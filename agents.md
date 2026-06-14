# Bon Jelly Guard — Agent Reference

## What this app does

Predicts jellyfish sting risk on Bonaire's west coast for a user-selected date range.
Returns a day-by-day risk breakdown split by jellyfish type and time of day.

Important: Every architectural, structural change needs to be added as documentation to this file!

---

## Stack

- **Nuxt 4** — server routes for API fetching + caching; Vue frontend
- **Vue 3** — composition API throughout; no class components
- **TypeScript** — strict types on all composables and server routes

---

## Architecture

```
server/api/
  moon.get.ts       → Fetches moon phase per day (FarmsenseMoon API, no key)
  weather.get.ts    → Fetches wind data for Bonaire (Open-Meteo, no key)
  tidal.get.ts      → Fetches sea-level tide signal for Bonaire (Open-Meteo Marine, no key)

composables/
  useRiskCalculator.ts   → Pure logic. No API calls. Takes RiskInput[], returns DayRisk[]
  useJellyForecast.ts    → Orchestrator. Calls APIs, merges data, calls calculator.

components/
  RiskBadge.vue     → Traffic light badge with optional % score
  ForecastTable.vue → Day-by-day table with expandable time-of-day detail

pages/
  index.vue         → Single page app. Date picker + forecast table.
```

---

## External APIs

| API | Purpose | Key required | Limit |
|-----|---------|-------------|-------|
| [FarmsenseMoon](https://api.farmsense.net/v1/moonphases/) | Moon phase per unix timestamp | No | Unknown |
| [Open-Meteo](https://api.open-meteo.com/v1/forecast) | Wind direction + speed for Bonaire | No | Free tier |
| [Open-Meteo Marine](https://marine-api.open-meteo.com/v1/marine) | Hourly sea-level tide signal | No | Free tier |

**Bonaire coordinates used:** `lat: 12.1696, lng: -68.2837` (west coast)

---

## Risk model

### Box jellyfish (lunar-driven)

Based on research for *Alatina alata* (Hawaii) applied to Bonaire:

| Days since full moon | Score |
|---------------------|-------|
| < 8 | 5–10 |
| 8 | 60 |
| 9 | 90 |
| 10 | 100 (peak) |
| 11 | 80 |
| 12 | 60 |
| > 12 | 5–15 |

Window: **8–12 days post full moon**, 2–4 day active period.

### Siphonophores (wind-driven)

Easterly winds (45–135°) push man-o-war toward Bonaire's leeward (west) coast.
Risk scales with wind speed in km/h, with user-facing wind values displayed as knots.
No forecast beyond 16 days → shown as "unknown".

### Time of day (tide-informed modifiers on box jelly score)

| Time | Modifier | Reason |
|------|---------|--------|
| Dawn | ×1.0–1.4 | Peak when tide is high or falling at dawn |
| Dusk | ×1.2–1.3 | Crepuscular activity window; higher near low tide |
| Night | ×1.0 | Spawning migration before moonrise |
| Day | ×0.6 | Box jellies retreat to deeper water |

Tidal state is derived from Open-Meteo Marine hourly `sea_level_height_msl`.
This is a gridded sea-level estimate, not navigation-grade tide data.

### Hazard score vs displayed likelihood

The calculator keeps raw `0–100` scores as relative hazard indices for model weighting
and `low` / `medium` / `high` thresholds. UI percentages should use calibrated
likelihood fields instead:

```ts
likelihood = 35 * ((hazardScore / 100) ** 1.35)
```

This caps a perfect hazard score at about `35%` practical sting likelihood, because
the model estimates favorable sting conditions rather than the probability that a
specific swimmer will be stung.

Daily `overallScore` is based on the strongest modeled source: the highest
time-of-day-adjusted box jelly score or the siphonophore score.

---

## Data confidence

| Confidence | Condition | Effect |
|-----------|-----------|--------|
| `high` | ≤ 7 days ahead | Real wind data from Open-Meteo |
| `medium` | 8–16 days ahead | Extended forecast from Open-Meteo |
| `low` | > 16 days ahead | Lunar risk only; siphonophore shown as unknown |

---

## Tidal integration

`server/api/tidal.get.ts` fetches hourly `sea_level_height_msl` from Open-Meteo
Marine for the requested date range. The route groups points by day, identifies
local high/low tide extrema, and returns `dawnTideState` and `duskTideState`
as `rising`, `falling`, `high`, `low`, or `unknown`.

The calculator uses tide state only for time-of-day box jelly modifiers:
high/falling tide at dawn raises the dawn multiplier, and low tide near dusk
raises the dusk multiplier. If tide data is unavailable, the model falls back
to baseline dawn/dusk activity modifiers.

---

## Key types

```ts
// useRiskCalculator.ts
type RiskLevel = 'low' | 'medium' | 'high'
type DataConfidence = 'high' | 'medium' | 'low'

interface RiskInput {
  date: string
  daysSinceFullMoon: number | null
  isFullMoon: boolean
  windDirection: number | null
  windSpeed: number | null // km/h, displayed as knots in UI copy
  isEasterly: boolean | null
  windConfidence: DataConfidence
  dawnTideState: TideState
  duskTideState: TideState
  tideConfidence: 'high' | 'low'
  tideSourceNote: string
}

interface DayRisk {
  date: string
  boxJellyScore: number       // 0–100
  boxJellyLevel: RiskLevel
  boxJellyLikelihood: number  // calibrated practical likelihood, 0–100
  siphonophoreScore: number   // 0–100
  siphonophoreLevel: RiskLevel
  siphonophoreLikelihood: number
  overallScore: number
  overallLevel: RiskLevel
  overallLikelihood: number
  timeOfDayRisks: TimeOfDayRisk[]
  tideReason: string
  confidence: DataConfidence
  confidenceNote: string
}

interface TimeOfDayRisk {
  timeOfDay: TimeOfDay
  boxJellyModifier: number
  boxJellyScore: number
  boxJellyLevel: RiskLevel
  boxJellyLikelihood: number
  reason: string
}
```

---

## Known limitations / future work

- Moon phase data from FarmsenseMoon may need verification against a second source
- Open-Meteo Marine tide data is approximate and not suitable for navigation
- No historical validation against actual Bonaire jellyfish sighting data
- Caching on server routes not yet implemented — add `useStorage` or Nitro cache layer
- App is Bonaire-specific; coordinates are hardcoded in `server/api/weather.get.ts`