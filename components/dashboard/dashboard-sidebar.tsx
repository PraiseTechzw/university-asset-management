"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, QrCode, Users, BarChart3, Settings, Projector, ClipboardList } from "lucide-react"

interface DashboardSidebarProps {
  role: string
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const getNavigationItems = (role: string) => {
    const baseItems = [{ icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" }]

    if (role === "admin") {
      return [
        ...baseItems,
        { icon: Package, label: "Asset Registry", href: "/assets" },
        { icon: Users, label: "User Management", href: "/users" },
        { icon: Projector, label: "Projector Management", href: "/projectors" },
        { icon: BarChart3, label: "Analytics", href: "/analytics" },
        { icon: Settings, label: "Settings", href: "/settings" },
      ]
    }

    if (role === "technician") {
      return [
        ...baseItems,
        { icon: QrCode, label: "Scan Asset", href: "/scan" },
        { icon: Projector, label: "Issue/Return", href: "/issue-return" },
        { icon: Package, label: "Asset Status", href: "/asset-status" },
        { icon: ClipboardList, label: "Maintenance", href: "/maintenance" },
      ]
    }

    // Staff role
    return [
      ...baseItems,
      { icon: Projector, label: "Request Projector", href: "/request" },
      { icon: ClipboardList, label: "My Bookings", href: "/bookings" },
    ]
  }

  const navigationItems = getNavigationItems(role)

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Logo/Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sidebar-foreground">CUT Assets</h2>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              item.href === "/dashboard" && "bg-sidebar-accent text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground text-center">CUT Asset Management v1.0</p>
      </div>
    </div>
  )
}
