"use client"

import { usePathname } from "next/navigation"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, ChevronRight } from "lucide-react"
import Link from "next/link"

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
  actions?: React.ReactNode
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
}

export function PageHeader({ 
  title, 
  description, 
  breadcrumbs = [], 
  actions,
  badge 
}: PageHeaderProps) {
  const pathname = usePathname()

  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbItems = [
      {
        label: "Home",
        href: "/dashboard"
      }
    ]

    let currentPath = ""
    paths.forEach((path, index) => {
      currentPath += `/${path}`
      if (index === 0) return // Skip dashboard
      
      const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')
      breadcrumbItems.push({
        label,
        href: index === paths.length - 1 ? undefined : currentPath
      })
    })

    return breadcrumbItems
  }

  const defaultBreadcrumbs = generateBreadcrumbs()
  const finalBreadcrumbs = breadcrumbs.length > 0 ? breadcrumbs : defaultBreadcrumbs

  return (
    <div className="space-y-4 pb-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          {finalBreadcrumbs.map((item, index) => (
            <BreadcrumbItem key={index}>
              {index === finalBreadcrumbs.length - 1 ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href || "#"}>{item.label}</Link>
                </BreadcrumbLink>
              )}
              {index < finalBreadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {badge && (
              <Badge variant={badge.variant || "secondary"}>
                {badge.text}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-muted-foreground text-lg">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
