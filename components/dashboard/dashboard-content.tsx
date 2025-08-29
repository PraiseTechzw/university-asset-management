"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminDashboard } from "./admin-dashboard"
import { TechnicianDashboard } from "./technician-dashboard"
import { StaffDashboard } from "./staff-dashboard"
import { DashboardLayout } from "./dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Shield, User, Wrench, Package, AlertTriangle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: "admin" | "technician" | "staff"
  department?: string
}

export function DashboardContent() {
  const { user, loading: authLoading } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && !authLoading) {
      fetchUserProfile()
    }
  }, [user, authLoading])

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const supabase = createClient()
      
      // Fetch user profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single()

      if (profileError) {
        console.error("Error fetching profile:", profileError)
        
        // If profile doesn't exist, create one with default role
        if (profileError.code === "PGRST116") {
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              id: user?.id,
              email: user?.email,
              full_name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User",
              role: "staff", // Default role
              created_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (createError) {
            throw new Error("Failed to create user profile")
          }

          setUserProfile(newProfile)
        } else {
          throw new Error("Failed to fetch user profile")
        }
      } else {
        setUserProfile(profile)
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error)
      setError(error instanceof Error ? error.message : "Failed to load user profile")
      toast({
        title: "❌ Error",
        description: "Failed to load dashboard. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-800 dark:text-red-200">Dashboard Error</CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700"
            >
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading state while fetching profile
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <p className="text-lg text-muted-foreground">Setting up your dashboard...</p>
        </div>
      </div>
    )
  }

  // Show role-based dashboard with layout
  if (userProfile) {
    const getRoleIcon = (role: string) => {
      switch (role) {
        case "admin":
          return <Shield className="w-5 h-5 text-purple-600" />
        case "technician":
          return <Wrench className="w-5 h-5 text-blue-600" />
        case "staff":
          return <User className="w-5 h-5 text-green-600" />
        default:
          return <User className="w-5 h-5 text-gray-600" />
      }
    }

    const getRoleColor = (role: string) => {
      switch (role) {
        case "admin":
          return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
        case "technician":
          return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
        case "staff":
          return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
      }
    }

    const getRoleDescription = (role: string) => {
      switch (role) {
        case "admin":
          return "Full system access and user management"
        case "technician":
          return "Asset operations and maintenance"
        case "staff":
          return "Asset requests and basic operations"
        default:
          return "Limited access"
      }
    }

    const renderDashboard = () => (
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Welcome Header */}
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge className={`${getRoleColor(userProfile.role)} px-3 py-1`}>
                    {getRoleIcon(userProfile.role)}
                    {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                  </Badge>
                  {userProfile.department && (
                    <Badge variant="outline" className="px-3 py-1">
                      {userProfile.department}
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Welcome back, {userProfile.full_name}!
                </h1>
                <p className="text-muted-foreground">
                  {getRoleDescription(userProfile.role)}
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Package className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role-based Dashboard */}
        {userProfile.role === "admin" && <AdminDashboard />}
        {userProfile.role === "technician" && <TechnicianDashboard />}
        {userProfile.role === "staff" && <StaffDashboard />}
      </div>
    )

    return (
      <DashboardLayout userRole={userProfile.role}>
        {renderDashboard()}
      </DashboardLayout>
    )
  }

  // Fallback - should not reach here
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
          <AlertTriangle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-xl font-semibold">Unable to load dashboard</h2>
        <p className="text-muted-foreground">Please refresh the page or contact support.</p>
        <Button onClick={() => window.location.reload()}>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Refresh Page
        </Button>
      </div>
    </div>
  )
}
