import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getActivityLogs } from '@/lib/server-actions/activity'
import { getServerSession } from 'next-auth'
import { authOptions, canViewLogs } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Activity, User, Calendar } from 'lucide-react'

export default async function ActivityLogsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !canViewLogs(session.user.role)) {
    redirect('/tanah-garapan')
  }

  const logsResult = await getActivityLogs()

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'CREATE_ENTRY':
      case 'CREATE_USER':
        return 'default'
      case 'UPDATE_ENTRY':
      case 'UPDATE_USER':
        return 'secondary'
      case 'DELETE_ENTRY':
      case 'DELETE_USER':
        return 'destructive'
      case 'EXPORT_CSV':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE_USER':
      case 'UPDATE_USER':
      case 'DELETE_USER':
        return <User className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const logs = logsResult.success ? logsResult.data || [] : []

  // Group logs by date
  const groupedLogs = logs.reduce((acc: any, log: any) => {
    const date = new Date(log.createdAt).toDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(log)
    return acc
  }, {})

  const logStats = {
    total: logs.length,
    today: logs.filter((log: any) => {
      const today = new Date().toDateString()
      const logDate = new Date(log.createdAt).toDateString()
      return today === logDate
    }).length,
    thisWeek: logs.filter((log: any) => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(log.createdAt) >= weekAgo
    }).length,
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor all system activities and user actions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logStats.total}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logStats.today}</div>
              <p className="text-xs text-muted-foreground">Activities today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logStats.thisWeek}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest activities and system events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">No activity logs</h3>
                <p className="text-sm text-gray-500">No activities have been recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedLogs).map(([date, dateLogs]: [string, any]) => (
                  <div key={date}>
                    <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    
                    <div className="space-y-3">
                      {dateLogs.map((log: any) => (
                        <div
                          key={log.id}
                          className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-shrink-0 mt-1">
                            {getActionIcon(log.action)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant={getActionBadgeVariant(log.action)}>
                                {log.action}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                by {log.user}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatDate(log.createdAt)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-900">{log.details}</p>
                            
                            {log.payload && (
                              <details className="mt-2">
                                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                                  View details
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(log.payload, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
