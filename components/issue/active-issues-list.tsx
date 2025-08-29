"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface ActiveIssue {
  id: string
  issue_date: string
  expected_return_date: string
  notes: string
  asset: {
    id: string
    asset_code: string
    name: string
    category: string
    brand: string
    model: string
    location: string
  }
  issued_to_profile: {
    full_name: string
    email: string
    department: string
  }
  issued_by_profile: {
    full_name: string
  }
}

interface ActiveIssuesListProps {
  issues: ActiveIssue[]
  canManageIssues: boolean
  currentUserId: string
}

export function ActiveIssuesList({ issues, canManageIssues, currentUserId }: ActiveIssuesListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [overdueFilter, setOverdueFilter] = useState("all")
  const [returnCondition, setReturnCondition] = useState("good")
  const [returnNotes, setReturnNotes] = useState("")
  const [isProcessingReturn, setIsProcessingReturn] = useState(false)
  const router = useRouter()

  const today = new Date()

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.issued_to_profile.full_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || issue.asset.category === categoryFilter

    const isOverdue = new Date(issue.expected_return_date) < today
    const matchesOverdue =
      overdueFilter === "all" ||
      (overdueFilter === "overdue" && isOverdue) ||
      (overdueFilter === "not-overdue" && !isOverdue)

    return matchesSearch && matchesCategory && matchesOverdue
  })

  const processReturn = async (issueId: string, assetId: string) => {
    setIsProcessingReturn(true)

    try {
      const supabase = createClient()

      // Update the asset issue record
      const { error: issueError } = await supabase
        .from("asset_issues")
        .update({
          status: "returned",
          actual_return_date: new Date().toISOString(),
          return_condition: returnCondition,
          notes: returnNotes ? `${returnNotes}` : null,
        })
        .eq("id", issueId)

      if (issueError) throw issueError

      // Update asset status back to available
      const { error: assetError } = await supabase
        .from("assets")
        .update({
          status: "available",
          condition: returnCondition,
        })
        .eq("id", assetId)

      if (assetError) throw assetError

      toast({
        title: "Return processed successfully",
        description: "Asset has been returned and is now available.",
      })

      // Reset form
      setReturnCondition("good")
      setReturnNotes("")

      // Refresh the page
      router.refresh()
    } catch (error) {
      console.error("Error processing return:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process return",
        variant: "destructive",
      })
    } finally {
      setIsProcessingReturn(false)
    }
  }

  const getDaysOverdue = (expectedReturnDate: string) => {
    const expected = new Date(expectedReturnDate)
    const diffTime = today.getTime() - expected.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by asset or person..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="projector">Projector</SelectItem>
                <SelectItem value="laptop">Laptop</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="printer">Printer</SelectItem>
                <SelectItem value="camera">Camera</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={overdueFilter} onValueChange={setOverdueFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Issues" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Issues</SelectItem>
                <SelectItem value="overdue">Overdue Only</SelectItem>
                <SelectItem value="not-overdue">Not Overdue</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-university-gray-600 flex items-center">
              {filteredIssues.length} of {issues.length} issues
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredIssues.map((issue) => {
          const daysOverdue = getDaysOverdue(issue.expected_return_date)
          const isOverdue = daysOverdue > 0

          return (
            <Card key={issue.id} className={`hover:shadow-lg transition-shadow ${isOverdue ? "border-red-200" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-university-blue-900">{issue.asset.name}</CardTitle>
                    <p className="text-sm text-university-gray-600 font-mono">{issue.asset.asset_code}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className="capitalize">{issue.asset.category}</Badge>
                    {isOverdue && (
                      <Badge className="bg-red-100 text-red-800">
                        {daysOverdue} day{daysOverdue > 1 ? "s" : ""} overdue
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-university-gray-600">Issued To:</span>
                    <p className="font-medium">{issue.issued_to_profile.full_name}</p>
                    <p className="text-university-gray-600">{issue.issued_to_profile.department}</p>
                  </div>
                  <div>
                    <span className="text-university-gray-600">Issue Date:</span>
                    <p className="font-medium">{new Date(issue.issue_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-university-gray-600">Expected Return:</span>
                    <p className={`font-medium ${isOverdue ? "text-red-600" : ""}`}>
                      {new Date(issue.expected_return_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-university-gray-600">Issued By:</span>
                    <p className="font-medium">{issue.issued_by_profile.full_name}</p>
                  </div>
                </div>

                {issue.notes && (
                  <div className="p-3 bg-university-blue-50 rounded-md">
                    <p className="text-sm text-university-blue-900">{issue.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Link href={`/dashboard/assets/${issue.asset.id}`}>
                    <Button variant="outline" size="sm">
                      View Asset
                    </Button>
                  </Link>
                  {canManageIssues && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Process Return
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Process Asset Return</DialogTitle>
                          <DialogDescription>
                            Record the return of {issue.asset.name} ({issue.asset.asset_code})
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Return Condition</Label>
                            <Select value={returnCondition} onValueChange={setReturnCondition}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="excellent">Excellent</SelectItem>
                                <SelectItem value="good">Good</SelectItem>
                                <SelectItem value="fair">Fair</SelectItem>
                                <SelectItem value="poor">Poor</SelectItem>
                                <SelectItem value="damaged">Damaged</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Return Notes (Optional)</Label>
                            <Textarea
                              value={returnNotes}
                              onChange={(e) => setReturnNotes(e.target.value)}
                              placeholder="Any issues or observations about the returned asset..."
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => processReturn(issue.id, issue.asset.id)}
                              disabled={isProcessingReturn}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isProcessingReturn ? "Processing..." : "Process Return"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredIssues.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-lg font-medium text-university-gray-900 mb-2">No active issues found</h3>
            <p className="text-university-gray-600">
              {searchTerm || categoryFilter !== "all" || overdueFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No assets are currently issued."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
