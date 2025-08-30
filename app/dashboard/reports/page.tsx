"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Package, 
  AlertTriangle,
  Download,
  Calendar,
  DollarSign,
  Activity
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ReportData {
  totalAssets: number
  totalUsers: number
  activeIssues: number
  maintenanceDue: number
  assetValue: number
  departmentStats: Array<{
    name: string
    assetCount: number
    userCount: number
  }>
  assetTypeDistribution: Array<{
    type: string
    count: number
    percentage: number
  }>
  monthlyIssues: Array<{
    month: string
    count: number
  }>
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("30")
  const [reportType, setReportType] = useState("overview")

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Fetch basic statistics
      const [assetsResult, usersResult, issuesResult] = await Promise.all([
        supabase.from("assets").select("id, value, department, type, status"),
        supabase.from("profiles").select("id, department, role"),
        supabase.from("asset_issues").select("id, status, created_at")
      ])

      if (assetsResult.error || usersResult.error || issuesResult.error) {
        throw new Error("Failed to fetch report data")
      }

      const assets = assetsResult.data || []
      const users = usersResult.data || []
      const issues = issuesResult.data || []

      // Calculate statistics
      const totalAssets = assets.length
      const totalUsers = users.length
      const activeIssues = issues.filter(issue => issue.status === "active").length
      const assetValue = assets.reduce((sum, asset) => sum + (asset.value || 0), 0)

      // Department statistics
      const departmentStats = users.reduce((acc, user) => {
        const dept = user.department || "Unassigned"
        if (!acc.find(d => d.name === dept)) {
          acc.push({
            name: dept,
            assetCount: assets.filter(a => a.department === dept).length,
            userCount: users.filter(u => u.department === dept).length
          })
        }
        return acc
      }, [] as Array<{name: string, assetCount: number, userCount: number}>)

      // Asset type distribution
      const typeCounts = assets.reduce((acc, asset) => {
        const type = asset.type || "Unknown"
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const assetTypeDistribution = Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / totalAssets) * 100)
      }))

      // Monthly issues (last 6 months)
      const monthlyIssues = Array.from({ length: 6 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        const monthIssues = issues.filter(issue => {
          const issueDate = new Date(issue.created_at)
          return issueDate.getMonth() === date.getMonth() && 
                 issueDate.getFullYear() === date.getFullYear()
        })
        return { month, count: monthIssues.length }
      }).reverse()

      setReportData({
        totalAssets,
        totalUsers,
        activeIssues,
        maintenanceDue: 0, // TODO: Implement maintenance tracking
        assetValue,
        departmentStats,
        assetTypeDistribution,
        monthlyIssues
      })
    } catch (error) {
      console.error("Error fetching report data:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = (format: 'pdf' | 'csv' | 'excel') => {
    // TODO: Implement export functionality
    console.log(`Exporting report as ${format}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading reports...</p>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load report data</p>
        <Button onClick={fetchReportData} className="mt-4">Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your asset management system
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => exportReport('pdf')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalAssets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.activeIssues}</div>
            <p className="text-xs text-muted-foreground">
              Pending resolution
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asset Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${reportData.assetValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total inventory value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs value={reportType} onValueChange={setReportType} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Department Overview</CardTitle>
                <CardDescription>Asset and user distribution by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.departmentStats.map((dept) => (
                    <div key={dept.name} className="flex items-center justify-between">
                      <span className="font-medium">{dept.name}</span>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{dept.assetCount} assets</span>
                        <span>{dept.userCount} users</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Asset Types</CardTitle>
                <CardDescription>Distribution of assets by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.assetTypeDistribution.map((type) => (
                    <div key={type.type} className="flex items-center justify-between">
                      <span className="font-medium">{type.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {type.count} ({type.percentage}%)
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${type.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Analysis</CardTitle>
              <CardDescription>Detailed breakdown by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Department</th>
                      <th className="text-left py-2">Assets</th>
                      <th className="text-left py-2">Users</th>
                      <th className="text-left py-2">Asset/User Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.departmentStats.map((dept) => (
                      <tr key={dept.name} className="border-b">
                        <td className="py-2 font-medium">{dept.name}</td>
                        <td className="py-2">{dept.assetCount}</td>
                        <td className="py-2">{dept.userCount}</td>
                        <td className="py-2">
                          {dept.userCount > 0 ? (dept.assetCount / dept.userCount).toFixed(1) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Issue Trends</CardTitle>
              <CardDescription>Monthly issue count over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {reportData.monthlyIssues.map((month) => (
                    <div key={month.month} className="text-center">
                      <div className="text-sm font-medium">{month.month}</div>
                      <div className="text-2xl font-bold">{month.count}</div>
                    </div>
                  ))}
                </div>
                <div className="h-32 bg-gray-50 rounded-lg flex items-end justify-between p-4">
                  {reportData.monthlyIssues.map((month, index) => {
                    const maxCount = Math.max(...reportData.monthlyIssues.map(m => m.count))
                    const height = maxCount > 0 ? (month.count / maxCount) * 100 : 0
                    return (
                      <div key={month.month} className="flex flex-col items-center">
                        <div 
                          className="w-8 bg-blue-600 rounded-t"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-muted-foreground mt-1">{month.count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
