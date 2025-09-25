'use client'

import { useEffect, useState } from 'react'
import { getTanahGarapanEntryById } from '@/lib/server-actions/tanah-garapan'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface PrintSinglePageProps {
  params: { id: string }
}

export default function PrintSinglePage({ params }: PrintSinglePageProps) {
  const [entry, setEntry] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEntry = async () => {
      const result = await getTanahGarapanEntryById(params.id)
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('id-ID')
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
              PEMERINTAH DESA/KELURAHAN
            </h1>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              [NAMA DESA/KELURAHAN]
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Alamat: [ALAMAT LENGKAP DESA/KELURAHAN]<br />
              Telp: [NOMOR TELEPON] | Email: [EMAIL]
            </p>
            <Separator className="my-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              SURAT KETERANGAN TANAH GARAPAN
            </h3>
            <p className="text-gray-600">
              Nomor: {entry.nomorSuratKeteranganGarapan}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Opening Statement */}
          <div className="text-justify mb-6">
            <p className="text-base leading-relaxed">
              Yang bertanda tangan di bawah ini, Kepala Desa/Kelurahan <strong>[NAMA DESA/KELURAHAN]</strong>, 
              dengan ini menerangkan bahwa:
            </p>
          </div>

          {/* Data Table */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="border-r border-gray-300 px-4 py-3 font-medium bg-gray-50 w-1/3">
                    Nama Pemegang Hak
                  </td>
                  <td className="px-4 py-3">
                    <strong>{entry.namaPemegangHak}</strong>
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="border-r border-gray-300 px-4 py-3 font-medium bg-gray-50">
                    Letak Tanah
                  </td>
                  <td className="px-4 py-3">
                    {entry.letakTanah}
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="border-r border-gray-300 px-4 py-3 font-medium bg-gray-50">
                    Letter C
                  </td>
                  <td className="px-4 py-3">
                    {entry.letterC}
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="border-r border-gray-300 px-4 py-3 font-medium bg-gray-50">
                    No. Surat Keterangan Garapan
                  </td>
                  <td className="px-4 py-3">
                    {entry.nomorSuratKeteranganGarapan}
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="border-r border-gray-300 px-4 py-3 font-medium bg-gray-50">
                    Luas Tanah
                  </td>
                  <td className="px-4 py-3">
                    <strong>{formatNumber(entry.luas)} m²</strong>
                  </td>
                </tr>
                {entry.keterangan && (
                  <tr>
                    <td className="border-r border-gray-300 px-4 py-3 font-medium bg-gray-50">
                      Keterangan
                    </td>
                    <td className="px-4 py-3">
                      {entry.keterangan}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Closing Statement */}
          <div className="text-justify mb-6">
            <p className="text-base leading-relaxed">
              Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-12">
            <div className="flex justify-between items-end">
              <div className="text-left">
                <p className="mb-4">Ditetapkan di: [NAMA DESA/KELURAHAN]</p>
                <p>Pada tanggal: {formatDate(new Date().toISOString())}</p>
              </div>
              <div className="text-center">
                <div className="mb-16">
                  <p className="text-sm text-gray-600 mb-2">Kepala Desa/Kelurahan</p>
                  <div className="border-b border-gray-400 w-48 mx-auto mb-2"></div>
                  <p className="text-sm font-medium">[NAMA KEPALA DESA/KELURAHAN]</p>
                  <p className="text-xs text-gray-500">NIP. [NIP KEPALA DESA/KELURAHAN]</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Print Info */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
          <p>Dicetak pada: {formatDate(new Date().toISOString())}</p>
          <p>ID: {entry.id}</p>
        </div>
      </div>
    </div>
  )
}
