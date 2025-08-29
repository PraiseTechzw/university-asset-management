import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, QrCode, Camera, Scan } from "lucide-react"

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Scanning Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scanner Interface Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Scan className="h-5 w-5 text-muted-foreground" />
                <Skeleton className="h-6 w-40" />
              </div>
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Camera Preview Area */}
                <div className="flex items-center justify-center">
                  <div className="relative w-full max-w-md aspect-square bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="relative">
                        <Camera className="h-16 w-16 text-muted-foreground mx-auto animate-pulse" />
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32 mx-auto" />
                        <Skeleton className="h-3 w-48 mx-auto" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scanning Controls */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-32" />
                </div>

                {/* Status Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-2 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-2 w-20" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-3 w-18" />
                      <Skeleton className="h-2 w-22" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Scans Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-muted-foreground" />
                <Skeleton className="h-6 w-36" />
              </div>
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="text-right space-y-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-2 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>

          {/* Scan Statistics */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-36" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="w-2 h-2 rounded-full mt-2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 md:hidden">
        <div className="flex items-center justify-around">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="w-6 h-6 rounded" />
              <Skeleton className="w-12 h-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
