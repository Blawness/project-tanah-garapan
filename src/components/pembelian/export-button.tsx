'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react'
import { getPembelianSertifikat } from '@/lib/server-actions/pembelian'
import { toast } from 'sonner'

interface ExportButtonProps {
  className?: string
}

export function ExportButton({ className }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedFields, setSelectedFields] = useState({
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
  })

  const fieldLabels = {
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
  }

  const handleFieldChange = (field: string) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }))
  }

  const selectAllFields = () => {
    setSelectedFields({
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
    })
  }

  const clearAllFields = () => {
    setSelectedFields({
      namaWarga: false,
      alamatWarga: false,
      noKtpWarga: false,
      noHpWarga: false,
      letakTanah: false,
      namaPemegangHak: false,
      luas: false,
      namaProyek: false,
      lokasiProyek: false,
      hargaBeli: false,
      statusPembelian: false,
      tanggalKontrak: false,
      tanggalPembayaran: false,
      metodePembayaran: false,
      nomorSertifikat: false,
      statusSertifikat: false,
      keterangan: false,
      totalDibayar: false,
      sisaTagihan: false
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID')
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

  const getStatusSertifikatLabel = (status: string) => {
    const labels = {
      PENDING: 'Menunggu',
      PROCESSING: 'Diproses',
      ISSUED: 'Diterbitkan',
      DELIVERED: 'Dikirim'
    }
    return labels[status as keyof typeof labels] || status
  }

  const getMetodePembayaranLabel = (metode: string) => {
    const labels = {
      CASH: 'Tunai',
      TRANSFER: 'Transfer Bank',
      QRIS: 'QRIS',
      E_WALLET: 'E-Wallet',
      BANK_TRANSFER: 'Bank Transfer'
    }
    return labels[metode as keyof typeof labels] || metode
  }

  const exportToCSV = async () => {
    setIsExporting(true)
    try {
      // Get all data
      const result = await getPembelianSertifikat(1, 10000) // Get all records
      if (!result.success || !result.data) {
        toast.error('Gagal mengambil data pembelian')
        return
      }

      const data = result.data.data

      // Prepare CSV headers
      const headers = Object.entries(selectedFields)
        .filter(([_, selected]) => selected)
        .map(([field, _]) => fieldLabels[field as keyof typeof fieldLabels])

      // Prepare CSV rows
      const rows = data.map(pembelian => {
        const totalDibayar = pembelian.pembayaran?.reduce((sum: number, p: any) =>
          sum + (p.statusPembayaran === 'VERIFIED' ? Number(p.jumlahPembayaran) : 0), 0) || 0
        const sisaTagihan = Number(pembelian.hargaBeli) - totalDibayar

        return Object.entries(selectedFields)
          .filter(([_, selected]) => selected)
          .map(([field, _]) => {
            switch (field) {
              case 'namaWarga':
                return `"${pembelian.namaWarga}"`
              case 'alamatWarga':
                return `"${pembelian.alamatWarga}"`
              case 'noKtpWarga':
                return `"${pembelian.noKtpWarga}"`
              case 'noHpWarga':
                return `"${pembelian.noHpWarga}"`
              case 'letakTanah':
                return `"${pembelian.tanahGarapan?.letakTanah || ''}"`
              case 'namaPemegangHak':
                return `"${pembelian.tanahGarapan?.namaPemegangHak || ''}"`
              case 'luas':
                return pembelian.tanahGarapan?.luas || 0
              case 'namaProyek':
                return `"${pembelian.proyek?.namaProyek || ''}"`
              case 'lokasiProyek':
                return `"${pembelian.proyek?.lokasiProyek || ''}"`
              case 'hargaBeli':
                return Number(pembelian.hargaBeli)
              case 'statusPembelian':
                return `"${getStatusLabel(pembelian.statusPembelian)}"`
              case 'tanggalKontrak':
                return `"${formatDate(pembelian.tanggalKontrak)}"`
              case 'tanggalPembayaran':
                return `"${formatDate(pembelian.tanggalPembayaran)}"`
              case 'metodePembayaran':
                return `"${pembelian.metodePembayaran ? getMetodePembayaranLabel(pembelian.metodePembayaran) : ''}"`
              case 'nomorSertifikat':
                return `"${pembelian.nomorSertifikat || ''}"`
              case 'statusSertifikat':
                return `"${getStatusSertifikatLabel(pembelian.statusSertifikat)}"`
              case 'keterangan':
                return `"${pembelian.keterangan || ''}"`
              case 'totalDibayar':
                return totalDibayar
              case 'sisaTagihan':
                return sisaTagihan
              default:
                return '""'
            }
          })
      })

      // Create CSV content
      const csvContent = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `laporan-pembelian-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Laporan berhasil diekspor ke CSV')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Gagal mengekspor laporan')
    } finally {
      setIsExporting(false)
    }
  }

  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      // Get all data
      const result = await getPembelianSertifikat(1, 10000) // Get all records
      if (!result.success || !result.data) {
        toast.error('Gagal mengambil data pembelian')
        return
      }

      const data = result.data.data

      // Prepare PDF content (simplified HTML structure)
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Laporan Pembelian Sertifikat</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #333; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { margin-bottom: 30px; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .summary-item { border: 1px solid #ddd; padding: 15px; border-radius: 5px; text-align: center; }
            .summary-value { font-size: 24px; font-weight: bold; color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .status-negotiation { background-color: #fef3c7; color: #92400e; }
            .status-agreed { background-color: #dbeafe; color: #1e40af; }
            .status-completed { background-color: #dcfce7; color: #166534; }
            .currency { text-align: right; }
            .text-right { text-align: right; }
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Laporan Pembelian Sertifikat</h1>
            <p>Dicetak pada: ${new Date().toLocaleDateString('id-ID')}</p>
          </div>

          <div class="summary">
            <div class="summary-grid">
              <div class="summary-item">
                <div>Total Pembelian</div>
                <div class="summary-value">${data.length}</div>
              </div>
              <div class="summary-item">
                <div>Total Nilai</div>
                <div class="summary-value">${formatCurrency(data.reduce((sum, p) => sum + Number(p.hargaBeli), 0))}</div>
              </div>
              <div class="summary-item">
                <div>Rata-rata Nilai</div>
                <div class="summary-value">${formatCurrency(data.length > 0 ? data.reduce((sum, p) => sum + Number(p.hargaBeli), 0) / data.length : 0)}</div>
              </div>
              <div class="summary-item">
                <div>Status Selesai</div>
                <div class="summary-value">${data.filter(p => ['COMPLETED', 'PAID'].includes(p.statusPembelian)).length}</div>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                ${Object.entries(selectedFields)
                  .filter(([_, selected]) => selected)
                  .map(([field, _]) => `<th>${fieldLabels[field as keyof typeof fieldLabels]}</th>`)
                  .join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(pembelian => {
                const totalDibayar = pembelian.pembayaran?.reduce((sum: number, p: any) =>
                  sum + (p.statusPembayaran === 'VERIFIED' ? Number(p.jumlahPembayaran) : 0), 0) || 0
                const sisaTagihan = Number(pembelian.hargaBeli) - totalDibayar

                return `
                  <tr>
                    ${Object.entries(selectedFields)
                      .filter(([_, selected]) => selected)
                      .map(([field, _]) => {
                        let value = ''
                        switch (field) {
                          case 'namaWarga':
                            value = pembelian.namaWarga
                            break
                          case 'alamatWarga':
                            value = pembelian.alamatWarga
                            break
                          case 'noKtpWarga':
                            value = pembelian.noKtpWarga
                            break
                          case 'noHpWarga':
                            value = pembelian.noHpWarga
                            break
                          case 'letakTanah':
                            value = pembelian.tanahGarapan?.letakTanah || ''
                            break
                          case 'namaPemegangHak':
                            value = pembelian.tanahGarapan?.namaPemegangHak || ''
                            break
                          case 'luas':
                            value = (pembelian.tanahGarapan?.luas || 0).toString()
                            break
                          case 'namaProyek':
                            value = pembelian.proyek?.namaProyek || ''
                            break
                          case 'lokasiProyek':
                            value = pembelian.proyek?.lokasiProyek || ''
                            break
                          case 'hargaBeli':
                            value = formatCurrency(Number(pembelian.hargaBeli))
                            break
                          case 'statusPembelian':
                            const statusClass = pembelian.statusPembelian.toLowerCase().replace('_', '-')
                            value = `<span class="status status-${statusClass}">${getStatusLabel(pembelian.statusPembelian)}</span>`
                            break
                          case 'tanggalKontrak':
                            value = formatDate(pembelian.tanggalKontrak)
                            break
                          case 'tanggalPembayaran':
                            value = formatDate(pembelian.tanggalPembayaran)
                            break
                          case 'metodePembayaran':
                            value = pembelian.metodePembayaran ? getMetodePembayaranLabel(pembelian.metodePembayaran) : ''
                            break
                          case 'nomorSertifikat':
                            value = pembelian.nomorSertifikat || ''
                            break
                          case 'statusSertifikat':
                            value = getStatusSertifikatLabel(pembelian.statusSertifikat)
                            break
                          case 'keterangan':
                            value = pembelian.keterangan || ''
                            break
                          case 'totalDibayar':
                            value = formatCurrency(totalDibayar)
                            break
                          case 'sisaTagihan':
                            value = formatCurrency(sisaTagihan)
                            break
                          default:
                            value = ''
                        }
                        return `<td>${value}</td>`
                      })
                      .join('')}
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `

      // Create and download PDF
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()

        // Wait for content to load then print
        printWindow.onload = () => {
          printWindow.print()
          printWindow.close()
        }
      }

      toast.success('Laporan berhasil diekspor ke PDF')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Gagal mengekspor laporan')
    } finally {
      setIsExporting(false)
    }
  }

  const selectedCount = Object.values(selectedFields).filter(Boolean).length

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" className={className}>
        <Download className="h-4 w-4 mr-2" />
        Export Laporan
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Laporan Pembelian
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Pilih Format Export</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={exportToCSV}
                  disabled={isExporting || selectedCount === 0}
                  className="h-20 flex-col"
                >
                  <FileSpreadsheet className="h-6 w-6 mb-2" />
                  Export ke CSV
                  <span className="text-xs opacity-75">
                    {selectedCount} kolom dipilih
                  </span>
                </Button>

                <Button
                  onClick={exportToPDF}
                  disabled={isExporting || selectedCount === 0}
                  variant="outline"
                  className="h-20 flex-col"
                >
                  <FileText className="h-6 w-6 mb-2" />
                  Export ke PDF
                  <span className="text-xs opacity-75">
                    {selectedCount} kolom dipilih
                  </span>
                </Button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Pilih Kolom yang Akan Diekspor</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllFields}>
                    Pilih Semua
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAllFields}>
                    Hapus Semua
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border rounded p-3">
                {Object.entries(fieldLabels).map(([field, label]) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={selectedFields[field as keyof typeof selectedFields]}
                      onCheckedChange={() => handleFieldChange(field)}
                    />
                    <Label htmlFor={field} className="text-sm">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="text-sm text-muted-foreground mt-2">
                {selectedCount} dari {Object.keys(fieldLabels).length} kolom dipilih
              </div>
            </div>

            {isExporting && (
              <div className="flex items-center justify-center p-4 bg-blue-50 rounded">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Menyiapkan laporan...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
