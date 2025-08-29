"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (user && !loading) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, don't render anything (will redirect)
  if (user) {
    return null
  }

  // Show login form for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CUT Asset Manager
            </h1>
            <p className="text-lg text-muted-foreground">
              Chinhoyi University of Technology
            </p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Secure asset management system with real-time authentication and role-based access control
            </p>
          </div>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>© 2024 Chinhoyi University of Technology</p>
          <p>Secure • Reliable • Efficient</p>
        </div>
      </div>
    </div>
  )
}
