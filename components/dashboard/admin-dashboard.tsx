"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import Link from "next/link"

interface DashboardStats {
  totalAssets: number
  availableAssets: number
  issuedAssets: number
  overdueAssets: number
  totalUsers: number
  activeIssues: number
  maintenanceAssets: number
  retiredAssets: number
}

interface AssetByCategory {
  category: string
  count: number
  available: number
  issued: number
}

interface RecentActivity {
  id: string
  type: "issue" | "return" | "register"
  asset_name: string
  user_name: string
  date: string
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    availableAssets: 0,
    issuedAssets: 0,
    overdueAssets: 0,
    totalUsers: 0,
    activeIssues: 0,
    maintenanceAssets: 0,
    retiredAssets: 0,
  })
  const [assetsByCategory, setAssetsByCategory] = useState<AssetByCategory[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const supabase = createClient()

      // Fetch basic stats
      const [assetsResult, usersResult, issuesResult] = await Promise.all([
        supabase.from("assets").select("status, category"),
        supabase.from("profiles").select("id"),
        supabase.from("asset_issues").select("expected_return_date, status"),
      ])

      if (assetsResult.data) {
        const assets = assetsResult.data
        const totalAssets = assets.length
        const availableAssets = assets.filter((a) => a.status === "available").length
        const issuedAssets = assets.filter((a) => a.status === "issued").length
        const maintenanceAssets = assets.filter((a) => a.status === "maintenance").length
        const retiredAssets = assets.filter((a) => a.status === "retired").length

        // Calculate overdue assets
        const today = new Date()
        const overdueAssets =
          issuesResult.data?.filter(
            (issue) => issue.status === "active" && new Date(issue.expected_return_date) < today,
          ).length || 0

        setStats({
          totalAssets,
          availableAssets,
          issuedAssets,
          overdueAssets,
          totalUsers: usersResult.data?.length || 0,
          activeIssues: issuesResult.data?.filter((i) => i.status === "active").length || 0,
          maintenanceAssets,
          retiredAssets,
        })

        // Group assets by category
        const categoryStats = assets.reduce((acc: Record<string, AssetByCategory>, asset) => {
          if (!acc[asset.category]) {
            acc[asset.category] = {
              category: asset.category,
              count: 0,
              available: 0,
              issued: 0,
            }
          }
          acc[asset.category].count++
          if (asset.status === "available") acc[asset.category].available++
          if (asset.status === "issued") acc[asset.category].issued++
          return acc
        }, {})

        setAssetsByCategory(Object.values(categoryStats))
      }

      // Fetch recent activity
      const { data: recentIssues } = await supabase
        .from("asset_issues")
        .select(`
          id,
          issue_date,
          actual_return_date,
          asset:assets(name),
          issued_to_profile:profiles!asset_issues_issued_to_fkey(full_name)
        `)
        .order("issue_date", { ascending: false })
        .limit(10)

      const { data: recentAssets } = await supabase
        .from("assets")
        .select(`
          id,
          name,
          created_at,
          created_by_profile:profiles!assets_created_by_fkey(full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      // Combine and format recent activity
      const activity: RecentActivity[] = []

      recentIssues?.forEach((issue) => {
        if (issue.actual_return_date) {
          activity.push({
            id: issue.id,
            type: "return",
            asset_name: issue.asset.name,
            user_name: issue.issued_to_profile.full_name,
            date: issue.actual_return_date,
          })
        }
        activity.push({
          id: `${issue.id}-issue`,
          type: "issue",
          asset_name: issue.asset.name,
          user_name: issue.issued_to_profile.full_name,
          date: issue.issue_date,
        })
      })

      recentAssets?.forEach((asset) => {
        activity.push({
          id: `${asset.id}-register`,
          type: "register",
          asset_name: asset.name,
          user_name: asset.created_by_profile?.full_name || "System",
          date: asset.created_at,
        })
      })

      // Sort by date and take top 10
      activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setRecentActivity(activity.slice(0, 10))
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#ca8a04", "#9333ea"]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-university-blue-900">Admin Dashboard</h1>
          <p className="text-university-gray-600 mt-1">Overview of asset management system</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/assets/register">Add Asset</Link>
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
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssets}</div>
            <p className="text-xs text-muted-foreground">Registered in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
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
            <p className="text-xs text-muted-foreground">Ready for use</p>
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
            <p className="text-xs text-muted-foreground">In use by staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
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
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeIssues}</div>
            <p className="text-xs text-muted-foreground">Currently tracked</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.maintenanceAssets}</div>
            <p className="text-xs text-muted-foreground">Under maintenance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retired</CardTitle>
            <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.retiredAssets}</div>
            <p className="text-xs text-muted-foreground">End of life</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Asset Status Distribution</CardTitle>
                <CardDescription>Current status of all assets</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Available", value: stats.availableAssets, color: "#16a34a" },
                        { name: "Issued", value: stats.issuedAssets, color: "#2563eb" },
                        { name: "Maintenance", value: stats.maintenanceAssets, color: "#ca8a04" },
                        { name: "Retired", value: stats.retiredAssets, color: "#6b7280" },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: "Available", value: stats.availableAssets, color: "#16a34a" },
                        { name: "Issued", value: stats.issuedAssets, color: "#2563eb" },
                        { name: "Maintenance", value: stats.maintenanceAssets, color: "#ca8a04" },
                        { name: "Retired", value: stats.retiredAssets, color: "#6b7280" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="w-full justify-start">
                  <Link href="/dashboard/assets/register">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Register New Asset
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
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
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/dashboard/issue/active">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    View Active Issues
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/dashboard/users">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                    Manage Users
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assets by Category</CardTitle>
              <CardDescription>Breakdown of assets by type and availability</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={assetsByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="available" stackId="a" fill="#16a34a" name="Available" />
                  <Bar dataKey="issued" stackId="a" fill="#2563eb" name="Issued" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest asset management activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge
                        className={
                          activity.type === "issue"
                            ? "bg-blue-100 text-blue-800"
                            : activity.type === "return"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                        }
                      >
                        {activity.type}
                      </Badge>
                      <div>
                        <p className="font-medium">{activity.asset_name}</p>
                        <p className="text-sm text-university-gray-600">{activity.user_name}</p>
                      </div>
                    </div>
                    <span className="text-sm text-university-gray-600">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-center text-university-gray-600 py-8">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
