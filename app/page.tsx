import { TrainingDashboard } from "@/components/training-dashboard"
import { loadPlan } from "@/lib/plan"

export default function Page() {
  const plan = loadPlan()

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col px-4 py-6 sm:px-6">
      <div className="flex-1">
        <TrainingDashboard plan={plan} />
      </div>

      <footer className="mt-10 border-t pt-6 text-center">
        <p className="text-sm text-muted-foreground italic">
          You got this. It&rsquo;s always been you.
        </p>
      </footer>
    </main>
  )
}
