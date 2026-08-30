// Fallback when Open-Meteo sunset is unavailable (e.g. stale CDN cache entries).
// Returns a local ISO datetime for America/Kralendijk, e.g. 2026-08-31T18:42

function parseCalendarDate(date: string): { y: number, m: number, d: number } {
  const [y, m, d] = date.split('-').map(Number)

  if (!y || !m || !d) {
    throw new Error(`Invalid calendar date: ${date}`)
  }

  return { y, m, d }
}

function getDayOfYear(year: number, month: number, day: number): number {
  const date = new Date(Date.UTC(year, month - 1, day))
  const start = Date.UTC(year, 0, 0)

  return Math.floor((date.getTime() - start) / 86400000)
}

export function estimateBonaireSunsetLocalIso(date: string): string {
  const { y, m, d } = parseCalendarDate(date)
  const dayOfYear = getDayOfYear(y, m, d)

  // Bonaire sits near 12°N — sunset stays close to 18:30 AST year-round.
  const sunsetMinutes = 18 * 60 + 28 + Math.round(10 * Math.sin((dayOfYear / 365) * 2 * Math.PI))
  const hour = Math.floor(sunsetMinutes / 60)
  const minute = sunsetMinutes % 60

  return `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function resolveSunsetForOstracods(
  date: string,
  sunset: string | null | undefined,
): string {
  if (typeof sunset === 'string' && sunset.length > 0) {
    return sunset
  }

  return estimateBonaireSunsetLocalIso(date)
}
