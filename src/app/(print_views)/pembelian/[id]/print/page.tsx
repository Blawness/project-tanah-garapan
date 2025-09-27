'use client'

import { useEffect, useState } from 'react'
import { getPembelianSertifikatById } from '@/lib/server-actions/pembelian'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

interface PrintSinglePageProps {
  params: { id: string }
}

interface PembelianData {
  id: string
  namaWarga: string
  alamatWarga: string
  noKtpWarga: string
  noHpWarga: string
  hargaBeli: number
  statusPembelian: string
  tanggalKontrak?: string
  tanggalPembayaran?: string
  metodePembayaran?: string
  nomorSertifikat?: string
  keterangan?: string
  createdAt: string
  proyek?: {
    namaProyek: string
    lokasiProyek: string
  }
  tanahGarapan?: {
    letakTanah: string
    namaPemegangHak: string
    luas: number
  }
  pembayaran?: Array<{
    id: string
    jenisPembayaran: string
    jumlahPembayaran: number
    tanggalPembayaran: string
    statusPembayaran: string
  }>
}

export default function PrintSinglePage({ params }: PrintSinglePageProps) {
  const [entry, setEntry] = useState<PembelianData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEntry = async () => {
      const result = await getPembelianSertifikatById(params.id)
      if (result.success) {
        setEntry(result.data)
      }
      setIsLoading(false)
    }

    fetchEntry()
  }, [params.id])

  useEffect(() => {
    if (!isLoading && entry) {
      // Auto-trigger print dialog after data loads
      window.print()
    }
  }, [isLoading, entry])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Data tidak ditemukan</p>
      </div>
    )
  }

  const formatDate = (date: string | Date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('id-ID')
  }

  const getStatusColor = (status: string) => {
    const colors = {
      NEGOTIATION: 'bg-yellow-100 text-yellow-800',
      AGREED: 'bg-blue-100 text-blue-800',
      CONTRACT_SIGNED: 'bg-purple-100 text-purple-800',
      PAID: 'bg-green-100 text-green-800',
      CERTIFICATE_ISSUED: 'bg-indigo-100 text-indigo-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      NEGOTIATION: 'Negosiasi',
      AGREED: 'Disepakati',
      CONTRACT_SIGNED: 'Kontrak Ditandatangani',
      PAID: 'Dibayar',
      CERTIFICATE_ISSUED: 'Sertifikat Diterbitkan',
      COMPLETED: 'Selesai',
      CANCELLED: 'Dibatalkan'
    }
    return labels[status as keyof typeof labels] || status
  }

  return (
    <div className="min-h-screen bg-white p-8 print:p-4">
      <style jsx global>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          .print-page {
            width: 100% !important;
            margin: 0 !important;
            padding: 1rem !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto print-page">
        {/* Letterhead */}
        <div className="text-center mb-8">
          {/* Official Letterhead */}
          <div className="border-2 border-gray-800 p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              INVOICE PEMBELIAN SERTIFIKAT
            </h1>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              [NAMA PERUSAHAAN/ORGANISASI]
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Alamat: [ALAMAT LENGKAP PERUSAHAAN]<br />
              Telp: [NOMOR TELEPON] | Email: [EMAIL]
            </p>
            <Separator className="my-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              INVOICE #{entry.id?.slice(-8).toUpperCase()}
            </h3>
            <p className="text-gray-600">
              Tanggal: {formatDate(entry.createdAt)}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-gray-900">Dari (Pembeli):</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Nama Perusahaan:</strong> [NAMA PERUSAHAAN]</p>
                <p><strong>Alamat:</strong> [ALAMAT PERUSAHAAN]</p>
                <p><strong>Telepon:</strong> [NOMOR TELEPON]</p>
                <p><strong>Email:</strong> [EMAIL PERUSAHAAN]</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-gray-900">Kepada (Penjual):</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Nama:</strong> {entry.namaWarga}</p>
                <p><strong>Alamat:</strong> {entry.alamatWarga}</p>
                <p><strong>No KTP:</strong> {entry.noKtpWarga}</p>
                <p><strong>No HP:</strong> {entry.noHpWarga}</p>
              </div>
            </div>
          </div>

          {/* Project & Land Information */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
              <h4 className="font-semibold text-gray-900">Informasi Proyek & Tanah</h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Nama Proyek:</strong> {entry.proyek?.namaProyek}</p>
                  <p><strong>Lokasi Proyek:</strong> {entry.proyek?.lokasiProyek}</p>
                </div>
                <div>
                  <p><strong>Letak Tanah:</strong> {entry.tanahGarapan?.letakTanah}</p>
                  <p><strong>Nama Pemegang Hak:</strong> {entry.tanahGarapan?.namaPemegangHak}</p>
                  <p><strong>Luas Tanah:</strong> {formatNumber(entry.tanahGarapan?.luas || 0)} m²</p>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Details */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
              <h4 className="font-semibold text-gray-900">Detail Pembelian</h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Harga Pembelian:</span>
                    <span className="font-bold text-lg">{formatCurrency(Number(entry.hargaBeli))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <Badge className={getStatusColor(entry.statusPembelian)}>
                      {getStatusLabel(entry.statusPembelian)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Metode Pembayaran:</span>
                    <span>{entry.metodePembayaran || '-'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Tanggal Kontrak:</span>
                    <span>{formatDate(entry.tanggalKontrak)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tanggal Pembayaran:</span>
                    <span>{formatDate(entry.tanggalPembayaran)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Nomor Sertifikat:</span>
                    <span>{entry.nomorSertifikat || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {entry.pembayaran && entry.pembayaran.length > 0 && (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                <h4 className="font-semibold text-gray-900">Riwayat Pembayaran</h4>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {entry.pembayaran.map((payment: any, index: number) => (
                    <div key={payment.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <div>
                        <p className="font-medium">Pembayaran #{index + 1}</p>
                        <p className="text-sm text-gray-600">
                          {payment.jenisPembayaran} - {formatDate(payment.tanggalPembayaran)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(Number(payment.jumlahPembayaran))}</p>
                        <Badge className="text-xs">
                          {payment.statusPembayaran}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {entry.keterangan && (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                <h4 className="font-semibold text-gray-900">Keterangan</h4>
              </div>
              <div className="p-4">
                <p className="text-gray-700">{entry.keterangan}</p>
              </div>
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
              <h4 className="font-semibold text-gray-900">Syarat dan Ketentuan</h4>
            </div>
            <div className="p-4">
              <div className="text-sm text-gray-600 space-y-2">
                <p>1. Pembayaran harus dilakukan sesuai dengan tanggal yang telah disepakati.</p>
                <p>2. Sertifikat tanah akan diserahkan setelah pembayaran lunas.</p>
                <p>3. Apabila terjadi pembatalan, akan dikenakan biaya administrasi.</p>
                <p>4. Segala perselisihan akan diselesaikan melalui musyawarah untuk mencapai mufakat.</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12">
            <div className="flex justify-between items-end">
              <div className="text-left">
                <p className="mb-4">Diterbitkan di: [KOTA]</p>
                <p>Pada tanggal: {formatDate(new Date().toISOString())}</p>
              </div>
              <div className="text-center">
                <div className="mb-16">
                  <p className="text-sm text-gray-600 mb-2">Pihak Pembeli</p>
                  <div className="border-b border-gray-400 w-48 mx-auto mb-2"></div>
                  <p className="text-sm font-medium">[NAMA PENANGGUNG JAWAB]</p>
                  <p className="text-xs text-gray-500">Jabatan: [JABATAN]</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Print Info */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
          <p>Dicetak pada: {formatDate(new Date().toISOString())}</p>
          <p>Invoice ID: {entry.id}</p>
        </div>
      </div>
    </div>
  )
}
