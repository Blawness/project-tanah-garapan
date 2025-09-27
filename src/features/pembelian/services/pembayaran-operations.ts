/**
 * Business logic operations for pembayaran (payment) functionality
 * Handles payment creation, validation, and business rules
 */

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions, canManageData } from '@/lib/auth'
import { logActivity } from '@/lib/server-actions/activity'
import { serializeDecimalObjects } from '@/lib/utils/serialization'

/**
 * Payment form data interface
 */
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

/**
 * Add new payment for pembelian
 */
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

    const serializedPembayaran = serializeDecimalObjects(pembayaran)

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

