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

  const refreshProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      // Re-fetch user profile
      if (user?.id) {
        const supabase = createClient()
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id, email, full_name, role, department")
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("Error refreshing profile:", error)
          setError("Failed to refresh user profile")
        } else if (profile) {
          setUserProfile(profile)
        }
      }
    } catch (error) {
      console.error("Error refreshing profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        
        // Check if we have cached profile data
        const cachedProfile = localStorage.getItem('userProfile')
        if (cachedProfile) {
          try {
            const profile = JSON.parse(cachedProfile)
            const cacheAge = Date.now() - profile.timestamp
            // Use cache if less than 5 minutes old
            if (cacheAge < 5 * 60 * 1000) {
              setUserProfile(profile.data)
              setIsLoading(false)
              return
            }
          } catch (e) {
            // Invalid cache, continue with fetch
          }
        }

        if (!user?.id) {
          setIsLoading(false)
          return
        }

        const supabase = createClient()
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id, email, full_name, role, department")
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("Error fetching profile:", error)
          // Retry once for network issues
          if (error.message?.includes('fetch') || error.message?.includes('network')) {
            setTimeout(() => {
              if (mounted) {
                fetchUserProfile()
              }
            }, 2000)
            return
          }
          setError("Failed to load user profile")
        } else if (profile) {
          // Cache the profile data
          localStorage.setItem('userProfile', JSON.stringify({
            data: profile,
            timestamp: Date.now()
          }))
          
          setUserProfile(profile)
        }
      } catch (error) {
        console.error("Error in fetchUserProfile:", error)
        setError("Failed to load user profile")
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchUserProfile()

    return () => {
      mounted = false
    }
  }, [user?.id])

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
          <p className="text-sm text-gray-500">
            {authLoading ? "Checking credentials..." : "Loading user profile..."}
          </p>
          {user && (
            <p className="text-xs text-gray-400">
              Logged in as: {user.email}
            </p>
          )}
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
      error,
      refreshProfile
    }}>
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          userRole={userProfile?.role}
        />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <MobileHeader 
            onMenuToggle={toggleSidebar}
            userRole={userProfile?.role}
          />
          
          {/* Page content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-6">
              {children}
            </div>
          </main>
          
          {/* Mobile bottom navigation */}
          <MobileBottomNav />
        </div>
      </div>
    </DashboardProvider>
  )
}
