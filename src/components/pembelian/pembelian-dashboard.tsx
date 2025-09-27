'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users,
  Calculator,
  Calendar,
  Target,
  Award
} from 'lucide-react'
import { getPembelianStats } from '@/lib/server-actions/pembelian'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface PembelianDashboardProps {
  className?: string
}

export function PembelianDashboard({ className }: PembelianDashboardProps) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  const formatCurrency = (amount: any) => {
    // Handle Prisma Decimal objects
    let numAmount = 0
    if (amount && typeof amount === 'object' && 's' in amount && 'e' in amount && 'd' in amount) {
      numAmount = amount.toNumber ? amount.toNumber() : Number(amount)
    } else {
      numAmount = Number(amount) || 0
    }

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(numAmount)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      NEGOTIATION: 'bg-yellow-100 text-yellow-800',
      AGREED: 'bg-blue-100 text-blue-800',
      CONTRACT_SIGNED: 'bg-purple-100 text-purple-800',
      PAID: 'bg-green-100 text-green-800',
      CERTIFICATE_ISSUED: 'bg-indigo-100 text-indigo-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
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

  // Prepare chart data
  const getChartData = () => {
    if (!stats) return []

    return Object.entries(stats.pembelianByStatus).map(([status, count]) => ({
      status: getStatusLabel(status),
      jumlah: count as number,
      color: status === 'COMPLETED' ? '#22c55e' :
             status === 'PAID' ? '#3b82f6' :
             status === 'CANCELLED' ? '#ef4444' :
             status === 'NEGOTIATION' ? '#f59e0b' : '#8b5cf6'
    }))
  }

  const getPaymentStatusData = () => {
    if (!stats) return []

    return Object.entries(stats.pembayaranByStatus).map(([status, count]) => ({
      status: status === 'VERIFIED' ? 'Terverifikasi' :
              status === 'PENDING' ? 'Menunggu' : 'Ditolak',
      jumlah: count as number,
      color: status === 'VERIFIED' ? '#22c55e' :
             status === 'PENDING' ? '#f59e0b' : '#ef4444'
    }))
  }

  // Calculate completion rate
  const getCompletionRate = () => {
    if (!stats || stats.totalPembelian === 0) return 0
    const completed = stats.pembelianByStatus.COMPLETED || 0
    const paid = stats.pembelianByStatus.PAID || 0
    return Math.round(((completed + paid) / stats.totalPembelian) * 100)
  }

  // Get top performing metrics
  const getTopMetrics = () => {
    if (!stats) return []

    const total = stats.totalPembelian
    const completed = stats.pembelianByStatus.COMPLETED || 0
    const paid = stats.pembelianByStatus.PAID || 0
    const negotiation = stats.pembelianByStatus.NEGOTIATION || 0

    return [
      {
        title: 'Tingkat Kelengkapan',
        value: `${getCompletionRate()}%`,
        icon: Award,
        color: 'text-green-600',
        description: `${completed + paid} dari ${total} pembelian selesai`
      },
      {
        title: 'Dalam Negosiasi',
        value: negotiation.toString(),
        icon: Users,
        color: 'text-yellow-600',
        description: 'Pembelian dalam proses negosiasi'
      },
      {
        title: 'Rata-rata Nilai',
        value: formatCurrency(stats.totalPembelian > 0 ? stats.totalHarga / stats.totalPembelian : 0),
        icon: DollarSign,
        color: 'text-blue-600',
        description: 'Nilai rata-rata per transaksi'
      }
    ]
  }

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className || ''}`}>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">Tidak ada data untuk ditampilkan</div>
        </CardContent>
      </Card>
    )
  }

  const chartData = getChartData()
  const paymentData = getPaymentStatusData()
  const topMetrics = getTopMetrics()

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                </div>
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Pembelian Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Distribusi Status Pembelian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="status"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: any, name: any) => [value, 'Jumlah']}
                  labelStyle={{ color: '#000' }}
                />
                <Bar dataKey="jumlah" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Pembayaran Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Status Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="jumlah"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [value, 'Jumlah']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {paymentData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm">{entry.status}: {entry.jumlah}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tingkat Penyelesaian</span>
                <span className="text-sm text-muted-foreground">{getCompletionRate()}%</span>
              </div>
              <Progress value={getCompletionRate()} className="h-2" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {Object.entries(stats.pembelianByStatus).map(([status, count]) => (
                <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{count as number}</div>
                  <Badge className={getStatusColor(status)}>
                    {getStatusLabel(status)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Pembelian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Transaksi</span>
              <span className="font-bold">{stats.totalPembelian}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Nilai</span>
              <span className="font-bold text-green-600">{formatCurrency(stats.totalHarga)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Rata-rata per Transaksi</span>
              <span className="font-bold text-blue-600">
                {formatCurrency(stats.totalPembelian > 0 ? stats.totalHarga / stats.totalPembelian : 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Terverifikasi</span>
              <span className="font-bold text-green-600">{stats.pembayaranByStatus.VERIFIED || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Menunggu Verifikasi</span>
              <span className="font-bold text-yellow-600">{stats.pembayaranByStatus.PENDING || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ditolak</span>
              <span className="font-bold text-red-600">{stats.pembayaranByStatus.REJECTED || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
