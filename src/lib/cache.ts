'use server'

import { cache } from 'react'
import { prisma } from './prisma'

// Cache for frequently accessed data
export const getCachedTanahGarapanCount = cache(async () => {
  return await prisma.tanahGarapanEntry.count()
})

export const getCachedUsersCount = cache(async () => {
  return await prisma.user.count()
})

export const getCachedActivityLogsCount = cache(async () => {
  return await prisma.activityLog.count()
})

// Cache for unique locations (used in search filters)
export const getCachedLocations = cache(async () => {
  const entries = await prisma.tanahGarapanEntry.findMany({
    select: { letakTanah: true },
    distinct: ['letakTanah']
  })
  
  return entries
    .map(entry => entry.letakTanah.split(',')[0].trim())
    .filter((location, index, self) => self.indexOf(location) === index)
    .sort()
})

// Cache for user roles distribution
export const getCachedUserRoles = cache(async () => {
  const users = await prisma.user.findMany({
    select: { role: true }
  })
  
  return users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)
})

// Cache for recent activity logs
export const getCachedRecentActivity = cache(async (limit: number = 10) => {
  return await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      user: true,
      action: true,
      details: true,
      createdAt: true
    }
  })
})

// Cache for tanah garapan statistics
export const getCachedTanahGarapanStats = cache(async () => {
  const [totalEntries, totalLuas, entriesByMonth] = await Promise.all([
    prisma.tanahGarapanEntry.count(),
    prisma.tanahGarapanEntry.aggregate({
      _sum: { luas: true }
    }),
    prisma.tanahGarapanEntry.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      orderBy: { createdAt: 'desc' }
    })
  ])

  return {
    totalEntries,
    totalLuas: totalLuas._sum.luas || 0,
    entriesByMonth: entriesByMonth.slice(0, 12) // Last 12 months
  }
})

