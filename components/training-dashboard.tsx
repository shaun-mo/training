"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  addDays,
  formatDayNumber,
  formatLong,
  formatWeekdayShort,
  getTodayISO,
  weekDates,
} from "@/lib/dates"
import { hasValue, TIME_ZONE, type PlanDay } from "@/lib/plan-types"
import { cn } from "@/lib/utils"

export function TrainingDashboard({ plan }: { plan: PlanDay[] }) {
  const { byDate, first, last, totalWeeks } = React.useMemo(() => {
    const byDate = new Map(plan.map((d) => [d.date, d]))
    return {
      byDate,
      first: plan[0]?.date ?? "",
      last: plan[plan.length - 1]?.date ?? "",
      totalWeeks: plan.reduce((m, d) => Math.max(m, d.week), 0),
    }
  }, [plan])

  const clamp = React.useCallback(
    (iso: string) => (iso < first ? first : iso > last ? last : iso),
    [first, last]
  )

  const [today, setToday] = React.useState<string | null>(null)
  const [selected, setSelected] = React.useState<string | null>(null)

  React.useEffect(() => {
    const t = getTodayISO(TIME_ZONE)
    setToday(t)
    setSelected(clamp(t))
  }, [clamp])

  const select = React.useCallback(
    (iso: string) => setSelected(clamp(iso)),
    [clamp]
  )

  const todayInRange = !!today && today >= first && today <= last
  const showReturn = !!today && !!selected && selected !== today && todayInRange

  return (
    <div className="flex flex-col">
      {/* Logo header — "Return to today" sits top-left, centered with the logo */}
      <header className="relative mb-9 flex items-center justify-center">
        {showReturn ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => select(today!)}
            className="absolute top-1/2 left-0 -translate-y-1/2 text-muted-foreground"
          >
            ← Return to today
          </Button>
        ) : null}
        <Image
          src="/ironman-logo.png"
          alt="Ironman"
          width={214}
          height={282}
          priority
          className="h-10 w-auto sm:h-12 dark:invert"
        />
      </header>

      {!selected ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Loading today&rsquo;s workout…
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Date — top of the body, where the title used to be */}
          <div className="flex items-center justify-center gap-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {formatLong(selected)}
            </h1>
            {selected === today ? <Badge>Today</Badge> : null}
          </div>

          <WeekNav
            weekLabel={`Week ${byDate.get(selected)?.week ?? "?"} of ${totalWeeks}`}
            phase={byDate.get(selected)?.phase}
            onPrev={() => select(addDays(selected, -7))}
            onNext={() => select(addDays(selected, 7))}
          />

          <WeekStrip
            dates={weekDates(selected)}
            selected={selected}
            today={today}
            byDate={byDate}
            onSelect={select}
          />

          <DayDetail day={byDate.get(selected)} date={selected} />
        </div>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------

function WeekNav({
  weekLabel,
  phase,
  onPrev,
  onNext,
}: {
  weekLabel: string
  phase?: string
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Button variant="outline" size="icon" onClick={onPrev} aria-label="Previous week">
        <ChevronLeft />
      </Button>
      <div className="min-w-0 text-center">
        <p className="truncate text-sm font-medium">{weekLabel}</p>
        {phase ? (
          <p className="truncate text-xs text-muted-foreground">{phase}</p>
        ) : null}
      </div>
      <Button variant="outline" size="icon" onClick={onNext} aria-label="Next week">
        <ChevronRight />
      </Button>
    </div>
  )
}

// -----------------------------------------------------------------------------

function WeekStrip({
  dates,
  selected,
  today,
  byDate,
  onSelect,
}: {
  dates: string[]
  selected: string
  today: string | null
  byDate: Map<string, PlanDay>
  onSelect: (iso: string) => void
}) {
  return (
    <div className="grid grid-cols-7 gap-1 sm:gap-2">
      {dates.map((iso) => {
        const isSelected = iso === selected
        const isToday = iso === today
        const day = byDate.get(iso)
        return (
          <button
            key={iso}
            onClick={() => onSelect(iso)}
            aria-current={isToday ? "date" : undefined}
            aria-pressed={isSelected}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg border px-0.5 py-2 transition-colors",
              "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              isSelected
                ? "border-transparent bg-primary text-primary-foreground hover:bg-primary"
                : isToday
                  ? "border-foreground/40"
                  : "border-border"
            )}
          >
            <span
              className={cn(
                "text-[10px] font-medium tracking-wide uppercase",
                isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
              )}
            >
              {formatWeekdayShort(iso).slice(0, 2)}
            </span>
            <span className="text-sm font-semibold tabular-nums">
              {formatDayNumber(iso)}
            </span>
            <LoadDots day={day} active={isSelected} />
          </button>
        )
      })}
    </div>
  )
}

