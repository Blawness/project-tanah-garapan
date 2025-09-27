'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, DollarSign, TrendingUp, Calendar, Plus, Search, X } from 'lucide-react'
import { ProyekTable } from '@/components/proyek/proyek-table'
import { ProyekForm } from '@/components/proyek/proyek-form'
import { PembelianTable } from '@/components/pembelian/pembelian-table'
import { PembelianForm } from '@/components/pembelian/pembelian-form'
import { ExportButton } from '@/components/proyek/export-button'
import { getProyekPembangunan, getProyekStats } from '@/lib/server-actions/proyek'
import { getPembelianSertifikat } from '@/lib/server-actions/pembelian'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ProyekPageProps {
  initialProyekData: {
    data: any[]
    total: number
    totalPages: number
    currentPage: number
    pageSize: number
  } | null
  initialStats: {
    totalProyek: number
    totalBudget: number
    totalTerpakai: number
    proyekByStatus: {
      PLANNING: number
      ONGOING: number
      COMPLETED: number
      CANCELLED: number
    }
  } | null
}

export default function ProyekPage({ initialProyekData, initialStats }: ProyekPageProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [proyekData, setProyekData] = useState(initialProyekData)
  const [stats, setStats] = useState(initialStats || {
    totalProyek: 0,
    totalBudget: 0,
    totalTerpakai: 0,
    proyekByStatus: {
      PLANNING: 0,
      ONGOING: 0,
      COMPLETED: 0,
      CANCELLED: 0
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [currentPage, setCurrentPage] = useState(initialProyekData?.currentPage || 1)
  const pageSize = 20
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isSearching, setIsSearching] = useState(false)
  const [isPembelianFormOpen, setIsPembelianFormOpen] = useState(false)
  const [pembelianData, setPembelianData] = useState<{
    data: any[]
    total: number
    totalPages: number
    currentPage: number
    pageSize: number
  } | null>(null)
  const [activeTab, setActiveTab] = useState('proyek')
  const [selectedProyekForPembelian, setSelectedProyekForPembelian] = useState<string | null>(null)

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
      PLANNING: 'bg-blue-100 text-blue-800',
      ONGOING: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      PLANNING: 'Planning',
      ONGOING: 'Ongoing',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled'
    }
    return labels[status as keyof typeof labels] || status
  }

  const loadProyekData = async (page: number = currentPage) => {
    try {
      setIsLoading(true)
      const search = searchQuery.trim() || undefined
      const status = statusFilter !== 'ALL' ? statusFilter : undefined
      const result = await getProyekPembangunan(page, pageSize, search, status)
      if (result.success) {
        setProyekData(result.data)
      } else {
        toast.error(result.error || 'Failed to load proyek data')
      }
    } catch (error) {
      toast.error('An error occurred while loading proyek data')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      setIsLoadingStats(true)
      const result = await getProyekStats()
      if (result.success) {
        setStats(result.data)
      } else {
        toast.error(result.error || 'Failed to load stats')
      }
    } catch (error) {
      toast.error('An error occurred while loading stats')
    } finally {
      setIsLoadingStats(false)
    }
  }

  useEffect(() => {
    loadProyekData(currentPage)
    loadStats()
  }, [currentPage, searchQuery, statusFilter])

  useEffect(() => {
    loadPembelianData()
  }, [])

  const handleSearch = () => {
    setCurrentPage(1) // Reset to first page when searching
    loadProyekData(1)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setStatusFilter('ALL')
    setCurrentPage(1)
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleRefresh = () => {
    loadProyekData(currentPage)
    loadStats()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleCreateNew = () => {
    setIsFormOpen(true)
  }

  const handleCreateNewPembelian = (proyekId?: string) => {
    if (proyekId) {
      setSelectedProyekForPembelian(proyekId)
    }
    setIsPembelianFormOpen(true)
  }

  const loadPembelianData = async () => {
    try {
      // Load pembelian data - for now load all data since we're showing the general proyek page
      // In the future, this could be filtered by a selected project
      const result = await getPembelianSertifikat(1, 20)
      if (result.success) {
        setPembelianData(result.data)
      } else {
        toast.error(result.error || 'Failed to load pembelian data')
      }
    } catch (error) {
      toast.error('An error occurred while loading pembelian data')
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Proyek Pembangunan</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manajemen proyek pembangunan dan pembelian sertifikat tanah garapan
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Proyek
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="proyek">Proyek Pembangunan</TabsTrigger>
            <TabsTrigger value="pembelian">Pembelian Sertifikat</TabsTrigger>
          </TabsList>

          <TabsContent value="proyek" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Cari proyek berdasarkan nama, lokasi, atau deskripsi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleSearchKeyPress}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Status</SelectItem>
                      <SelectItem value="PLANNING">Planning</SelectItem>
                      <SelectItem value="ONGOING">Ongoing</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
              <div className="flex gap-2">
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? 'Mencari...' : 'Cari'}
                </Button>
                <Button variant="outline" onClick={handleClearSearch}>
                  <X className="h-4 w-4" />
                </Button>
                <ExportButton
                  search={searchQuery}
                  statusFilter={statusFilter}
                  disabled={isLoading}
                />
              </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Proyek</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingStats ? '...' : stats.totalProyek}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Proyek pembangunan
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingStats ? '...' : formatCurrency(stats.totalBudget)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Budget keseluruhan
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Budget Terpakai</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingStats ? '...' : formatCurrency(stats.totalTerpakai)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Budget yang sudah digunakan
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status Proyek</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {isLoadingStats ? (
                      <div className="text-sm">Loading...</div>
                    ) : (
                      Object.entries(stats.proyekByStatus).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <Badge className={getStatusColor(status)}>
                            {getStatusLabel(status)}
                          </Badge>
                          <span className="text-sm font-medium">{count as number}</span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Proyek Table */}
            {isLoading ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">Loading proyek data...</div>
                </CardContent>
              </Card>
            ) : (
              <ProyekTable
                data={proyekData?.data || []}
                onRefresh={handleRefresh}
                onCreateNew={handleCreateNew}
                pagination={proyekData ? {
                  currentPage: proyekData.currentPage,
                  totalPages: proyekData.totalPages,
                  total: proyekData.total,
                  pageSize: proyekData.pageSize
                } : undefined}
                onPageChange={handlePageChange}
              />
            )}
          </TabsContent>

          <TabsContent value="pembelian" className="space-y-6">
            <PembelianTable
              data={pembelianData?.data || []}
              onRefresh={() => loadPembelianData()}
              onCreateNew={handleCreateNewPembelian}
              pagination={pembelianData ? {
                currentPage: pembelianData.currentPage,
                totalPages: pembelianData.totalPages,
                total: pembelianData.total,
                pageSize: pembelianData.pageSize
              } : undefined}
              onPageChange={() => {}}
            />
          </TabsContent>
        </Tabs>

        {/* Create/Edit Form Dialog */}
        <ProyekForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSuccess={() => {
            setIsFormOpen(false)
            handleRefresh()
          }}
        />

        {/* Pembelian Form Dialog */}
        <PembelianForm
          open={isPembelianFormOpen}
          onOpenChange={setIsPembelianFormOpen}
          proyekId={selectedProyekForPembelian}
          onSuccess={() => {
            setIsPembelianFormOpen(false)
            setSelectedProyekForPembelian(null)
            loadPembelianData()
            handleRefresh() // Add this to refresh proyek data and stats
          }}
        />
      </div>
    </AppLayout>
  )
}