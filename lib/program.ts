// =============================================================================
// PROGRAM LOOKUP
// -----------------------------------------------------------------------------
// Maps a real calendar date onto the 20-week plan via PROGRAM_START_DATE.
// =============================================================================

import { diffDays } from "@/lib/dates"
import {
  PROGRAM_START_DATE,
  PROGRAM_WEEKS,
  trainingPlan,
  type TrainingDay,
  type TrainingWeek,
} from "@/lib/training-plan"

export interface ProgramDay {
  /** "YYYY-MM-DD" of this calendar day. */
  iso: string
  /** True when the date falls within the 20-week program. */
  inProgram: boolean
  /** 1-based week number (1…20), or null when outside the program. */
  weekNumber: number | null
  /** 1-based day-of-week within the program week (1 = Mon … 7 = Sun). */
  dayOfWeek: number | null
  /** The week's metadata, or null when outside the program. */
  week: TrainingWeek | null
  /** The day's plan, or null when outside the program. */
  day: TrainingDay | null
}

/** Look up the program info for a given calendar date. */
export function getProgramDay(iso: string): ProgramDay {
  const offset = diffDays(PROGRAM_START_DATE, iso)
  const inProgram = offset >= 0 && offset < PROGRAM_WEEKS * 7

  if (!inProgram) {
    return {
      iso,
      inProgram: false,
      weekNumber: null,
      dayOfWeek: null,
      week: null,
      day: null,
    }
  }

  const weekIndex = Math.floor(offset / 7)
  const dayIndex = offset % 7
  const week = trainingPlan[weekIndex]

  return {
    iso,
    inProgram: true,
    weekNumber: weekIndex + 1,
    dayOfWeek: dayIndex + 1,
    week,
    day: week?.days[dayIndex] ?? null,
  }
}

/** True when a day has no planned sessions. */
export function isUnplanned(day: TrainingDay | null): boolean {
  return !day || day.sessions.length === 0
}

/** True when the only session is a Rest entry. */
export function isRestDay(day: TrainingDay | null): boolean {
  return !!day && day.sessions.length > 0 && day.sessions.every((s) => s.discipline === "Rest")
}
