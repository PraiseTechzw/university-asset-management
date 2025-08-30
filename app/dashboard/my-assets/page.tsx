"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Package, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Download
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface MyAsset {
  id: string
  asset_code: string
  name: string
  category: string
  brand: string
  model: string
  condition: string
  status: string
  issue_date: string
  expected_return_date: string
  actual_return_date?: string
  notes?: string
  return_condition?: string
}

export default function MyAssetsPage() {
  const [assets, setAssets] = useState<MyAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<MyAsset | null>(null)

  useEffect(() => {
    fetchMyAssets()
  }, [])

  const fetchMyAssets = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Fetch assets assigned to current user
      const { data, error } = await supabase
        .from("asset_issues")
        .select(`
          id,
          asset_id,
          issue_date,
          expected_return_date,
          actual_return_date,
          notes,
          status,
          return_condition,
          assets (
            id,
            asset_code,
            name,
            category,
            brand,
            model,
            condition,
            status
          )
        `)
        .eq("issued_to", user.id)
        .order("issue_date", { ascending: false })

      if (error) throw error

      // Transform the data to match our interface
      const transformedAssets: MyAsset[] = (data || []).map(issue => ({
        id: issue.assets.id,
        asset_code: issue.assets.asset_code,
        name: issue.assets.name,
        category: issue.assets.category,
        brand: issue.assets.brand || "",
        model: issue.assets.model || "",
        condition: issue.assets.condition,
        status: issue.status,
        issue_date: issue.issue_date,
        expected_return_date: issue.expected_return_date,
        actual_return_date: issue.actual_return_date,
        notes: issue.notes,
        return_condition: issue.return_condition
      }))

      setAssets(transformedAssets)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load your assets",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReturnAsset = async (asset: MyAsset) => {
    setSelectedAsset(asset)
    setShowReturnModal(true)
  }

  const submitReturn = async (returnCondition: string, notes: string) => {
    if (!selectedAsset) return

    try {
      const supabase = createClient()
      
      // Update the asset issue record
      const { error } = await supabase
        .from("asset_issues")
        .update({
          status: "returned",
          actual_return_date: new Date().toISOString(),
          return_condition: returnCondition,
          notes: notes
        })
        .eq("asset_id", selectedAsset.id)
        .eq("status", "active")

      if (error) throw error

      // Update the asset status to available
      const { error: assetError } = await supabase
        .from("assets")
        .update({ status: "available" })
        .eq("id", selectedAsset.id)

      if (assetError) throw assetError

      toast({
        title: "✅ Asset returned successfully",
        description: "Your asset has been returned and is now available for others",
      })

      setShowReturnModal(false)
      setSelectedAsset(null)
      fetchMyAssets() // Refresh the list
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to return asset",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800 border-green-200',
      'returned': 'bg-blue-100 text-blue-800 border-blue-200',
      'overdue': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getConditionColor = (condition: string) => {
    const colors = {
      'excellent': 'text-green-600',
      'good': 'text-blue-600',
      'fair': 'text-yellow-600',
      'poor': 'text-orange-600',
      'damaged': 'text-red-600'
    }
    return colors[condition as keyof typeof colors] || 'text-gray-600'
  }

  const getDaysRemaining = (expectedDate: string) => {
    const expected = new Date(expectedDate)
    const today = new Date()
    const diffTime = expected.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return Math.abs(diffDays)
    return diffDays
  }

  const isOverdue = (expectedDate: string) => {
    return new Date(expectedDate) < new Date()
  }

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const activeAssets = assets.filter(asset => asset.status === "active")
  const overdueAssets = assets.filter(asset => isOverdue(asset.expected_return_date) && asset.status === "active")
  const returnedAssets = assets.filter(asset => asset.status === "returned")

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading your assets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Assets</h1>
          <p className="text-muted-foreground">
            View and manage your assigned equipment and assets
          </p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Assigned</p>
                <p className="text-2xl font-bold">{assets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Currently Active</p>
                <p className="text-2xl font-bold">{activeAssets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{overdueAssets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-muted-foreground">Returned</p>
                <p className="text-2xl font-bold">{returnedAssets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search assets by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
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
          </div>
        </CardContent>
      </Card>

      {/* Assets List */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Details</CardTitle>
          <CardDescription>
            {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAssets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No assets found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{asset.name}</h3>
                          <p className="text-sm text-muted-foreground">{asset.asset_code}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className={getStatusColor(asset.status)}>
                            {asset.status}
                          </Badge>
                          <Badge variant="outline">
                            {asset.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Brand/Model:</span>
                          <p>{asset.brand} {asset.model}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Condition:</span>
                          <p className={getConditionColor(asset.condition)}>
                            {asset.condition.charAt(0).toUpperCase() + asset.condition.slice(1)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Issue Date:</span>
                          <p>{new Date(asset.issue_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {asset.status === "active" && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>Expected Return: {new Date(asset.expected_return_date).toLocaleDateString()}</span>
                            {isOverdue(asset.expected_return_date) ? (
                              <Badge variant="destructive">
                                {getDaysRemaining(asset.expected_return_date)} day{getDaysRemaining(asset.expected_return_date) !== 1 ? 's' : ''} overdue
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                {getDaysRemaining(asset.expected_return_date)} day{getDaysRemaining(asset.expected_return_date) !== 1 ? 's' : ''} remaining
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {asset.notes && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium">Notes:</span> {asset.notes}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {asset.status === "active" && (
                        <Button
                          onClick={() => handleReturnAsset(asset)}
                          variant="outline"
                          size="sm"
                        >
                          Return Asset
                        </Button>
                      )}
                      
                      {asset.status === "returned" && asset.return_condition && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Returned in:</span>
                          <p className={getConditionColor(asset.return_condition)}>
                            {asset.return_condition.charAt(0).toUpperCase() + asset.return_condition.slice(1)} condition
                          </p>
                          <span className="text-muted-foreground">Returned on:</span>
                          <p>{asset.actual_return_date ? new Date(asset.actual_return_date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Return Asset Modal */}
      {showReturnModal && selectedAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Return Asset</CardTitle>
              <CardDescription>
                Return {selectedAsset.name} ({selectedAsset.asset_code})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Return Condition</label>
                <Select onValueChange={(value) => setSelectedAsset({...selectedAsset, return_condition: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
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
                <label className="text-sm font-medium">Additional Notes</label>
                <Input
                  placeholder="Any issues or comments..."
                  value={selectedAsset.notes || ""}
                  onChange={(e) => setSelectedAsset({...selectedAsset, notes: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowReturnModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => submitReturn(selectedAsset.return_condition || "good", selectedAsset.notes || "")}
                  disabled={!selectedAsset.return_condition}
                >
                  Confirm Return
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
