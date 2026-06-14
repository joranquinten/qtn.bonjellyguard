// server/api/moon.get.ts
// Returns moon phase data for a date range
// Uses Open-Meteo moon phase data with a local lunar-cycle fallback

import { defineEventHandler, getQuery, createError } from 'h3'

export interface MoonPhaseDay {
  date: string        // ISO date string YYYY-MM-DD
  phase: number       // 0–1 (0 = new moon, 0.5 = full moon, 1 = new moon again)
  phaseName: string   // human-readable phase name
  isFullMoon: boolean
  daysSinceFullMoon: number
}

// Bonaire west coast coordinates
const BONAIRE_LAT = 12.1696
const BONAIRE_LNG = -68.2837

const MS_PER_DAY = 86400000
const SYNODIC_MONTH_DAYS = 29.530588853

// Known full moon: 2000-01-21 04:40 UTC.
// The local estimate keeps the risk model usable when Open-Meteo is unavailable
// and when the selected range starts after the most recent full moon.
const KNOWN_FULL_MOON_MS = Date.UTC(2000, 0, 21, 4, 40)

interface MoonCycleEstimate {
  phase: number
  phaseName: string
  isFullMoon: boolean
  daysSinceFullMoon: number
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

function getMaxOpenMeteoForecastDate(): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  today.setDate(today.getDate() + 16)

  return today.toISOString().slice(0, 10)
}

function modulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor
}

function dateToUtcNoon(date: string): number {
  const [year, month, day] = date.split('-').map(Number)

  if (!year || !month || !day) {
    throw createError({ statusCode: 400, message: 'Date params must use YYYY-MM-DD format' })
  }

  return Date.UTC(year, month - 1, day, 12)
}

function phaseNameFromDaysSinceFullMoon(daysSinceFullMoon: number): string {
  if (daysSinceFullMoon <= 1 || daysSinceFullMoon >= 28) return 'Full Moon'
  if (daysSinceFullMoon <= 6) return 'Waning Gibbous'
  if (daysSinceFullMoon <= 8) return 'Last Quarter'
  if (daysSinceFullMoon <= 13) return 'Waning Crescent'
  if (daysSinceFullMoon <= 16) return 'New Moon'
  if (daysSinceFullMoon <= 21) return 'Waxing Crescent'
  if (daysSinceFullMoon <= 23) return 'First Quarter'
  return 'Waxing Gibbous'
}

function daysSinceFullMoonFromPhase(phase: number): number {
  return Math.floor(modulo(phase - 0.5, 1) * SYNODIC_MONTH_DAYS)
}

function isFullMoonPhase(phase: number): boolean {
  const distanceFromFull = Math.abs(phase - 0.5)

  return distanceFromFull <= 0.03
}

function moonPhaseToDay(date: string, phase: number): MoonPhaseDay {
  const normalizedPhase = modulo(phase, 1)
  const daysSinceFullMoon = daysSinceFullMoonFromPhase(normalizedPhase)

  return {
    date,
    phase: Number(normalizedPhase.toFixed(2)),
    phaseName: phaseNameFromDaysSinceFullMoon(daysSinceFullMoon),
    isFullMoon: isFullMoonPhase(normalizedPhase),
    daysSinceFullMoon
  }
}

function estimateMoonCycle(date: string): MoonCycleEstimate {
  const elapsedDays = (dateToUtcNoon(date) - KNOWN_FULL_MOON_MS) / MS_PER_DAY
  const daysSinceFullMoonExact = modulo(elapsedDays, SYNODIC_MONTH_DAYS)
  const daysSinceFullMoon = Math.floor(daysSinceFullMoonExact)
  const phase = modulo((daysSinceFullMoonExact / SYNODIC_MONTH_DAYS) + 0.5, 1)

  return {
    phase: Number(phase.toFixed(2)),
    phaseName: phaseNameFromDaysSinceFullMoon(daysSinceFullMoon),
    isFullMoon: daysSinceFullMoon <= 1 || daysSinceFullMoon >= 28,
    daysSinceFullMoon
  }
}

async function fetchOpenMeteoMoonPhases(startDate: string, endDate: string): Promise<Record<string, MoonPhaseDay>> {
  const result: Record<string, MoonPhaseDay> = {}
  const maxForecastDate = getMaxOpenMeteoForecastDate()
  const clippedEnd = new Date(endDate) > new Date(maxForecastDate) ? maxForecastDate : endDate

  if (new Date(startDate) > new Date(clippedEnd)) {
    return result
  }

  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(BONAIRE_LAT))
  url.searchParams.set('longitude', String(BONAIRE_LNG))
  url.searchParams.set('daily', 'moon_phase')
  url.searchParams.set('start_date', startDate)
  url.searchParams.set('end_date', clippedEnd)
  url.searchParams.set('timezone', 'America/Kralendijk')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Open-Meteo moon API error: ${res.status}`)

  const data = await res.json()
  const dates: string[] = data.daily?.time ?? []
  const phases: number[] = data.daily?.moon_phase ?? []

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i]
    const phase = phases[i]

    if (date && typeof phase === 'number') {
      result[date] = moonPhaseToDay(date, phase)
    }
  }

  return result
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

  let openMeteoMoonByDate: Record<string, MoonPhaseDay> = {}

  try {
    openMeteoMoonByDate = await fetchOpenMeteoMoonPhases(startDate, endDate)
  } catch (e) {
    // Return estimated data rather than failing entirely.
    console.error('Open-Meteo moon fetch failed:', e)
  }

  return dates.map((date) => openMeteoMoonByDate[date] ?? {
    date,
    ...estimateMoonCycle(date)
  })
})
