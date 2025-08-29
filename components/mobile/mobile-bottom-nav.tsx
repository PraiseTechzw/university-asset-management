"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Package, ClipboardList, QrCode, User } from "lucide-react"

interface MobileBottomNavProps {
  role: string
}

export function MobileBottomNav({ role }: MobileBottomNavProps) {
  const pathname = usePathname()

  const getNavItems = () => {
    const baseItems = [
      { href: "/dashboard", icon: Home, label: "Home" },
      { href: "/dashboard/assets", icon: Package, label: "Assets" },
    ]

    if (role === "admin" || role === "technician") {
      return [
        ...baseItems,
        { href: "/dashboard/issue", icon: ClipboardList, label: "Issue" },
        { href: "/dashboard/scan", icon: QrCode, label: "Scan" },
        { href: "/dashboard/profile", icon: User, label: "Profile" },
      ]
    }

    return [
      ...baseItems,
      { href: "/dashboard/scan", icon: QrCode, label: "Scan" },
      { href: "/dashboard/profile", icon: User, label: "Profile" },
    ]
  }

  const navItems = getNavItems()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="grid grid-cols-4 h-16">
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 text-xs transition-colors",
                isActive
                  ? "text-university-blue-600 bg-university-blue-50"
                  : "text-gray-600 hover:text-university-blue-600",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
