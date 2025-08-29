import { Suspense } from "react"
import { UsersManagement } from "@/components/dashboard/users-management"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

export default function UsersPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <UsersManagement />
    </Suspense>
  )
}
