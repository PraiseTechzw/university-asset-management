"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

interface QuickScanInterfaceProps {
  currentUserId: string
}

export function QuickScanInterface({ currentUserId }: QuickScanInterfaceProps) {
  const [scannedCode, setScannedCode] = useState("")
  const [assetInfo, setAssetInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleScan = async () => {
    if (!scannedCode.trim()) return

    setIsLoading(true)
    try {
      const supabase = createClient()

      // Look up asset by code
      const { data: asset, error } = await supabase
        .from("assets")
        .select(`
          *,
          current_issue:asset_issues!inner(
            id,
            issued_to,
            issue_date,
            expected_return_date,
            status,
            issued_to_profile:profiles!asset_issues_issued_to_fkey(full_name, email)
          )
        `)
        .eq("asset_code", scannedCode.trim())
        .single()

      if (error || !asset) {
        toast({
          title: "Asset not found",
          description: `No asset found with code: ${scannedCode}`,
          variant: "destructive",
        })
        setAssetInfo(null)
        return
      }

      setAssetInfo(asset)
    } catch (error) {
      console.error("Error scanning asset:", error)
      toast({
        title: "Error",
        description: "Failed to scan asset",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickReturn = async () => {
    if (!assetInfo?.current_issue?.[0]) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const issueId = assetInfo.current_issue[0].id

      // Update the asset issue record
      const { error: issueError } = await supabase
        .from("asset_issues")
        .update({
          status: "returned",
          actual_return_date: new Date().toISOString(),
          return_condition: "good", // Default condition for quick return
        })
        .eq("id", issueId)

      if (issueError) throw issueError

      // Update asset status back to available
      const { error: assetError } = await supabase.from("assets").update({ status: "available" }).eq("id", assetInfo.id)

      if (assetError) throw assetError

      toast({
        title: "Quick return processed",
        description: `${assetInfo.name} has been returned successfully.`,
      })

      // Clear the form
      setScannedCode("")
      setAssetInfo(null)
    } catch (error) {
      console.error("Error processing quick return:", error)
      toast({
        title: "Error",
        description: "Failed to process return",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Scan Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Scan Asset QR Code</CardTitle>
          <CardDescription>Enter or scan an asset code to view details and perform quick actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter asset code (e.g., CUT-PROJ-001)"
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === "Enter" && handleScan()}
            />
            <Button onClick={handleScan} disabled={isLoading || !scannedCode.trim()}>
              {isLoading ? "Scanning..." : "Scan"}
            </Button>
          </div>

          <div className="text-center py-8 border-2 border-dashed border-university-gray-300 rounded-lg">
            <svg
              className="w-16 h-16 text-university-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
            <p className="text-university-gray-600">Point camera at QR code or enter asset code manually</p>
          </div>
        </CardContent>
      </Card>

      {/* Asset Information */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Information</CardTitle>
          <CardDescription>Details and available actions for scanned asset</CardDescription>
        </CardHeader>
        <CardContent>
          {assetInfo ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-university-blue-900">{assetInfo.name}</h3>
                <p className="text-university-gray-600 font-mono">{assetInfo.asset_code}</p>
                <div className="flex gap-2 mt-2">
                  <Badge
                    className={
                      assetInfo.status === "available"
                        ? "bg-green-100 text-green-800"
                        : assetInfo.status === "issued"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {assetInfo.status}
                  </Badge>
                  <Badge className="capitalize">{assetInfo.category}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-university-gray-600">Brand:</span>
                  <p className="font-medium">{assetInfo.brand || "N/A"}</p>
                </div>
                <div>
                  <span className="text-university-gray-600">Model:</span>
                  <p className="font-medium">{assetInfo.model || "N/A"}</p>
                </div>
                <div>
                  <span className="text-university-gray-600">Location:</span>
                  <p className="font-medium">{assetInfo.location || "N/A"}</p>
                </div>
                <div>
                  <span className="text-university-gray-600">Condition:</span>
                  <p className="font-medium capitalize">{assetInfo.condition}</p>
                </div>
              </div>

              {assetInfo.current_issue && assetInfo.current_issue.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <h4 className="font-medium text-blue-900 mb-2">Currently Issued</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-blue-700">To:</span>{" "}
                      {assetInfo.current_issue[0].issued_to_profile.full_name}
                    </p>
                    <p>
                      <span className="text-blue-700">Since:</span>{" "}
                      {new Date(assetInfo.current_issue[0].issue_date).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="text-blue-700">Due:</span>{" "}
                      {new Date(assetInfo.current_issue[0].expected_return_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {assetInfo.status === "issued" && assetInfo.current_issue && (
                  <Button onClick={handleQuickReturn} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                    {isLoading ? "Processing..." : "Quick Return"}
                  </Button>
                )}
                {assetInfo.status === "available" && (
                  <Button className="bg-university-blue-600 hover:bg-university-blue-700">Quick Issue</Button>
                )}
                <Button variant="outline">View Details</Button>
              </div>
            </div>
          ) : (
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
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-university-gray-600">Scan an asset code to view information</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
