# Ironman Cozumel — Training Plan

A simple, mobile-first one-page site that shows the workout for the day across a
22-week Ironman training program (Jun 21 → Race Day, Nov 22 2026). It opens to
**today's** workout (based on Austin, TX / Central time) and includes a
responsive week calendar to browse any other day.

Built with Next.js (App Router), React, Tailwind CSS v4, and shadcn/ui (Base UI).

## How it works

- The site computes the current date in **Central Time** and shows that day's
  workout. **Strength** comes first (with a body-part tag — Quads, Arms, Back…),
  then **Endurance** (Run / Swim / Bike / Brick), then any **Notes**.
- Three tabs: **Day** (the full workout, cards stacked vertically), **Week** (a
  Sunday → Saturday table for the selected week), and **Full Plan** (every day).
- Tap any day in a table to open it. "← Return to today" (top-left) jumps back to
  the current day.
- The logo doubles as the app icon — "Add to Home Screen" on iOS uses it.

## Editing the plan

The entire program lives in **`public/ironman_training_plan.json`** — one object
per day. To change a workout, edit that file and redeploy. Each day looks like:

```json
{
  "date": "2026-06-24",
  "day": "Wednesday",
  "week": 1,
  "phase": "Foundation",
  "strength_tag": "Back",
  "strength_workout": "Back: Lat pulldown 4x10, Seated cable row 4x10, …",
  "endurance_tag": "Bike",
  "endurance_workout": "12 mi total — 2 mi WU, 3x2 mi @ Z2, 2 mi CD.",
  "notes": ""
}
```

The JSON is imported at build time (no filesystem reads at render), so it deploys
cleanly to Vercel.

## Develop

```bash
bun install
bun run dev        # http://localhost:3000
bun run build      # production build
bun run typecheck  # tsc --noEmit
```

Deployed via Vercel from this repo.
