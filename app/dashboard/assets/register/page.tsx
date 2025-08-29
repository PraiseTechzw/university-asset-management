import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AssetRegistrationForm } from "@/components/assets/asset-registration-form"

export default async function RegisterAssetPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if user can register assets
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || (profile.role !== "admin" && profile.role !== "technician")) {
    redirect("/dashboard/assets")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-university-blue-900">Register New Asset</h1>
        <p className="text-university-gray-600 mt-1">Add a new asset to the university inventory</p>
      </div>

      <AssetRegistrationForm />
    </div>
  )
}
