"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Menu, 
  Bell, 
  Search, 
  User,
  Moon,
  Sun,
  Package
} from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface MobileHeaderProps {
  onMenuToggle: () => void
  userRole?: "admin" | "technician" | "staff"
}

export function MobileHeader({ onMenuToggle, userRole }: MobileHeaderProps) {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const [notifications] = useState(3) // Mock notification count

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
      case "technician":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
      case "staff":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 lg:hidden">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="h-9 w-9 p-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Chinhoyi University of Technology" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CUT
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="h-9 w-9 p-0"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 relative"
          >
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {notifications > 9 ? "9+" : notifications}
              </Badge>
            )}
          </Button>

          {/* User Profile */}
          <div className="flex items-center gap-2">
            {userRole && (
              <Badge className={cn("text-xs", getRoleColor(userRole))}>
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-full"
            >
              <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Button
            variant="outline"
            size="sm"
            className="whitespace-nowrap text-xs h-8 px-3"
          >
            <User className="w-3 h-3 mr-1" />
            Profile
          </Button>
          
          {userRole === "admin" && (
            <Button
              variant="outline"
              size="sm"
              className="whitespace-nowrap text-xs h-8 px-3"
            >
              <Package className="w-3 h-3 mr-1" />
              Assets
            </Button>
          )}
          
          {userRole === "technician" && (
            <Button
              variant="outline"
              size="sm"
              className="whitespace-nowrap text-xs h-8 px-3"
            >
              <Search className="w-3 h-3 mr-1" />
              Scan
            </Button>
          )}
          
          {userRole === "staff" && (
            <Button
              variant="outline"
              size="sm"
              className="whitespace-nowrap text-xs h-8 px-3"
            >
              <User className="w-3 h-3 mr-1" />
              Request
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
