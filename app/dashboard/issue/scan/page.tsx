import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { QuickScanInterface } from "@/components/issue/quick-scan-interface"

export default async function QuickScanPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if user can manage issues
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || (profile.role !== "admin" && profile.role !== "technician")) {
    redirect("/dashboard")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-university-blue-900">Quick Scan</h1>
        <p className="text-university-gray-600 mt-1">Scan QR codes for quick asset operations</p>
      </div>

      <QuickScanInterface currentUserId={user.id} />
    </div>
  )
}
