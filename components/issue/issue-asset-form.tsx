"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

interface Asset {
  id: string
  asset_code: string
  name: string
  category: string
  brand: string
  model: string
  location: string
}

interface StaffMember {
  id: string
  full_name: string
  email: string
  department: string
  role: string
}

interface IssueAssetFormProps {
  availableAssets: Asset[]
  staffMembers: StaffMember[]
  currentUserId: string
}

export function IssueAssetForm({ availableAssets, staffMembers, currentUserId }: IssueAssetFormProps) {
  const [selectedAssetId, setSelectedAssetId] = useState("")
  const [selectedStaffId, setSelectedStaffId] = useState("")
  const [expectedReturnDate, setExpectedReturnDate] = useState("")
  const [notes, setNotes] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const selectedAsset = availableAssets.find((asset) => asset.id === selectedAssetId)
  const selectedStaff = staffMembers.find((staff) => staff.id === selectedStaffId)

  const filteredAssets = availableAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.brand?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Set default return date to 7 days from now
  const getDefaultReturnDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toISOString().split("T")[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssetId || !selectedStaffId || !expectedReturnDate) {
      toast({
        title: "Missing Information",
        description: "Please select an asset, staff member, and return date.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Start a transaction-like operation
      // 1. Create the asset issue record
      const { error: issueError } = await supabase.from("asset_issues").insert({
        asset_id: selectedAssetId,
        issued_to: selectedStaffId,
        issued_by: currentUserId,
        expected_return_date: expectedReturnDate,
        notes: notes || null,
        status: "active",
      })

      if (issueError) throw issueError

      // 2. Update asset status to 'issued'
      const { error: updateError } = await supabase
        .from("assets")
        .update({ status: "issued" })
        .eq("id", selectedAssetId)

      if (updateError) throw updateError

      toast({
        title: "Asset issued successfully",
        description: `${selectedAsset?.name} has been issued to ${selectedStaff?.full_name}.`,
      })

      router.push("/dashboard/issue/active")
    } catch (error) {
      console.error("Error issuing asset:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to issue asset",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Issue Asset</CardTitle>
            <CardDescription>Select an asset and assign it to a staff member</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Asset Selection */}
              <div className="space-y-4">
                <Label>Select Asset</Label>
                <Input
                  placeholder="Search assets by name, code, or brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto border rounded-md p-3">
                  {filteredAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedAssetId === asset.id
                          ? "border-university-blue-500 bg-university-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedAssetId(asset.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{asset.name}</h4>
                          <p className="text-sm text-university-gray-600 font-mono">{asset.asset_code}</p>
                          <p className="text-sm text-university-gray-600">
                            {asset.brand} {asset.model} • {asset.location}
                          </p>
                        </div>
                        <Badge className="capitalize">{asset.category}</Badge>
                      </div>
                    </div>
                  ))}
                  {filteredAssets.length === 0 && (
                    <p className="text-center text-university-gray-600 py-4">No available assets found</p>
                  )}
                </div>
              </div>

              {/* Staff Selection */}
              <div className="space-y-2">
                <Label htmlFor="staff">Issue To</Label>
                <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffMembers.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        <div className="flex flex-col">
                          <span>{staff.full_name}</span>
                          <span className="text-sm text-university-gray-600">
                            {staff.department} • {staff.role}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Return Date */}
              <div className="space-y-2">
                <Label htmlFor="returnDate">Expected Return Date</Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setExpectedReturnDate(getDefaultReturnDate())}
                  >
                    7 Days
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const date = new Date()
                      date.setDate(date.getDate() + 14)
                      setExpectedReturnDate(date.toISOString().split("T")[0])
                    }}
                  >
                    14 Days
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const date = new Date()
                      date.setMonth(date.getMonth() + 1)
                      setExpectedReturnDate(date.toISOString().split("T")[0])
                    }}
                  >
                    1 Month
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes or special instructions..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-university-blue-600 hover:bg-university-blue-700"
                  disabled={isLoading || !selectedAssetId || !selectedStaffId || !expectedReturnDate}
                >
                  {isLoading ? "Issuing..." : "Issue Asset"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Summary Panel */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Issue Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedAsset ? (
              <div>
                <h4 className="font-medium text-university-gray-700">Asset</h4>
                <p className="font-medium">{selectedAsset.name}</p>
                <p className="text-sm text-university-gray-600 font-mono">{selectedAsset.asset_code}</p>
                <p className="text-sm text-university-gray-600">
                  {selectedAsset.brand} {selectedAsset.model}
                </p>
              </div>
            ) : (
              <div>
                <h4 className="font-medium text-university-gray-700">Asset</h4>
                <p className="text-sm text-university-gray-600">No asset selected</p>
              </div>
            )}

            {selectedStaff ? (
              <div>
                <h4 className="font-medium text-university-gray-700">Issued To</h4>
                <p className="font-medium">{selectedStaff.full_name}</p>
                <p className="text-sm text-university-gray-600">{selectedStaff.department}</p>
                <p className="text-sm text-university-gray-600">{selectedStaff.email}</p>
              </div>
            ) : (
              <div>
                <h4 className="font-medium text-university-gray-700">Issued To</h4>
                <p className="text-sm text-university-gray-600">No staff member selected</p>
              </div>
            )}

            {expectedReturnDate && (
              <div>
                <h4 className="font-medium text-university-gray-700">Expected Return</h4>
                <p className="font-medium">{new Date(expectedReturnDate).toLocaleDateString()}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Available Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Available:</span>
                <span className="font-medium">{availableAssets.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Projectors:</span>
                <span className="font-medium">{availableAssets.filter((a) => a.category === "projector").length}</span>
              </div>
              <div className="flex justify-between">
                <span>Laptops:</span>
                <span className="font-medium">{availableAssets.filter((a) => a.category === "laptop").length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
