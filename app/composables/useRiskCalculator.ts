// composables/useRiskCalculator.ts
// Pure risk calculation logic — no API calls, no side effects.
// Takes moon + wind data per day, returns risk scores.
// Designed to be extended with tidal data later.

export type RiskLevel = 'low' | 'medium' | 'high'
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night'
export type DataConfidence = 'high' | 'medium' | 'low'

export interface RiskInput {
  date: string
  daysSinceFullMoon: number | null
  isFullMoon: boolean
  windDirection: number | null       // degrees
  windSpeed: number | null           // km/h
  isEasterly: boolean | null
  windConfidence: DataConfidence
  // Future: tidalState, dawnTideState
}

export interface TimeOfDayRisk {
  timeOfDay: TimeOfDay
  boxJellyModifier: number   // multiplier applied to base score
  boxJellyScore: number      // adjusted hazard index, 0-100
  boxJellyLevel: RiskLevel
  boxJellyLikelihood: number // calibrated practical likelihood, 0-100
  reason: string
}

export interface DayRisk {
  date: string

  // Box jelly (lunar-driven)
  boxJellyScore: number          // 0–100
  boxJellyLevel: RiskLevel
  boxJellyLikelihood: number     // calibrated practical likelihood, 0–100
  boxJellyReason: string

  // Siphonophore / man-o-war (wind-driven)
  siphonophoreScore: number      // 0–100
  siphonophoreLevel: RiskLevel
  siphonophoreLikelihood: number // calibrated practical likelihood, 0–100
  siphonophoreReason: string

  // Combined worst-case
  overallScore: number
  overallLevel: RiskLevel
  overallLikelihood: number      // calibrated practical likelihood, 0–100

  // Time-of-day breakdown
  timeOfDayRisks: TimeOfDayRisk[]

  // Data confidence (driven by weather forecast availability)
  confidence: DataConfidence
  confidenceNote: string
}

// ─── Box Jelly Scoring ────────────────────────────────────────────────────────
// Based on research: peak activity 8–12 days post full moon, window 2–4 days
// Highest risk: days 9–10. Elevated: days 8–12. Low outside window.

function calcBoxJellyScore(daysSinceFullMoon: number | null): number {
  if (daysSinceFullMoon === null) return 20  // unknown = low baseline

  const d = daysSinceFullMoon

  if (d < 0) return 5                           // before this cycle's full moon
  if (d >= 0 && d <= 7) return 10              // post full moon, pre-window
  if (d === 8) return 60
  if (d === 9) return 90
  if (d === 10) return 100
  if (d === 11) return 80
  if (d === 12) return 60
  if (d >= 13 && d <= 20) return 15            // fading, next cycle building
  if (d > 20) return 5                          // approaching next full moon
  return 10
}

// ─── Siphonophore Scoring ─────────────────────────────────────────────────────
// Easterly winds push man-o-war toward Bonaire's west coast (dive sites)
// Higher wind speed = more risk

function calcSiphonophoreScore(
  isEasterly: boolean | null,
  windSpeed: number | null,
  confidence: DataConfidence
): number {
  if (confidence === 'low') return -1  // -1 = unknown, shown differently in UI

  if (isEasterly === null || windSpeed === null) return 20  // fallback

  if (!isEasterly) return 10  // wind not pushing toward shore

  // Easterly confirmed — scale by speed
  if (windSpeed < 10) return 30
  if (windSpeed < 20) return 55
  if (windSpeed < 30) return 75
  return 90
}

// ─── Practical Likelihood Calibration ─────────────────────────────────────────
// Raw scores are relative hazard indices. This curve converts them into a more
// conservative user-facing estimate of practical sting likelihood.

const MAX_PRACTICAL_STING_LIKELIHOOD = 35
const LIKELIHOOD_CURVE = 1.35

function hazardToLikelihood(hazardScore: number): number {
  if (hazardScore <= 0) return 0

  return Math.round(MAX_PRACTICAL_STING_LIKELIHOOD * ((hazardScore / 100) ** LIKELIHOOD_CURVE))
}

// ─── Time of Day Modifiers ────────────────────────────────────────────────────
// Static rules based on crepuscular activity pattern + tidal note
// When tidal data is available, dawn modifier should factor in receding tide

