import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getUsers } from '@/lib/server-actions/users'
import { getServerSession } from 'next-auth'
import { authOptions, canViewLogs } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Users, UserPlus, Shield, Calendar } from 'lucide-react'

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !canViewLogs(session.user.role)) {
    redirect('/tanah-garapan')
  }

  const usersResult = await getUsers()

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'DEVELOPER':
        return 'default'
      case 'ADMIN':
        return 'destructive'
      case 'MANAGER':
        return 'secondary'
      case 'USER':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'DEVELOPER':
        return 'Full system access'
      case 'ADMIN':
        return 'Administrative privileges'
      case 'MANAGER':
        return 'Data management access'
      case 'USER':
        return 'Read-only access'
      default:
        return 'Unknown role'
    }
  }

  const users = usersResult.success ? usersResult.data || [] : []

  const userStats = {
    total: users.length,
    developers: users.filter((user: any) => user.role === 'DEVELOPER').length,
    admins: users.filter((user: any) => user.role === 'ADMIN').length,
    managers: users.filter((user: any) => user.role === 'MANAGER').length,
    regularUsers: users.filter((user: any) => user.role === 'USER').length,
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage system users and their permissions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.total}</div>
              <p className="text-xs text-muted-foreground">All users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Developers</CardTitle>
              <Shield className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.developers}</div>
              <p className="text-xs text-muted-foreground">System developers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.admins}</div>
              <p className="text-xs text-muted-foreground">Administrators</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Managers</CardTitle>
              <Shield className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.managers}</div>
              <p className="text-xs text-muted-foreground">Data managers</p>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>System Users</CardTitle>
            <CardDescription>
              List of all registered users and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">No users found</h3>
                <p className="text-sm text-gray-500">No users have been created yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user: any) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-start justify-between space-x-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                          </h3>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-500 mb-2">
                          {user.email}
                        </p>
                        
                        <p className="text-xs text-gray-400 mb-3">
                          {getRoleDescription(user.role)}
                        </p>
                        
                        <div className="flex items-center text-xs text-gray-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          Joined {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>
              Overview of permissions for each user role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Permission</th>
                    <th className="text-center py-3 px-4 font-medium">Developer</th>
                    <th className="text-center py-3 px-4 font-medium">Admin</th>
                    <th className="text-center py-3 px-4 font-medium">Manager</th>
                    <th className="text-center py-3 px-4 font-medium">User</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { permission: 'View Data', dev: '✅', admin: '✅', manager: '✅', user: '✅' },
                    { permission: 'Create Entry', dev: '✅', admin: '✅', manager: '✅', user: '❌' },
                    { permission: 'Edit Entry', dev: '✅', admin: '✅', manager: '✅', user: '❌' },
                    { permission: 'Delete Entry', dev: '✅', admin: '✅', manager: '✅', user: '❌' },
                    { permission: 'Export Data', dev: '✅', admin: '✅', manager: '✅', user: '❌' },
                    { permission: 'Print Data', dev: '✅', admin: '✅', manager: '✅', user: '✅' },
                    { permission: 'View Logs', dev: '✅', admin: '✅', manager: '❌', user: '❌' },
                    { permission: 'Manage Users', dev: '✅', admin: '✅', manager: '❌', user: '❌' },
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm">{row.permission}</td>
                      <td className="py-3 px-4 text-center text-sm">{row.dev}</td>
                      <td className="py-3 px-4 text-center text-sm">{row.admin}</td>
                      <td className="py-3 px-4 text-center text-sm">{row.manager}</td>
                      <td className="py-3 px-4 text-center text-sm">{row.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
