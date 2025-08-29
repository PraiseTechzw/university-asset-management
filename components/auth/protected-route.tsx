"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-lg text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // If no user, don't render anything (will redirect)
  if (!user) {
    return null
  }

  // If role is required, check if user has the required role
  if (requiredRole) {
    // This would need to be implemented with actual role checking
    // For now, we'll allow access and let the dashboard handle role-specific content
  }

  return <>{children}</>
}
