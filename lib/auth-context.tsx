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
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    // Real authentication check
    const getInitialSession = async () => {
      try {
        // Check if we have a cached session first
        const cachedSession = localStorage.getItem('supabase.auth.token')
        if (cachedSession) {
          try {
            const parsed = JSON.parse(cachedSession)
            if (parsed && parsed.access_token) {
              // Quick validation without full API call
              setLoading(false)
              setInitialized(true)
              return
            }
          } catch (e) {
            // Invalid cache, continue with normal flow
          }
        }

        // Real session fetch
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          if (mounted) {
            setLoading(false)
            setInitialized(true)
          }
          return
        }

        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
          setInitialized(true)
        }
      } catch (error) {
        // Only retry for network issues
        if (error instanceof Error && 
            (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch'))) {
          // Retry once after a short delay
          setTimeout(() => {
            if (mounted) {
              getInitialSession()
            }
          }, 1000)
          return
        }
        
        if (mounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        try {
          setSession(session)
          setUser(session?.user ?? null)

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

            // Get or create user profile (non-blocking)
            ensureUserProfile(session.user).catch(console.error)
            
            toast({
              title: "🎉 Welcome back!",
              description: `Successfully signed in as ${session.user.email}`,
            })

            // Redirect to dashboard
            router.push("/dashboard")
          } else if (event === "SIGNED_OUT") {
            router.push("/")
          }
        } catch (error) {
          console.error("Error in auth state change:", error)
        } finally {
          if (mounted) {
            setLoading(false)
            setInitialized(true)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router])

  const ensureUserProfile = async (user: User) => {
    try {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profileError) {
        // If profile doesn't exist, create one with default role
        if (profileError.code === "PGRST116") {
          const { error: createError } = await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
            role: "staff", // Default role
            created_at: new Date().toISOString(),
          })

          if (createError) {
            console.error("Profile creation error:", createError)
            // Don't throw, just log the error and continue
            return
          }
        } else {
          console.error("Profile fetch error:", profileError)
          // Don't throw, just log the error and continue
          return
        }
      }
    } catch (error) {
      console.error("Error ensuring user profile:", error)
      // Don't throw here, just log the error and continue
      // This prevents authentication from failing due to profile issues
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
        description: "You have been successfully signed out. Thank you for using CUT Asset Manager.",
      })
    } catch (error) {
      console.error("Sign out error:", error)
      toast({
        title: "❌ Sign out error",
        description: "Failed to sign out. Please try again or refresh the page.",
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
