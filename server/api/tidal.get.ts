// server/api/tidal.get.ts
// STUB — tidal data not yet implemented
// Tidal patterns affect box jellyfish inshore timing:
//   - High tide receding toward dawn = peak inshore risk
//   - Low tide in early evening = elevated risk
//
// Suggested future API: WorldTides (https://www.worldtides.info/api)
//   or NOAA Tides & Currents (US-based but may cover Caribbean)
//   or StormGlass (https://stormglass.io) which covers global tidal data
//
// When implementing, add TidalDay to the risk calculator input
// and factor high-tide-at-dawn into the time-of-day risk modifier.

import { defineEventHandler, getQuery } from 'h3'

export interface TidalDay {
  date: string
  implemented: false
  // Future fields:
  // highTides: { time: string; height: number }[]
  // lowTides: { time: string; height: number }[]
  // dawnTideState: 'rising' | 'falling' | 'high' | 'low' | null
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const startDate = query.start as string
  const endDate = query.end as string

  // Generate placeholder entries for each date in range
  const dates: TidalDay[] = []
  const current = new Date(startDate)
  const end = new Date(endDate)

  while (current <= end) {
    dates.push({
      date: current.toISOString().split('T')[0],
      implemented: false
    })
    current.setDate(current.getDate() + 1)
  }

  return dates
})
