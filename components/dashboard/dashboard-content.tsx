"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { AdminDashboard } from "./admin-dashboard"
import { TechnicianDashboard } from "./technician-dashboard"
import { StaffDashboard } from "./staff-dashboard"
import { DashboardLayout } from "./dashboard-layout"
import { Loader2 } from "lucide-react"

export function DashboardContent() {
  const { user, loading: authLoading } = useAuth()
  const [role, setRole] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user && !authLoading) {
      fetchUserRole()
    }
  }, [user, authLoading])

  const fetchUserRole = async () => {
    if (!user) return

    try {
      const supabase = createClient()
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Error fetching user role:", error)
        // Default to staff if profile not found
        setRole("staff")
      } else {
        setRole(profile?.role || "staff")
      }
    } catch (error) {
      console.error("Error fetching user role:", error)
      setRole("staff")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking authentication
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // If no user, redirect to login (this should not happen due to auth protection)
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">Please sign in to access the dashboard.</p>
        </div>
      </div>
    )
  }

  const renderDashboard = () => {
    switch (role) {
      case "admin":
        return <AdminDashboard />
      case "technician":
        return <TechnicianDashboard />
      default:
        return <StaffDashboard />
    }
  }

  return <DashboardLayout role={role}>{renderDashboard()}</DashboardLayout>
}
