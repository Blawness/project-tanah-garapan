'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions, canManageData } from '@/lib/auth'
import { logActivity } from './activity'

export interface ProyekFormData {
  namaProyek: string
  lokasiProyek: string
  deskripsi?: string
  statusProyek: 'PLANNING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  tanggalMulai?: string
  tanggalSelesai?: string
  budgetTotal: number
}

export async function getProyekPembangunan(page: number = 1, pageSize: number = 20) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const skip = (page - 1) * pageSize

    const [proyek, total] = await Promise.all([
      prisma.proyekPembangunan.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          pembelianSertifikat: {
            include: {
              tanahGarapan: true
            }
          }
        }
      }),
      prisma.proyekPembangunan.count()
    ])

    const totalPages = Math.ceil(total / pageSize)

    return { 
      success: true, 
      data: {
        data: proyek,
        total,
        totalPages,
        currentPage: page,
        pageSize
      }
    }
  } catch (error) {
    console.error('Error fetching proyek pembangunan:', error)
    return { success: false, error: 'Failed to fetch proyek' }
  }
}

export async function getProyekPembangunanById(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const proyek = await prisma.proyekPembangunan.findUnique({
      where: { id },
      include: {
        pembelianSertifikat: {
          include: {
            tanahGarapan: true,
            pembayaran: true
          }
        }
      }
    })

    if (!proyek) {
      return { success: false, error: 'Proyek not found' }
    }

    return { success: true, data: proyek }
  } catch (error) {
    console.error('Error fetching proyek by id:', error)
    return { success: false, error: 'Failed to fetch proyek' }
  }
}

export async function addProyekPembangunan(data: ProyekFormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canManageData(session.user.role)) {
      return { success: false, error: 'Unauthorized' }
    }

    const proyek = await prisma.proyekPembangunan.create({
      data: {
        namaProyek: data.namaProyek,
        lokasiProyek: data.lokasiProyek,
        deskripsi: data.deskripsi,
        statusProyek: data.statusProyek,
        tanggalMulai: data.tanggalMulai ? new Date(data.tanggalMulai) : null,
        tanggalSelesai: data.tanggalSelesai ? new Date(data.tanggalSelesai) : null,
        budgetTotal: data.budgetTotal,
        createdBy: session.user.name
      }
    })

    await logActivity(
      session.user.name,
      'CREATE_PROYEK',
      `Created new proyek: ${proyek.namaProyek}`,
      proyek
    )

    revalidatePath('/proyek')
    return { success: true, data: proyek, message: 'Proyek created successfully' }
  } catch (error) {
    console.error('Error creating proyek:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create proyek' }
  }
}

export async function updateProyekPembangunan(id: string, data: ProyekFormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canManageData(session.user.role)) {
      return { success: false, error: 'Unauthorized' }
    }

    const proyek = await prisma.proyekPembangunan.update({
      where: { id },
      data: {
        namaProyek: data.namaProyek,
        lokasiProyek: data.lokasiProyek,
        deskripsi: data.deskripsi,
        statusProyek: data.statusProyek,
        tanggalMulai: data.tanggalMulai ? new Date(data.tanggalMulai) : null,
        tanggalSelesai: data.tanggalSelesai ? new Date(data.tanggalSelesai) : null,
        budgetTotal: data.budgetTotal
      }
    })

    await logActivity(
      session.user.name,
      'UPDATE_PROYEK',
      `Updated proyek: ${proyek.namaProyek}`,
      proyek
    )

    revalidatePath('/proyek')
    return { success: true, data: proyek, message: 'Proyek updated successfully' }
  } catch (error) {
    console.error('Error updating proyek:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to update proyek' }
  }
}

export async function deleteProyekPembangunan(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canManageData(session.user.role)) {
      return { success: false, error: 'Unauthorized' }
    }

    const proyek = await prisma.proyekPembangunan.findUnique({
      where: { id },
      include: {
        pembelianSertifikat: true
      }
    })

    if (!proyek) {
      return { success: false, error: 'Proyek not found' }
    }

    if (proyek.pembelianSertifikat.length > 0) {
      return { success: false, error: 'Cannot delete proyek with existing pembelian' }
    }

    await prisma.proyekPembangunan.delete({
      where: { id }
    })

    await logActivity(
      session.user.name,
      'DELETE_PROYEK',
      `Deleted proyek: ${proyek.namaProyek}`,
      proyek
    )

    revalidatePath('/proyek')
    return { success: true, message: 'Proyek deleted successfully' }
  } catch (error) {
    console.error('Error deleting proyek:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to delete proyek' }
  }
}

export async function getProyekStats() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const [totalProyek, totalBudget, totalTerpakai, proyekByStatus] = await Promise.all([
      prisma.proyekPembangunan.count(),
      prisma.proyekPembangunan.aggregate({
        _sum: { budgetTotal: true }
      }),
      prisma.proyekPembangunan.aggregate({
        _sum: { budgetTerpakai: true }
      }),
      prisma.proyekPembangunan.groupBy({
        by: ['statusProyek'],
        _count: { id: true }
      })
    ])

    return {
      success: true,
      data: {
        totalProyek,
        totalBudget: totalBudget._sum.budgetTotal || 0,
        totalTerpakai: totalTerpakai._sum.budgetTerpakai || 0,
        proyekByStatus: proyekByStatus.reduce((acc, item) => {
          acc[item.statusProyek] = item._count.id
          return acc
        }, {} as Record<string, number>)
      }
    }
  } catch (error) {
    console.error('Error fetching proyek stats:', error)
    return { success: false, error: 'Failed to fetch proyek stats' }
  }
}
