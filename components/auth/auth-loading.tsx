import { Loader2 } from "lucide-react"

export function AuthLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md w-full">
        {/* Logo */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
          <img
            src="/logo.png"
            alt="Chinhoyi University of Technology"
            className="w-12 h-12 object-contain"
          />
        </div>
        
        {/* Real Loading Indicator */}
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Authenticating...
          </span>
        </div>

        {/* Status Message */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Please wait while we verify your credentials
        </div>

        {/* Simple Loading Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  )
}
