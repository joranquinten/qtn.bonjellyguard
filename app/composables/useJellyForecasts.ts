// composables/useJellyForecast.ts
// Orchestrates API calls and merges data into RiskInput[] for the calculator.

import { ref, computed } from 'vue'
import { useRiskCalculator, type DayRisk, type RiskInput, type DataConfidence, type TideState } from './useRiskCalculator'

export interface ForecastState {
  loading: boolean
  error: string | null
  days: DayRisk[]
}

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function defaultDateRange(): { start: string; end: string } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(today)
  end.setDate(end.getDate() + 6)  // 7-day default
  return { start: toISODate(today), end: toISODate(end) }
}

export function useJellyForecast() {
  const { calculate } = useRiskCalculator()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const days = ref<DayRisk[]>([])

  const hasData = computed(() => days.value.length > 0)

  async function fetch(startDate?: string, endDate?: string) {
    const range = defaultDateRange()
    const start = startDate ?? range.start
    const end = endDate ?? range.end

    loading.value = true
    error.value = null
    days.value = []

    try {
      // Parallel fetch — moon, wind, and tide signals stay independent until model merge.
      const [moonData, weatherData, tidalData] = await Promise.all([
        $fetch<any[]>(`/api/moon?start=${start}&end=${end}`),
        $fetch<any[]>(`/api/weather?start=${start}&end=${end}`),
        $fetch<any[]>(`/api/tidal?start=${start}&end=${end}`),
      ])

      // Index weather by date for easy lookup
      const weatherByDate: Record<string, any> = {}
      for (const w of weatherData) {
        weatherByDate[w.date] = w
      }

      const tideByDate: Record<string, any> = {}
      for (const tide of tidalData) {
        tideByDate[tide.date] = tide
      }

      // Merge into RiskInput[]
      const inputs: RiskInput[] = moonData.map((moon) => {
        const weather = weatherByDate[moon.date]
        const tide = tideByDate[moon.date]

        return {
          date: moon.date,
          daysSinceFullMoon: moon.daysSinceFullMoon,
          isFullMoon: moon.isFullMoon,
          windDirection: weather?.windDirection ?? null,
          windSpeed: weather?.windSpeed ?? null,
          isEasterly: weather?.isEasterly ?? null,
          windConfidence: (weather?.confidence ?? 'low') as DataConfidence,
          dawnTideState: (tide?.dawnTideState ?? 'unknown') as TideState,
          duskTideState: (tide?.duskTideState ?? 'unknown') as TideState,
          tideConfidence: tide?.confidence === 'high' ? 'high' : 'low',
          tideSourceNote: tide?.sourceNote ?? 'Tide forecast unavailable',
        }
      })

      days.value = calculate(inputs)
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to load forecast data'
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    days,
    hasData,
    fetch,
    defaultDateRange,
  }
}
