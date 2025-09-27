/**
 * Legacy pembelian server actions - DEPRECATED
 * Use the new modular services from src/features/pembelian/services/
 * This file is kept for backward compatibility during migration
 */

'use server'

import {
  getPembelianSertifikat,
  getPembelianSertifikatById,
  getPembelianSertifikatByIds,
  addPembelianSertifikat,
  updatePembelianSertifikat,
  deletePembelianSertifikat
} from '@/features/pembelian/services/pembelian-operations'
import {
  getPembelianStats,
  getTanahGarapanAvailable
} from '@/features/pembelian/services/pembelian-statistics'
import {
  addPembayaranPembelian
} from '@/features/pembelian/services/pembayaran-operations'
import type { PembelianFormData } from '@/features/pembelian/components/pembelian-form-schema'
import type { PembayaranFormData } from '@/features/pembelian/services/pembayaran-operations'

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

// Re-export types for backward compatibility
export type {
  PembelianFormData,
  PembayaranFormData
}
