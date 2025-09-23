'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { exportTanahGarapanToCSV, getTanahGarapanEntriesByIds } from '@/lib/server-actions/tanah-garapan'
import { canManageData } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileText, Printer } from 'lucide-react'
import { toast } from 'sonner'

interface ExportButtonProps {
  selectedIds: string[]
  onPrintSelected?: () => void
}

export function ExportButton({ selectedIds, onPrintSelected }: ExportButtonProps) {
  const { data: session } = useSession()
  const [isExporting, setIsExporting] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  const canManage = session?.user && canManageData(session.user.role)

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const result = await exportTanahGarapanToCSV()
      if (result.success && result.data) {
        // Create and download CSV file
        const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `tanah-garapan-${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success('Data berhasil diekspor ke CSV')
      } else {
        toast.error(result.error || 'Gagal mengekspor data')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mengekspor data')
    } finally {
      setIsExporting(false)
    }
  }

  const handlePrintSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error('Pilih data yang ingin dicetak')
      return
    }

    setIsPrinting(true)
    try {
      // Open print page with selected IDs
      const printUrl = `/garapan/print/selected?ids=${selectedIds.join(',')}`
      const printWindow = window.open(printUrl, '_blank')
      if (printWindow) {
        printWindow.focus()
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mencetak')
    } finally {
      setIsPrinting(false)
    }
  }

  const handlePrintAll = () => {
    const printWindow = window.open('/garapan/print/all', '_blank')
    if (printWindow) {
      printWindow.focus()
    }
  }

  if (!canManage) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export / Print
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV} disabled={isExporting}>
          <FileText className="mr-2 h-4 w-4" />
          {isExporting ? 'Mengekspor...' : 'Export CSV'}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handlePrintAll}>
          <Printer className="mr-2 h-4 w-4" />
          Print Semua
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handlePrintSelected} 
          disabled={selectedIds.length === 0 || isPrinting}
        >
          <Printer className="mr-2 h-4 w-4" />
          {isPrinting ? 'Mencetak...' : `Print Terpilih (${selectedIds.length})`}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
