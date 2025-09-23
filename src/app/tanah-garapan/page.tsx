'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { getTanahGarapanEntries, searchTanahGarapanEntries } from '@/lib/server-actions/tanah-garapan'
import { canManageData } from '@/lib/auth'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TanahGarapanForm } from '@/components/tanah-garapan/tanah-garapan-form'
import { TanahGarapanTable } from '@/components/tanah-garapan/tanah-garapan-table'
import { ExportButton } from '@/components/tanah-garapan/export-button'
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

  const canManage = session?.user && canManageData(session.user.role)

  const fetchEntries = async () => {
    setIsLoading(true)
    try {
      const result = await getTanahGarapanEntries()
      if (result.success) {
        setEntries(result.data || [])
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
    if (searchQuery.trim()) {
      handleSearch()
    } else {
      fetchEntries()
    }
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
            <ExportButton 
              selectedIds={selectedIds}
            />
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

        {/* Search and Actions */}
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
              <TanahGarapanTable
                entries={entries}
                onRefresh={handleRefresh}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Form Dialog */}
      <TanahGarapanForm
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleRefresh}
      />
    </AppLayout>
  )
}
