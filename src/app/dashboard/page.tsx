import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCachedTanahGarapanStats, getCachedUserRoles, getCachedRecentActivity } from '@/lib/cache'
import { MapPin, Users, Activity, FileText } from 'lucide-react'

export default async function DashboardPage() {
  const [tanahGarapanStats, userRoles, recentActivity] = await Promise.all([
    getCachedTanahGarapanStats(),
    getCachedUserRoles(),
    getCachedRecentActivity(5)
  ])

  const totalUsers = Object.values(userRoles).reduce((sum, count) => sum + count, 0)

  const stats = [
    {
      title: 'Total Tanah Garapan',
      value: tanahGarapanStats.totalEntries,
      description: 'Jumlah data tanah garapan',
      icon: MapPin,
      color: 'text-blue-600'
    },
    {
      title: 'Total Luas',
      value: `${tanahGarapanStats.totalLuas.toLocaleString()} m²`,
      description: 'Total luas tanah garapan',
      icon: FileText,
      color: 'text-green-600'
    },
    {
      title: 'Total Pengguna',
      value: totalUsers,
      description: 'Jumlah pengguna sistem',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Aktivitas Terbaru',
      value: recentActivity.length,
      description: 'Aktivitas terbaru',
      icon: Activity,
      color: 'text-orange-600'
    }
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Overview sistem manajemen tanah garapan
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Aktivitas terbaru dalam sistem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((log) => (
                  <div key={log.id} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {log.details}
                      </p>
                      <p className="text-sm text-gray-500">
                        by {log.user} • {new Date(log.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}