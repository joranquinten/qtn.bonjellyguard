// server/api/tidal.get.ts
// Returns approximate tide signal for Bonaire using Open-Meteo Marine.
// sea_level_height_msl is a gridded model signal, not navigation-grade tide data.

import { defineEventHandler, getQuery, createError } from 'h3'

// Bonaire west coast coordinates (matching the weather forecast location)
const BONAIRE_LAT = 12.1696
const BONAIRE_LNG = -68.2837
const TIMEZONE = 'America/Kralendijk'
const DAWN_HOUR = 6
const DUSK_HOUR = 18

export type TideState = 'rising' | 'falling' | 'high' | 'low' | 'unknown'

export interface TideEvent {
  time: string
  height: number
}

export interface TidalDay {
  date: string
  highTides: TideEvent[]
  lowTides: TideEvent[]
  dawnTideState: TideState
  duskTideState: TideState
  confidence: 'high' | 'low'
  sourceNote: string
}

interface TidePoint {
  time: string
  height: number
}

function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const current = new Date(startDate)
  const end = new Date(endDate)

  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

function emptyTidalDay(date: string, sourceNote = 'Tide forecast unavailable'): TidalDay {
  return {
    date,
    highTides: [],
    lowTides: [],
    dawnTideState: 'unknown',
    duskTideState: 'unknown',
    confidence: 'low',
    sourceNote
  }
}

function hourFromLocalTime(time: string): number {
  return Number(time.slice(11, 13))
}

function roundHeight(height: number): number {
  return Math.round(height * 100) / 100
}

function findTideEvents(points: TidePoint[]): { highTides: TideEvent[]; lowTides: TideEvent[] } {
  const highTides: TideEvent[] = []
  const lowTides: TideEvent[] = []

  for (let i = 1; i < points.length - 1; i++) {
    const previous = points[i - 1]
    const current = points[i]
    const next = points[i + 1]

    if (!previous || !current || !next) continue

    if (current.height >= previous.height && current.height > next.height) {
      highTides.push({ time: current.time, height: roundHeight(current.height) })
    }

    if (current.height <= previous.height && current.height < next.height) {
      lowTides.push({ time: current.time, height: roundHeight(current.height) })
    }
  }

  return { highTides, lowTides }
}

function tideStateAtHour(points: TidePoint[], targetHour: number): TideState {
  if (points.length < 3) return 'unknown'

  let targetIndex = 0

  for (let index = 1; index < points.length; index++) {
    const point = points[index]
    const bestPoint = points[targetIndex]
    if (!point || !bestPoint) continue

    const currentDistance = Math.abs(hourFromLocalTime(point.time) - targetHour)
    const bestDistance = Math.abs(hourFromLocalTime(bestPoint.time) - targetHour)

    if (currentDistance < bestDistance) targetIndex = index
  }

  if (targetIndex === 0 || targetIndex === points.length - 1) return 'unknown'

  const previous = points[targetIndex - 1]
  const current = points[targetIndex]
  const next = points[targetIndex + 1]

  if (!previous || !current || !next) return 'unknown'

  if (current.height >= previous.height && current.height >= next.height) return 'high'
  if (current.height <= previous.height && current.height <= next.height) return 'low'
  if (next.height > current.height) return 'rising'
  if (next.height < current.height) return 'falling'

  return 'unknown'
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const startDate = query.start as string
  const endDate = query.end as string

  if (!startDate || !endDate) {
    throw createError({ statusCode: 400, message: 'start and end query params required (YYYY-MM-DD)' })
  }

  const dates = getDateRange(startDate, endDate)

  if (dates.length > 120) {
    throw createError({ statusCode: 400, message: 'Date range too large (max 120 days)' })
  }

  const result: Record<string, TidalDay> = Object.fromEntries(
    dates.map((date) => [date, emptyTidalDay(date)])
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const maxForecastDate = new Date(today)
  maxForecastDate.setDate(maxForecastDate.getDate() + 16)

  const requestStart = new Date(startDate)
  if (requestStart > maxForecastDate) {
    return Object.values(result)
  }

  const clippedEnd = new Date(endDate) > maxForecastDate
    ? maxForecastDate.toISOString().slice(0, 10)
    : endDate

  try {
    const url = new URL('https://marine-api.open-meteo.com/v1/marine')
    url.searchParams.set('latitude', String(BONAIRE_LAT))
    url.searchParams.set('longitude', String(BONAIRE_LNG))
    url.searchParams.set('hourly', 'sea_level_height_msl')
    url.searchParams.set('start_date', startDate)
    url.searchParams.set('end_date', clippedEnd)
    url.searchParams.set('timezone', TIMEZONE)

    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`Open-Meteo Marine error: ${res.status}`)

    const data = await res.json()
    const times: string[] = data.hourly?.time ?? []
    const heights: Array<number | null> = data.hourly?.sea_level_height_msl ?? []
    const pointsByDate: Record<string, TidePoint[]> = {}

    for (let i = 0; i < times.length; i++) {
      const time = times[i]
      const height = heights[i]
      const date = time?.split('T')[0]

      if (!time || !date || !result[date] || height == null) continue

      pointsByDate[date] ??= []
      pointsByDate[date].push({ time, height })
    }

    for (const date of dates) {
      const points = pointsByDate[date] ?? []
      const { highTides, lowTides } = findTideEvents(points)

      result[date] = {
        date,
        highTides,
        lowTides,
        dawnTideState: tideStateAtHour(points, DAWN_HOUR),
        duskTideState: tideStateAtHour(points, DUSK_HOUR),
        confidence: points.length > 0 ? 'high' : 'low',
        sourceNote: points.length > 0
          ? 'Open-Meteo Marine sea-level estimate'
          : 'Tide forecast unavailable'
      }
    }
  } catch (e) {
    // Return placeholders so the forecast can still use moon + wind data.
    console.error('Tidal fetch failed:', e)
  }

  return Object.values(result)
})