function LoadDots({ day, active }: { day?: PlanDay; active: boolean }) {
  if (!day) return <span className="h-1.5" aria-hidden />

  const strengthLoad = hasValue(day.strengthTag) && day.strengthTag !== "Rest"
  const enduranceLoad =
    hasValue(day.enduranceTag) &&
    day.enduranceTag !== "Rest" &&
    day.enduranceTag !== "Recovery"
  const count = (strengthLoad ? 1 : 0) + (enduranceLoad ? 1 : 0)

  if (count === 0) {
    return (
      <span
        aria-hidden
        className={cn(
          "h-1.5 w-1.5 rounded-full border",
          active ? "border-primary-foreground/70" : "border-muted-foreground/60"
        )}
      />
    )
  }
  return (
    <span className="flex h-1.5 items-center gap-0.5" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            active ? "bg-primary-foreground" : "bg-foreground/70"
          )}
        />
      ))}
    </span>
  )
}

// -----------------------------------------------------------------------------
// Day detail — strength first (as a checklist), then endurance, then notes.
// -----------------------------------------------------------------------------

/** Split a workout into individual steps. Drops the leading group label
 *  (e.g. "Back: ") since it's already shown as a tag, and splits on commas and
 *  arrows. Commas inside numbers (e.g. "1,500 yd") are preserved. */
function parseSteps(text: string): string[] {
  let s = (text ?? "").trim()
  if (!s) return []
  const colon = s.indexOf(":")
  if (colon > -1 && colon <= 20) s = s.slice(colon + 1).trim()
  s = s.replace(/\s*\.\s*$/, "")
  return s
    .split(/\s*->\s*|\s*→\s*|,\s+/)
    .map((x) => x.trim())
    .filter(Boolean)
}

function DayDetail({ day, date }: { day: PlanDay | undefined; date: string }) {
  if (!day) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No workout found for this day.
          </p>
        </CardContent>
      </Card>
    )
  }

  const showStrength = hasValue(day.strengthWorkout) || hasValue(day.strengthTag)
  const showEndurance =
    hasValue(day.enduranceWorkout) || hasValue(day.enduranceTag)

  return (
    <div className="flex flex-col gap-4">
      {showStrength ? (
        <ActivityCard
          kind="Strength"
          section="strength"
          date={date}
          tag={day.strengthTag}
          workout={day.strengthWorkout}
        />
      ) : null}
      {showEndurance ? (
        <ActivityCard
          kind="Endurance"
          section="endurance"
          date={date}
          tag={day.enduranceTag}
          workout={day.enduranceWorkout}
        />
      ) : null}
      {hasValue(day.notes) ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-line text-muted-foreground">
              {day.notes}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function ActivityCard({
  kind,
  section,
  date,
  tag,
  workout,
}: {
  kind: string
  section: "strength" | "endurance"
  date: string
  tag: string
  workout: string
}) {
  const isRest = tag.trim().toLowerCase() === "rest"
  const steps = isRest ? [] : parseSteps(workout)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{kind}</CardTitle>
          {hasValue(tag) ? <Badge variant="secondary">{tag}</Badge> : null}
        </div>
      </CardHeader>
      <CardContent>
        {steps.length > 0 ? (
          <Checklist key={`${section}:${date}`} section={section} date={date} steps={steps} />
        ) : (
          <p className="text-sm whitespace-pre-line">
            {hasValue(workout) ? workout : "—"}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function Checklist({
  section,
  date,
  steps,
}: {
  section: string
  date: string
  steps: string[]
}) {
  const key = `imtraining:${section}:${date}`
  const [checked, setChecked] = React.useState<boolean[]>(() => {
    if (typeof window === "undefined") return steps.map(() => false)
    try {
      const raw = window.localStorage.getItem(key)
      const arr = raw ? (JSON.parse(raw) as boolean[]) : []
      return steps.map((_, i) => !!arr[i])
    } catch {
      return steps.map(() => false)
    }
  })

  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = prev.slice()
      next[i] = !next[i]
      try {
        window.localStorage.setItem(key, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })

  return (
    <ul className="flex flex-col gap-3">
      {steps.map((step, i) => {
        const id = `chk-${section}-${date}-${i}`
        return (
          <li key={i} className="flex items-start gap-2.5">
            <Checkbox
              id={id}
              checked={checked[i] ?? false}
              onCheckedChange={() => toggle(i)}
              className="mt-0.5"
            />
            <label
              htmlFor={id}
              className={cn(
                "cursor-pointer text-sm leading-snug select-none",
                checked[i] && "text-muted-foreground line-through"
              )}
            >
              {step}
            </label>
          </li>
        )
      })}
    </ul>
  )
}
