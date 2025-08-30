"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Tag, 
  Package, 
  Plus, 
  Edit, 
  Trash2,
  Search,
  MoreHorizontal,
  Settings
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface AssetCategory {
  id: string
  name: string
  code: string
  description: string
  parentCategory?: string
  assetCount: number
  totalValue: number
  depreciationRate: number
  maintenanceInterval: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<AssetCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Fetch categories with asset counts and values
      const { data, error } = await supabase
        .from("asset_categories")
        .select(`
          *,
          assets!asset_categories_asset_count(count),
          assets!asset_categories_total_value(value)
        `)
        .order('name', { ascending: true })

      if (error) throw error

      // Transform data to match interface
      const cats = (data || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        code: cat.code,
        description: cat.description,
        parentCategory: cat.parent_category,
        assetCount: cat.assets?.[0]?.count || 0,
        totalValue: cat.assets?.[0]?.value || 0,
        depreciationRate: cat.depreciation_rate || 0,
        maintenanceInterval: cat.maintenance_interval || 0,
        isActive: cat.is_active !== false,
        createdAt: cat.created_at,
        updatedAt: cat.updated_at
      }))

      setCategories(cats)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Error",
        description: "Failed to load asset categories",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Tag className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Categories</h1>
          <p className="text-muted-foreground">
            Manage asset categories and classification system
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Asset categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((sum, cat) => sum + cat.assetCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${categories.reduce((sum, cat) => sum + cat.totalValue, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined asset value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.filter(cat => cat.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription className="text-sm font-mono">
                    {category.code}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {!category.isActive && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
              
              {category.parentCategory && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Parent: </span>
                  <Badge variant="outline">{category.parentCategory}</Badge>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Assets:</span>
                  <div className="font-medium">{category.assetCount}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Value:</span>
                  <div className="font-medium">${category.totalValue.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Depreciation:</span>
                  <div className="font-medium">{category.depreciationRate}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Maintenance:</span>
                  <div className="font-medium">{category.maintenanceInterval} days</div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2 border-t">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setEditingCategory(category)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No categories found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? `No categories match "${searchTerm}"` : "Get started by creating your first asset category"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Category
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Category Modal */}
      {(showCreateForm || editingCategory) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </CardTitle>
              <CardDescription>
                {editingCategory 
                  ? 'Update category information' 
                  : 'Add a new asset category to the system'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g., Computer Equipment"
                    defaultValue={editingCategory?.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Category Code *</Label>
                  <Input 
                    id="code" 
                    placeholder="e.g., COMP"
                    defaultValue={editingCategory?.code}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Brief description of the category"
                  defaultValue={editingCategory?.description}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="parentCategory">Parent Category</Label>
                  <Input 
                    id="parentCategory" 
                    placeholder="e.g., Electronics (optional)"
                    defaultValue={editingCategory?.parentCategory}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="depreciationRate">Depreciation Rate (%)</Label>
                  <Input 
                    id="depreciationRate" 
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g., 20"
                    defaultValue={editingCategory?.depreciationRate}
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maintenanceInterval">Maintenance Interval (days)</Label>
                  <Input 
                    id="maintenanceInterval" 
                    type="number"
                    min="0"
                    placeholder="e.g., 90"
                    defaultValue={editingCategory?.maintenanceInterval}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isActive">Status</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      defaultChecked={editingCategory?.isActive !== false}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button className="flex-1">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingCategory(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
