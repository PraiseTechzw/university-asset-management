"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { QrCode, Camera, Search, Package } from "lucide-react"
import { MobileHeader } from "@/components/mobile/mobile-header"
import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav"
import Link from "next/link"

interface Asset {
  id: string
  asset_code: string
  name: string
  category: string
  brand: string
  model: string
  status: string
  location: string
  current_issue?: Array<{
    issued_to_profile: { full_name: string }
    expected_return_date: string
  }>
}

export default function ScanPage() {
  const [userRole, setUserRole] = useState<string>("")
  const [searchCode, setSearchCode] = useState("")
  const [foundAsset, setFoundAsset] = useState<Asset | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [cameraSupported, setCameraSupported] = useState(false)

  useEffect(() => {
    // Check if camera is supported
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setCameraSupported(true)
    }

    // Get user role from localStorage (demo)
    const role = localStorage.getItem("userRole") || "staff"
    setUserRole(role)
  }, [])

  const searchAsset = async (code: string) => {
    if (!code.trim()) return

    setIsLoading(true)
    setError("")
    setFoundAsset(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("assets")
        .select(`
          *,
          current_issue:asset_issues!inner(
            issued_to_profile:profiles!asset_issues_issued_to_fkey(full_name),
            expected_return_date
          )
        `)
        .eq("asset_code", code.toUpperCase())
        .eq("asset_issues.status", "active")
        .single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (!data) {
        // Try without current issue
        const { data: assetData, error: assetError } = await supabase
          .from("assets")
          .select("*")
          .eq("asset_code", code.toUpperCase())
          .single()

        if (assetError) {
          setError("Asset not found")
          return
        }

        setFoundAsset(assetData)
      } else {
        setFoundAsset(data)
      }
    } catch (err) {
      console.error("Error searching asset:", err)
      setError("Error searching for asset")
    } finally {
      setIsLoading(false)
    }
  }

  const handleScan = () => {
    // In a real app, this would open camera and scan QR code
    // For demo, we'll simulate scanning
    const demoCode = "CUT-PROJ-001"
    setSearchCode(demoCode)
    searchAsset(demoCode)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      available: "bg-green-100 text-green-800",
      issued: "bg-blue-100 text-blue-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      retired: "bg-gray-100 text-gray-800",
    }
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader role={userRole} title="Asset Scanner" subtitle="Scan or search for assets" />

      <div className="p-4 pb-20 space-y-6">
        {/* Scan Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Quick Asset Lookup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cameraSupported && (
              <Button onClick={handleScan} className="w-full h-12 text-lg" size="lg">
                <Camera className="h-5 w-5 mr-2" />
                Scan QR Code
              </Button>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Enter asset code (e.g., CUT-PROJ-001)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                className="pl-10 h-12 text-lg"
                onKeyPress={(e) => e.key === "Enter" && searchAsset(searchCode)}
              />
            </div>

            <Button
              onClick={() => searchAsset(searchCode)}
              variant="outline"
              className="w-full h-12"
              disabled={isLoading || !searchCode.trim()}
            >
              {isLoading ? "Searching..." : "Search Asset"}
            </Button>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-800 text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Found Asset */}
        {foundAsset && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{foundAsset.name}</CardTitle>
                <Badge className={getStatusBadge(foundAsset.status)}>{foundAsset.status}</Badge>
              </div>
              <p className="text-sm text-gray-600 font-mono">{foundAsset.asset_code}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Brand:</span>
                  <p className="font-medium">{foundAsset.brand || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-600">Model:</span>
                  <p className="font-medium">{foundAsset.model || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <p className="font-medium capitalize">{foundAsset.category}</p>
                </div>
                <div>
                  <span className="text-gray-600">Location:</span>
                  <p className="font-medium">{foundAsset.location || "N/A"}</p>
                </div>
              </div>

              {foundAsset.status === "issued" && foundAsset.current_issue && foundAsset.current_issue.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Currently Issued To:</p>
                  <p className="text-sm text-blue-700">{foundAsset.current_issue[0].issued_to_profile.full_name}</p>
                  <p className="text-xs text-blue-600">
                    Due: {new Date(foundAsset.current_issue[0].expected_return_date).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button asChild className="flex-1">
                  <Link href={`/dashboard/assets/${foundAsset.id}`}>
                    <Package className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </Button>
                {(userRole === "admin" || userRole === "technician") && foundAsset.status === "available" && (
                  <Button asChild variant="outline" className="flex-1 bg-transparent">
                    <Link href={`/dashboard/issue?asset=${foundAsset.id}`}>Issue Asset</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start h-12 bg-transparent">
              <Link href="/dashboard/assets">
                <Package className="h-4 w-4 mr-2" />
                Browse All Assets
              </Link>
            </Button>
            {(userRole === "admin" || userRole === "technician") && (
              <>
                <Button asChild variant="outline" className="w-full justify-start h-12 bg-transparent">
                  <Link href="/dashboard/issue">
                    <QrCode className="h-4 w-4 mr-2" />
                    Issue Asset
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start h-12 bg-transparent">
                  <Link href="/dashboard/issue/active">
                    <Search className="h-4 w-4 mr-2" />
                    Active Issues
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <MobileBottomNav role={userRole} />
    </div>
  )
}
