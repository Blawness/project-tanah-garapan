'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X, Calendar, MapPin, Ruler } from 'lucide-react'

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  onClear: () => void
  locations: string[]
}

interface SearchFilters {
  query: string
  location: string
  minLuas: string
  maxLuas: string
  dateFrom: string
  dateTo: string
}

export function AdvancedSearch({ onSearch, onClear, locations }: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    minLuas: '',
    maxLuas: '',
    dateFrom: '',
    dateTo: ''
  })

  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    const newActiveFilters = Object.entries(filters)
      .filter(([_, value]) => value.trim() !== '')
      .map(([key, _]) => key)
    
    setActiveFilters(newActiveFilters)
    onSearch(filters)
  }

  const handleClear = () => {
    setFilters({
      query: '',
      location: '',
      minLuas: '',
      maxLuas: '',
      dateFrom: '',
      dateTo: ''
    })
    setActiveFilters([])
    onClear()
  }

  const removeFilter = (filterKey: string) => {
    const newFilters = { ...filters, [filterKey]: '' }
    setFilters(newFilters)
    
    const newActiveFilters = activeFilters.filter(key => key !== filterKey)
    setActiveFilters(newActiveFilters)
    
    onSearch(newFilters)
  }

  const getFilterLabel = (key: string) => {
    const labels: Record<string, string> = {
      query: 'Pencarian',
      location: 'Lokasi',
      minLuas: 'Min Luas',
      maxLuas: 'Max Luas',
      dateFrom: 'Dari Tanggal',
      dateTo: 'Sampai Tanggal'
    }
    return labels[key] || key
  }

  const getFilterValue = (key: string) => {
    const value = filters[key as keyof SearchFilters]
    if (key === 'location') {
      return locations.find(loc => loc === value) || value
    }
    return value
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Pencarian & Filter</span>
            </CardTitle>
            <CardDescription>
              Gunakan filter untuk menemukan data tanah garapan yang spesifik
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {isExpanded ? 'Sembunyikan' : 'Tampilkan'} Filter
          </Button>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {activeFilters.map((filterKey) => (
              <Badge key={filterKey} variant="secondary" className="flex items-center space-x-1">
                <span>{getFilterLabel(filterKey)}: {getFilterValue(filterKey)}</span>
                <button
                  onClick={() => removeFilter(filterKey)}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Hapus Semua
            </Button>
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="space-y-6">
            {/* Basic Search */}
            <div className="space-y-2">
              <Label htmlFor="query">Pencarian Umum</Label>
              <Input
                id="query"
                placeholder="Cari berdasarkan letak tanah, nama pemegang hak, atau keterangan..."
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location Filter */}
              <div className="space-y-2">
                <Label htmlFor="location">Lokasi</Label>
                <Select
                  value={filters.location}
                  onValueChange={(value) => handleFilterChange('location', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih lokasi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Lokasi</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label>Rentang Tanggal</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      type="date"
                      placeholder="Dari tanggal"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      type="date"
                      placeholder="Sampai tanggal"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Luas Range */}
            <div className="space-y-2">
              <Label>Rentang Luas (m²)</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    placeholder="Minimal luas"
                    value={filters.minLuas}
                    onChange={(e) => handleFilterChange('minLuas', e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Maksimal luas"
                    value={filters.maxLuas}
                    onChange={(e) => handleFilterChange('maxLuas', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClear}>
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Cari
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}


