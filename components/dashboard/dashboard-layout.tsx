"use client"

import { useState } from "react"
import { DashboardSidebar } from "./dashboard-sidebar"
import { MobileHeader } from "../mobile/mobile-header"
import { MobileBottomNav } from "../mobile/mobile-bottom-nav"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Menu, Bell, User, LogOut, Sun, Moon, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: string
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "👋 Signed out successfully",
        description: "You have been logged out of the system.",
      })
    } catch (error) {
      console.error("Sign out error:", error)
      toast({
        title: "❌ Sign out failed",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const getUserInitials = () => {
    if (!user?.email) return "U"
    const name = user.user_metadata?.full_name || user.email.split("@")[0]
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const getUserDisplayName = () => {
    if (!user?.email) return "User"
    return user.user_metadata?.full_name || user.email.split("@")[0]
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      {isMobile && (
        <MobileHeader
          role={role}
          title="Dashboard"
          subtitle={`Welcome, ${getUserDisplayName()}`}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar
          role={role}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Desktop Header */}
          <header className="hidden md:flex items-center justify-between p-6 border-b bg-card">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {role === "admin" && "Admin Dashboard"}
                  {role === "technician" && "Technician Dashboard"}
                  {role === "staff" && "Staff Dashboard"}
                </h1>
                <p className="text-muted-foreground">
                  Welcome back, {getUserDisplayName()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="hover:bg-accent"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt={getUserDisplayName()} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        Role: {role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav role={role} />}
    </div>
  )
}
