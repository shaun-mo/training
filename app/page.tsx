import { TrainingDashboard } from "@/components/training-dashboard"
import { PROGRAM_TITLE } from "@/lib/training-plan"

export default function Page() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {PROGRAM_TITLE}
        </h1>
        <p className="text-sm text-muted-foreground">
          Your workout for the day, every day.
        </p>
      </header>

      <TrainingDashboard />
    </main>
  )
}
