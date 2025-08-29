"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

interface AssetDetailsViewProps {
  asset: any // We'll type this properly later
  userRole: string
}

export function AssetDetailsView({ asset, userRole }: AssetDetailsViewProps) {
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

  const canManageAsset = userRole === "admin" || userRole === "technician"
  const activeIssue = asset.asset_issues?.find((issue: any) => issue.status === "active")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-university-blue-900">{asset.name}</h1>
          <p className="text-university-gray-600 font-mono">{asset.asset_code}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/assets">
            <Button variant="outline">Back to Assets</Button>
          </Link>
          {canManageAsset && (
            <Button className="bg-university-blue-600 hover:bg-university-blue-700">Edit Asset</Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Asset Details</TabsTrigger>
          <TabsTrigger value="history">Issue History</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Asset Information
                    <Badge className={getStatusBadge(asset.status)}>{asset.status}</Badge>
                    <Badge className={getConditionBadge(asset.condition)}>{asset.condition}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-university-gray-700">Category</h4>
                      <p className="capitalize">{asset.category}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-university-gray-700">Brand</h4>
                      <p>{asset.brand || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-university-gray-700">Model</h4>
                      <p>{asset.model || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-university-gray-700">Serial Number</h4>
                      <p className="font-mono text-sm">{asset.serial_number || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-university-gray-700">Location</h4>
                      <p>{asset.location || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-university-gray-700">Purchase Date</h4>
                      <p>{asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-university-gray-700">Purchase Price</h4>
                      <p>{asset.purchase_price ? `$${asset.purchase_price}` : "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-university-gray-700">Warranty Expiry</h4>
                      <p>{asset.warranty_expiry ? new Date(asset.warranty_expiry).toLocaleDateString() : "N/A"}</p>
                    </div>
                  </div>
                  {asset.description && (
                    <div>
                      <h4 className="font-medium text-university-gray-700">Description</h4>
                      <p className="text-sm text-university-gray-600">{asset.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* QR Code & Actions */}
            <div className="space-y-6">
              {asset.qr_code_url && (
                <Card>
                  <CardHeader>
                    <CardTitle>QR Code</CardTitle>
                    <CardDescription>Scan to view asset details</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <img
                      src={asset.qr_code_url || "/placeholder.svg"}
                      alt={`QR Code for ${asset.asset_code}`}
                      className="mx-auto mb-4"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <a href={asset.qr_code_url} download={`${asset.asset_code}-qr.png`}>
                        Download QR Code
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Current Issue Status */}
              {activeIssue && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-900">Currently Issued</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium text-university-gray-700">Issued To</h4>
                      <p>{activeIssue.issued_to_profile.full_name}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-university-gray-700">Issue Date</h4>
                      <p>{new Date(activeIssue.issue_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-university-gray-700">Expected Return</h4>
                      <p>{new Date(activeIssue.expected_return_date).toLocaleDateString()}</p>
                    </div>
                    {canManageAsset && (
                      <Button className="w-full bg-green-600 hover:bg-green-700">Process Return</Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              {canManageAsset && asset.status === "available" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full bg-university-blue-600 hover:bg-university-blue-700">Issue Asset</Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      Schedule Maintenance
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Issue History</CardTitle>
              <CardDescription>Track of all asset assignments and returns</CardDescription>
            </CardHeader>
            <CardContent>
              {asset.asset_issues && asset.asset_issues.length > 0 ? (
                <div className="space-y-4">
                  {asset.asset_issues.map((issue: any) => (
                    <div key={issue.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{issue.issued_to_profile.full_name}</h4>
                        <Badge
                          className={
                            issue.status === "active" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                          }
                        >
                          {issue.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-university-gray-600">
                        <div>
                          <span className="font-medium">Issued:</span> {new Date(issue.issue_date).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Expected Return:</span>{" "}
                          {new Date(issue.expected_return_date).toLocaleDateString()}
                        </div>
                        {issue.actual_return_date && (
                          <div>
                            <span className="font-medium">Returned:</span>{" "}
                            {new Date(issue.actual_return_date).toLocaleDateString()}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Issued By:</span> {issue.issued_by_profile.full_name}
                        </div>
                      </div>
                      {issue.notes && <p className="text-sm text-university-gray-600 mt-2">{issue.notes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-university-gray-600 py-8">No issue history available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
              <CardDescription>Record of all maintenance activities</CardDescription>
            </CardHeader>
            <CardContent>
              {asset.maintenance_logs && asset.maintenance_logs.length > 0 ? (
                <div className="space-y-4">
                  {asset.maintenance_logs.map((log: any) => (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">{log.maintenance_type}</h4>
                        <span className="text-sm text-university-gray-600">
                          {new Date(log.maintenance_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-university-gray-600 mb-2">{log.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm text-university-gray-600">
                        {log.cost && (
                          <div>
                            <span className="font-medium">Cost:</span> ${log.cost}
                          </div>
                        )}
                        {log.performed_by_profile && (
                          <div>
                            <span className="font-medium">Performed By:</span> {log.performed_by_profile.full_name}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-university-gray-600 py-8">No maintenance history available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
