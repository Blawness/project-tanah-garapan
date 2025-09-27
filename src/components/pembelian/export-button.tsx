/**
 * Legacy export button component - DEPRECATED
 * Use the new modular export components from src/features/pembelian/components/
 * This file is kept for backward compatibility during migration
 */

'use client'

import { ExportButton as NewExportButton } from '@/features/pembelian/components/export-button'

interface ExportButtonProps {
  className?: string
}

/**
 * @deprecated Use NewExportButton from @/features/pembelian/components/export-button instead
 */
export function ExportButton({ className }: ExportButtonProps) {
  return <NewExportButton className={className} />
}

