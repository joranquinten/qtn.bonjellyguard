// server/api/moon.get.ts
// Returns moon phase data for a date range
// Uses FarmsenseMoon API (no key required)

import { defineEventHandler, getQuery, createError } from 'h3'

export interface MoonPhaseDay {
  date: string        // ISO date string YYYY-MM-DD
  phase: number       // 0–1 (0 = new moon, 0.5 = full moon, 1 = new moon again)
  phaseName: string   // human-readable phase name
  isFullMoon: boolean
  daysSinceFullMoon: number | null  // null if no full moon has occurred yet in range
}

// Farmsense returns phase as illumination + phase index
// Phase index: 0=New, 1=Waxing Crescent, 2=First Quarter, 3=Waxing Gibbous,
//              4=Full, 5=Waning Gibbous, 6=Last Quarter, 7=Waning Crescent
const PHASE_NAMES = [
  'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
  'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'
]

function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const current = new Date(startDate)
  const end = new Date(endDate)
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }
  return dates
}

async function fetchMoonPhase(unixTimestamp: number): Promise<{ phase: number; phaseIndex: number }> {
  const url = `https://api.farmsense.net/v1/moonphases/?d=${unixTimestamp}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Moon API error: ${res.status}`)
  const data = await res.json()
  if (!data?.[0]) throw new Error('No moon data returned')
  return {
    phase: data[0].Phase,           // 0–1 illumination fraction (approx)
    phaseIndex: data[0].Moon[0]     // phase name string from API
  }
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

  // Fetch moon data for each date
  const results: MoonPhaseDay[] = []
  let lastFullMoonDate: string | null = null

  for (const date of dates) {
    const unix = Math.floor(new Date(date).getTime() / 1000)

    try {
      const moonData = await fetchMoonPhase(unix)

      // Farmsense returns phase name as string in Moon array
      const phaseName = String(moonData.phaseIndex)
      const isFullMoon = phaseName === 'Full Moon'

      if (isFullMoon) lastFullMoonDate = date

      const daysSinceFullMoon = lastFullMoonDate
        ? Math.floor((new Date(date).getTime() - new Date(lastFullMoonDate).getTime()) / 86400000)
        : null

      results.push({
        date,
        phase: moonData.phase,
        phaseName,
        isFullMoon,
        daysSinceFullMoon
      })
    } catch (e) {
      // Return partial data rather than failing entirely
      results.push({
        date,
        phase: 0,
        phaseName: 'Unknown',
        isFullMoon: false,
        daysSinceFullMoon: null
      })
    }
  }

  return results
})
