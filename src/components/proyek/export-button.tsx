'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'
import { exportProyekToCSV } from '@/lib/server-actions/proyek'
import { toast } from 'sonner'

interface ExportButtonProps {
  search?: string
  statusFilter?: string
  disabled?: boolean
}

export function ExportButton({ search, statusFilter, disabled }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const result = await exportProyekToCSV(search, statusFilter)

      if (result.success) {
        // Create and trigger download
        const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')

        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob)
          link.setAttribute('href', url)
          link.setAttribute('download', result.filename)
          link.style.visibility = 'hidden'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          toast.success('Data berhasil di-export ke CSV')
        }
      } else {
        toast.error(result.error || 'Gagal export data')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Terjadi kesalahan saat export data')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || isExporting}
      variant="outline"
    >
      {isExporting ? (
        <>
          <FileText className="h-4 w-4 mr-2 animate-pulse" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </>
      )}
    </Button>
  )
}
