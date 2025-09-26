'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Calculator,
  Receipt,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  FileText,
  PlusCircle
} from 'lucide-react'
import { getPembelianSertifikat, deletePembelianSertifikat } from '@/lib/server-actions/pembelian'
import { PembelianForm } from './pembelian-form'
import { PembayaranTable } from './pembayaran-table'
import { ExportButton } from './export-button'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface PembelianTableProps {
  refreshTrigger?: number
}

export function PembelianTable({ refreshTrigger }: PembelianTableProps) {
  const [pembelian, setPembelian] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [proyekFilter, setProyekFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPembelian, setEditingPembelian] = useState<any>(null)
  const [proyekList, setProyekList] = useState<any[]>([])
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedPembelian, setSelectedPembelian] = useState<any>(null)

  const pageSize = 10

  useEffect(() => {
    loadPembelian()
  }, [currentPage, searchTerm, statusFilter, proyekFilter, refreshTrigger])

  const loadPembelian = async () => {
    setLoading(true)
    try {
      const result = await getPembelianSertifikat(currentPage, pageSize)
      if (result.success && result.data) {
        setPembelian(result.data.data)
        setTotalPages(result.data.totalPages)
        setTotalItems(result.data.total)
        // Extract unique proyek for filter
        const uniqueProyek = Array.from(
          new Set(result.data.data.map((p: any) => p.proyek?.namaProyek).filter(Boolean))
        ).map(nama => result.data.data.find((p: any) => p.proyek?.namaProyek === nama)?.proyek)
        setProyekList(uniqueProyek)
      }
    } catch (error) {
      console.error('Error loading pembelian:', error)
      toast.error('Gagal memuat data pembelian')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, namaWarga: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pembelian untuk ${namaWarga}?`)) {
      return
    }

    try {
      const result = await deletePembelianSertifikat(id)
      if (result.success) {
        toast.success('Pembelian berhasil dihapus')
        loadPembelian()
      } else {
        toast.error(result.error || 'Gagal menghapus pembelian')
      }
    } catch (error) {
      console.error('Error deleting pembelian:', error)
      toast.error('Terjadi kesalahan saat menghapus')
    }
  }

  const handleEdit = (pembelian: any) => {
    setEditingPembelian(pembelian)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setEditingPembelian(null)
    loadPembelian()
  }

  const handleViewDetail = (pembelian: any) => {
    setSelectedPembelian(pembelian)
    setDetailOpen(true)
  }

  const handleDetailClose = () => {
    setDetailOpen(false)
    setSelectedPembelian(null)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const filteredPembelian = pembelian.filter(p => {
    const matchesSearch = p.namaWarga.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.tanahGarapan?.letakTanah.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.proyek?.namaProyek.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || p.statusPembelian === statusFilter
    const matchesProyek = proyekFilter === 'ALL' || p.proyek?.namaProyek === proyekFilter
    return matchesSearch && matchesStatus && matchesProyek
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Data Pembelian Sertifikat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Memuat data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              <CardTitle>Data Pembelian Sertifikat</CardTitle>
              <Badge variant="secondary">{totalItems}</Badge>
            </div>
            <div className="flex gap-2">
              <ExportButton />
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pembelian
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari nama warga, lokasi tanah, atau nama proyek..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="NEGOTIATION">Negosiasi</SelectItem>
                <SelectItem value="AGREED">Disepakati</SelectItem>
                <SelectItem value="CONTRACT_SIGNED">Kontrak Ditandatangani</SelectItem>
                <SelectItem value="PAID">Dibayar</SelectItem>
                <SelectItem value="CERTIFICATE_ISSUED">Sertifikat Diterbitkan</SelectItem>
                <SelectItem value="COMPLETED">Selesai</SelectItem>
                <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>

            <Select value={proyekFilter} onValueChange={setProyekFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter Proyek" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Proyek</SelectItem>
                {proyekList.map((proyek) => (
                  <SelectItem key={proyek?.id} value={proyek?.namaProyek}>
                    {proyek?.namaProyek}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Warga & Tanah</TableHead>
                  <TableHead>Proyek</TableHead>
                  <TableHead>Harga & Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="w-12">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPembelian.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchTerm || statusFilter !== 'ALL' || proyekFilter !== 'ALL'
                        ? 'Tidak ada data yang sesuai dengan filter'
                        : 'Belum ada data pembelian sertifikat'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPembelian.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{p.namaWarga}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {p.tanahGarapan?.letakTanah}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {p.noHpWarga}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{p.proyek?.namaProyek}</div>
                          <div className="text-sm text-muted-foreground">{p.proyek?.lokasiProyek}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="font-medium">{formatCurrency(Number(p.hargaBeli))}</div>
                          <Badge className={getStatusColor(p.statusPembelian)}>
                            {getStatusLabel(p.statusPembelian)}
                          </Badge>
                          {p.pembayaran && p.pembayaran.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {p.pembayaran.length} pembayaran
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {p.tanggalKontrak && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(p.tanggalKontrak), 'dd MMM yyyy', { locale: id })}
                            </div>
                          )}
                          {p.tanggalPembayaran && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CreditCard className="h-3 w-3" />
                              {format(new Date(p.tanggalPembayaran), 'dd MMM yyyy', { locale: id })}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetail(p)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(p)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(p.id, p.namaWarga)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Menampilkan {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalItems)} dari {totalItems} data
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPembelian ? 'Edit Pembelian Sertifikat' : 'Tambah Pembelian Sertifikat Baru'}
            </DialogTitle>
          </DialogHeader>
          <PembelianForm
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            pembelian={editingPembelian}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Detail Pembelian Sertifikat
            </DialogTitle>
          </DialogHeader>
          {selectedPembelian && (
            <div className="space-y-6">
              {/* Informasi Pembelian */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informasi Warga</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{selectedPembelian.namaWarga}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedPembelian.alamatWarga}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedPembelian.noKtpWarga}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedPembelian.noHpWarga}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informasi Tanah</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedPembelian.tanahGarapan?.letakTanah}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedPembelian.tanahGarapan?.namaPemegangHak}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Luas: {selectedPembelian.tanahGarapan?.luas} m²</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Informasi Proyek */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Proyek</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground">Nama Proyek:</span>
                      <div className="font-medium">{selectedPembelian.proyek?.namaProyek}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lokasi Proyek:</span>
                      <div className="font-medium">{selectedPembelian.proyek?.lokasiProyek}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Riwayat Pembayaran */}
              <PembayaranTable
                pembelianId={selectedPembelian.id}
                namaWarga={selectedPembelian.namaWarga}
                totalHarga={Number(selectedPembelian.hargaBeli)}
                pembayaran={selectedPembelian.pembayaran || []}
                onSuccess={() => {
                  loadPembelian()
                  handleDetailClose()
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
