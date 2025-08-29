"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Calendar, TrendingUp, Users, Package, AlertTriangle, Wrench, Archive, Clock, Shield } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { PageHeader } from "./page-header"

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
  const [selectedPeriod, setSelectedPeriod] = useState("week")

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

      recentIssues?.forEach((issue: any) => {
        if (issue.actual_return_date) {
          activity.push({
            id: issue.id,
            type: "return",
            asset_name: issue.asset?.name || "Unknown Asset",
            user_name: issue.issued_to_profile?.full_name || "Unknown User",
            date: issue.actual_return_date,
          })
        }
        activity.push({
          id: `${issue.id}-issue`,
          type: "issue",
          asset_name: issue.asset?.name || "Unknown Asset",
          user_name: issue.issued_to_profile?.full_name || "Unknown User",
          date: issue.issue_date,
        })
      })

      recentAssets?.forEach((asset: any) => {
        activity.push({
          id: `${asset.id}-register`,
          type: "register",
          asset_name: asset.name || "Unknown Asset",
          user_name: asset.created_by_profile?.full_name || "System",
          date: asset.created_at,
        })
      })

      // Sort by date and take top 10
      activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setRecentActivity(activity.slice(0, 10))
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "❌ Error",
        description: "Failed to load dashboard data. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getUtilizationRate = () => {
    if (stats.totalAssets === 0) return 0
    return Math.round(((stats.issuedAssets + stats.maintenanceAssets) / stats.totalAssets) * 100)
  }

  const getOverdueRate = () => {
    if (stats.issuedAssets === 0) return 0
    return Math.round((stats.overdueAssets / stats.issuedAssets) * 100)
  }

  const COLORS = ["#16a34a", "#2563eb", "#ca8a04", "#6b7280", "#dc2626"]

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <PageHeader
        title="Admin Dashboard"
        description="Comprehensive overview of asset management system"
        actions={
          <div className="flex gap-2">
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/dashboard/assets/register">
                <Package className="w-4 h-4 mr-2" />
                Add Asset
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/issue">
                <Clock className="w-4 h-4 mr-2" />
                Issue Asset
              </Link>
            </Button>
          </div>
        }
      />

      {/* Welcome Message */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 px-3 py-1">
                  <Shield className="w-4 h-4 mr-1" />
                  Admin
                </Badge>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Welcome to the Admin Dashboard
              </h2>
              <p className="text-muted-foreground">
                Manage assets, users, and system settings with full administrative access
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Registered in system</p>
            <Progress value={100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.availableAssets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Ready for use</p>
            <Progress 
              value={stats.totalAssets > 0 ? (stats.availableAssets / stats.totalAssets) * 100 : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Issued</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.issuedAssets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">In use by staff</p>
            <Progress 
              value={stats.totalAssets > 0 ? (stats.issuedAssets / stats.totalAssets) * 100 : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueAssets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
            <Progress 
              value={getOverdueRate()} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeIssues.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Currently tracked</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.maintenanceAssets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Under maintenance</p>
            <Progress 
              value={stats.totalAssets > 0 ? (stats.maintenanceAssets / stats.totalAssets) * 100 : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retired</CardTitle>
            <Archive className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.retiredAssets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">End of life</p>
            <Progress 
              value={stats.totalAssets > 0 ? (stats.retiredAssets / stats.totalAssets) * 100 : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              System Overview
            </CardTitle>
            <CardDescription>Key performance indicators and utilization rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{getUtilizationRate()}%</div>
                <p className="text-sm text-muted-foreground">Asset Utilization</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{getOverdueRate()}%</div>
                <p className="text-sm text-muted-foreground">Overdue Rate</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Available Assets</span>
                <span className="font-medium">{stats.availableAssets}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Issued Assets</span>
                <span className="font-medium">{stats.issuedAssets}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Maintenance</span>
                <span className="font-medium">{stats.maintenanceAssets}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/dashboard/assets/register">
                <Package className="w-4 h-4 mr-2" />
                Register New Asset
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/issue">
                <Clock className="w-4 h-4 mr-2" />
                Issue Asset
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/issue/active">
                <Clock className="w-4 h-4 mr-2" />
                View Active Issues
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/users">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Status Distribution */}
            <Card className="group hover:shadow-lg transition-all duration-300">
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
                      label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
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

            {/* Asset Utilization Trend */}
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle>Asset Utilization Trend</CardTitle>
                <CardDescription>Monthly asset usage patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { month: 'Jan', utilization: 65 },
                    { month: 'Feb', utilization: 72 },
                    { month: 'Mar', utilization: 68 },
                    { month: 'Apr', utilization: 75 },
                    { month: 'May', utilization: 80 },
                    { month: 'Jun', utilization: 78 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="utilization" stroke="#2563eb" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card className="group hover:shadow-lg transition-all duration-300">
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
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest asset management activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors animate-in slide-in-from-left-4 duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        className={
                          activity.type === "issue"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                            : activity.type === "return"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                        }
                      >
                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      </Badge>
                      <div>
                        <p className="font-medium">{activity.asset_name}</p>
                        <p className="text-sm text-muted-foreground">{activity.user_name}</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
