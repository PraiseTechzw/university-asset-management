import { Loader2 } from "lucide-react"

export function AuthLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
        <div className="space-y-2">
          <p className="text-lg text-muted-foreground">Initializing...</p>
          <p className="text-sm text-muted-foreground">Setting up authentication</p>
        </div>
      </div>
    </div>
  )
}
