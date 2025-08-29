"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Asset {
  id: string
  asset_code: string
  name: string
  category: string
  brand: string
  model: string
  condition: string
  status: string
  location: string
  qr_code_url: string
  created_at: string
  created_by_profile?: { full_name: string }
  current_issue?: Array<{
    id: string
    issued_to: string
    issue_date: string
    expected_return_date: string
    status: string
    issued_to_profile: { full_name: string }
  }>
}

interface AssetsListProps {
  assets: Asset[]
  userRole: string
}

export function AssetsList({ assets, userRole }: AssetsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.model?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      available: "bg-green-100 text-green-800",
      issued: "bg-blue-100 text-blue-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      retired: "bg-gray-100 text-gray-800",
    }
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  const getConditionBadge = (condition: string) => {
    const variants = {
      excellent: "bg-green-100 text-green-800",
      good: "bg-blue-100 text-blue-800",
      fair: "bg-yellow-100 text-yellow-800",
      poor: "bg-orange-100 text-orange-800",
      damaged: "bg-red-100 text-red-800",
    }
    return variants[condition as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      {/* Mobile-Optimized Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-4 md:gap-4">
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 md:h-10"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-12 md:h-10">
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-12 md:h-10">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-university-gray-600 flex items-center justify-center md:justify-start h-12 md:h-10">
              {filteredAssets.length} of {assets.length} assets
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile-Optimized Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredAssets.map((asset) => (
          <Card key={asset.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg text-university-blue-900 truncate">{asset.name}</CardTitle>
                  <p className="text-sm text-university-gray-600 font-mono">{asset.asset_code}</p>
                </div>
                <div className="flex flex-col gap-1 ml-2">
                  <Badge className={getStatusBadge(asset.status)}>{asset.status}</Badge>
                  <Badge className={getConditionBadge(asset.condition)}>{asset.condition}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-university-gray-600">Brand:</span>
                  <p className="font-medium">{asset.brand || "N/A"}</p>
                </div>
                <div>
                  <span className="text-university-gray-600">Model:</span>
                  <p className="font-medium">{asset.model || "N/A"}</p>
                </div>
                <div>
                  <span className="text-university-gray-600">Category:</span>
                  <p className="font-medium capitalize">{asset.category}</p>
                </div>
                <div>
                  <span className="text-university-gray-600">Location:</span>
                  <p className="font-medium">{asset.location || "N/A"}</p>
                </div>
              </div>

              {asset.status === "issued" && asset.current_issue && asset.current_issue.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm font-medium text-blue-900">Currently Issued To:</p>
                  <p className="text-sm text-blue-700">{asset.current_issue[0].issued_to_profile.full_name}</p>
                  <p className="text-xs text-blue-600">
                    Due: {new Date(asset.current_issue[0].expected_return_date).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                {asset.qr_code_url && (
                  <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                    <a href={asset.qr_code_url} target="_blank" rel="noopener noreferrer">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                        />
                      </svg>
                      QR
                    </a>
                  </Button>
                )}
                {(userRole === "admin" || userRole === "technician") && (
                  <Link href={`/dashboard/assets/${asset.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                      Edit
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssets.length === 0 && (
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="text-lg font-medium text-university-gray-900 mb-2">No assets found</h3>
            <p className="text-university-gray-600">
              {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No assets have been registered yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
