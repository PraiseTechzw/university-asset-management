"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Clock, Monitor, AlertTriangle, Package, Search, Plus, Eye, User } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { PageHeader } from "./page-header"

interface StaffStats {
  myActiveIssues: number
  availableProjectors: number
  myOverdueItems: number
}

export function StaffDashboard() {
  const [stats, setStats] = useState<StaffStats>({
    myActiveIssues: 0,
    availableProjectors: 0,
    myOverdueItems: 0,
  })
  const [myIssues, setMyIssues] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStaffData()
  }, [])

  const fetchStaffData = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Fetch my active issues
      const { data: myActiveIssues } = await supabase
        .from("asset_issues")
        .select(`
          *,
          asset:assets(name, asset_code, category)
        `)
        .eq("issued_to", user.id)
        .eq("status", "active")

      setMyIssues(myActiveIssues || [])

      // Calculate overdue items
      const today = new Date()
      const overdueCount = myActiveIssues?.filter((issue) => new Date(issue.expected_return_date) < today).length || 0

      // Get available projectors
      const { data: projectors } = await supabase
        .from("assets")
        .select("id")
        .eq("category", "projector")
        .eq("status", "available")

      setStats({
        myActiveIssues: myActiveIssues?.length || 0,
        availableProjectors: projectors?.length || 0,
        myOverdueItems: overdueCount,
      })
    } catch (error) {
      console.error("Error fetching staff data:", error)
      toast({
        title: "❌ Error",
        description: "Failed to load dashboard data. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
        title="My Dashboard"
        description="Track your asset assignments and requests"
        actions={
          <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Link href="/dashboard/request">
              <Plus className="w-4 h-4 mr-2" />
              Request Asset
            </Link>
          </Button>
        }
      />

      {/* Welcome Message */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 px-3 py-1">
                  <User className="w-4 h-4 mr-1" />
                  Staff
                </Badge>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Welcome to Your Dashboard
              </h2>
              <p className="text-muted-foreground">
                Manage your asset requests and track current assignments
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Active Issues</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.myActiveIssues.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Currently assigned to me</p>
            <Progress 
              value={stats.myActiveIssues > 0 ? 100 : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Projectors</CardTitle>
            <Monitor className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.availableProjectors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Ready for booking</p>
            <Progress 
              value={stats.availableProjectors > 0 ? 100 : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.myOverdueItems.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Need to return</p>
            <Progress 
              value={stats.myOverdueItems > 0 ? 100 : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* My Current Issues */}
      <Card className="group hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            My Current Assets
          </CardTitle>
          <CardDescription>Assets currently assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myIssues.map((issue, index) => {
              const isOverdue = new Date(issue.expected_return_date) < new Date()
              const daysUntilDue = getDaysUntilDue(issue.expected_return_date)

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
                        Issued: {new Date(issue.issue_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Due: {new Date(issue.expected_return_date).toLocaleDateString()}
                    </p>
                    {isOverdue ? (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                        {Math.abs(daysUntilDue)} days overdue
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {daysUntilDue} days left
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
            {myIssues.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No active assignments</h3>
                <p className="text-muted-foreground">You don't have any assets currently assigned to you.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Request Asset
            </CardTitle>
            <CardDescription>Submit a request for equipment</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/dashboard/request">
                <Plus className="w-4 h-4 mr-2" />
                Make Request
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-600" />
              View All Assets
            </CardTitle>
            <CardDescription>Browse available equipment</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/assets">
                <Search className="w-4 h-4 mr-2" />
                Browse Assets
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Asset Overview
            </CardTitle>
            <CardDescription>Summary of your asset management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.myActiveIssues}</div>
                <p className="text-sm text-muted-foreground">Active Assignments</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.availableProjectors}</div>
                <p className="text-sm text-muted-foreground">Available Projectors</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Assignments</span>
                <span className="font-medium">{stats.myActiveIssues}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Overdue Items</span>
                <span className="font-medium text-red-600">{stats.myOverdueItems}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>On Time</span>
                <span className="font-medium text-green-600">{stats.myActiveIssues - stats.myOverdueItems}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Quick Stats
            </CardTitle>
            <CardDescription>Your asset management summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{stats.myActiveIssues}</div>
              <p className="text-xs text-muted-foreground">Total Assets</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-lg font-bold text-green-600">{stats.availableProjectors}</div>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <div className="text-lg font-bold text-red-600">{stats.myOverdueItems}</div>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
