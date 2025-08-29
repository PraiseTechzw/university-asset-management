"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, Clock, AlertTriangle, Wrench, QrCode, Package, Eye } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

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
    const total = stats.availableAssets + stats.issuedAssets + stats.maintenanceAssets
    if (total === 0) return 0
    return Math.round(((stats.issuedAssets + stats.maintenanceAssets) / total) * 100)
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Technician Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Manage asset operations and maintenance</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Link href="/dashboard/issue/scan">
              <QrCode className="w-4 h-4 mr-2" />
              Quick Scan
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/issue">
              <Package className="w-4 h-4 mr-2" />
              Issue Asset
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Assets</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.availableAssets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Ready to issue</p>
            <Progress 
              value={stats.availableAssets + stats.issuedAssets + stats.maintenanceAssets > 0 ? 
                (stats.availableAssets / (stats.availableAssets + stats.issuedAssets + stats.maintenanceAssets)) * 100 : 0} 
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
            <p className="text-xs text-muted-foreground">In use</p>
            <Progress 
              value={stats.availableAssets + stats.issuedAssets + stats.maintenanceAssets > 0 ? 
                (stats.issuedAssets / (stats.availableAssets + stats.issuedAssets + stats.maintenanceAssets)) * 100 : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Returns</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueAssets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
            <Progress 
              value={stats.issuedAssets > 0 ? (stats.overdueAssets / stats.issuedAssets) * 100 : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.maintenanceAssets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Under repair</p>
            <Progress 
              value={stats.availableAssets + stats.issuedAssets + stats.maintenanceAssets > 0 ? 
                (stats.maintenanceAssets / (stats.availableAssets + stats.issuedAssets + stats.maintenanceAssets)) * 100 : 0} 
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
            <CardDescription>Asset utilization and operational metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{getUtilizationRate()}%</div>
                <p className="text-sm text-muted-foreground">Asset Utilization</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.availableAssets}</div>
                <p className="text-sm text-muted-foreground">Available for Issue</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Assets</span>
                <span className="font-medium">{stats.availableAssets + stats.issuedAssets + stats.maintenanceAssets}</span>
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
              <QrCode className="w-5 h-5 text-purple-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common technician tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/dashboard/issue/scan">
                <QrCode className="w-4 h-4 mr-2" />
                Quick Scan
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/issue">
                <Package className="w-4 h-4 mr-2" />
                Issue Asset
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/issue/active">
                <Eye className="w-4 h-4 mr-2" />
                View Active Issues
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues */}
      <Card className="group hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle>Recent Issues</CardTitle>
          <CardDescription>Latest asset assignments requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentIssues.map((issue, index) => {
              const isOverdue = new Date(issue.expected_return_date) < new Date()
              return (
                <div 
                  key={issue.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors animate-in slide-in-from-left-4 duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/20 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{issue.asset?.name || "Unknown Asset"}</h4>
                      <p className="text-sm text-muted-foreground font-mono">{issue.asset?.asset_code || "No Code"}</p>
                      <p className="text-sm text-muted-foreground">
                        To: {issue.issued_to_profile?.full_name || "Unknown User"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(issue.expected_return_date).toLocaleDateString()}
                    </p>
                    {isOverdue && (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
            {recentIssues.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No active issues</h3>
                <p className="text-muted-foreground">All assets are properly managed.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-600" />
              Quick Scan
            </CardTitle>
            <CardDescription>Scan QR codes for instant operations</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/dashboard/issue/scan">
                <QrCode className="w-4 h-4 mr-2" />
                Start Scanning
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Issue Asset
            </CardTitle>
            <CardDescription>Assign assets to staff members</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/issue">
                <Package className="w-4 h-4 mr-2" />
                Issue Asset
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              Active Issues
            </CardTitle>
            <CardDescription>Manage current asset assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/issue/active">
                <Eye className="w-4 h-4 mr-2" />
                View Issues
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
