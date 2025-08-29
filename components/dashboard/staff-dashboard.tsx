"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

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
          <h1 className="text-3xl font-bold text-university-blue-900">My Dashboard</h1>
          <p className="text-university-gray-600 mt-1">Track your asset assignments and requests</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/request">Request Asset</Link>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Active Issues</CardTitle>
            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.myActiveIssues}</div>
            <p className="text-xs text-muted-foreground">Currently assigned to me</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Projectors</CardTitle>
            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.availableProjectors}</div>
            <p className="text-xs text-muted-foreground">Ready for booking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
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
            <div className="text-2xl font-bold text-red-600">{stats.myOverdueItems}</div>
            <p className="text-xs text-muted-foreground">Need to return</p>
          </CardContent>
        </Card>
      </div>

      {/* My Current Issues */}
      <Card>
        <CardHeader>
          <CardTitle>My Current Assets</CardTitle>
          <CardDescription>Assets currently assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myIssues.map((issue) => {
              const isOverdue = new Date(issue.expected_return_date) < new Date()
              const daysUntilDue = Math.ceil(
                (new Date(issue.expected_return_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
              )

              return (
                <div key={issue.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-university-blue-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-university-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">{issue.asset.name}</h4>
                      <p className="text-sm text-university-gray-600 font-mono">{issue.asset.asset_code}</p>
                      <p className="text-sm text-university-gray-600">
                        Issued: {new Date(issue.issue_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Due: {new Date(issue.expected_return_date).toLocaleDateString()}
                    </p>
                    {isOverdue ? (
                      <Badge className="bg-red-100 text-red-800">{Math.abs(daysUntilDue)} days overdue</Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-800">{daysUntilDue} days left</Badge>
                    )}
                  </div>
                </div>
              )
            })}
            {myIssues.length === 0 && (
              <div className="text-center py-8">
                <svg
                  className="w-12 h-12 text-university-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="text-lg font-medium text-university-gray-900 mb-2">No active assignments</h3>
                <p className="text-university-gray-600">You don't have any assets currently assigned to you.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Request Asset</CardTitle>
            <CardDescription>Submit a request for equipment</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/request">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Make Request
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">View All Assets</CardTitle>
            <CardDescription>Browse available equipment</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/dashboard/assets">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Browse Assets
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
