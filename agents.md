# Bonaire Jelly Forecast — Agent Reference

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
  tidal.get.ts      → STUB — returns placeholder data, not yet implemented

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
Risk scales with wind speed. No forecast beyond 16 days → shown as "unknown".

### Time of day (static modifiers on box jelly score)

| Time | Modifier | Reason |
|------|---------|--------|
| Dawn | ×1.4 | Peak — high tide receding, jellies trapped inshore |
| Dusk | ×1.2 | Crepuscular activity window |
| Night | ×1.0 | Spawning migration before moonrise |
| Day | ×0.6 | Box jellies retreat to deeper water |

> **TODO:** Replace static dawn modifier with tidal data when implemented.

---

## Data confidence

| Confidence | Condition | Effect |
|-----------|-----------|--------|
| `high` | ≤ 7 days ahead | Real wind data from Open-Meteo |
| `medium` | 8–16 days ahead | Extended forecast from Open-Meteo |
| `low` | > 16 days ahead | Lunar risk only; siphonophore shown as unknown |

---

## Tidal integration (future)

When ready to add tidal data:

1. Implement `server/api/tidal.get.ts` — stub is already in place
2. Add `TidalDay` fields to `RiskInput` in `useRiskCalculator.ts`
3. Replace static dawn modifier (×1.4) with: `high tide receding at dawn → higher multiplier`
4. Wire tidal fetch in `useJellyForecast.ts` (comment already present)

Suggested providers:
- [WorldTides](https://www.worldtides.info/api) — global, paid
- [StormGlass](https://stormglass.io) — global tidal + marine data, free tier available

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
  windSpeed: number | null
  isEasterly: boolean | null
  windConfidence: DataConfidence
}

interface DayRisk {
  date: string
  boxJellyScore: number       // 0–100
  boxJellyLevel: RiskLevel
  siphonophoreScore: number   // 0–100
  siphonophoreLevel: RiskLevel
  overallScore: number
  overallLevel: RiskLevel
  timeOfDayRisks: TimeOfDayRisk[]
  confidence: DataConfidence
  confidenceNote: string
}
```

---

## Known limitations / future work

- Moon phase data from FarmsenseMoon may need verification against a second source
- Time-of-day modifiers are static rules, not tide-informed
- No historical validation against actual Bonaire jellyfish sighting data
- Caching on server routes not yet implemented — add `useStorage` or Nitro cache layer
- App is Bonaire-specific; coordinates are hardcoded in `server/api/weather.get.ts`