function buildTimeOfDayRisk(
  timeOfDay: TimeOfDay,
  boxJellyScore: number,
  boxJellyModifier: number,
  reason: string
): TimeOfDayRisk {
  const adjustedScore = Math.min(100, Math.round(boxJellyScore * boxJellyModifier))

  return {
    timeOfDay,
    boxJellyModifier,
    boxJellyScore: adjustedScore,
    boxJellyLevel: scoreToLevel(adjustedScore),
    boxJellyLikelihood: hazardToLikelihood(adjustedScore),
    reason
  }
}

function getTimeOfDayRisks(boxJellyScore: number): TimeOfDayRisk[] {
  if (boxJellyScore < 20) {
    // Low lunar risk — time of day barely matters
    return [
      buildTimeOfDayRisk('dawn', boxJellyScore, 1.0, 'Low lunar activity'),
      buildTimeOfDayRisk('day', boxJellyScore, 0.8, 'Low lunar activity'),
      buildTimeOfDayRisk('dusk', boxJellyScore, 1.0, 'Low lunar activity'),
      buildTimeOfDayRisk('night', boxJellyScore, 0.9, 'Low lunar activity'),
    ]
  }

  return [
    buildTimeOfDayRisk(
      'dawn',
      boxJellyScore,
      1.4,
      'Peak risk — high tide receding at dawn pushes jellies inshore'
      // TODO: refine with real tidal data
    ),
    buildTimeOfDayRisk(
      'day',
      boxJellyScore,
      0.6,
      'Lower activity — box jellies retreat to deeper water'
    ),
    buildTimeOfDayRisk(
      'dusk',
      boxJellyScore,
      1.2,
      'Elevated — crepuscular activity window'
    ),
    buildTimeOfDayRisk(
      'night',
      boxJellyScore,
      1.0,
      'Moderate — active spawning migration occurs before moonrise'
    ),
  ]
}

// ─── Level Thresholds ─────────────────────────────────────────────────────────

function scoreToLevel(score: number): RiskLevel {
  if (score >= 60) return 'high'
  if (score >= 30) return 'medium'
  return 'low'
}

function confidenceNote(confidence: DataConfidence): string {
  if (confidence === 'high') return 'Wind forecast available — high accuracy'
  if (confidence === 'medium') return 'Extended forecast (8–16 days) — moderate accuracy'
  return 'No wind forecast available — lunar risk only, siphonophore risk unknown'
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function useRiskCalculator() {
  function calculate(inputs: RiskInput[]): DayRisk[] {
    return inputs.map((input) => {
      const boxJellyScore = calcBoxJellyScore(input.daysSinceFullMoon)
      const siphonophoreRaw = calcSiphonophoreScore(
        input.isEasterly,
        input.windSpeed,
        input.windConfidence
      )

      const siphonophoreScore = siphonophoreRaw === -1 ? 0 : siphonophoreRaw
      const siphonophoreUnknown = siphonophoreRaw === -1

      const timeOfDayRisks = getTimeOfDayRisks(boxJellyScore)
      const maxTimeOfDayBoxJellyScore = Math.max(...timeOfDayRisks.map((tod) => tod.boxJellyScore))
      const overallScore = Math.min(100, Math.max(maxTimeOfDayBoxJellyScore, siphonophoreScore))

      const boxJellyReason = input.daysSinceFullMoon !== null
        ? `Day ${input.daysSinceFullMoon} after last full moon`
        : 'Full moon reference not available'

      const siphonophoreReason = siphonophoreUnknown
        ? 'No forecast data — wind-driven risk unknown'
        : input.isEasterly
          ? `Easterly winds (${input.windSpeed ?? '?'} km/h) pushing toward west coast`
          : `Wind not easterly — low shore risk`

      return {
        date: input.date,
        boxJellyScore,
        boxJellyLevel: scoreToLevel(boxJellyScore),
        boxJellyLikelihood: hazardToLikelihood(boxJellyScore),
        boxJellyReason,
        siphonophoreScore,
        siphonophoreLevel: siphonophoreUnknown ? 'low' : scoreToLevel(siphonophoreScore),
        siphonophoreLikelihood: siphonophoreUnknown ? 0 : hazardToLikelihood(siphonophoreScore),
        siphonophoreReason,
        overallScore,
        overallLevel: scoreToLevel(overallScore),
        overallLikelihood: hazardToLikelihood(overallScore),
        timeOfDayRisks,
        confidence: input.windConfidence,
        confidenceNote: confidenceNote(input.windConfidence)
      }
    })
  }

  return { calculate }
}
