"use client"

import { AdminDashboard } from "./admin-dashboard"
import { TechnicianDashboard } from "./technician-dashboard"
import { StaffDashboard } from "./staff-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, User, Wrench } from "lucide-react"
import { useDashboard } from "./dashboard-context"

export function DashboardContentSimple() {
  const { userRole } = useDashboard()
  const role = userRole || "staff"

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-5 h-5 text-purple-600" />
      case "technician":
        return <Wrench className="w-5 h-5 text-blue-600" />
      case "staff":
        return <User className="w-5 h-5 text-green-600" />
      default:
        return <User className="w-5 h-5 text-gray-600" />
    }
  }

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

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return "Full system access and user management"
      case "technician":
        return "Asset operations and maintenance"
      case "staff":
        return "Asset requests and basic operations"
      default:
        return "Limited access"
    }
  }

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Role-based Dashboard */}
      {role === "admin" && <AdminDashboard />}
      {role === "technician" && <TechnicianDashboard />}
      {role === "staff" && <StaffDashboard />}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your assets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getRoleColor(role)}>
            {getRoleIcon(role)}
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Role Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getRoleIcon(role)}
            {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
          </CardTitle>
          <CardDescription>
            {getRoleDescription(role)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderDashboard()}
        </CardContent>
      </Card>
    </div>
  )
}
