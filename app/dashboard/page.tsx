import { Suspense } from "react"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  )
}
