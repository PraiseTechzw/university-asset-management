import { Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </Suspense>
    </ProtectedRoute>
  )
}
