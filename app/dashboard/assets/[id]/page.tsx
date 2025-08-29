import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AssetDetailsView } from "@/components/assets/asset-details-view"

interface AssetDetailsPageProps {
  params: Promise<{ id: string }>
}

export default async function AssetDetailsPage({ params }: AssetDetailsPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get asset details with related data
  const { data: asset, error: assetError } = await supabase
    .from("assets")
    .select(`
      *,
      created_by_profile:profiles!assets_created_by_fkey(full_name),
      asset_issues(
        *,
        issued_to_profile:profiles!asset_issues_issued_to_fkey(full_name),
        issued_by_profile:profiles!asset_issues_issued_by_fkey(full_name)
      ),
      maintenance_logs(
        *,
        performed_by_profile:profiles!maintenance_logs_performed_by_fkey(full_name)
      )
    `)
    .eq("id", id)
    .single()

  if (assetError || !asset) {
    redirect("/dashboard/assets")
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <AssetDetailsView asset={asset} userRole={profile?.role || "staff"} />
    </div>
  )
}
