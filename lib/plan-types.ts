// =============================================================================
// PLAN TYPES + CONFIG  (client-safe)
// =============================================================================

/** IANA timezone used to decide "today". Austin, TX = Central Time. */
export const TIME_ZONE = "America/Chicago"

/** One day of the program. */
export interface PlanDay {
  /** ISO date, "YYYY-MM-DD". */
  date: string
  /** Weekday name, e.g. "Tuesday". */
  weekday: string
  /** Week number within the program (1-based). */
  week: number
  /** Training phase, e.g. "Foundation", "Base Build", "Taper & Race". */
  phase: string
  /** Strength body-part tag, e.g. "Quads", "Arms", "Rest". */
  strengthTag: string
  strengthWorkout: string
  /** Endurance discipline tag, e.g. "Run", "Swim", "Bike", "Brick". */
  enduranceTag: string
  enduranceWorkout: string
  notes: string
}

/** A field is "empty" when it is blank or just a dash. */
export function hasValue(v: string | undefined | null): v is string {
  return !!v && v.trim() !== "" && v.trim() !== "—" && v.trim() !== "-"
}
