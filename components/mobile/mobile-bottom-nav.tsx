"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Package, 
  QrCode, 
  Plus, 
  Users 
} from "lucide-react"
import { useDashboard } from "@/components/dashboard/dashboard-context"

export function MobileBottomNav() {
  const pathname = usePathname()
  const { userRole } = useDashboard()

  const getNavItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard
      }
    ]

    if (userRole === "admin") {
      return [
        ...baseItems,
        {
          title: "Assets",
          href: "/dashboard/assets",
          icon: Package
        },
        {
          title: "Users",
          href: "/dashboard/users",
          icon: Users
        }
      ]
    } else if (userRole === "technician") {
      return [
        ...baseItems,
        {
          title: "Scan",
          href: "/dashboard/scan",
          icon: QrCode
        },
        {
          title: "Issue",
          href: "/dashboard/issue",
          icon: Package
        }
      ]
    } else {
      return [
        ...baseItems,
        {
          title: "Request",
          href: "/dashboard/request",
          icon: Plus
        },
        {
          title: "Assets",
          href: "/dashboard/assets",
          icon: Package
        }
      ]
    }
  }

  const navItems = getNavItems()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center py-2 px-3 text-xs transition-colors",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.title}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
