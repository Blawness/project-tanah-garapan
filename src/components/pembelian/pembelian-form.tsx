/**
 * Legacy pembelian form component - DEPRECATED
 * Use the new modular form components from src/features/pembelian/components/
 * This file is kept for backward compatibility during migration
 */

'use client'

import { PembelianForm as NewPembelianForm } from '@/features/pembelian/components/pembelian-form'

interface PembelianFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pembelian?: {
    id: string
    proyekId: string
    tanahGarapanId: string
    namaWarga: string
    alamatWarga: string
    noKtpWarga: string
    noHpWarga: string
    hargaBeli: number
    statusPembelian: string
    tanggalKontrak?: string | Date
    tanggalPembayaran?: string | Date
    metodePembayaran?: string
    buktiPembayaran?: string
    keterangan?: string
    nomorSertifikat?: string
    fileSertifikat?: string
    statusSertifikat?: string
  }
  proyekId?: string
  onSuccess?: () => void
}

/**
 * @deprecated Use NewPembelianForm from @/features/pembelian/components/pembelian-form instead
 */
export function PembelianForm({
  open,
  onOpenChange,
  pembelian,
  proyekId,
  onSuccess
}: PembelianFormProps) {
  return (
    <NewPembelianForm
      open={open}
      onOpenChange={onOpenChange}
      pembelian={pembelian}
      proyekId={proyekId}
      onSuccess={onSuccess}
    />
  )
}

