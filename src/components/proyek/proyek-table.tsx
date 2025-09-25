'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MoreHorizontal, Edit, Trash2, Eye, Plus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ProyekForm } from './proyek-form'
import { deleteProyekPembangunan } from '@/lib/server-actions/proyek'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface ProyekTableProps {
  data: any[]
  onRefresh: () => void
  onCreateNew: () => void
}

const statusColors = {
  PLANNING: 'bg-blue-100 text-blue-800',
  ONGOING: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const statusLabels = {
  PLANNING: 'Planning',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
}

export function ProyekTable({ data, onRefresh, onCreateNew }: ProyekTableProps) {
  const [editingProyek, setEditingProyek] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedProyek, setSelectedProyek] = useState<any>(null)

  const handleEdit = (proyek: any) => {
    setEditingProyek(proyek)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id: string, namaProyek: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus proyek "${namaProyek}"?`)) {
      const result = await deleteProyekPembangunan(id)
      if (result.success) {
        toast.success('Proyek berhasil dihapus')
        onRefresh()
      } else {
        toast.error(result.error || 'Gagal menghapus proyek')
      }
    }
  }

  const handleViewDetail = (proyek: any) => {
    setSelectedProyek(proyek)
    setIsDetailDialogOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: string | Date) => {
    if (!date) return '-'
    return format(new Date(date), 'dd MMM yyyy', { locale: id })
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Proyek Pembangunan</CardTitle>
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Proyek
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Proyek</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget Total</TableHead>
                <TableHead>Budget Terpakai</TableHead>
                <TableHead>Tanggal Mulai</TableHead>
                <TableHead>Tanggal Selesai</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((proyek) => (
                <TableRow key={proyek.id}>
                  <TableCell className="font-medium">{proyek.namaProyek}</TableCell>
                  <TableCell>{proyek.lokasiProyek}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[proyek.statusProyek as keyof typeof statusColors]}>
                      {statusLabels[proyek.statusProyek as keyof typeof statusLabels]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(Number(proyek.budgetTotal))}</TableCell>
                  <TableCell>{formatCurrency(Number(proyek.budgetTerpakai))}</TableCell>
                  <TableCell>{formatDate(proyek.tanggalMulai)}</TableCell>
                  <TableCell>{formatDate(proyek.tanggalSelesai)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetail(proyek)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(proyek)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(proyek.id, proyek.namaProyek)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <ProyekForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        proyek={editingProyek}
        onSuccess={() => {
          setIsEditDialogOpen(false)
          setEditingProyek(null)
          onRefresh()
        }}
      />

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detail Proyek: {selectedProyek?.namaProyek}</DialogTitle>
          </DialogHeader>
          {selectedProyek && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Informasi Proyek</h4>
                  <div className="space-y-2">
                    <p><strong>Nama:</strong> {selectedProyek.namaProyek}</p>
                    <p><strong>Lokasi:</strong> {selectedProyek.lokasiProyek}</p>
                    <p><strong>Status:</strong> 
                      <Badge className={`ml-2 ${statusColors[selectedProyek.statusProyek as keyof typeof statusColors]}`}>
                        {statusLabels[selectedProyek.statusProyek as keyof typeof statusLabels]}
                      </Badge>
                    </p>
                    <p><strong>Budget Total:</strong> {formatCurrency(Number(selectedProyek.budgetTotal))}</p>
                    <p><strong>Budget Terpakai:</strong> {formatCurrency(Number(selectedProyek.budgetTerpakai))}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Timeline</h4>
                  <div className="space-y-2">
                    <p><strong>Tanggal Mulai:</strong> {formatDate(selectedProyek.tanggalMulai)}</p>
                    <p><strong>Tanggal Selesai:</strong> {formatDate(selectedProyek.tanggalSelesai)}</p>
                    <p><strong>Dibuat:</strong> {formatDate(selectedProyek.createdAt)}</p>
                    <p><strong>Diupdate:</strong> {formatDate(selectedProyek.updatedAt)}</p>
                  </div>
                </div>
              </div>
              
              {selectedProyek.deskripsi && (
                <div>
                  <h4 className="font-semibold mb-2">Deskripsi</h4>
                  <p className="text-gray-600">{selectedProyek.deskripsi}</p>
                </div>
              )}

              {selectedProyek.pembelianSertifikat && selectedProyek.pembelianSertifikat.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Pembelian Sertifikat ({selectedProyek.pembelianSertifikat.length})</h4>
                  <div className="space-y-2">
                    {selectedProyek.pembelianSertifikat.map((pembelian: any) => (
                      <div key={pembelian.id} className="border rounded p-3">
                        <p><strong>Warga:</strong> {pembelian.namaWarga}</p>
                        <p><strong>Harga:</strong> {formatCurrency(Number(pembelian.hargaBeli))}</p>
                        <p><strong>Status:</strong> {pembelian.statusPembelian}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
