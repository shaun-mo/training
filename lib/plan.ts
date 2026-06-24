// =============================================================================
// PLAN LOADER
// -----------------------------------------------------------------------------
// The program is sourced from public/ironman_training_plan.json. To update the
// plan, just edit that JSON file (one object per day) — nothing else changes.
// The JSON is imported at build time, so there are no filesystem reads at
// render and it deploys cleanly to Vercel.
// =============================================================================

import raw from "@/public/ironman_training_plan.json"

import type { PlanDay } from "./plan-types"

interface RawDay {
  date: string
  day: string
  week: number
  phase: string
  strength_tag: string
  strength_workout: string
  endurance_tag: string
  endurance_workout: string
  notes: string
}

/** Load the full program, sorted by date. */
export function loadPlan(): PlanDay[] {
  return (raw as RawDay[])
    .map((r) => ({
      date: r.date,
      weekday: r.day ?? "",
      week: Number(r.week) || 0,
      phase: r.phase ?? "",
      strengthTag: r.strength_tag ?? "",
      strengthWorkout: r.strength_workout ?? "",
      enduranceTag: r.endurance_tag ?? "",
      enduranceWorkout: r.endurance_workout ?? "",
      notes: r.notes ?? "",
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
