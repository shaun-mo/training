// =============================================================================
// DATE UTILITIES
// -----------------------------------------------------------------------------
// All dates are handled as plain calendar strings ("YYYY-MM-DD") to avoid any
// timezone / DST off-by-one bugs. When we need arithmetic we anchor at UTC noon.
// =============================================================================

/** "YYYY-MM-DD" for the given moment, as seen in the target timezone. */
export function getTodayISO(timeZone: string, now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

/** Parse "YYYY-MM-DD" to a Date anchored at UTC noon (safe for day math). */
function parse(iso: string): Date {
  return new Date(`${iso}T12:00:00Z`)
}

/** Format a UTC-noon Date back to "YYYY-MM-DD". */
function format(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Add (or subtract) whole days to an ISO date, returning a new ISO date. */
export function addDays(iso: string, days: number): string {
  const d = parse(iso)
  d.setUTCDate(d.getUTCDate() + days)
  return format(d)
}

/** Whole-day difference: b - a (positive if b is after a). */
export function diffDays(a: string, b: string): number {
  const ms = parse(b).getTime() - parse(a).getTime()
  return Math.round(ms / 86_400_000)
}

/** ISO date of the Sunday on or before the given date (weeks start Sunday). */
export function startOfWeek(iso: string): string {
  const d = parse(iso)
  const dow = d.getUTCDay() // 0 = Sun … 6 = Sat
  return addDays(iso, -dow)
}

/** The 7 ISO dates Sunday → Saturday for the week containing `iso`. */
export function weekDates(iso: string): string[] {
  const sunday = startOfWeek(iso)
  return Array.from({ length: 7 }, (_, i) => addDays(sunday, i))
}

const LONG = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
})
const FULL = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})
const MED = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})
const WEEKDAY_SHORT = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" })
const DAY_NUM = new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "UTC" })
const MONTH_SHORT = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" })

/** e.g. "Tuesday, June 23" */
export function formatLong(iso: string): string {
  return LONG.format(parse(iso))
}

/** e.g. "Tuesday, June 23, 2026" */
export function formatFull(iso: string): string {
  return FULL.format(parse(iso))
}

/** e.g. "Sun, Nov 22" */
export function formatMedium(iso: string): string {
  return MED.format(parse(iso))
}

/** e.g. "Tue" */
export function formatWeekdayShort(iso: string): string {
  return WEEKDAY_SHORT.format(parse(iso))
}

/** e.g. "23" */
export function formatDayNumber(iso: string): string {
  return DAY_NUM.format(parse(iso))
}

/** e.g. "Jun" */
export function formatMonthShort(iso: string): string {
  return MONTH_SHORT.format(parse(iso))
}
