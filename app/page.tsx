import { TrainingDashboard } from "@/components/training-dashboard"
import { loadPlan } from "@/lib/plan"

export default function Page() {
  const plan = loadPlan()

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <TrainingDashboard plan={plan} />
    </main>
  )
}
