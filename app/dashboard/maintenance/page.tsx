"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Wrench, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Plus,
  Search,
  Filter
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface MaintenanceRecord {
  id: string
  assetId: string
  assetName: string
  type: 'preventive' | 'corrective' | 'emergency'
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue'
  description: string
  scheduledDate: string
  completedDate?: string
  technician: string
  cost: number
  notes?: string
}

export default function MaintenancePage() {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchMaintenanceRecords()
  }, [])

  const fetchMaintenanceRecords = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Fetch maintenance records with asset information
      const { data, error } = await supabase
        .from("maintenance_records")
        .select(`
          *,
          assets(name)
        `)
        .order('scheduledDate', { ascending: false })

      if (error) throw error

      // Transform data to match interface
      const records = (data || []).map(record => ({
        id: record.id,
        assetId: record.asset_id,
        assetName: record.assets?.name || 'Unknown Asset',
        type: record.type,
        status: record.status,
        description: record.description,
        scheduledDate: record.scheduled_date,
        completedDate: record.completed_date,
        technician: record.technician,
        cost: record.cost || 0,
        notes: record.notes
      }))

      setMaintenanceRecords(records)
    } catch (error) {
      console.error("Error fetching maintenance records:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      'scheduled': 'secondary',
      'in-progress': 'default',
      'completed': 'default',
      'overdue': 'destructive'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.replace('-', ' ')}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const variants = {
      'preventive': 'default',
      'corrective': 'secondary',
      'emergency': 'destructive'
    } as const

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'secondary'}>
        {type}
      </Badge>
    )
  }

  const filteredRecords = maintenanceRecords.filter(record => {
    const matchesStatus = filterStatus === "all" || record.status === filterStatus
    const matchesSearch = record.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Wrench className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading maintenance records...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance Management</h1>
          <p className="text-muted-foreground">
            Track and manage asset maintenance schedules and records
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Maintenance
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search assets or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceRecords.length}</div>
            <p className="text-xs text-muted-foreground">
              Maintenance records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {maintenanceRecords.filter(r => r.status === 'scheduled').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Upcoming maintenance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {maintenanceRecords.filter(r => r.status === 'in-progress').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently being worked on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {maintenanceRecords.filter(r => r.status === 'overdue').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Past due date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Records</CardTitle>
          <CardDescription>
            View and manage all maintenance activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Asset</th>
                  <th className="text-left py-3 px-2">Type</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Scheduled Date</th>
                  <th className="text-left py-3 px-2">Technician</th>
                  <th className="text-left py-3 px-2">Cost</th>
                  <th className="text-left py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2">
                      <div>
                        <div className="font-medium">{record.assetName}</div>
                        <div className="text-sm text-muted-foreground">
                          {record.description.substring(0, 50)}...
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      {getTypeBadge(record.type)}
                    </td>
                    <td className="py-3 px-2">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-sm">
                        {new Date(record.scheduledDate).toLocaleDateString()}
                      </div>
                      {record.status === 'overdue' && (
                        <div className="text-xs text-red-600">
                          {Math.ceil((Date.now() - new Date(record.scheduledDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-sm">{record.technician}</div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-sm">
                        ${record.cost.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                        {record.status === 'scheduled' && (
                          <Button size="sm">
                            Start
                          </Button>
                        )}
                        {record.status === 'in-progress' && (
                          <Button size="sm" variant="secondary">
                            Complete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredRecords.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No maintenance records found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
