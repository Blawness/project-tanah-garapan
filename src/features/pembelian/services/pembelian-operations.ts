/**
 * Business logic operations for pembelian (purchase) functionality
 * Handles CRUD operations, validation, and business rules
 */

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions, canManageData } from '@/lib/auth'
import { logActivity } from '@/lib/server-actions/activity'
import { serializeDecimalObjects } from '@/lib/utils/serialization'
import { PembelianFormData } from '../components/pembelian-form-schema'

/**
 * Get all pembelian sertifikat with pagination and filtering
 */
export async function getPembelianSertifikat(
  page: number = 1,
  pageSize: number = 20,
  proyekId?: string
) {
  try {
    // Temporarily disable authentication for development
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return { success: false, error: 'Unauthorized' }
    // }

    const skip = (page - 1) * pageSize
    const whereClause = proyekId ? { proyekId } : {}

    const [pembelian, total] = await Promise.all([
      prisma.pembelianSertifikat.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          proyek: true,
          tanahGarapan: true,
          pembayaran: true
        }
      }),
      prisma.pembelianSertifikat.count({ where: whereClause })
    ])

    const serializedPembelian = serializeDecimalObjects(pembelian)
    const totalPages = Math.ceil(total / pageSize)

    return {
      success: true,
      data: {
        data: serializedPembelian,
        total,
        totalPages,
        currentPage: page,
        pageSize
      }
    }
  } catch (error) {
    console.error('Error fetching pembelian sertifikat:', error)
    return { success: false, error: 'Failed to fetch pembelian' }
  }
}

/**
 * Get pembelian sertifikat by ID
 */
export async function getPembelianSertifikatById(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const pembelian = await prisma.pembelianSertifikat.findUnique({
      where: { id },
      include: {
        proyek: true,
        tanahGarapan: true,
        pembayaran: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!pembelian) {
      return { success: false, error: 'Pembelian not found' }
    }

    const serializedPembelian = serializeDecimalObjects(pembelian)
    return { success: true, data: serializedPembelian }
  } catch (error) {
    console.error('Error fetching pembelian by id:', error)
    return { success: false, error: 'Failed to fetch pembelian' }
  }
}

/**
 * Create new pembelian sertifikat
 */
export async function addPembelianSertifikat(data: PembelianFormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canManageData(session.user.role)) {
      return { success: false, error: 'Unauthorized' }
    }

    const pembelian = await prisma.pembelianSertifikat.create({
      data: {
        proyekId: data.proyekId,
        tanahGarapanId: data.tanahGarapanId,
        namaWarga: data.namaWarga,
        alamatWarga: data.alamatWarga,
        noKtpWarga: data.noKtpWarga,
        noHpWarga: data.noHpWarga,
        hargaBeli: data.hargaBeli,
        statusPembelian: data.statusPembelian,
        tanggalKontrak: data.tanggalKontrak ? new Date(data.tanggalKontrak) : null,
        tanggalPembayaran: data.tanggalPembayaran ? new Date(data.tanggalPembayaran) : null,
        metodePembayaran: data.metodePembayaran,
        buktiPembayaran: data.buktiPembayaran,
        keterangan: data.keterangan,
        nomorSertifikat: data.nomorSertifikat,
        fileSertifikat: data.fileSertifikat,
        statusSertifikat: data.statusSertifikat || 'PENDING',
        createdBy: session.user.name
      }
    })

    const serializedPembelian = serializeDecimalObjects(pembelian)

    await logActivity(
      session.user.name,
      'CREATE_PEMBELIAN',
      `Created new pembelian: ${pembelian.namaWarga} - ${pembelian.hargaBeli}`,
      serializedPembelian
    )

    revalidatePath('/pembelian')
    revalidatePath(`/proyek/${data.proyekId}`)
    return { success: true, data: serializedPembelian, message: 'Pembelian created successfully' }
  } catch (error) {
    console.error('Error creating pembelian:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create pembelian' }
  }
}

/**
 * Update existing pembelian sertifikat
 */
export async function updatePembelianSertifikat(id: string, data: PembelianFormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canManageData(session.user.role)) {
      return { success: false, error: 'Unauthorized' }
    }

    const pembelian = await prisma.pembelianSertifikat.update({
      where: { id },
      data: {
        proyekId: data.proyekId,
        tanahGarapanId: data.tanahGarapanId,
        namaWarga: data.namaWarga,
        alamatWarga: data.alamatWarga,
        noKtpWarga: data.noKtpWarga,
        noHpWarga: data.noHpWarga,
        hargaBeli: data.hargaBeli,
        statusPembelian: data.statusPembelian,
        tanggalKontrak: data.tanggalKontrak ? new Date(data.tanggalKontrak) : null,
        tanggalPembayaran: data.tanggalPembayaran ? new Date(data.tanggalPembayaran) : null,
        metodePembayaran: data.metodePembayaran,
        buktiPembayaran: data.buktiPembayaran,
        keterangan: data.keterangan,
        nomorSertifikat: data.nomorSertifikat,
        fileSertifikat: data.fileSertifikat,
        statusSertifikat: data.statusSertifikat
      }
    })

    const serializedPembelian = serializeDecimalObjects(pembelian)

    await logActivity(
      session.user.name,
      'UPDATE_PEMBELIAN',
      `Updated pembelian: ${pembelian.namaWarga} - ${pembelian.hargaBeli}`,
      serializedPembelian
    )

    revalidatePath('/pembelian')
    revalidatePath(`/proyek/${data.proyekId}`)
    return { success: true, data: serializedPembelian, message: 'Pembelian updated successfully' }
  } catch (error) {
    console.error('Error updating pembelian:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to update pembelian' }
  }
}

/**
 * Get multiple pembelian sertifikat by IDs for bulk operations
 */
export async function getPembelianSertifikatByIds(ids: string[]) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const pembelian = await prisma.pembelianSertifikat.findMany({
      where: {
        id: { in: ids }
      },
      include: {
        proyek: true,
        tanahGarapan: true,
        pembayaran: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const serializedPembelian = serializeDecimalObjects(pembelian)
    return { success: true, data: serializedPembelian }
  } catch (error) {
    console.error('Error fetching pembelian by ids:', error)
    return { success: false, error: 'Failed to fetch pembelian' }
  }
}

/**
 * Delete pembelian sertifikat (with validation)
 */
export async function deletePembelianSertifikat(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canManageData(session.user.role)) {
      return { success: false, error: 'Unauthorized' }
    }

    const pembelian = await prisma.pembelianSertifikat.findUnique({
      where: { id },
      include: {
        pembayaran: true
      }
    })

    if (!pembelian) {
      return { success: false, error: 'Pembelian not found' }
    }

    if (pembelian.pembayaran.length > 0) {
      return { success: false, error: 'Cannot delete pembelian with existing payments' }
    }

    await prisma.pembelianSertifikat.delete({
      where: { id }
    })

    await logActivity(
      session.user.name,
      'DELETE_PEMBELIAN',
      `Deleted pembelian: ${pembelian.namaWarga}`,
      pembelian
    )

    revalidatePath('/pembelian')
    revalidatePath(`/proyek/${pembelian.proyekId}`)
    return { success: true, message: 'Pembelian deleted successfully' }
  } catch (error) {
    console.error('Error deleting pembelian:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to delete pembelian' }
  }
}

