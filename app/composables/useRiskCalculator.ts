// composables/useRiskCalculator.ts
// Pure risk calculation logic — no API calls, no side effects.
// Takes moon + wind data per day, returns risk scores.
// Designed to be extended with tidal data later.

export type RiskLevel = 'low' | 'medium' | 'high'
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night'
export type DataConfidence = 'high' | 'medium' | 'low'
export type TideState = 'rising' | 'falling' | 'high' | 'low' | 'unknown'

export interface RiskInput {
  date: string
  daysSinceFullMoon: number | null
  isFullMoon: boolean
  windDirection: number | null       // degrees
  windSpeed: number | null           // km/h
  isEasterly: boolean | null
  windConfidence: DataConfidence
  dawnTideState: TideState
  duskTideState: TideState
  tideConfidence: 'high' | 'low'
  tideSourceNote: string
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
  tideReason: string

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

const KMH_TO_KNOTS = 0.539957

function formatWindSpeedKnots(windSpeedKmh: number | null): string {
  if (windSpeedKmh === null) return '?'

  return String(Math.round(windSpeedKmh * KMH_TO_KNOTS))
}

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
// Crepuscular activity is adjusted with tide state where marine data is available.

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

function dawnRiskDetails(dawnTideState: TideState): { modifier: number; reason: string } {
  if (dawnTideState === 'falling') {
    return {
      modifier: 1.4,
      reason: 'Peak risk · tide falling at dawn can trap jellies inshore'
    }
  }

  if (dawnTideState === 'high') {
    return {
      modifier: 1.35,
      reason: 'Peak risk · high tide around dawn favors inshore jelly presence'
    }
  }

  if (dawnTideState === 'rising') {
    return {
      modifier: 1.15,
      reason: 'Elevated dawn activity, but tide is still rising'
    }
  }

  if (dawnTideState === 'low') {
    return {
      modifier: 1.0,
      reason: 'Dawn activity window, but low tide reduces inshore trapping signal'
    }
  }

  return {
    modifier: 1.2,
    reason: 'Elevated dawn activity · tide estimate unavailable'
  }
}

function duskRiskDetails(duskTideState: TideState): { modifier: number; reason: string } {
  if (duskTideState === 'low') {
    return {
      modifier: 1.3,
      reason: 'Elevated · low tide near dusk can concentrate jellies near shore'
    }
  }

  return {
    modifier: 1.2,
    reason: duskTideState === 'unknown'
      ? 'Elevated · crepuscular activity window; tide estimate unavailable'
      : `Elevated · crepuscular activity window; tide is ${duskTideState}`
  }
}

function tideReason(input: RiskInput): string {
  if (input.tideConfidence === 'low') {
    return 'Tide estimate unavailable · using baseline dawn/dusk modifiers'
  }

  return `Tide estimate available · dawn tide is ${input.dawnTideState}, dusk tide is ${input.duskTideState}. ${input.tideSourceNote}`
}

function getTimeOfDayRisks(
  boxJellyScore: number,
  dawnTideState: TideState,
  duskTideState: TideState
): TimeOfDayRisk[] {
  if (boxJellyScore < 20) {
    // Low lunar risk — time of day barely matters
    return [
      buildTimeOfDayRisk('dawn', boxJellyScore, 1.0, 'Low lunar activity'),
      buildTimeOfDayRisk('day', boxJellyScore, 0.8, 'Low lunar activity'),
      buildTimeOfDayRisk('dusk', boxJellyScore, 1.0, 'Low lunar activity'),
      buildTimeOfDayRisk('night', boxJellyScore, 0.9, 'Low lunar activity'),
    ]
  }

  const dawnRisk = dawnRiskDetails(dawnTideState)
  const duskRisk = duskRiskDetails(duskTideState)

  return [
    buildTimeOfDayRisk(
      'dawn',
      boxJellyScore,
      dawnRisk.modifier,
      dawnRisk.reason
    ),
    buildTimeOfDayRisk(
      'day',
      boxJellyScore,
      0.6,
      'Lower activity · box jellies retreat to deeper water'
    ),
    buildTimeOfDayRisk(
      'dusk',
      boxJellyScore,
      duskRisk.modifier,
      duskRisk.reason
    ),
    buildTimeOfDayRisk(
      'night',
      boxJellyScore,
      1.0,
      'Moderate · active spawning migration occurs before moonrise'
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
  if (confidence === 'high') return 'Wind forecast available · high accuracy'
  if (confidence === 'medium') return 'Extended forecast (8–16 days) · moderate accuracy'
  return 'No wind forecast available · lunar risk only, siphonophore risk unknown'
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

      const timeOfDayRisks = getTimeOfDayRisks(
        boxJellyScore,
        input.dawnTideState,
        input.duskTideState
      )
      const maxTimeOfDayBoxJellyScore = Math.max(...timeOfDayRisks.map((tod) => tod.boxJellyScore))
      const overallScore = Math.min(100, Math.max(maxTimeOfDayBoxJellyScore, siphonophoreScore))

      const boxJellyReason = input.daysSinceFullMoon !== null
        ? `Day ${input.daysSinceFullMoon} after last full moon`
        : 'Full moon reference not available'

      const siphonophoreReason = siphonophoreUnknown
        ? 'No forecast data · wind-driven risk unknown'
        : input.isEasterly
          ? `Easterly winds (${formatWindSpeedKnots(input.windSpeed)} knots) pushing toward west coast`
          : `Wind not easterly · low shore risk`

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
        tideReason: tideReason(input),
        confidence: input.windConfidence,
        confidenceNote: confidenceNote(input.windConfidence)
      }
    })
  }

  return { calculate }
}
