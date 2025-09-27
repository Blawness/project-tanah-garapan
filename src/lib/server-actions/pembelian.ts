'use server'

/**
 * Legacy pembelian server actions - DEPRECATED
 * Use the new modular services from src/features/pembelian/services/
 * This file is kept for backward compatibility during migration
 */

import {
  getPembelianSertifikat,
  getPembelianSertifikatById,
  getPembelianSertifikatByIds,
  addPembelianSertifikat,
  updatePembelianSertifikat,
  deletePembelianSertifikat
} from '../../features/pembelian/services/pembelian-operations'
import {
  getPembelianStats,
  getTanahGarapanAvailable
} from '../../features/pembelian/services/pembelian-statistics'
import {
  addPembayaranPembelian
} from '../../features/pembelian/services/pembayaran-operations'

// Type definitions to avoid import issues
export interface PembelianFormData {
  proyekId: string
  tanahGarapanId: string
  namaWarga: string
  alamatWarga: string
  noKtpWarga: string
  noHpWarga: string
  hargaBeli: number
  statusPembelian: 'NEGOTIATION' | 'AGREED' | 'CONTRACT_SIGNED' | 'PAID' | 'CERTIFICATE_ISSUED' | 'COMPLETED' | 'CANCELLED'
  tanggalKontrak?: string | null
  tanggalPembayaran?: string | null
  metodePembayaran?: 'CASH' | 'TRANSFER' | 'QRIS' | 'E_WALLET' | 'BANK_TRANSFER' | null
  buktiPembayaran?: string | null
  keterangan?: string | null
  nomorSertifikat?: string | null
  fileSertifikat?: string | null
  statusSertifikat?: 'PENDING' | 'PROCESSING' | 'ISSUED' | 'DELIVERED' | null
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

// Re-export functions for backward compatibility
export {
  getPembelianSertifikat,
  getPembelianSertifikatById,
  getPembelianSertifikatByIds,
  addPembelianSertifikat,
  updatePembelianSertifikat,
  deletePembelianSertifikat,
  getPembelianStats,
  getTanahGarapanAvailable,
  addPembayaranPembelian
}

// Types are defined locally above
