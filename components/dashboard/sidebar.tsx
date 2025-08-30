"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  QrCode,
  FileText,
  Wrench,
  BarChart3,
  Calendar,
  Search,
  Plus,
  Eye,
  Clock,
  AlertTriangle,
  Archive,
  Building2,
  ChevronRight,
  Home
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  userRole?: "admin" | "technician" | "staff"
}

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  badge?: string
  description?: string
  role?: "admin" | "technician" | "staff" | "all"
}

export function Sidebar({ isOpen, onToggle, userRole }: SidebarProps) {
  const pathname = usePathname()
  const { signOut, user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "👋 Signed out successfully",
        description: "You have been signed out of the system.",
      })
    } catch (error) {
      toast({
        title: "❌ Sign out failed",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
        description: "Overview and analytics",
        role: "all"
      }
    ]

    const adminItems: NavItem[] = [
      {
        title: "Asset Management",
        href: "/dashboard/assets",
        icon: <Package className="w-4 h-4" />,
        description: "Manage all assets",
        role: "admin"
      },
      {
        title: "User Management",
        href: "/dashboard/users",
        icon: <Users className="w-4 h-4" />,
        description: "Manage users and roles",
        role: "admin"
      },
      {
        title: "Reports & Analytics",
        href: "/dashboard/reports",
        icon: <BarChart3 className="w-4 h-4" />,
        description: "System reports and insights",
        role: "admin"
      },
      {
        title: "System Settings",
        href: "/dashboard/settings",
        icon: <Settings className="w-4 h-4" />,
        description: "Configure system settings",
        role: "admin"
      }
    ]

    const technicianItems: NavItem[] = [
      {
        title: "Quick Scan",
        href: "/dashboard/scan",
        icon: <QrCode className="w-4 h-4" />,
        description: "Scan QR codes for operations",
        role: "technician"
      },
      {
        title: "Issue Assets",
        href: "/dashboard/issue",
        icon: <Package className="w-4 h-4" />,
        description: "Assign assets to users",
        role: "technician"
      },
      {
        title: "Active Issues",
        href: "/dashboard/issue/active",
        icon: <Clock className="w-4 h-4" />,
        description: "View current assignments",
        role: "technician"
      },
      {
        title: "Maintenance",
        href: "/dashboard/maintenance",
        icon: <Wrench className="w-4 h-4" />,
        description: "Asset maintenance records",
        role: "technician"
      }
    ]

    const staffItems: NavItem[] = [
      {
        title: "Request Asset",
        href: "/dashboard/request",
        icon: <Plus className="w-4 h-4" />,
        description: "Submit asset requests",
        role: "staff"
      },
      {
        title: "My Assets",
        href: "/dashboard/my-assets",
        icon: <Eye className="w-4 h-4" />,
        description: "View assigned assets",
        role: "staff"
      },
      {
        title: "Browse Assets",
        href: "/dashboard/assets",
        icon: <Search className="w-4 h-4" />,
        description: "Search available assets",
        role: "staff"
      },
      {
        title: "My Requests",
        href: "/dashboard/my-requests",
        icon: <FileText className="w-4 h-4" />,
        description: "Track request status",
        role: "staff"
      }
    ]

    const commonItems: NavItem[] = [
      {
        title: "Calendar",
        href: "/dashboard/calendar",
        icon: <Calendar className="w-4 h-4" />,
        description: "Asset scheduling",
        role: "all"
      }
    ]

    // Build navigation items based on role, avoiding duplicates
    let navItems = [...baseItems]
    
    if (userRole === "admin") {
      navItems.push(...adminItems)
    } else if (userRole === "technician") {
      navItems.push(...technicianItems)
    } else if (userRole === "staff") {
      navItems.push(...staffItems)
    }
    
    // Add common items that don't conflict with role-specific items
    navItems.push(...commonItems)
    

    
    return navItems
  }

  const navItems = getNavItems()

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:relative left-0 top-0 z-50 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:z-auto lg:flex-shrink-0",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CUT
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex h-8 w-8 p-0"
            >
              <ChevronRight className={cn(
                "w-4 h-4 transition-transform",
                isCollapsed && "rotate-180"
              )} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="p-4 space-y-2">
            {navItems.map((item, index) => {
              const active = isActive(item.href)
              const showItem = item.role === "all" || item.role === userRole
              
              if (!showItem) return null

              return (
                <Link key={`${item.role}-${item.href}-${index}`} href={item.href}>
                  <div
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer",
                      active
                        ? "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <div className={cn(
                      "flex-shrink-0",
                      active ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    )}>
                      {item.icon}
                    </div>
                    
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          {/* User Section */}
          {!isCollapsed && (
            <>
              <Separator className="mx-4 my-4" />
              <div className="px-4 pb-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {user?.email || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : "User"}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full mt-2 justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </>
          )}
        </ScrollArea>
      </div>
    </>
  )
}
