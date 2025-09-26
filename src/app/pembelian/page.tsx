'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, DollarSign, TrendingUp, Users, Receipt } from 'lucide-react'
import { PembelianTable } from '@/components/pembelian/pembelian-table'
import { PembelianDashboard } from '@/components/pembelian/pembelian-dashboard'
import { getPembelianStats } from '@/lib/server-actions/pembelian'

export default function PembelianPage() {
  const [stats, setStats] = useState({
    totalPembelian: 0,
    totalHarga: 0,
    pembelianByStatus: {
      NEGOTIATION: 0,
      AGREED: 0,
      CONTRACT_SIGNED: 0,
      PAID: 0,
      CERTIFICATE_ISSUED: 0,
      COMPLETED: 0,
      CANCELLED: 0
    },
    pembayaranByStatus: {
      PENDING: 0,
      VERIFIED: 0,
      REJECTED: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const result = await getPembelianStats()
      if (result.success && result.data) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }


  const handleDataChange = () => {
    loadStats()
    setRefreshTrigger(prev => prev + 1)
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pembelian Sertifikat</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manajemen pembelian sertifikat tanah garapan dari warga
            </p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Memuat data...</div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pembelian Sertifikat</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manajemen pembelian sertifikat tanah garapan dari warga
          </p>
        </div>

        {/* Dashboard Analytics */}
        <PembelianDashboard />

        {/* Pembelian Table */}
        <PembelianTable refreshTrigger={refreshTrigger} />
      </div>
    </AppLayout>
  )
}