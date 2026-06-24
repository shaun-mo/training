// =============================================================================
// TRAINING PLAN CONFIG + DATA
// -----------------------------------------------------------------------------
// This is the ONLY file you edit day-to-day. Fill in the `trainingPlan` weeks
// below as Shaun provides each day's workout. Nothing else needs to change.
// =============================================================================

/** IANA timezone used to decide "today". Austin, TX = Central Time. */
export const TIME_ZONE = "America/Chicago"

/** Shown in the page header. */
export const PROGRAM_TITLE = "Ironman 20-Week Training Plan"

/**
 * Day 1 of the program (a MONDAY, in "YYYY-MM-DD" form).
 * The app maps the real calendar date onto the plan using this anchor, so the
 * site always opens to the correct day. Change this one line if the program
 * starts on a different Monday.
 */
export const PROGRAM_START_DATE = "2026-06-22"

/** Total number of weeks in the program. */
export const PROGRAM_WEEKS = 20

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type Discipline =
  | "Swim"
  | "Bike"
  | "Run"
  | "Brick"
  | "Strength"
  | "Rest"
  | "Other"

export interface Session {
  /** Discipline tag — drives the small label/badge on each session. */
  discipline: Discipline
  /** Short name, e.g. "Easy Run" or "Threshold Intervals". */
  title: string
  /** Optional duration/distance, e.g. "45 min" or "2,000 yd". */
  duration?: string
  /** Optional fuller description. Newlines render as separate lines. */
  details?: string
}

export interface TrainingDay {
  /** One entry per session for the day. Leave empty `[]` for an unplanned day. */
  sessions: Session[]
  /** Optional note shown above the sessions (e.g. coaching cue for the day). */
  note?: string
}

export interface TrainingWeek {
  /** Optional theme for the week, e.g. "Base — Build 1". */
  focus?: string
  /** Exactly 7 days, Monday → Sunday. */
  days: [
    TrainingDay,
    TrainingDay,
    TrainingDay,
    TrainingDay,
    TrainingDay,
    TrainingDay,
    TrainingDay,
  ]
}

// -----------------------------------------------------------------------------
// Helpers for authoring the plan
// -----------------------------------------------------------------------------

/** A rest day. */
const rest = (note?: string): TrainingDay => ({
  sessions: [{ discipline: "Rest", title: "Rest Day" }],
  note,
})

/** An empty / not-yet-entered day. */
const empty = (): TrainingDay => ({ sessions: [] })

/** Build a week from up to 7 days; missing days are filled as empty. */
const week = (
  focus: string | undefined,
  days: Partial<Record<0 | 1 | 2 | 3 | 4 | 5 | 6, TrainingDay>>,
): TrainingWeek => ({
  focus,
  days: [
    days[0] ?? empty(),
    days[1] ?? empty(),
    days[2] ?? empty(),
    days[3] ?? empty(),
    days[4] ?? empty(),
    days[5] ?? empty(),
    days[6] ?? empty(),
  ],
})

const emptyWeek = (): TrainingWeek => week(undefined, {})

// -----------------------------------------------------------------------------
// THE PLAN — 20 weeks, Monday → Sunday.
// Week 1 is filled with sample workouts so you can see the layout working.
// Replace these with the real plan as it comes in.
// -----------------------------------------------------------------------------

export const trainingPlan: TrainingWeek[] = [
  // ---- Week 1 (sample data — replace with the real plan) --------------------
  week("Base — Week 1 (sample)", {
    0: {
      sessions: [
        { discipline: "Swim", title: "Technique Swim", duration: "1,800 yd", details: "Warm up 400. 8x50 drill/swim. Main 6x100 steady. Cool down 200." },
      ],
    },
    1: {
      sessions: [
        { discipline: "Run", title: "Easy Run", duration: "40 min", details: "Conversational pace, Zone 2. Keep heart rate low." },
        { discipline: "Strength", title: "Core + Mobility", duration: "20 min" },
      ],
    },
    2: {
      sessions: [
        { discipline: "Bike", title: "Endurance Ride", duration: "60 min", details: "Steady Zone 2. Smooth cadence 85–95 rpm." },
      ],
    },
    3: {
      sessions: [
        { discipline: "Swim", title: "Endurance Swim", duration: "2,000 yd" },
        { discipline: "Run", title: "Short Brick Run", duration: "15 min", details: "Easy off the swim, focus on form." },
      ],
    },
    4: rest("Optional light stretching or a walk."),
    5: {
      sessions: [
        { discipline: "Bike", title: "Long Ride", duration: "90 min", details: "Aerobic endurance. Practice fueling every 30 min." },
      ],
    },
    6: {
      sessions: [
        { discipline: "Run", title: "Long Run", duration: "60 min", details: "Negative split — start easy, finish a touch quicker." },
      ],
    },
  }),
  // ---- Weeks 2–20 (empty placeholders) -------------------------------------
  ...Array.from({ length: PROGRAM_WEEKS - 1 }, emptyWeek),
]
