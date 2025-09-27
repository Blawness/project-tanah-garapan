/**
 * Validation schema for pembelian form
 */

import { z } from 'zod'

/**
 * Validation schema for pembelian form data
 */
export const pembelianSchema = z.object({
  proyekId: z.string().min(1, 'Proyek Pembangunan wajib dipilih'),
  tanahGarapanId: z.string().min(1, 'Tanah Garapan is required'),
  namaWarga: z.string().min(1, 'Nama Warga is required'),
  alamatWarga: z.string().min(1, 'Alamat Warga is required'),
  noKtpWarga: z.string().min(15, 'No KTP must be 15 or 16 digits').max(16, 'No KTP must be 15 or 16 digits'),
  noHpWarga: z.string().min(1, 'No HP is required'),
  hargaBeli: z.coerce.number().positive('Harga must be positive'),
  statusPembelian: z.enum(['NEGOTIATION', 'AGREED', 'CONTRACT_SIGNED', 'PAID', 'CERTIFICATE_ISSUED', 'COMPLETED', 'CANCELLED']),
  tanggalKontrak: z.string().optional().nullable().refine((val) => {
    if (!val) return true
    const date = new Date(val)
    return !isNaN(date.getTime())
  }, 'Tanggal Kontrak harus dalam format yang valid (YYYY-MM-DD)'),
  tanggalPembayaran: z.string().optional().nullable().refine((val) => {
    if (!val) return true
    const date = new Date(val)
    return !isNaN(date.getTime())
  }, 'Tanggal Pembayaran harus dalam format yang valid (YYYY-MM-DD)'),
  metodePembayaran: z.enum(['CASH', 'TRANSFER', 'QRIS', 'E_WALLET', 'BANK_TRANSFER']).optional(),
  buktiPembayaran: z.string().optional(),
  keterangan: z.string().optional(),
  nomorSertifikat: z.string().optional(),
  fileSertifikat: z.string().optional(),
  statusSertifikat: z.enum(['PENDING', 'PROCESSING', 'ISSUED', 'DELIVERED']).optional()
})

/**
 * Type definition for pembelian form data
 */
export type PembelianFormData = z.infer<typeof pembelianSchema>

