// server/api/weather.get.ts
// Returns wind data for Bonaire using Open-Meteo (free, no key required)
// Open-Meteo forecast: up to 16 days. Beyond that, no data available.

import { defineEventHandler, getQuery, createError } from 'h3'

// Bonaire west coast coordinates (where diving happens)
const BONAIRE_LAT = 12.1696
const BONAIRE_LNG = -68.2837

export type WindDataConfidence = 'high' | 'medium' | 'low'

export interface WindDay {
  date: string                    // YYYY-MM-DD
  windDirection: number | null    // degrees (0–360), null if no data
  windSpeed: number | null        // km/h, null if no data
  isEasterly: boolean | null      // true if wind is from east (blows jellies west toward shore)
  confidence: WindDataConfidence  // high = <7 days, medium = 7–16 days, low = >16 days
}

// Wind from east: roughly 45–135 degrees
function isEasterlyWind(degrees: number): boolean {
  return degrees >= 45 && degrees <= 135
}

function getConfidence(date: string): WindDataConfidence {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  const diffDays = Math.floor((target.getTime() - today.getTime()) / 86400000)

  if (diffDays <= 7) return 'high'
  if (diffDays <= 16) return 'medium'
  return 'low'
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const startDate = query.start as string
  const endDate = query.end as string

  if (!startDate || !endDate) {
    throw createError({ statusCode: 400, message: 'start and end query params required (YYYY-MM-DD)' })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Open-Meteo only forecasts 16 days ahead — clip end date
  const maxForecastDate = new Date(today)
  maxForecastDate.setDate(maxForecastDate.getDate() + 16)

  const clippedEnd = new Date(endDate) > maxForecastDate
    ? maxForecastDate.toISOString().split('T')[0]
    : endDate

  // Build result map with low-confidence placeholders for all dates first
  const result: Record<string, WindDay> = {}
  const current = new Date(startDate)
  const end = new Date(endDate)

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0]
    result[dateStr] = {
      date: dateStr,
      windDirection: null,
      windSpeed: null,
      isEasterly: null,
      confidence: getConfidence(dateStr)
    }
    current.setDate(current.getDate() + 1)
  }

  // Fetch from Open-Meteo for dates within forecast range
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast')
    url.searchParams.set('latitude', String(BONAIRE_LAT))
    url.searchParams.set('longitude', String(BONAIRE_LNG))
    url.searchParams.set('daily', 'wind_direction_10m_dominant,wind_speed_10m_max')
    url.searchParams.set('wind_speed_unit', 'kmh')
    url.searchParams.set('start_date', startDate)
    url.searchParams.set('end_date', clippedEnd)
    url.searchParams.set('timezone', 'America/Kralendijk')

    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`)

    const data = await res.json()
    const dates: string[] = data.daily?.time ?? []
    const directions: number[] = data.daily?.wind_direction_10m_dominant ?? []
    const speeds: number[] = data.daily?.wind_speed_10m_max ?? []

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i]
      if (result[date]) {
        result[date].windDirection = directions[i] ?? null
        result[date].windSpeed = speeds[i] ?? null
        result[date].isEasterly = directions[i] != null ? isEasterlyWind(directions[i]) : null
      }
    }
  } catch (e) {
    // Return placeholders — UI will show low confidence
    console.error('Weather fetch failed:', e)
  }

  return Object.values(result)
})
