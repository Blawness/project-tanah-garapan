'use client'

import { useState, useEffect } from 'react'
// Server actions are now called through API routes
import { Separator } from '@/components/ui/separator'

export default function PrintAllPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch('/api/tanah-garapan')
        const result = await response.json()

        if (result.success) {
          setEntries(result.data || [])
        }
      } catch (error) {
        console.error('Error fetching entries:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntries()
  }, [])

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
        <p>Tidak ada data untuk dicetak</p>
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

  // Group by letak tanah for better organization
  const groupedEntries = entries.reduce((acc: any, entry) => {
    const location = entry.letakTanah.split(',')[0].trim() // Take first part before comma
    if (!acc[location]) {
      acc[location] = []
    }
    acc[location].push(entry)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-white p-8 print:p-4">
      <style dangerouslySetInnerHTML={{
        __html: `
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
        `
      }} />

      <div className="max-w-6xl mx-auto print-page">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            DAFTAR SELURUH TANAH GARAPAN
          </h1>
          <p className="text-gray-600">
            Total: {entries.length} entries | Total Luas: {formatNumber(totalLuas)} m²
          </p>
          <Separator className="my-4" />
        </div>

        {/* Summary Table */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">Ringkasan Data</h2>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-left">No</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Letak Tanah</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Pemegang Hak</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Letter C</th>
                <th className="border border-gray-300 px-3 py-2 text-left">No. SKG</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Luas (m²)</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Tanggal</th>
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
                  <td className="border border-gray-300 px-3 py-2 text-center">{formatDate(entry.createdAt)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td colSpan={5} className="border border-gray-300 px-3 py-2 text-right">Total:</td>
                <td className="border border-gray-300 px-3 py-2 text-right">{formatNumber(totalLuas)}</td>
                <td className="border border-gray-300 px-3 py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Statistics by Location */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">Statistik per Lokasi</h2>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-left">Lokasi</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Jumlah</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Total Luas (m²)</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Rata-rata Luas (m²)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedEntries).map(([location, locationEntries]: [string, any]) => {
                const totalLocationLuas = locationEntries.reduce((sum: number, entry: any) => sum + entry.luas, 0)
                const avgLuas = totalLocationLuas / locationEntries.length
                
                return (
                  <tr key={location}>
                    <td className="border border-gray-300 px-3 py-2 font-medium">{location}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">{locationEntries.length}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">{formatNumber(totalLocationLuas)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">{formatNumber(Math.round(avgLuas))}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
          <p>Lokasi: {Object.keys(groupedEntries).length} area berbeda</p>
        </div>
      </div>
    </div>
  )
}
