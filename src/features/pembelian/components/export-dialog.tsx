/**
 * Export dialog component for pembelian data
 * Provides UI for selecting fields and exporting CSV
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Download, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  EXPORT_FIELDS,
  DEFAULT_SELECTED_FIELDS,
  exportPembelianToCSV
} from '../services/export-service'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SelectedFields {
  namaWarga: boolean
  alamatWarga: boolean
  noKtpWarga: boolean
  noHpWarga: boolean
  letakTanah: boolean
  namaPemegangHak: boolean
  luas: boolean
  namaProyek: boolean
  lokasiProyek: boolean
  hargaBeli: boolean
  statusPembelian: boolean
  tanggalKontrak: boolean
  tanggalPembayaran: boolean
  metodePembayaran: boolean
  nomorSertifikat: boolean
  statusSertifikat: boolean
  keterangan: boolean
  totalDibayar: boolean
  sisaTagihan: boolean
}

/**
 * Export dialog component
 */
export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [selectedFields, setSelectedFields] = useState<SelectedFields>(DEFAULT_SELECTED_FIELDS)

  const handleFieldChange = (field: keyof SelectedFields) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const selectAllFields = () => {
    setSelectedFields(DEFAULT_SELECTED_FIELDS)
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

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const result = await exportPembelianToCSV(selectedFields)

      if (result.success && result.data) {
        // Create and download CSV file
        const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `pembelian-sertifikat-${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success('Data berhasil diekspor')
        onOpenChange(false)
      } else {
        toast.error(result.error || 'Gagal mengekspor data')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Terjadi kesalahan saat mengekspor')
    } finally {
      setIsExporting(false)
    }
  }

  const selectedCount = Object.values(selectedFields).filter(Boolean).length
  const totalFields = Object.keys(selectedFields).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Data Pembelian
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Field Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pilih Kolom untuk Diekspor</CardTitle>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedCount} dari {totalFields} kolom dipilih
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllFields}>
                    Pilih Semua
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAllFields}>
                    Hapus Semua
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(EXPORT_FIELDS).map(([field, label]) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={selectedFields[field as keyof SelectedFields]}
                      onCheckedChange={() => handleFieldChange(field as keyof SelectedFields)}
                    />
                    <Label htmlFor={field} className="text-sm font-normal">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Export Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button onClick={handleExport} disabled={isExporting || selectedCount === 0}>
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengekspor...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV ({selectedCount} kolom)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

