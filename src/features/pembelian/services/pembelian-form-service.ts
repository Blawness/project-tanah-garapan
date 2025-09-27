/**
 * Service for pembelian form operations
 * Handles form initialization, data loading, and form submission
 */

import { PembelianFormData } from '../components/pembelian-form-schema'
import { getTanahGarapanAvailable } from '@/lib/server-actions/pembelian'

/**
 * Available tanah garapan data
 */
export interface AvailableTanahGarapan {
  id: string
  letakTanah: string
  namaPemegangHak: string
  luas: number
}

/**
 * Available proyek data
 */
export interface AvailableProyek {
  id: string
  namaProyek: string
  lokasiProyek: string
}

/**
 * Form state interface
 */
export interface PembelianFormState {
  availableTanahGarapan: AvailableTanahGarapan[]
  availableProyek: AvailableProyek[]
  isLoadingProyek: boolean
  isLoadingTanahGarapan: boolean
}

/**
 * Load available tanah garapan options
 */
export async function loadAvailableTanahGarapan(): Promise<AvailableTanahGarapan[]> {
  try {
    const result = await getTanahGarapanAvailable()
    if (result.success) {
      return result.data
    }
    return []
  } catch (error) {
    console.error('Error loading tanah garapan:', error)
    return []
  }
}

/**
 * Load available proyek options
 */
export async function loadAvailableProyek(): Promise<AvailableProyek[]> {
  try {
    const response = await fetch('/api/proyek?limit=100')
    const result = await response.json()
    if (result.success && result.data) {
      return result.data.data || []
    } else {
      console.error('Failed to load projects:', result.error)
      return []
    }
  } catch (error) {
    console.error('Error loading proyek:', error)
    return []
  }
}

/**
 * Format date for form display
 */
export function formatDateForForm(date: string | Date | undefined): string {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toISOString().split('T')[0]
}

/**
 * Get form default values from existing pembelian data
 */
export function getFormDefaultValues(
  pembelian?: any,
  proyekId?: string
): Partial<PembelianFormData> {
  const result = {
    proyekId: pembelian?.proyekId || proyekId || '',
    tanahGarapanId: pembelian?.tanahGarapanId || '',
    namaWarga: pembelian?.namaWarga || '',
    alamatWarga: pembelian?.alamatWarga || '',
    noKtpWarga: pembelian?.noKtpWarga || '',
    noHpWarga: pembelian?.noHpWarga || '',
    hargaBeli: pembelian?.hargaBeli || 0,
    statusPembelian: pembelian?.statusPembelian || 'NEGOTIATION',
    tanggalKontrak: formatDateForForm(pembelian?.tanggalKontrak),
    tanggalPembayaran: formatDateForForm(pembelian?.tanggalPembayaran),
    metodePembayaran: pembelian?.metodePembayaran || 'CASH',
    buktiPembayaran: pembelian?.buktiPembayaran || '',
    keterangan: pembelian?.keterangan || '',
    nomorSertifikat: pembelian?.nomorSertifikat || '',
    fileSertifikat: pembelian?.fileSertifikat || '',
    statusSertifikat: pembelian?.statusSertifikat || 'PENDING'
  }

  console.log('getFormDefaultValues input:', { pembelian, proyekId })
  console.log('getFormDefaultValues result:', result)
  console.log('Harga beli value:', result.hargaBeli, 'type:', typeof result.hargaBeli)

  return result
}

