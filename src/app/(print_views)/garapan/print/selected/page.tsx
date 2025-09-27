'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
// Server actions are now called through API routes
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function PrintSelectedPage() {
  const searchParams = useSearchParams()
  const [entries, setEntries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEntries = async () => {
      const ids = searchParams.get('ids')?.split(',') || []

      if (ids.length === 0) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/tanah-garapan`)
        const result = await response.json()

        if (result.success) {
          // Filter entries by IDs
          const filteredEntries = result.data.filter((entry: any) => ids.includes(entry.id))
          setEntries(filteredEntries || [])
        }
      } catch (error) {
        console.error('Error fetching entries:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntries()
  }, [searchParams])

  useEffect(() => {
    if (!isLoading && entries.length > 0) {
      // Auto-trigger print dialog after data loads
      setTimeout(() => window.print(), 500)
    }
  }, [isLoading, entries])

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

  if (entries.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Tidak ada data yang dipilih</p>
      </div>
    )
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID')
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('id-ID')
  }

  const totalLuas = entries.reduce((sum, entry) => sum + entry.luas, 0)

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
          .page-break { page-break-before: always; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto print-page">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            DAFTAR TANAH GARAPAN TERPILIH
          </h1>
          <p className="text-gray-600">
            Total: {entries.length} entries | Total Luas: {formatNumber(totalLuas)} m²
          </p>
          <Separator className="my-4" />
        </div>

        {/* Summary Table */}
        <div className="mb-8">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-left">No</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Letak Tanah</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Pemegang Hak</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Letter C</th>
                <th className="border border-gray-300 px-3 py-2 text-left">No. SKG</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Luas (m²)</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry.id}>
                  <td className="border border-gray-300 px-3 py-2">{index + 1}</td>
                  <td className="border border-gray-300 px-3 py-2">{entry.letakTanah}</td>
                  <td className="border border-gray-300 px-3 py-2">{entry.namaPemegangHak}</td>
                  <td className="border border-gray-300 px-3 py-2">{entry.letterC}</td>
                  <td className="border border-gray-300 px-3 py-2">{entry.nomorSuratKeteranganGarapan}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">{formatNumber(entry.luas)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td colSpan={5} className="border border-gray-300 px-3 py-2 text-right">Total:</td>
                <td className="border border-gray-300 px-3 py-2 text-right">{formatNumber(totalLuas)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Detailed Entries */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Detail Lengkap</h2>
          
          {entries.map((entry, index) => (
            <div key={entry.id} className={index > 0 ? 'page-break' : ''}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {index + 1}. {entry.letakTanah}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nama Pemegang Hak</label>
                      <p className="text-base font-medium">{entry.namaPemegangHak}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Letter C</label>
                      <p className="text-base font-medium">{entry.letterC}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">No. Surat Keterangan Garapan</label>
                      <p className="text-base font-medium">{entry.nomorSuratKeteranganGarapan}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Luas Tanah</label>
                      <p className="text-base font-medium">{formatNumber(entry.luas)} m²</p>
                    </div>
                  </div>
                  
                  {entry.keterangan && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-500">Keterangan</label>
                      <p className="text-base">{entry.keterangan}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 text-xs text-gray-500">
                    <p>Dibuat: {formatDate(entry.createdAt)} | ID: {entry.id}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-right">
          <div className="inline-block text-center">
            <p className="mb-16">Ditetapkan di: ........................</p>
            <p className="mb-16">Pada tanggal: {formatDate(new Date().toISOString())}</p>
            <div className="border-b border-gray-400 w-48 mx-auto mb-2"></div>
            <p className="text-sm font-medium">Kepala Desa/Lurah</p>
          </div>
        </div>

        {/* Print Info */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
          <p>Dicetak pada: {formatDate(new Date().toISOString())}</p>
          <p>Total Entries: {entries.length} | Total Luas: {formatNumber(totalLuas)} m²</p>
        </div>
      </div>
    </div>
  )
}
