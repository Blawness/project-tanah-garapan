'use server'

import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/lib/types'
import { getServerSession } from 'next-auth'
import { authOptions, canViewLogs } from '@/lib/auth'

export async function logActivity(
  user: string,
  action: string,
  details: string,
  payload?: any
): Promise<void> {
  try {
    // Temporarily disable authentication for development
    // const session = await getServerSession(authOptions)
    // if (!session || !canViewLogs(session.user.role)) {
    //   return // Don't log if not authenticated
    // }

    await prisma.activityLog.create({
      data: {
        user,
        action,
        details,
        payload: payload ? JSON.parse(JSON.stringify(payload)) : null,
      }
    })
  } catch (error) {
    console.error('Error logging activity:', error)
    // Don't throw error to prevent breaking the main operation
  }
}

export async function getActivityLogs(): Promise<ApiResponse<any[]>> {
  try {
    // Temporarily disable authentication for development
    // const session = await getServerSession(authOptions)
    // if (!session || !canViewLogs(session.user.role)) {
    //   return { success: false, error: 'Unauthorized' }
    // }

    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 logs
    })

    return { success: true, data: logs }
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return { success: false, error: 'Failed to fetch activity logs' }
  }
}

export async function getActivityLogsByUser(user: string): Promise<ApiResponse<any[]>> {
  try {
    // Temporarily disable authentication for development
    // const session = await getServerSession(authOptions)
    // if (!session || !canViewLogs(session.user.role)) {
    //   return { success: false, error: 'Unauthorized' }
    // }

    const logs = await prisma.activityLog.findMany({
      where: { user },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return { success: true, data: logs }
  } catch (error) {
    console.error('Error fetching user activity logs:', error)
    return { success: false, error: 'Failed to fetch user activity logs' }
  }
}

export async function getActivityLogsByAction(action: string): Promise<ApiResponse<any[]>> {
  try {
    // Temporarily disable authentication for development
    // const session = await getServerSession(authOptions)
    // if (!session || !canViewLogs(session.user.role)) {
    //   return { success: false, error: 'Unauthorized' }
    // }

    const logs = await prisma.activityLog.findMany({
      where: { action },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return { success: true, data: logs }
  } catch (error) {
    console.error('Error fetching action activity logs:', error)
    return { success: false, error: 'Failed to fetch action activity logs' }
  }
}
