"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Loader2, Calendar, Clock, Package } from "lucide-react"
import { format, addDays } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface AssetRequestFormData {
  assetCategory: string
  assetName: string
  purpose: string
  requestedDate: string
  expectedReturnDate: string
  priority: string
  additionalNotes: string
}

interface AvailableAsset {
  id: string
  name: string
  asset_code: string
  category: string
  condition: string
}

export function AssetRequestForm() {
  const [formData, setFormData] = useState<AssetRequestFormData>({
    assetCategory: "",
    assetName: "",
    purpose: "",
    requestedDate: format(new Date(), "yyyy-MM-dd"),
    expectedReturnDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    priority: "medium",
    additionalNotes: "",
  })
  const [availableAssets, setAvailableAssets] = useState<AvailableAsset[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAssets, setIsLoadingAssets] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchAvailableAssets()
  }, [])

  const fetchAvailableAssets = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("assets")
        .select("id, name, asset_code, category, condition")
        .eq("status", "available")
        .order("category", { ascending: true })

      if (error) throw error
      setAvailableAssets(data || [])
    } catch (error) {
      console.error("Error fetching available assets:", error)
      toast({
        title: "Error",
        description: "Failed to fetch available assets",
        variant: "destructive",
      })
    } finally {
      setIsLoadingAssets(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Create asset request
      const { error } = await supabase.from("asset_requests").insert({
        requester_id: user.id,
        asset_category: formData.assetCategory,
        asset_name: formData.assetName,
        purpose: formData.purpose,
        requested_date: formData.requestedDate,
        expected_return_date: formData.expectedReturnDate,
        priority: formData.priority,
        additional_notes: formData.additionalNotes,
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "🎉 Request submitted successfully!",
        description: "Your asset request has been submitted and is pending approval.",
      })

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Error submitting request:", error)
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Failed to submit request",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getAssetsByCategory = (category: string) => {
    if (!category) return []
    return availableAssets.filter((asset) => asset.category === category)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return "🔴"
      case "medium":
        return "🟡"
      case "low":
        return "🟢"
      default:
        return "⚪"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Request Asset</h1>
          <p className="text-muted-foreground mt-1">Submit a request for equipment or assets</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
              <CardDescription>Fill in the details for your asset request</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="assetCategory">Asset Category *</Label>
                    <Select
                      value={formData.assetCategory}
                      onValueChange={(value) => setFormData({ ...formData, assetCategory: value })}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="projector">Projector</SelectItem>
                        <SelectItem value="laptop">Laptop</SelectItem>
                        <SelectItem value="desktop">Desktop</SelectItem>
                        <SelectItem value="printer">Printer</SelectItem>
                        <SelectItem value="camera">Camera</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assetName">Specific Asset (Optional)</Label>
                    <Select
                      value={formData.assetName}
                      onValueChange={(value) => setFormData({ ...formData, assetName: value })}
                      disabled={isLoading || !formData.assetCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any available asset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any available asset</SelectItem>
                        {getAssetsByCategory(formData.assetCategory).map((asset) => (
                          <SelectItem key={asset.id} value={asset.name}>
                            {asset.name} ({asset.asset_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requestedDate">Requested Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="requestedDate"
                        type="date"
                        value={formData.requestedDate}
                        onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
                        className="pl-10"
                        min={format(new Date(), "yyyy-MM-dd")}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedReturnDate">Expected Return Date *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="expectedReturnDate"
                        type="date"
                        value={formData.expectedReturnDate}
                        onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                        className="pl-10"
                        min={formData.requestedDate}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose *</Label>
                    <Input
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      placeholder="e.g., Lecture presentation, Research project"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">Additional Notes</Label>
                  <Textarea
                    id="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    placeholder="Any additional information or special requirements..."
                    rows={3}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Available Assets Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Available Assets
              </CardTitle>
              <CardDescription>Currently available equipment</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAssets ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {availableAssets.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No assets available</p>
                  ) : (
                    availableAssets.slice(0, 5).map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">{asset.asset_code}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {asset.condition}
                        </Badge>
                      </div>
                    ))
                  )}
                  {availableAssets.length > 5 && (
                    <p className="text-center text-xs text-muted-foreground">
                      +{availableAssets.length - 5} more assets available
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Request Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Request Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Category:</span>
                <span className="text-sm font-medium">
                  {formData.assetCategory ? formData.assetCategory.charAt(0).toUpperCase() + formData.assetCategory.slice(1) : "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Priority:</span>
                <span className={`text-sm font-medium ${getPriorityColor(formData.priority)}`}>
                  {getPriorityIcon(formData.priority)} {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Duration:</span>
                <span className="text-sm font-medium">
                  {formData.requestedDate && formData.expectedReturnDate
                    ? `${Math.ceil(
                        (new Date(formData.expectedReturnDate).getTime() - new Date(formData.requestedDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )} day(s)`
                    : "Not set"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
