import { getPembelianStats } from '@/lib/server-actions/pembelian'
import React from 'react'

interface PembelianLayoutProps {
  children: React.ReactNode
}

export default async function PembelianLayout({ children }: PembelianLayoutProps) {
  const initialStats = await getPembelianStats()

  return React.cloneElement(children as React.ReactElement, {
    initialStats: initialStats.success ? initialStats.data : null,
  })
}
