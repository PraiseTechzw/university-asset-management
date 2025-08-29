"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { User, Session } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === "SIGNED_IN" && session?.user) {
          // Check if user has @cut.ac.zw domain
          if (!session.user.email?.endsWith("@cut.ac.zw")) {
            toast({
              title: "❌ Access Denied",
              description: "Only Chinhoyi University accounts can access this system.",
              variant: "destructive",
            })
            await signOut()
            return
          }

          // Get or create user profile
          await ensureUserProfile(session.user)
          
          toast({
            title: "🎉 Welcome back!",
            description: "Successfully signed in.",
          })

          // Redirect to dashboard
          router.push("/dashboard")
        } else if (event === "SIGNED_OUT") {
          router.push("/")
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const ensureUserProfile = async (user: User) => {
    try {
      // Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (!profile) {
        // Create new profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          role: "staff", // Default role
          created_at: new Date().toISOString(),
        })

        if (profileError) {
          console.error("Profile creation error:", profileError)
        }
      }
    } catch (error) {
      console.error("Error ensuring user profile:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Domain check is handled in onAuthStateChange
        await ensureUserProfile(data.user)
      }
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            hd: "cut.ac.zw", // Restrict to cut.ac.zw domain
          },
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error) {
      console.error("Google sign in error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast({
        title: "👋 Signed out",
        description: "You have been successfully signed out.",
      })
    } catch (error) {
      console.error("Sign out error:", error)
      toast({
        title: "❌ Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error("Error refreshing user:", error)
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signInWithGoogle,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
