import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AssetsList } from "@/components/assets/assets-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AssetsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile to check role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get assets with pagination
  const { data: assets, error: assetsError } = await supabase
    .from("assets")
    .select(`
      *,
      created_by_profile:profiles!assets_created_by_fkey(full_name),
      current_issue:asset_issues(
        id,
        issued_to,
        issue_date,
        expected_return_date,
        status,
        issued_to_profile:profiles!asset_issues_issued_to_fkey(full_name)
      )
    `)
    .order("created_at", { ascending: false })

  if (assetsError) {
    console.error("Error fetching assets:", assetsError)
  }

  const canManageAssets = profile?.role === "admin" || profile?.role === "technician"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {canManageAssets && (
          <Link href="/dashboard/assets/register">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Register Asset
            </Button>
          </Link>
        )}
      </div>

      <AssetsList assets={assets || []} userRole={profile?.role || "staff"} />
    </div>
  )
}
