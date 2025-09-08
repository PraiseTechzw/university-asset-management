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
import { toast } from "@/hooks/use-toast"
import { Confetti, useConfetti } from "@/components/ui/confetti"
import { Loader2, CheckCircle } from "lucide-react"

interface AssetFormData {
  assetCode: string
  name: string
  category: string
  brand: string
  model: string
  serialNumber: string
  purchaseDate: string
  purchasePrice: string
  warrantyExpiry: string
  condition: string
  location: string
  description: string
}

export function AssetRegistrationForm() {
  const [formData, setFormData] = useState<AssetFormData>({
    assetCode: "",
    name: "",
    category: "",
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    purchasePrice: "",
    warrantyExpiry: "",
    condition: "excellent",
    location: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    assetCode?: string
    serialNumber?: string
  }>({})
  const [isValidating, setIsValidating] = useState<{
    assetCode: boolean
    serialNumber: boolean
  }>({
    assetCode: false,
    serialNumber: false
  })
  const router = useRouter()
  const { isActive: confettiActive, trigger: triggerConfetti } = useConfetti()

  const generateAssetCode = async () => {
    const categoryPrefix =
      {
        projector: "PROJ",
        laptop: "LAP",
        desktop: "DESK",
        printer: "PRINT",
        camera: "CAM",
        other: "OTHER",
      }[formData.category] || "ASSET"

    let code = ""
    let isUnique = false
    let attempts = 0
    const maxAttempts = 10

    // Generate unique asset code
    while (!isUnique && attempts < maxAttempts) {
      const randomNum = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")
      code = `CUT-${categoryPrefix}-${randomNum}`
      
      // Check if code is unique
      const supabase = createClient()
      const { data, error } = await supabase
        .from("assets")
        .select("asset_code")
        .eq("asset_code", code)
        .single()

      if (error && error.code === "PGRST116") {
        // No record found, code is unique
        isUnique = true
      } else if (data) {
        // Code exists, try again
        attempts++
      } else {
        // Other error, break
        break
      }
    }

    if (isUnique) {
      setFormData({ ...formData, assetCode: code })
      setValidationErrors(prev => ({ ...prev, assetCode: undefined }))
    } else {
      toast({
        title: "⚠️ Warning",
        description: "Unable to generate unique asset code. Please try again or enter manually.",
        variant: "destructive",
      })
    }
  }

  const validateAssetCode = async (code: string) => {
    if (!code.trim()) {
      setValidationErrors(prev => ({ ...prev, assetCode: "Asset code is required" }))
      return false
    }

    setIsValidating(prev => ({ ...prev, assetCode: true }))

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("assets")
        .select("asset_code")
        .eq("asset_code", code)
        .single()

      if (error && error.code === "PGRST116") {
        // No record found, code is unique
        setValidationErrors(prev => ({ ...prev, assetCode: undefined }))
        return true
      } else if (data) {
        setValidationErrors(prev => ({ ...prev, assetCode: "Asset code already exists" }))
        return false
      } else {
        setValidationErrors(prev => ({ ...prev, assetCode: "Error checking asset code" }))
        return false
      }
    } catch (error) {
      setValidationErrors(prev => ({ ...prev, assetCode: "Error checking asset code" }))
      return false
    } finally {
      setIsValidating(prev => ({ ...prev, assetCode: false }))
    }
  }

  const validateSerialNumber = async (serialNumber: string) => {
    if (!serialNumber.trim()) {
      setValidationErrors(prev => ({ ...prev, serialNumber: undefined }))
      return true // Serial number is optional
    }

    setIsValidating(prev => ({ ...prev, serialNumber: true }))

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("assets")
        .select("serial_number")
        .eq("serial_number", serialNumber)
        .single()

      if (error && error.code === "PGRST116") {
        // No record found, serial number is unique
        setValidationErrors(prev => ({ ...prev, serialNumber: undefined }))
        return true
      } else if (data) {
        setValidationErrors(prev => ({ ...prev, serialNumber: "Serial number already exists" }))
        return false
      } else {
        setValidationErrors(prev => ({ ...prev, serialNumber: "Error checking serial number" }))
        return false
      }
    } catch (error) {
      setValidationErrors(prev => ({ ...prev, serialNumber: "Error checking serial number" }))
      return false
    } finally {
      setIsValidating(prev => ({ ...prev, serialNumber: false }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setValidationErrors({})

    try {
      // Validate asset code uniqueness
      const isAssetCodeValid = await validateAssetCode(formData.assetCode)
      if (!isAssetCodeValid) {
        setIsLoading(false)
        return
      }

      // Validate serial number uniqueness (if provided)
      const isSerialNumberValid = await validateSerialNumber(formData.serialNumber)
      if (!isSerialNumberValid) {
        setIsLoading(false)
        return
      }

      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Generate QR code URL (placeholder for now)
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(formData.assetCode)}`

      const { error } = await supabase.from("assets").insert({
        asset_code: formData.assetCode,
        name: formData.name,
        category: formData.category,
        brand: formData.brand,
        model: formData.model,
        serial_number: formData.serialNumber || null,
        purchase_date: formData.purchaseDate || null,
        purchase_price: formData.purchasePrice ? Number.parseFloat(formData.purchasePrice) : null,
        warranty_expiry: formData.warrantyExpiry || null,
        condition: formData.condition,
        location: formData.location,
        description: formData.description,
        qr_code_url: qrCodeUrl,
        created_by: user.id,
      })

      if (error) {
        // Handle specific database errors
        if (error.code === "23505") {
          if (error.message.includes("asset_code")) {
            setValidationErrors(prev => ({ ...prev, assetCode: "Asset code already exists" }))
            toast({
              title: "❌ Duplicate Asset Code",
              description: "This asset code is already in use. Please choose a different one.",
              variant: "destructive",
            })
          } else if (error.message.includes("serial_number")) {
            setValidationErrors(prev => ({ ...prev, serialNumber: "Serial number already exists" }))
            toast({
              title: "❌ Duplicate Serial Number",
              description: "This serial number is already in use. Please choose a different one.",
              variant: "destructive",
            })
          }
        } else {
          throw error
        }
        return
      }

      // Trigger confetti animation
      triggerConfetti()

      toast({
        title: "🎉 Asset registered successfully!",
        description: `Asset ${formData.assetCode} has been added to the inventory.`,
      })

      // Wait a bit for confetti to show before redirecting
      setTimeout(() => {
        router.push("/dashboard/assets")
      }, 2000)
    } catch (error) {
      console.error("Error registering asset:", error)
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Failed to register asset",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Confetti isActive={confettiActive} />
      <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-t-lg">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Asset Registration
          </CardTitle>
          <CardDescription className="text-base">
            Fill in the details for the new asset. All required fields must be completed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="assetCode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Asset Code *
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="assetCode"
                      value={formData.assetCode}
                      onChange={(e) => {
                        setFormData({ ...formData, assetCode: e.target.value })
                        // Clear error when user starts typing
                        if (validationErrors.assetCode) {
                          setValidationErrors(prev => ({ ...prev, assetCode: undefined }))
                        }
                      }}
                      onBlur={() => {
                        if (formData.assetCode.trim()) {
                          validateAssetCode(formData.assetCode)
                        }
                      }}
                      placeholder="CUT-PROJ-001"
                      required
                      disabled={isLoading}
                      className={`w-full ${
                        validationErrors.assetCode 
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      }`}
                    />
                    {isValidating.assetCode && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generateAssetCode} 
                    disabled={isLoading}
                    className="whitespace-nowrap border-gray-200 hover:bg-gray-50"
                  >
                    Generate
                  </Button>
                </div>
                {validationErrors.assetCode && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-xs">!</span>
                    {validationErrors.assetCode}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Asset Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Epson PowerLite Projector"
                  required
                  disabled={isLoading}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
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
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Epson"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="PowerLite 1795F"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serialNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Serial Number
                </Label>
                <div className="relative">
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, serialNumber: e.target.value })
                      // Clear error when user starts typing
                      if (validationErrors.serialNumber) {
                        setValidationErrors(prev => ({ ...prev, serialNumber: undefined }))
                      }
                    }}
                    onBlur={() => {
                      if (formData.serialNumber.trim()) {
                        validateSerialNumber(formData.serialNumber)
                      }
                    }}
                    placeholder="EP1795F001"
                    disabled={isLoading}
                    className={`w-full ${
                      validationErrors.serialNumber 
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                  {isValidating.serialNumber && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    </div>
                  )}
                </div>
                {validationErrors.serialNumber && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-xs">!</span>
                    {validationErrors.serialNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price (USD)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  placeholder="899.99"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                <Input
                  id="warrantyExpiry"
                  type="date"
                  value={formData.warrantyExpiry}
                  onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                  disabled={isLoading}
                >
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
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Lecture Hall A"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details about the asset..."
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()} 
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
                disabled={isLoading || !!validationErrors.assetCode || !!validationErrors.serialNumber}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering Asset...
                  </>
                ) : (
                  "Register Asset"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
