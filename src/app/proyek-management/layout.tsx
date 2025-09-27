import { getProyekPembangunan, getProyekStats } from '@/lib/server-actions/proyek'
import React from 'react'

interface ProyekLayoutProps {
  children: React.ReactNode
}

export default async function ProyekLayout({ children }: ProyekLayoutProps) {
  const initialProyekData = await getProyekPembangunan(1, 20) // Fetch initial data
  const initialStats = await getProyekStats()

  return React.cloneElement(children as React.ReactElement, {
    initialProyekData: initialProyekData.success ? initialProyekData.data : null,
    initialStats: initialStats.success ? initialStats.data : null,
  })
}
