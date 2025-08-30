"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Sidebar } from "./sidebar"
import { MobileHeader } from "./mobile-header"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"
import { DashboardProvider } from "./dashboard-context"
import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav"

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: "admin" | "technician" | "staff"
  department?: string
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const fetchUserProfile = useCallback(async () => {
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
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, user?.email, user?.user_metadata?.full_name])

  useEffect(() => {
    if (user && !authLoading) {
      fetchUserProfile()
    }
  }, [user, authLoading, fetchUserProfile])

  // Show loading state while checking authentication or fetching profile
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <p className="text-lg text-muted-foreground">
            {authLoading ? "Verifying authentication..." : "Setting up your dashboard..."}
          </p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">Dashboard Error</h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <DashboardProvider value={{
      userProfile,
      userRole: userProfile?.role || null,
      isLoading,
      error
    }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={toggleSidebar}
          userRole={userProfile?.role}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0 lg:ml-0 transition-all duration-300 overflow-auto">
          {/* Mobile Header */}
          <MobileHeader 
            onMenuToggle={toggleSidebar}
            userRole={userProfile?.role}
          />

          {/* Page Content */}
          <main className="min-h-screen pb-20 lg:pb-6">
            <div className="p-4 lg:p-6">
              {children}
            </div>
          </main>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
          )}
        </div>
      </div>
    </DashboardProvider>
  )
}
