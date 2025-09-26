'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getUsers } from '@/lib/server-actions/users'
import { canViewLogs } from '@/lib/auth'
import { Users, UserPlus, Shield, Calendar } from 'lucide-react'
import { LazyUserForm, LazyUserActions } from '@/components/lazy/lazy-components'
import { LazyWrapper, FormFallback, CardFallback } from '@/components/lazy/lazy-wrapper'
import { toast } from 'sonner'

export default function UsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

  const canManage = session?.user && canViewLogs(session.user.role)

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const result = await getUsers()
      if (result.success) {
        setUsers(result.data || [])
      } else {
        toast.error(result.error || 'Failed to fetch users')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (canManage) {
      fetchUsers()
    }
  }, [canManage])

  if (!canManage) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500">You don't have permission to view this page.</p>
          </div>
        </div>
      </AppLayout>
    )
  }

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

  const userStats = {
    total: users.length,
    developers: users.filter((user: any) => user.role === 'DEVELOPER').length,
    admins: users.filter((user: any) => user.role === 'ADMIN').length,
    managers: users.filter((user: any) => user.role === 'MANAGER').length,
    regularUsers: users.filter((user: any) => user.role === 'USER').length,
  }

  const handleCreateUser = () => {
    setEditingUser(null)
    setFormMode('create')
    setIsFormOpen(true)
  }

  const handleEditUser = (user: any) => {
    setEditingUser(user)
    setFormMode('edit')
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    fetchUsers()
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage system users and their permissions
            </p>
          </div>
          <Button onClick={handleCreateUser}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
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
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-sm text-gray-500">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">No users found</h3>
                <p className="text-sm text-gray-500">No users have been created yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                          </h3>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          Joined {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                    <LazyWrapper fallback={<div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />}>
                      <LazyUserActions 
                        user={user} 
                        onEdit={handleEditUser}
                        onRefresh={fetchUsers}
                      />
                    </LazyWrapper>
                  </div>
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

      {/* User Form Dialog */}
      <LazyWrapper fallback={<FormFallback />}>
        <LazyUserForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSuccess={handleFormSuccess}
          user={editingUser}
          mode={formMode}
        />
      </LazyWrapper>
    </AppLayout>
  )
}
