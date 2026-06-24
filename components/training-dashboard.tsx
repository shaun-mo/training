"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  addDays,
  formatDayNumber,
  formatLong,
  formatWeekdayShort,
  getTodayISO,
  startOfWeek,
  weekDates,
} from "@/lib/dates"
import { getProgramDay, isRestDay, isUnplanned } from "@/lib/program"
import { PROGRAM_WEEKS, TIME_ZONE, type TrainingDay } from "@/lib/training-plan"
import { cn } from "@/lib/utils"

export function TrainingDashboard() {
  // `selected` starts null so the server and client agree on first paint; the
  // real "today" (Central time) is resolved on the client after mount.
  const [today, setToday] = React.useState<string | null>(null)
  const [selected, setSelected] = React.useState<string | null>(null)

  React.useEffect(() => {
    const iso = getTodayISO(TIME_ZONE)
    setToday(iso)
    setSelected(iso)
  }, [])

  if (!today || !selected) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        Loading today&rsquo;s workout…
      </p>
    )
  }

  const week = weekDates(selected)
  const weekAnchor = getProgramDay(startOfWeek(selected))

  return (
    <div className="flex flex-col gap-5">
      <WeekNav
        weekLabel={
          weekAnchor.inProgram
            ? `Week ${weekAnchor.weekNumber} of ${PROGRAM_WEEKS}`
            : "Off-program week"
        }
        weekFocus={weekAnchor.week?.focus}
        onPrev={() => setSelected(addDays(selected, -7))}
        onNext={() => setSelected(addDays(selected, 7))}
        onToday={() => setSelected(today)}
        showToday={selected !== today}
      />

      <WeekStrip
        days={week}
        selected={selected}
        today={today}
        onSelect={setSelected}
      />

      <DayDetail iso={selected} isToday={selected === today} />
    </div>
  )
}

// -----------------------------------------------------------------------------

function WeekNav({
  weekLabel,
  weekFocus,
  onPrev,
  onNext,
  onToday,
  showToday,
}: {
  weekLabel: string
  weekFocus?: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  showToday: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Button variant="outline" size="icon" onClick={onPrev} aria-label="Previous week">
        <ChevronLeft />
      </Button>

      <div className="min-w-0 text-center">
        <p className="truncate text-sm font-medium">{weekLabel}</p>
        {weekFocus ? (
          <p className="truncate text-xs text-muted-foreground">{weekFocus}</p>
        ) : showToday ? (
          <button
            onClick={onToday}
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Back to today
          </button>
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
  days,
  selected,
  today,
  onSelect,
}: {
  days: string[]
  selected: string
  today: string
  onSelect: (iso: string) => void
}) {
  return (
    <div className="grid grid-cols-7 gap-1 sm:gap-2">
      {days.map((iso) => {
        const isSelected = iso === selected
        const isToday = iso === today
        const { day } = getProgramDay(iso)
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

/** Small dots summarising the day's load at a glance. */
function LoadDots({ day, active }: { day: TrainingDay | null; active: boolean }) {
  if (isUnplanned(day)) {
    return <span className="h-1.5" aria-hidden />
  }
  if (isRestDay(day)) {
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
      {day!.sessions.map((_, i) => (
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

const DISCIPLINE_LABEL: Record<string, string> = {
  Swim: "Swim",
  Bike: "Bike",
  Run: "Run",
  Brick: "Brick",
  Strength: "Strength",
  Rest: "Rest",
  Other: "Other",
}

function DayDetail({ iso, isToday }: { iso: string; isToday: boolean }) {
  const { inProgram, weekNumber, day } = getProgramDay(iso)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{formatLong(iso)}</h2>
          {isToday ? (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              Today
            </span>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {inProgram ? `Week ${weekNumber} of ${PROGRAM_WEEKS}` : "Outside the program"}
        </p>
      </CardHeader>

      <CardContent>
        {!inProgram ? (
          <p className="text-sm text-muted-foreground">
            This date is outside the {PROGRAM_WEEKS}-week program window.
          </p>
        ) : isUnplanned(day) ? (
          <p className="text-sm text-muted-foreground">
            No workout entered for this day yet.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {day!.note ? (
              <p className="text-sm text-muted-foreground italic">{day!.note}</p>
            ) : null}
            {day!.sessions.map((session, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 border-l-2 border-border pl-3"
              >
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {DISCIPLINE_LABEL[session.discipline] ?? session.discipline}
                  </span>
                  <span className="font-medium">{session.title}</span>
                  {session.duration ? (
                    <span className="text-sm text-muted-foreground">
                      · {session.duration}
                    </span>
                  ) : null}
                </div>
                {session.details ? (
                  <p className="text-sm whitespace-pre-line text-muted-foreground">
                    {session.details}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
