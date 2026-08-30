const MS_PER_DAY = 86400000
const BONAIRE_TIMEZONE = 'America/Kralendijk'

export function parseCalendarDate(date: string): { y: number, m: number, d: number } {
  const [y, m, d] = date.split('-').map(Number)

  if (!y || !m || !d) {
    throw new Error(`Invalid calendar date: ${date}`)
  }

  return { y, m, d }
}

export function formatCalendarDate(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function getCalendarDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const start = parseCalendarDate(startDate)
  const end = parseCalendarDate(endDate)
  let timestamp = Date.UTC(start.y, start.m - 1, start.d)
  const endTimestamp = Date.UTC(end.y, end.m - 1, end.d)

  while (timestamp <= endTimestamp) {
    const current = new Date(timestamp)
    dates.push(formatCalendarDate(
      current.getUTCFullYear(),
      current.getUTCMonth() + 1,
      current.getUTCDate(),
    ))
    timestamp += MS_PER_DAY
  }

  return dates
}

export function getTodayInTimeZone(timeZone: string = BONAIRE_TIMEZONE): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date())
}

export function addCalendarDays(date: string, days: number): string {
  const { y, m, d } = parseCalendarDate(date)
  const next = new Date(Date.UTC(y, m - 1, d + days))

  return formatCalendarDate(
    next.getUTCFullYear(),
    next.getUTCMonth() + 1,
    next.getUTCDate(),
  )
}

export function compareCalendarDates(a: string, b: string): number {
  return a.localeCompare(b)
}
