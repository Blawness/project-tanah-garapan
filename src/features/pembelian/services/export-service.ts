/**
 * Export service for pembelian data
 * Handles CSV export functionality and data formatting
 */

import { getPembelianSertifikat } from '@/lib/server-actions/pembelian'

/**
 * Export field configuration for pembelian data
 */
export const EXPORT_FIELDS = {
  namaWarga: 'Nama Warga',
  alamatWarga: 'Alamat Warga',
  noKtpWarga: 'No KTP Warga',
  noHpWarga: 'No HP Warga',
  letakTanah: 'Letak Tanah',
  namaPemegangHak: 'Nama Pemegang Hak',
  luas: 'Luas Tanah (m²)',
  namaProyek: 'Nama Proyek',
  lokasiProyek: 'Lokasi Proyek',
  hargaBeli: 'Harga Beli',
  statusPembelian: 'Status Pembelian',
  tanggalKontrak: 'Tanggal Kontrak',
  tanggalPembayaran: 'Tanggal Pembayaran',
  metodePembayaran: 'Metode Pembayaran',
  nomorSertifikat: 'Nomor Sertifikat',
  statusSertifikat: 'Status Sertifikat',
  keterangan: 'Keterangan',
  totalDibayar: 'Total Dibayar',
  sisaTagihan: 'Sisa Tagihan'
} as const

/**
 * Default selected fields for export
 */
export const DEFAULT_SELECTED_FIELDS = {
  namaWarga: true,
  alamatWarga: true,
  noKtpWarga: true,
  noHpWarga: true,
  letakTanah: true,
  namaPemegangHak: true,
  luas: true,
  namaProyek: true,
  lokasiProyek: true,
  hargaBeli: true,
  statusPembelian: true,
  tanggalKontrak: true,
  tanggalPembayaran: true,
  metodePembayaran: true,
  nomorSertifikat: true,
  statusSertifikat: true,
  keterangan: true,
  totalDibayar: true,
  sisaTagihan: true
}

/**
 * Status label mappings
 */
export const STATUS_LABELS = {
  pembelian: {
    NEGOTIATION: 'Negosiasi',
    AGREED: 'Disepakati',
    CONTRACT_SIGNED: 'Kontrak Ditandatangani',
    PAID: 'Dibayar',
    CERTIFICATE_ISSUED: 'Sertifikat Diterbitkan',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan'
  },
  sertifikat: {
    PENDING: 'Menunggu',
    PROCESSING: 'Diproses',
    ISSUED: 'Diterbitkan',
    DELIVERED: 'Disampaikan'
  }
} as const

/**
 * Format currency for export
 */
export function formatCurrencyForExport(amount: number): string {
  const numAmount = Number(amount) || 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(numAmount)
}

/**
 * Format date for export
 */
export function formatDateForExport(dateString: string): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID')
}

/**
 * Calculate payment summary for a pembelian record
 */
export function calculatePaymentSummary(pembelian: any) {
  const totalDibayar = pembelian.pembayaran?.reduce((sum: number, payment: any) =>
    sum + Number(payment.jumlahPembayaran), 0) || 0
  const sisaTagihan = Number(pembelian.hargaBeli) - totalDibayar

  return {
    totalDibayar: formatCurrencyForExport(totalDibayar),
    sisaTagihan: formatCurrencyForExport(Math.max(0, sisaTagihan))
  }
}

/**
 * Get status label for pembelian
 */
export function getPembelianStatusLabel(status: string): string {
  return STATUS_LABELS.pembelian[status as keyof typeof STATUS_LABELS.pembelian] || status
}

/**
 * Get status label for sertifikat
 */
export function getSertifikatStatusLabel(status: string): string {
  return STATUS_LABELS.sertifikat[status as keyof typeof STATUS_LABELS.sertifikat] || status
}

/**
 * Generate CSV content from pembelian data
 */
export function generateCSVContent(data: any[], selectedFields: Record<string, boolean>): string {
  const headers = Object.entries(selectedFields)
    .filter(([_, selected]) => selected)
    .map(([field]) => EXPORT_FIELDS[field as keyof typeof EXPORT_FIELDS])

  const rows = data.map(item => {
    const paymentSummary = calculatePaymentSummary(item)

    return Object.entries(selectedFields)
      .filter(([_, selected]) => selected)
      .map(([field]) => {
        switch (field) {
          case 'hargaBeli':
            return formatCurrencyForExport(Number(item[field]))
          case 'luas':
            return item[field]?.toString() || ''
          case 'tanggalKontrak':
          case 'tanggalPembayaran':
            return formatDateForExport(item[field])
          case 'statusPembelian':
            return getPembelianStatusLabel(item[field])
          case 'statusSertifikat':
            return getSertifikatStatusLabel(item[field])
          case 'totalDibayar':
            return paymentSummary.totalDibayar
          case 'sisaTagihan':
            return paymentSummary.sisaTagihan
          default:
            return item[field]?.toString() || ''
        }
      })
  })

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return csvContent
}

/**
 * Export pembelian data to CSV
 */
export async function exportPembelianToCSV(
  selectedFields: Record<string, boolean> = DEFAULT_SELECTED_FIELDS
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const result = await getPembelianSertifikat(1, 10000) // Get all records

    if (!result.success || !result.data?.data) {
      return { success: false, error: 'Failed to fetch pembelian data' }
    }

    const csvContent = generateCSVContent(result.data.data, selectedFields)

    return {
      success: true,
      data: csvContent
    }
  } catch (error) {
    console.error('Export error:', error)
    return { success: false, error: 'Export failed' }
  }
}

