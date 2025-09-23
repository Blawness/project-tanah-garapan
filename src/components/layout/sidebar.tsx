'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { canViewLogs } from '@/lib/auth'
import { 
  Home, 
  MapPin, 
  FileText, 
  Users, 
  Activity,
  Upload,
  Download,
  Printer
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['USER', 'MANAGER', 'ADMIN', 'DEVELOPER']
  },
  {
    name: 'Tanah Garapan',
    href: '/tanah-garapan',
    icon: MapPin,
    roles: ['USER', 'MANAGER', 'ADMIN', 'DEVELOPER']
  },
  {
    name: 'Users',
    href: '/users',
    icon: Users,
    roles: ['ADMIN', 'DEVELOPER']
  },
  {
    name: 'Activity Logs',
    href: '/activity-logs',
    icon: Activity,
    roles: ['ADMIN', 'DEVELOPER']
  },
]

export function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session?.user) {
    return null
  }

  const userRole = session.user.role

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  )

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex min-h-0 flex-1 flex-col bg-gray-900">
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div className="flex items-center flex-shrink-0 px-4">
            <MapPin className="h-8 w-8 text-white" />
            <span className="ml-2 text-white font-semibold">Tanah Garapan</span>
          </div>
          <nav className="mt-8 flex-1 space-y-1 px-2">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
