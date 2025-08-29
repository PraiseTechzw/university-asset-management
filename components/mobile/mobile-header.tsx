"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Bell, Search, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { useState } from "react"

interface MobileHeaderProps {
  role: string
  title: string
  subtitle?: string
}

export function MobileHeader({ role, title, subtitle }: MobileHeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between md:hidden sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <DashboardSidebar role={role} />
          </SheetContent>
        </Sheet>

        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
