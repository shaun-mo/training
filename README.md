# Ironman Training Plan

A simple, mobile-first one-page site that shows the workout for the day across a
20-week Ironman training program. It opens to **today's** workout (based on
Austin, TX / Central time) and includes a responsive week calendar to browse
other days.

Built with Next.js (App Router), React, Tailwind CSS v4, and shadcn/ui.

## How it works

- The site computes the current date in **Central Time** and maps it onto the
  program using a start date.
- The week strip shows Monday → Sunday; tap any day to see its full workout, or
  use the arrows to move between weeks. "Back to today" jumps to the current day.

## Editing the plan

Everything you edit day-to-day lives in **`lib/training-plan.ts`**:

- `PROGRAM_START_DATE` — Day 1 of the program (must be a **Monday**, `YYYY-MM-DD`).
- `PROGRAM_WEEKS` — number of weeks (default `20`).
- `trainingPlan` — an array of 20 weeks, each with 7 days (Mon → Sun). Fill in
  each day's `sessions` (discipline, title, optional duration + details).

Week 1 ships with sample workouts so the layout is visible; replace them with the
real plan as it comes in.

## Develop

```bash
bun install
bun run dev        # http://localhost:3000
bun run build      # production build
bun run typecheck  # tsc --noEmit
```

Deployed via Vercel from this repo.
