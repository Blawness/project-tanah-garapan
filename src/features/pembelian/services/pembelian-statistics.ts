/**
 * Statistics and analytics service for pembelian data
 * Calculates various metrics and aggregations
 */

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { serializeDecimalObjects } from '@/lib/utils/serialization'

/**
 * Get pembelian statistics and dashboard data
 */
export async function getPembelianStats() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const [totalPembelian, totalHarga, pembelianByStatus, pembayaranByStatus] = await Promise.all([
      prisma.pembelianSertifikat.count(),
      prisma.pembelianSertifikat.aggregate({
        _sum: { hargaBeli: true }
      }),
      prisma.pembelianSertifikat.groupBy({
        by: ['statusPembelian'],
        _count: { id: true }
      }),
      prisma.pembayaranPembelian.groupBy({
        by: ['statusPembayaran'],
        _count: { id: true }
      })
    ])

    return {
      success: true,
      data: {
        totalPembelian,
        totalHarga: serializeDecimalObjects(totalHarga._sum.hargaBeli) || 0,
        pembelianByStatus: pembelianByStatus.reduce((acc, item) => {
          acc[item.statusPembelian] = item._count.id
          return acc
        }, {} as Record<string, number>),
        pembayaranByStatus: pembayaranByStatus.reduce((acc, item) => {
          acc[item.statusPembayaran] = item._count.id
          return acc
        }, {} as Record<string, number>)
      }
    }
  } catch (error) {
    console.error('Error fetching pembelian stats:', error)
    return { success: false, error: 'Failed to fetch pembelian stats' }
  }
}

/**
 * Get available tanah garapan (not yet purchased)
 */
export async function getTanahGarapanAvailable() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get tanah garapan that are not yet purchased
    const tanahGarapan = await prisma.tanahGarapanEntry.findMany({
      where: {
        pembelianSertifikat: {
          none: {}
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: tanahGarapan }
  } catch (error) {
    console.error('Error fetching available tanah garapan:', error)
    return { success: false, error: 'Failed to fetch available tanah garapan' }
  }
}

