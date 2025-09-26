'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions, canManageData } from '@/lib/auth'
import { logActivity } from './activity'

export interface PembelianFormData {
  proyekId: string
  tanahGarapanId: string
  namaWarga: string
  alamatWarga: string
  noKtpWarga: string
  noHpWarga: string
  hargaBeli: number
  statusPembelian: 'NEGOTIATION' | 'AGREED' | 'CONTRACT_SIGNED' | 'PAID' | 'CERTIFICATE_ISSUED' | 'COMPLETED' | 'CANCELLED'
  tanggalKontrak?: string
  tanggalPembayaran?: string
  metodePembayaran?: 'CASH' | 'TRANSFER' | 'QRIS' | 'E_WALLET' | 'BANK_TRANSFER'
  buktiPembayaran?: string
  keterangan?: string
  nomorSertifikat?: string
  fileSertifikat?: string
  statusSertifikat?: 'PENDING' | 'PROCESSING' | 'ISSUED' | 'DELIVERED'
}

export interface PembayaranFormData {
  pembelianId: string
  nomorPembayaran: string
  jumlahPembayaran: number
  jenisPembayaran: 'DP' | 'CICILAN' | 'PELUNASAN' | 'BONUS'
  metodePembayaran: 'CASH' | 'TRANSFER' | 'QRIS' | 'E_WALLET' | 'BANK_TRANSFER'
  tanggalPembayaran: string
  statusPembayaran: 'PENDING' | 'VERIFIED' | 'REJECTED'
  buktiPembayaran?: string
  keterangan?: string
}

export async function getPembelianSertifikat(page: number = 1, pageSize: number = 20, proyekId?: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

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

    // Convert Decimal objects to numbers for Client Component compatibility
    const serializedPembelian = pembelian.map(item => ({
      ...item,
      hargaBeli: Number(item.hargaBeli),
      pembayaran: item.pembayaran.map(pembayaran => ({
        ...pembayaran,
        jumlahPembayaran: Number(pembayaran.jumlahPembayaran)
      })),
      proyek: item.proyek ? {
        ...item.proyek,
        budgetTotal: Number(item.proyek.budgetTotal),
        budgetTerpakai: Number(item.proyek.budgetTerpakai)
      } : null,
      tanahGarapan: item.tanahGarapan ? {
        ...item.tanahGarapan,
        luas: Number(item.tanahGarapan.luas)
      } : null
    }))

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

    // Convert Decimal objects to numbers for Client Component compatibility
    const serializedPembelian = {
      ...pembelian,
      hargaBeli: Number(pembelian.hargaBeli),
      pembayaran: pembelian.pembayaran.map(pembayaran => ({
        ...pembayaran,
        jumlahPembayaran: Number(pembayaran.jumlahPembayaran)
      })),
      proyek: pembelian.proyek ? {
        ...pembelian.proyek,
        budgetTotal: Number(pembelian.proyek.budgetTotal),
        budgetTerpakai: Number(pembelian.proyek.budgetTerpakai)
      } : null
    }

    return { success: true, data: serializedPembelian }
  } catch (error) {
    console.error('Error fetching pembelian by id:', error)
    return { success: false, error: 'Failed to fetch pembelian' }
  }
}

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

    // Convert Decimal objects to numbers for Client Component compatibility
    const serializedPembelian = {
      ...pembelian,
      hargaBeli: Number(pembelian.hargaBeli)
    }

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

    // Convert Decimal objects to numbers for Client Component compatibility
    const serializedPembelian = {
      ...pembelian,
      hargaBeli: Number(pembelian.hargaBeli)
    }

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

export async function addPembayaranPembelian(data: PembayaranFormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canManageData(session.user.role)) {
      return { success: false, error: 'Unauthorized' }
    }

    const pembayaran = await prisma.pembayaranPembelian.create({
      data: {
        pembelianId: data.pembelianId,
        nomorPembayaran: data.nomorPembayaran,
        jumlahPembayaran: data.jumlahPembayaran,
        jenisPembayaran: data.jenisPembayaran,
        metodePembayaran: data.metodePembayaran,
        tanggalPembayaran: new Date(data.tanggalPembayaran),
        statusPembayaran: data.statusPembayaran,
        buktiPembayaran: data.buktiPembayaran,
        keterangan: data.keterangan,
        createdBy: session.user.name
      }
    })

    // Convert Decimal objects to numbers for Client Component compatibility
    const serializedPembayaran = {
      ...pembayaran,
      jumlahPembayaran: Number(pembayaran.jumlahPembayaran)
    }

    await logActivity(
      session.user.name,
      'CREATE_PEMBAYARAN',
      `Created new pembayaran: ${pembayaran.nomorPembayaran} - ${pembayaran.jumlahPembayaran}`,
      serializedPembayaran
    )

    revalidatePath('/pembelian')
    revalidatePath(`/pembelian/${data.pembelianId}`)
    return { success: true, data: serializedPembayaran, message: 'Pembayaran created successfully' }
  } catch (error) {
    console.error('Error creating pembayaran:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create pembayaran' }
  }
}

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
        totalHarga: Number(totalHarga._sum.hargaBeli) || 0,
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
