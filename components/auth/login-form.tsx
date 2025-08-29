"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"
import { Confetti, useConfetti } from "@/components/ui/confetti"
import { Loader2, Mail, Lock, Shield, Building2, Eye, EyeOff, Sparkles, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  
  const { signIn, signInWithGoogle, loading } = useAuth()
  const { isActive: confettiActive, trigger: triggerConfetti } = useConfetti()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate email domain
    if (!email.endsWith("@cut.ac.zw")) {
      setError("Only @cut.ac.zw accounts are allowed to access this system.")
      return
    }

    try {
      await signIn(email, password)
      
      // Show success state and trigger confetti
      setIsSuccess(true)
      triggerConfetti()
      
      // Success toast is handled by AuthContext
    } catch (error) {
      console.error("Sign in error:", error)
      setError(error instanceof Error ? error.message : "Failed to sign in")
      
      toast({
        title: "❌ Sign in failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      })
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    try {
      await signInWithGoogle()
      // Success is handled by AuthContext
    } catch (error) {
      console.error("Google sign in error:", error)
      setError("Failed to sign in with Google")
      
      toast({
        title: "❌ Google sign in failed",
        description: "Please try again or use email/password.",
        variant: "destructive",
      })
    }
  }

  const isFormValid = email.trim() !== "" && password.trim() !== ""

  return (
    <>
      <Confetti isActive={confettiActive} />
      
      <div className="w-full max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-700">
        <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl overflow-hidden relative">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20" />
          
          {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse delay-1000" />
          </div>

          <CardHeader className="text-center space-y-4 relative z-10">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-300 hover:rotate-3">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            
            <div className="animate-in fade-in duration-700 delay-200">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base mt-2">
                Sign in to your Chinhoyi University account
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 relative z-10">
            {/* Success State */}
            {isSuccess && (
              <div className="text-center space-y-2 animate-in zoom-in duration-500">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-green-600 font-medium">Login successful!</p>
                <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
              </div>
            )}

            {/* Google Sign In */}
            <div className="animate-in slide-in-from-bottom-4 duration-700 delay-300">
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading || isSuccess}
                className={cn(
                  "w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-lg",
                  "transition-all duration-300 hover:shadow-xl active:scale-95",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "group relative overflow-hidden"
                )}
                variant="outline"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 transform -translate-x-full group-hover:translate-x-full transition-transform duration-600" />
                
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                <span className="relative z-10">
                  {loading ? "Signing in..." : "Continue with Google"}
                </span>
              </Button>
            </div>

            <div className="animate-in fade-in duration-700 delay-400">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-3 text-muted-foreground font-medium">
                    Or continue with email
                  </span>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
                  <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {/* Email/Password Form */}
            <form 
              onSubmit={handleSubmit} 
              className="space-y-5 animate-in slide-in-from-bottom-4 duration-700 delay-500"
            >
              <div className="space-y-3">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Email Address
                </Label>
                <div className="transform transition-all duration-200 hover:scale-[1.02] focus-within:scale-[1.02]">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@cut.ac.zw"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-base transition-all duration-200"
                    disabled={loading || isSuccess}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                  <Lock className="h-4 w-4 text-green-600" />
                  Password
                </Label>
                <div className="transform transition-all duration-200 hover:scale-[1.02] focus-within:scale-[1.02] relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-12 border-gray-200 focus:border-green-500 focus:ring-green-500 text-base transition-all duration-200"
                    disabled={loading || isSuccess}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading || isSuccess}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                <Button 
                  type="submit" 
                  className={cn(
                    "w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                    "text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "relative overflow-hidden group"
                  )}
                  disabled={loading || !isFormValid || isSuccess}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-600" />
                  
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-5 w-5" />
                      Sign In
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Domain Restriction Notice */}
            <div 
              className="text-center animate-in slide-in-from-bottom-4 duration-700 delay-600"
            >
              <div className="inline-flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  Only @cut.ac.zw accounts can access this system
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
