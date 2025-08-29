"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface TechnicianStats {
  availableAssets: number
  issuedAssets: number
  overdueAssets: number
  maintenanceAssets: number
}

export function TechnicianDashboard() {
  const [stats, setStats] = useState<TechnicianStats>({
    availableAssets: 0,
    issuedAssets: 0,
    overdueAssets: 0,
    maintenanceAssets: 0,
  })
  const [recentIssues, setRecentIssues] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTechnicianData()
  }, [])

  const fetchTechnicianData = async () => {
    try {
      const supabase = createClient()

      // Fetch asset stats
      const { data: assets } = await supabase.from("assets").select("status")

      if (assets) {
        setStats({
          availableAssets: assets.filter((a) => a.status === "available").length,
          issuedAssets: assets.filter((a) => a.status === "issued").length,
          overdueAssets: 0, // Will calculate from issues
          maintenanceAssets: assets.filter((a) => a.status === "maintenance").length,
        })
      }

      // Fetch recent issues
      const { data: issues } = await supabase
        .from("asset_issues")
        .select(`
          *,
          asset:assets(name, asset_code),
          issued_to_profile:profiles!asset_issues_issued_to_fkey(full_name)
        `)
        .eq("status", "active")
        .order("issue_date", { ascending: false })
        .limit(5)

      setRecentIssues(issues || [])

      // Calculate overdue
      const today = new Date()
      const overdue = issues?.filter((issue) => new Date(issue.expected_return_date) < today).length || 0

      setStats((prev) => ({ ...prev, overdueAssets: overdue }))
    } catch (error) {
      console.error("Error fetching technician data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-university-blue-900">Technician Dashboard</h1>
          <p className="text-university-gray-600 mt-1">Manage asset operations and maintenance</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/issue/scan">Quick Scan</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/issue">Issue Asset</Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Assets</CardTitle>
            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.availableAssets}</div>
            <p className="text-xs text-muted-foreground">Ready to issue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Issued</CardTitle>
            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.issuedAssets}</div>
            <p className="text-xs text-muted-foreground">In use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Returns</CardTitle>
            <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueAssets}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <svg className="h-4 w-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.maintenanceAssets}</div>
            <p className="text-xs text-muted-foreground">Under repair</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Issues</CardTitle>
          <CardDescription>Latest asset assignments requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentIssues.map((issue) => {
              const isOverdue = new Date(issue.expected_return_date) < new Date()
              return (
                <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{issue.asset.name}</p>
                      <p className="text-sm text-university-gray-600 font-mono">{issue.asset.asset_code}</p>
                      <p className="text-sm text-university-gray-600">To: {issue.issued_to_profile.full_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-university-gray-600">
                      Due: {new Date(issue.expected_return_date).toLocaleDateString()}
                    </p>
                    {isOverdue && <Badge className="bg-red-100 text-red-800">Overdue</Badge>}
                  </div>
                </div>
              )
            })}
            {recentIssues.length === 0 && <p className="text-center text-university-gray-600 py-8">No active issues</p>}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Scan</CardTitle>
            <CardDescription>Scan QR codes for instant operations</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/issue/scan">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
                Start Scanning
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Issue Asset</CardTitle>
            <CardDescription>Assign assets to staff members</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/dashboard/issue">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Issue Asset
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Issues</CardTitle>
            <CardDescription>Manage current asset assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/dashboard/issue/active">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                View Issues
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
