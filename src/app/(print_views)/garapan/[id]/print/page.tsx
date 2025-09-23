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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            SURAT KETERANGAN TANAH GARAPAN
          </h1>
          <p className="text-gray-600">
            Nomor: {entry.nomorSuratKeteranganGarapan}
          </p>
          <Separator className="my-4" />
        </div>

        {/* Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Tanah</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Letak Tanah</label>
                  <p className="text-lg font-medium">{entry.letakTanah}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Letter C</label>
                  <p className="text-lg font-medium">{entry.letterC}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nama Pemegang Hak</label>
                  <p className="text-lg font-medium">{entry.namaPemegangHak}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Luas Tanah</label>
                  <p className="text-lg font-medium">{formatNumber(entry.luas)} m²</p>
                </div>
              </div>

              {entry.keterangan && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Keterangan</label>
                  <p className="text-base">{entry.keterangan}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-12 text-right">
            <div className="inline-block text-center">
              <p className="mb-16">Ditetapkan di: ........................</p>
              <p className="mb-16">Pada tanggal: {formatDate(new Date().toISOString())}</p>
              <div className="border-b border-gray-400 w-48 mx-auto mb-2"></div>
              <p className="text-sm font-medium">Kepala Desa/Lurah</p>
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
