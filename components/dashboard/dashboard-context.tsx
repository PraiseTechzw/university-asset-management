"use client"

import { createContext, useContext, ReactNode } from "react"

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: "admin" | "technician" | "staff"
  department?: string
}

interface DashboardContextType {
  userProfile: UserProfile | null
  userRole: "admin" | "technician" | "staff" | null
  isLoading: boolean
  error: string | null
  refreshProfile: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}

interface DashboardProviderProps {
  children: ReactNode
  value: DashboardContextType
}

export function DashboardProvider({ children, value }: DashboardProviderProps) {
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}
