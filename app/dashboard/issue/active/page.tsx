import Link from "next/link"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ActiveIssuesList } from "@/components/issue/active-issues-list"

export default async function ActiveIssuesPage() {
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

  // Get active issues with asset and user details
  const { data: activeIssues, error: issuesError } = await supabase
    .from("asset_issues")
    .select(`
      *,
      asset:assets(
        id,
        asset_code,
        name,
        category,
        brand,
        model,
        location
      ),
      issued_to_profile:profiles!asset_issues_issued_to_fkey(
        full_name,
        email,
        department
      ),
      issued_by_profile:profiles!asset_issues_issued_by_fkey(
        full_name
      )
    `)
    .eq("status", "active")
    .order("issue_date", { ascending: false })

  if (issuesError) {
    console.error("Error fetching active issues:", issuesError)
  }

  const canManageIssues = profile?.role === "admin" || profile?.role === "technician"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-university-blue-900">Active Issues</h1>
          <p className="text-university-gray-600 mt-1">Track currently issued assets and process returns</p>
        </div>
        {canManageIssues && (
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/issue">Issue Asset</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/issue/scan">Quick Scan</Link>
            </Button>
          </div>
        )}
      </div>

      <ActiveIssuesList issues={activeIssues || []} canManageIssues={canManageIssues} currentUserId={user.id} />
    </div>
  )
}
