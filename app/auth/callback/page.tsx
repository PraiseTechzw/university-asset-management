"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle, Shield } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function AuthCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    handleAuthCallback()
  }, [])

  const handleAuthCallback = async () => {
    try {
      const supabase = createClient()
      
      // Get the auth code from URL
      const code = searchParams.get("code")
      
      if (!code) {
        throw new Error("No authorization code received")
      }

      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) throw error

      if (data.user) {
        // Check if user has @cut.ac.zw domain
        if (!data.user.email?.endsWith("@cut.ac.zw")) {
          setStatus("error")
          setMessage("Only @cut.ac.zw accounts are allowed to access this system.")
          
          // Sign out the user
          await supabase.auth.signOut()
          
          toast({
            title: "❌ Access Denied",
            description: "Only Chinhoyi University accounts can access this system.",
            variant: "destructive",
          })
          
          setTimeout(() => {
            router.push("/")
          }, 3000)
          return
        }

        // Check if user profile exists, if not create one
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single()

        if (!profile) {
          // Create new profile for Google user
          const { error: profileError } = await supabase.from("profiles").insert({
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Google User",
            role: "staff", // Default role for new users
            created_at: new Date().toISOString(),
          })

          if (profileError) {
            console.error("Profile creation error:", profileError)
          }
        }

        setStatus("success")
        setMessage("Authentication successful! Redirecting to dashboard...")

        toast({
          title: "🎉 Welcome!",
          description: "Successfully signed in with Google.",
        })

        // Redirect to dashboard
        setTimeout(() => {
          const role = profile?.role || "staff"
          router.push(`/dashboard?role=${role}`)
        }, 2000)
      }
    } catch (error) {
      console.error("Auth callback error:", error)
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Authentication failed")
      
      toast({
        title: "❌ Authentication Failed",
        description: "Please try signing in again.",
        variant: "destructive",
      })

      setTimeout(() => {
        router.push("/")
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            {status === "loading" && "Authenticating..."}
            {status === "success" && "Authentication Successful"}
            {status === "error" && "Authentication Failed"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {status === "loading" && "Please wait while we verify your credentials"}
            {status === "success" && "You will be redirected to the dashboard shortly"}
            {status === "error" && "There was an issue with your authentication"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}
          
          {status === "success" && (
            <div className="flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          )}
          
          {status === "error" && (
            <div className="flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            {message}
          </p>

          {status === "loading" && (
            <div className="text-xs text-muted-foreground">
              <p>This may take a few moments...</p>
            </div>
          )}

          {status === "error" && (
            <div className="pt-4">
              <button
                onClick={() => router.push("/")}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                Return to login
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
