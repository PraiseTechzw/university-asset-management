"use client"

import { Component, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Auth Error Boundary caught an error:", error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Authentication Error
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                We encountered an issue with the authentication system. This is usually a temporary problem.
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={this.handleRetry} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/"}
                className="w-full"
              >
                Go to Home
              </Button>
            </div>

            {this.state.error && (
              <details className="text-left text-sm text-gray-500 dark:text-gray-400">
                <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                  Technical Details
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
