/**
 * Main export button component for pembelian data
 * Provides the trigger button and manages the export dialog state
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { ExportDialog } from './export-dialog'

interface ExportButtonProps {
  className?: string
}

/**
 * Main export button component
 */
export function ExportButton({ className }: ExportButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        variant="outline"
        className={className}
      >
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>

      <ExportDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  )
}

