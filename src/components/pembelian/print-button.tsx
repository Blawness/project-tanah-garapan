'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface PrintButtonProps {
  pembelianId?: string
  selectedIds?: string[]
  variant?: 'single' | 'bulk'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function PrintButton({
  pembelianId,
  selectedIds,
  variant = 'single',
  size = 'sm',
  className
}: PrintButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePrint = async () => {
    setIsLoading(true)

    try {
      if (variant === 'single' && pembelianId) {
        // Single invoice print
        window.open(`/pembelian/${pembelianId}/print`, '_blank')
      } else if (variant === 'bulk' && selectedIds && selectedIds.length > 0) {
        // Bulk print selected invoices
        const idsParam = selectedIds.join(',')
        window.open(`/pembelian/print/selected?ids=${idsParam}`, '_blank')
      } else {
        toast.error('Tidak ada data yang dipilih untuk dicetak')
        return
      }
    } catch (error) {
      console.error('Error opening print window:', error)
      toast.error('Gagal membuka halaman cetak')
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonText = () => {
    if (variant === 'single') {
      return (
        <>
          <Printer className="h-4 w-4 mr-2" />
          Cetak Invoice
        </>
      )
    } else {
      return (
        <>
          <FileText className="h-4 w-4 mr-2" />
          Cetak Terpilih ({selectedIds?.length || 0})
        </>
      )
    }
  }

  const getTooltipText = () => {
    if (variant === 'single') {
      return 'Cetak invoice pembelian ini'
    } else {
      return `Cetak ${selectedIds?.length || 0} invoice terpilih`
    }
  }

  return (
    <Button
      onClick={handlePrint}
      disabled={isLoading || (variant === 'bulk' && (!selectedIds || selectedIds.length === 0))}
      size={size}
      className={className}
      title={getTooltipText()}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          Memproses...
        </>
      ) : (
        getButtonText()
      )}
    </Button>
  )
}
