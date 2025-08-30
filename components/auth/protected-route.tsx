"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AuthLoading } from "./auth-loading"

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
    return <AuthLoading />
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
