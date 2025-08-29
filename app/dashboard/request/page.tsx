import { Suspense } from "react"
import { AssetRequestForm } from "@/components/assets/asset-request-form"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

export default function RequestPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AssetRequestForm />
    </Suspense>
  )
}
