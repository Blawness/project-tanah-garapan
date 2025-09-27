'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MoreHorizontal, Edit, Trash2, Eye, Plus, ChevronLeft, ChevronRight, Printer } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PembelianForm } from './pembelian-form'
import { PembayaranTable } from './pembayaran-table'
import { PrintButton } from './print-button'
import { deletePembelianSertifikat } from '@/lib/server-actions/pembelian'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface PembelianTableProps {
  data?: Array<{
    id: string
    proyekId: string
    tanahGarapanId: string
    namaWarga: string
    alamatWarga: string
    noKtpWarga: string
    noHpWarga: string
    hargaBeli: number
    statusPembelian: string
    tanggalKontrak?: string | Date
    tanggalPembayaran?: string | Date
    metodePembayaran?: string
    buktiPembayaran?: string
    keterangan?: string
    nomorSertifikat?: string
    fileSertifikat?: string
    statusSertifikat?: string
    createdAt: string | Date
    updatedAt: string | Date
    proyek?: {
      namaProyek: string
      lokasiProyek: string
    }
    tanahGarapan?: {
      letakTanah: string
      namaPemegangHak: string
      luas: number
    }
    pembayaran?: Array<{
      id: string
      jenisPembayaran: string
      jumlahPembayaran: number
      tanggalPembayaran: string
      statusPembayaran: string
    }>
  }>
  onRefresh?: () => void
  onCreateNew?: (proyekId?: string) => void
  pagination?: {
    currentPage: number
    totalPages: number
    total: number
    pageSize: number
  }
  onPageChange?: (page: number) => void
  proyekId?: string
  refreshTrigger?: number
}

