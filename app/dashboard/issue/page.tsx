import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { IssueAssetForm } from "@/components/issue/issue-asset-form"

export default async function IssueAssetPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if user can issue assets
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || (profile.role !== "admin" && profile.role !== "technician")) {
    redirect("/dashboard")
  }

  // Get available assets
  const { data: availableAssets } = await supabase
    .from("assets")
    .select("id, asset_code, name, category, brand, model, location")
    .eq("status", "available")
    .order("name")

  // Get all staff members for issuing to
  const { data: staffMembers } = await supabase
    .from("profiles")
    .select("id, full_name, email, department, role")
    .order("full_name")

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-university-blue-900">Issue Asset</h1>
        <p className="text-university-gray-600 mt-1">Issue an asset to a staff member</p>
      </div>

      <IssueAssetForm
        availableAssets={availableAssets || []}
        staffMembers={staffMembers || []}
        currentUserId={user.id}
      />
    </div>
  )
}
