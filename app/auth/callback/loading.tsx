import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Shield } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            Loading...
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Please wait while we prepare the authentication page
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          
          <p className="text-sm text-muted-foreground">
            Initializing authentication...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
