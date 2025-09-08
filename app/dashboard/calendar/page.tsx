"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  Package,
  Users,
  AlertTriangle
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface CalendarEvent {
  id: string
  title: string
  type: 'maintenance' | 'asset-issue' | 'meeting' | 'deadline'
  startDate: string
  endDate: string
  description: string
  assetId?: string
  assetName?: string
  assignedTo?: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)

  useEffect(() => {
    fetchCalendarEvents()
  }, [currentDate])

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Calculate date range for current month view
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      // Fetch events from multiple tables
      const [maintenanceResult, issuesResult] = await Promise.all([
        supabase
          .from("maintenance_records")
          .select(`
            id,
            issue_description,
            reported_date,
            resolved_date,
            status,
            priority,
            assets(name)
          `)
          .gte('reported_date', startOfMonth.toISOString())
          .lte('reported_date', endOfMonth.toISOString()),
        supabase
          .from("asset_issues")
          .select(`
            id,
            notes,
            issue_date,
            expected_return_date,
            status,
            assets(name)
          `)
          .gte('issue_date', startOfMonth.toISOString())
          .lte('issue_date', endOfMonth.toISOString())
      ])

      if (maintenanceResult.error) throw maintenanceResult.error
      if (issuesResult.error) throw issuesResult.error

      // Transform maintenance records
      const maintenanceEvents: CalendarEvent[] = (maintenanceResult.data || []).map(record => ({
        id: record.id,
        title: `Maintenance: ${record.issue_description}`,
        type: 'maintenance',
        startDate: record.reported_date,
        endDate: record.resolved_date || record.reported_date,
        description: record.issue_description,
        assetName: record.assets?.[0]?.name,
        status: record.status,
        priority: record.priority || 'medium'
      }))

      // Transform asset issues
      const issueEvents: CalendarEvent[] = (issuesResult.data || []).map(issue => ({
        id: issue.id,
        title: `Issue: ${issue.notes}`,
        type: 'asset-issue',
        startDate: issue.issue_date,
        endDate: issue.expected_return_date || issue.issue_date,
        description: issue.notes,
        assetName: issue.assets?.[0]?.name,
        status: issue.status,
        priority: issue.status === 'overdue' ? 'high' : 'medium'
      }))

      setEvents([...maintenanceEvents, ...issueEvents])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load calendar events",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      'maintenance': 'bg-blue-100 text-blue-800 border-blue-200',
      'asset-issue': 'bg-orange-100 text-orange-800 border-orange-200',
      'meeting': 'bg-purple-100 text-purple-800 border-purple-200',
      'deadline': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'text-green-600',
      'medium': 'text-yellow-600',
      'high': 'text-orange-600',
      'critical': 'text-red-600'
    }
    return colors[priority as keyof typeof colors] || 'text-gray-600'
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const today = new Date()
  const days = getDaysInMonth(currentDate)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <CalendarIcon className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Calendar</h1>
          <p className="text-muted-foreground">
            Schedule and track asset-related activities
          </p>
        </div>
        <Button onClick={() => setShowEventModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <h2 className="text-xl font-semibold">
              {currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
            
            <Button
              variant="outline"
              onClick={() => navigateMonth('next')}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center font-medium text-sm text-muted-foreground">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="p-2" />
              }
              
              const isToday = day.toDateString() === today.toDateString()
              const isCurrentMonth = day.getMonth() === currentDate.getMonth()
              const dayEvents = getEventsForDate(day)
              
              return (
                <div
                  key={day.toISOString()}
                  className={`
                    min-h-[120px] p-2 border border-gray-200 dark:border-gray-800
                    ${isToday ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-300' : ''}
                    ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900/50 text-muted-foreground' : ''}
                    hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer
                  `}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="text-sm font-medium mb-1">
                    {day.getDate()}
                  </div>
                  
                  {/* Events for this day */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className={`
                          text-xs p-1 rounded border truncate
                          ${getEventTypeColor(event.type)}
                        `}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>
            Events scheduled for the next 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events
              .filter(event => {
                const eventDate = new Date(event.startDate)
                const nextWeek = new Date()
                nextWeek.setDate(nextWeek.getDate() + 7)
                return eventDate >= today && eventDate <= nextWeek
              })
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .slice(0, 10)
              .map(event => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-3 h-3 rounded-full
                      ${event.type === 'maintenance' ? 'bg-blue-500' : 
                        event.type === 'asset-issue' ? 'bg-orange-500' : 'bg-purple-500'}
                    `} />
                    
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(event.startDate).toLocaleDateString()} • {event.assetName || 'No asset'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={event.status === 'overdue' ? 'destructive' : 'secondary'}>
                      {event.status}
                    </Badge>
                    <span className={`text-sm font-medium ${getPriorityColor(event.priority)}`}>
                      {event.priority}
                    </span>
                  </div>
                </div>
              ))}
            
            {events.filter(event => {
              const eventDate = new Date(event.startDate)
              const nextWeek = new Date()
              nextWeek.setDate(nextWeek.getDate() + 7)
              return eventDate >= today && eventDate <= nextWeek
            }).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming events</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Add New Event</CardTitle>
              <CardDescription>
                Schedule a new asset-related event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Event creation form coming soon</p>
                <p className="text-sm">This will include fields for event type, dates, assets, and assignments</p>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowEventModal(false)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Date Selection Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>
                Events for {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map(event => (
                  <div
                    key={event.id}
                    className="p-3 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{event.title}</div>
                      <Badge variant={event.status === 'overdue' ? 'destructive' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {event.description}
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(event.startDate).toLocaleTimeString()}
                      </span>
                      {event.assetName && (
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {event.assetName}
                        </span>
                      )}
                      <span className={`font-medium ${getPriorityColor(event.priority)}`}>
                        {event.priority} priority
                      </span>
                    </div>
                  </div>
                ))}
                
                {getEventsForDate(selectedDate).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No events scheduled for this date</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedDate(null)}
                >
                  Close
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    setSelectedDate(null)
                    setShowEventModal(true)
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
