"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs"
import {
  addDays,
  formatLong,
  formatMedium,
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
  const [tab, setTab] = React.useState("day")

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
      <header className="relative mb-6 flex items-center justify-center">
        {showReturn ? (
          <button
            onClick={() => select(today!)}
            className="absolute top-1/2 left-0 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Return to today
          </button>
        ) : null}
        <Image
          src="/ironman-logo.png"
          alt="Ironman"
          width={214}
          height={282}
          priority
          className="h-16 w-auto sm:h-20 dark:invert"
        />
      </header>

      {!selected ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Loading today&rsquo;s workout…
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          <DateHeading
            selected={selected}
            day={byDate.get(selected)}
            totalWeeks={totalWeeks}
            isToday={selected === today}
            onPrevDay={() => select(addDays(selected, -1))}
            onNextDay={() => select(addDays(selected, 1))}
          />

          <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
            <TabsList>
              <TabsTab value="day">Day</TabsTab>
              <TabsTab value="week">Week</TabsTab>
              <TabsTab value="plan">Full Plan</TabsTab>
            </TabsList>

            <TabsPanel value="day">
              <DayDetail day={byDate.get(selected)} />
            </TabsPanel>

            <TabsPanel value="week">
              <WeekView
                selected={selected}
                today={today}
                byDate={byDate}
                totalWeeks={totalWeeks}
                onPrevWeek={() => select(addDays(selected, -7))}
                onNextWeek={() => select(addDays(selected, 7))}
                onPick={(iso) => {
                  select(iso)
                  setTab("day")
                }}
              />
            </TabsPanel>

            <TabsPanel value="plan">
              <FullPlan
                plan={plan}
                selected={selected}
                today={today}
                onPick={(iso) => {
                  select(iso)
                  setTab("day")
                }}
              />
            </TabsPanel>
          </Tabs>
        </div>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------

function DateHeading({
  selected,
  day,
  totalWeeks,
  isToday,
  onPrevDay,
  onNextDay,
}: {
  selected: string
  day: PlanDay | undefined
  totalWeeks: number
  isToday: boolean
  onPrevDay: () => void
  onNextDay: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Button variant="outline" size="icon" onClick={onPrevDay} aria-label="Previous day">
        <ChevronLeft />
      </Button>

      <div className="min-w-0 text-center">
        <div className="flex items-center justify-center gap-2">
          <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
            {formatLong(selected)}
          </h1>
          {isToday ? <Badge>Today</Badge> : null}
        </div>
        {day ? (
          <p className="text-sm text-muted-foreground">
            Week {day.week} of {totalWeeks} · {day.phase}
          </p>
        ) : null}
      </div>

      <Button variant="outline" size="icon" onClick={onNextDay} aria-label="Next day">
        <ChevronRight />
      </Button>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Day detail — strength first, then endurance, then notes. Each its own card,
// stacked vertically on every screen size.
// -----------------------------------------------------------------------------

function DayDetail({ day }: { day: PlanDay | undefined }) {
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
        <WorkoutCard kind="Strength" tag={day.strengthTag} body={day.strengthWorkout} />
      ) : null}
      {showEndurance ? (
        <WorkoutCard kind="Endurance" tag={day.enduranceTag} body={day.enduranceWorkout} />
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

function WorkoutCard({
  kind,
  tag,
  body,
}: {
  kind: string
  tag: string
  body: string
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{kind}</CardTitle>
          {hasValue(tag) ? <Badge variant="secondary">{tag}</Badge> : null}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-line">{hasValue(body) ? body : "—"}</p>
      </CardContent>
    </Card>
  )
}

// -----------------------------------------------------------------------------
// Week view — Sunday → Saturday data table for the selected week.
// -----------------------------------------------------------------------------

function WeekView({
  selected,
  today,
  byDate,
  totalWeeks,
  onPrevWeek,
  onNextWeek,
  onPick,
}: {
  selected: string
  today: string | null
  byDate: Map<string, PlanDay>
  totalWeeks: number
  onPrevWeek: () => void
  onNextWeek: () => void
  onPick: (iso: string) => void
}) {
  const dates = weekDates(selected) // Sun → Sat
  const current = byDate.get(selected)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" size="icon" onClick={onPrevWeek} aria-label="Previous week">
          <ChevronLeft />
        </Button>
        <p className="truncate text-sm font-medium">
          {current
            ? `Week ${current.week} of ${totalWeeks} · ${current.phase}`
            : "Week"}
        </p>
        <Button variant="outline" size="icon" onClick={onNextWeek} aria-label="Next week">
          <ChevronRight />
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Day</TableHead>
            <TableHead>Strength</TableHead>
            <TableHead>Endurance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dates.map((iso) => {
            const d = byDate.get(iso)
            if (!d) {
              return (
                <TableRow key={iso}>
                  <TableCell className="font-medium whitespace-nowrap text-muted-foreground">
                    {formatMedium(iso)}
                  </TableCell>
                  <TableCell colSpan={2} className="text-muted-foreground">
                    No session
                  </TableCell>
                </TableRow>
              )
            }
            return (
              <ClickableRow
                key={iso}
                onPick={() => onPick(iso)}
                isToday={iso === today}
                isSelected={iso === selected}
              >
                <TableCell className="font-medium whitespace-nowrap">
                  {formatMedium(iso)}
                </TableCell>
                <TableCell>{hasValue(d.strengthTag) ? d.strengthTag : "—"}</TableCell>
                <TableCell>{hasValue(d.enduranceTag) ? d.enduranceTag : "—"}</TableCell>
              </ClickableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Full plan — scrollable data table of every day.
// -----------------------------------------------------------------------------

function FullPlan({
  plan,
  selected,
  today,
  onPick,
}: {
  plan: PlanDay[]
  selected: string
  today: string | null
  onPick: (iso: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">Tap any day to open it.</p>
      <div className="max-h-[60vh] overflow-y-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Wk</TableHead>
              <TableHead>Strength</TableHead>
              <TableHead>Endurance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plan.map((d) => (
              <ClickableRow
                key={d.date}
                onPick={() => onPick(d.date)}
                isToday={d.date === today}
                isSelected={d.date === selected}
              >
                <TableCell className="font-medium whitespace-nowrap">
                  {formatMedium(d.date)}
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {d.week}
                </TableCell>
                <TableCell>{hasValue(d.strengthTag) ? d.strengthTag : "—"}</TableCell>
                <TableCell>{hasValue(d.enduranceTag) ? d.enduranceTag : "—"}</TableCell>
              </ClickableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------

function ClickableRow({
  onPick,
  isToday,
  isSelected,
  children,
}: {
  onPick: () => void
  isToday: boolean
  isSelected: boolean
  children: React.ReactNode
}) {
  return (
    <TableRow
      role="button"
      tabIndex={0}
      onClick={onPick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onPick()
        }
      }}
      className={cn(
        "cursor-pointer",
        isSelected && "bg-muted",
        isToday && !isSelected && "bg-accent/60"
      )}
    >
      {children}
    </TableRow>
  )
}
