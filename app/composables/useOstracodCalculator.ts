// composables/useOstracodCalculator.ts
// Pure logic for ostracod occurrence windows — no API calls.

import { resolveSunsetForOstracods } from '~/utils/bonaireSunset'

export type OstracodProbability = 'high' | 'low'

export interface OstracodInput {
  date: string
  daysSinceFullMoon: number
  sunset: string | null // ISO local datetime from Open-Meteo, e.g. 2026-08-31T18:45
}

export interface OstracodDay {
  date: string
  daysSinceFullMoon: number
  peakTime: string // formatted local time, e.g. "7:30 PM"
  probability: OstracodProbability
}

const PEAK_OFFSET_MINUTES = 45

function probabilityForDay(daysSinceFullMoon: number): OstracodProbability | null {
  if (daysSinceFullMoon >= 3 && daysSinceFullMoon <= 5) return 'high'
  if (daysSinceFullMoon === 2 || daysSinceFullMoon === 6) return 'low'
  return null
}

// Open-Meteo returns sunset in America/Kralendijk local time — parse directly
// so peak time stays correct regardless of server/browser timezone.
function formatPeakTime(sunset: string): string {
  const match = sunset.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/)
  if (!match) return '—'

  const hour = Number(match[2])
  const minute = Number(match[3])
  const totalMinutes = hour * 60 + minute + PEAK_OFFSET_MINUTES
  const peakHour = Math.floor(totalMinutes / 60) % 24
  const peakMinute = totalMinutes % 60
  const period = peakHour >= 12 ? 'PM' : 'AM'
  const hour12 = peakHour % 12 || 12

  return `${hour12}:${String(peakMinute).padStart(2, '0')} ${period}`
}

export function useOstracodCalculator() {
  function calculate(inputs: OstracodInput[]): OstracodDay[] {
    return inputs
      .map((input) => {
        const probability = probabilityForDay(input.daysSinceFullMoon)
        if (!probability) return null

        const sunset = resolveSunsetForOstracods(input.date, input.sunset)

        return {
          date: input.date,
          daysSinceFullMoon: input.daysSinceFullMoon,
          peakTime: formatPeakTime(sunset),
          probability,
        }
      })
      .filter((day): day is OstracodDay => day !== null)
  }

  return { calculate }
}