const statusColors = {
  NEGOTIATION: 'bg-yellow-100 text-yellow-800',
  AGREED: 'bg-blue-100 text-blue-800',
  CONTRACT_SIGNED: 'bg-purple-100 text-purple-800',
  PAID: 'bg-green-100 text-green-800',
  CERTIFICATE_ISSUED: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const statusLabels = {
  NEGOTIATION: 'Negotiation',
  AGREED: 'Agreed',
  CONTRACT_SIGNED: 'Contract Signed',
  PAID: 'Paid',
  CERTIFICATE_ISSUED: 'Certificate Issued',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
}

export function PembelianTable({
  data,
  onRefresh,
  onCreateNew,
  pagination,
  onPageChange,
  proyekId,
  refreshTrigger
}: PembelianTableProps) {
  const [editingPembelian, setEditingPembelian] = useState<PembelianTableProps['data'] extends Array<infer T> ? T | null : null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedPembelian, setSelectedPembelian] = useState<PembelianTableProps['data'] extends Array<infer T> ? T | null : null>(null)
  const [pembelianData, setPembelianData] = useState<PembelianTableProps['data']>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Default refresh function if not provided
  const defaultRefresh = () => {
    loadPembelianData()
  }

  useEffect(() => {
    // Only load data internally if no data prop is provided
    if (!data || data.length === 0) {
      loadPembelianData()
    } else {
      setPembelianData(data)
      setIsLoading(false)
    }
  }, [refreshTrigger, data])

  const loadPembelianData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/pembelian')
      const result = await response.json()
      if (result.success) {
        setPembelianData(result.data)
      }
    } catch (error) {
      console.error('Error loading pembelian data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (pembelian: NonNullable<PembelianTableProps['data']>[0]) => {
    setEditingPembelian(pembelian)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id: string, namaWarga: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pembelian dari "${namaWarga}"?`)) {
      try {
        const result = await fetch('/api/pembelian', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        })

        const data = await result.json()

        if (data.success) {
          toast.success('Pembelian berhasil dihapus')
          if (onRefresh) {
            onRefresh()
          } else {
            defaultRefresh()
          }
        } else {
          toast.error(data.error || 'Gagal menghapus pembelian')
        }
      } catch (error) {
        toast.error('Terjadi kesalahan saat menghapus pembelian')
      }
    }
  }

  const handleViewDetail = (pembelian: NonNullable<PembelianTableProps['data']>[0]) => {
    setSelectedPembelian(pembelian)
    setIsDetailDialogOpen(true)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked && pembelianData) {
      setSelectedIds(pembelianData.map(item => item.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectItem = (pembelianId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, pembelianId])
    } else {
      setSelectedIds(prev => prev.filter(id => id !== pembelianId))
    }
  }

  const isAllSelected = pembelianData && pembelianData.length > 0 && selectedIds.length === pembelianData.length
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < pembelianData.length

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

  const formatDate = (date: string | Date) => {
    if (!date) return '-'
    return format(new Date(date), 'dd MMM yyyy', { locale: id })
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pembelian Sertifikat</CardTitle>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <PrintButton
                selectedIds={selectedIds}
                variant="bulk"
                size="sm"
              />
            )}
            {onCreateNew && (
              <Button onClick={() => onCreateNew(proyekId)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pembelian
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate
                    }}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Nama Warga</TableHead>
                <TableHead>Tanah Garapan</TableHead>
                <TableHead>Harga Beli</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Metode Pembayaran</TableHead>
                <TableHead>Tanggal Kontrak</TableHead>
                <TableHead>Tanggal Pembayaran</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : pembelianData && pembelianData.length > 0 ? pembelianData.map((pembelian) => (
                <TableRow key={pembelian.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(pembelian.id)}
                      onCheckedChange={(checked) => handleSelectItem(pembelian.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{pembelian.namaWarga}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{pembelian.tanahGarapan?.letakTanah}</div>
                      <div className="text-sm text-gray-500">{pembelian.tanahGarapan?.namaPemegangHak}</div>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(pembelian.hargaBeli)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[pembelian.statusPembelian as keyof typeof statusColors]}>
                      {statusLabels[pembelian.statusPembelian as keyof typeof statusLabels]}
                    </Badge>
                  </TableCell>
                  <TableCell>{pembelian.metodePembayaran || '-'}</TableCell>
                  <TableCell>{formatDate(pembelian.tanggalKontrak)}</TableCell>
                  <TableCell>{formatDate(pembelian.tanggalPembayaran)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetail(pembelian)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(pembelian)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => window.open(`/pembelian/${pembelian.id}/print`, '_blank')}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Cetak Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(pembelian.id, pembelian.namaWarga)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    Belum ada data pembelian sertifikat
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-500">
                Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.pageSize, pagination.total)} of{' '}
                {pagination.total} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNumber: number
                    if (pagination.totalPages <= 5) {
                      pageNumber = i + 1
                    } else if (pagination.currentPage <= 3) {
                      pageNumber = i + 1
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNumber = pagination.totalPages - 4 + i
                    } else {
                      pageNumber = pagination.currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === pagination.currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange?.(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <PembelianForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        pembelian={editingPembelian}
        onSuccess={() => {
          setIsEditDialogOpen(false)
          setEditingPembelian(null)
          if (onRefresh) {
            onRefresh()
          } else {
            defaultRefresh()
          }
        }}
      />

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detail Pembelian: {selectedPembelian?.namaWarga}</DialogTitle>
          </DialogHeader>
          {selectedPembelian && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Informasi Warga</h4>
                  <div className="space-y-2">
                    <p><strong>Nama:</strong> {selectedPembelian.namaWarga}</p>
                    <p><strong>Alamat:</strong> {selectedPembelian.alamatWarga}</p>
                    <p><strong>No KTP:</strong> {selectedPembelian.noKtpWarga}</p>
                    <p><strong>No HP:</strong> {selectedPembelian.noHpWarga}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Informasi Proyek</h4>
                  <div className="space-y-2">
                    <p><strong>Nama Proyek:</strong> {selectedPembelian.proyek?.namaProyek}</p>
                    <p><strong>Lokasi Proyek:</strong> {selectedPembelian.proyek?.lokasiProyek}</p>
                  </div>
                </div>
              </div>

              {/* Tanah Garapan Information */}
              <div>
                <h4 className="font-semibold mb-2">Informasi Tanah Garapan</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <p><strong>Letak Tanah:</strong> {selectedPembelian.tanahGarapan?.letakTanah}</p>
                  <p><strong>Nama Pemegang Hak:</strong> {selectedPembelian.tanahGarapan?.namaPemegangHak}</p>
                  <p><strong>Luas:</strong> {selectedPembelian.tanahGarapan?.luas} m²</p>
                </div>
              </div>

              {/* Purchase Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Informasi Pembelian</h4>
                  <div className="space-y-2">
                    <p><strong>Harga Beli:</strong> {formatCurrency(selectedPembelian.hargaBeli)}</p>
                    <p><strong>Status:</strong>
                      <Badge className={`ml-2 ${statusColors[selectedPembelian.statusPembelian as keyof typeof statusColors]}`}>
                        {statusLabels[selectedPembelian.statusPembelian as keyof typeof statusLabels]}
                      </Badge>
                    </p>
                    <p><strong>Metode Pembayaran:</strong> {selectedPembelian.metodePembayaran || '-'}</p>
                    <p><strong>Tanggal Kontrak:</strong> {formatDate(selectedPembelian.tanggalKontrak)}</p>
                    <p><strong>Tanggal Pembayaran:</strong> {formatDate(selectedPembelian.tanggalPembayaran)}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Informasi Sertifikat</h4>
                  <div className="space-y-2">
                    <p><strong>Nomor Sertifikat:</strong> {selectedPembelian.nomorSertifikat || '-'}</p>
                    <p><strong>Status Sertifikat:</strong> {selectedPembelian.statusSertifikat || 'PENDING'}</p>
                    <p><strong>Dibuat:</strong> {formatDate(selectedPembelian.createdAt)}</p>
                    <p><strong>Diupdate:</strong> {formatDate(selectedPembelian.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {selectedPembelian.keterangan && (
                <div>
                  <h4 className="font-semibold mb-2">Keterangan</h4>
                  <p className="text-gray-600">{selectedPembelian.keterangan}</p>
                </div>
              )}

              {/* Payments */}
              {selectedPembelian.pembayaran && selectedPembelian.pembayaran.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-4">Riwayat Pembayaran</h4>
                  <PembayaranTable
                    data={selectedPembelian.pembayaran || []}
                    pembelianId={selectedPembelian.id}
                    onRefresh={() => {
                      // Refresh the selected pembelian data
                      window.location.reload()
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}