'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { getTanahGarapanEntries, searchTanahGarapanEntries, advancedSearchTanahGarapanEntries } from '@/lib/server-actions/tanah-garapan'
import { canManageData } from '@/lib/auth'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LazyTanahGarapanForm, LazyTanahGarapanTable, LazyExportButton, LazyAdvancedSearch } from '@/components/lazy/lazy-components'
import { LazyWrapper, TableFallback, FormFallback } from '@/components/lazy/lazy-wrapper'
import { DataPagination } from '@/components/shared/data-pagination'
import { Plus, Search, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export default function TanahGarapanPage() {
  const { data: session } = useSession()
  const [entries, setEntries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [locations, setLocations] = useState<string[]>([])
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 20,
    totalItems: 0
  })

  const canManage = session?.user && canManageData(session.user.role)

  const fetchEntries = async (page: number = pagination.currentPage, pageSize: number = pagination.pageSize) => {
    setIsLoading(true)
    try {
      const result = await getTanahGarapanEntries(page, pageSize)
      if (result.success && result.data) {
        setEntries(result.data.data || [])
        setPagination({
          currentPage: result.data.currentPage,
          totalPages: result.data.totalPages,
          pageSize: result.data.pageSize,
          totalItems: result.data.total
        })
        // Extract unique locations from all data (not just current page)
        const allEntriesResult = await getTanahGarapanEntries(1, 1000) // Get all for locations
        if (allEntriesResult.success && allEntriesResult.data) {
          const uniqueLocations = [...new Set(
            (allEntriesResult.data.data || []).map((entry: any) => entry.letakTanah.split(',')[0].trim())
          )].sort()
          setLocations(uniqueLocations)
        }
      } else {
        toast.error(result.error || 'Failed to fetch entries')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchEntries()
      return
    }

    setIsSearching(true)
    try {
      const result = await searchTanahGarapanEntries(searchQuery)
      if (result.success) {
        setEntries(result.data || [])
      } else {
        toast.error(result.error || 'Search failed')
      }
    } catch (error) {
      toast.error('Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const handleRefresh = () => {
    setSelectedIds([])
    setSearchQuery('')
    setIsAdvancedSearch(false)
    fetchEntries()
  }

  const handleAdvancedSearch = async (filters: any) => {
    setIsSearching(true)
    setIsAdvancedSearch(true)
    try {
      const result = await advancedSearchTanahGarapanEntries(filters)
      if (result.success) {
        setEntries(result.data || [])
      } else {
        toast.error(result.error || 'Advanced search failed')
      }
    } catch (error) {
      toast.error('Advanced search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const handleClearAdvancedSearch = () => {
    setIsAdvancedSearch(false)
    fetchEntries()
  }

  const handlePageChange = (page: number) => {
    fetchEntries(page, pagination.pageSize)
  }

  const handlePageSizeChange = (pageSize: number) => {
    fetchEntries(1, pageSize)
  }

  // Initial data fetch
  useEffect(() => {
    fetchEntries()
  }, [])

  // Search on Enter key
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const totalLuas = entries.reduce((sum, entry) => sum + (entry.luas || 0), 0)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tanah Garapan</h1>
            <p className="mt-1 text-sm text-gray-600">
              Kelola data tanah garapan dan dokumen terkait
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <LazyWrapper fallback={<div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />}>
              <LazyExportButton 
                selectedIds={selectedIds}
              />
            </LazyWrapper>
            {canManage && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Data
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{entries.length}</div>
              <p className="text-xs text-muted-foreground">
                Data tanah garapan
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Luas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLuas.toLocaleString()} m²</div>
              <p className="text-xs text-muted-foreground">
                Luas keseluruhan
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Terpilih</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedIds.length}</div>
              <p className="text-xs text-muted-foreground">
                Data yang dipilih
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Search */}
        <LazyWrapper fallback={<div className="h-32 bg-gray-100 rounded animate-pulse" />}>
          <LazyAdvancedSearch
            onSearch={handleAdvancedSearch}
            onClear={handleClearAdvancedSearch}
            locations={locations}
          />
        </LazyWrapper>

        {/* Basic Search and Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="flex-1 flex items-center space-x-2">
                <Input
                  placeholder="Cari berdasarkan letak tanah, nama pemegang hak, atau keterangan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  disabled={isSearching}
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={isSearching}
                  variant="outline"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                onClick={handleRefresh} 
                variant="outline"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Data Tanah Garapan</CardTitle>
            <CardDescription>
              Daftar semua data tanah garapan yang terdaftar dalam sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Memuat data...</p>
                </div>
              </div>
            ) : (
              <LazyWrapper fallback={<TableFallback />}>
                <LazyTanahGarapanTable
                  entries={entries}
                  onRefresh={handleRefresh}
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                />
              </LazyWrapper>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        <DataPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Add Form Dialog */}
      <LazyWrapper fallback={<FormFallback />}>
        <LazyTanahGarapanForm
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSuccess={handleRefresh}
        />
      </LazyWrapper>
    </AppLayout>
  )
}
