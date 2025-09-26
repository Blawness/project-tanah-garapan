'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Plus,
  Calculator,
  Receipt,
  Calendar,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { PembayaranForm } from './pembayaran-form'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface PembayaranTableProps {
  pembelianId: string
  namaWarga: string
  totalHarga: number
  pembayaran: any[]
  onSuccess?: () => void
}

export function PembayaranTable({
  pembelianId,
  namaWarga,
  totalHarga,
  pembayaran,
  onSuccess
}: PembayaranTableProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)

  const totalDibayar = pembayaran.reduce((sum, p) =>
    sum + (p.statusPembayaran === 'VERIFIED' ? Number(p.jumlahPembayaran) : 0), 0
  )
  const sisaTagihan = totalHarga - totalDibayar

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      VERIFIED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      PENDING: 'Menunggu Verifikasi',
      VERIFIED: 'Terverifikasi',
      REJECTED: 'Ditolak'
    }
    return labels[status as keyof typeof labels] || status
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getJenisPembayaranLabel = (jenis: string) => {
    const labels = {
      DP: 'DP (Uang Muka)',
      CICILAN: 'Cicilan',
      PELUNASAN: 'Pelunasan',
      BONUS: 'Bonus'
    }
    return labels[jenis as keyof typeof labels] || jenis
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    onSuccess?.()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Riwayat Pembayaran
              <Badge variant="secondary">{pembayaran.length} pembayaran</Badge>
            </CardTitle>
            {sisaTagihan > 0 && (
              <Button onClick={() => setIsFormOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pembayaran
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalHarga)}
              </div>
              <div className="text-sm text-muted-foreground">Total Tagihan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalDibayar)}
              </div>
              <div className="text-sm text-muted-foreground">Sudah Dibayar</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${sisaTagihan > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(Math.max(0, sisaTagihan))}
              </div>
              <div className="text-sm text-muted-foreground">Sisa Tagihan</div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor & Tanggal</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pembayaran.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Belum ada pembayaran
                    </TableCell>
                  </TableRow>
                ) : (
                  pembayaran
                    .sort((a, b) => new Date(b.tanggalPembayaran).getTime() - new Date(a.tanggalPembayaran).getTime())
                    .map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{p.nomorPembayaran}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(p.tanggalPembayaran), 'dd MMM yyyy', { locale: id })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getJenisPembayaranLabel(p.jenisPembayaran)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">
                            {p.metodePembayaran.toLowerCase().replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(Number(p.jumlahPembayaran))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(p.statusPembayaran)}
                          <Badge className={getStatusColor(p.statusPembayaran)}>
                            {getStatusLabel(p.statusPembayaran)}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Completion Status */}
          {sisaTagihan <= 0 && pembayaran.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Pembayaran Lunas</span>
              </div>
              <div className="text-sm text-green-600 mt-1">
                Semua tagihan telah dibayar lunas pada tanggal {format(new Date(pembayaran[0]?.tanggalPembayaran), 'dd MMMM yyyy', { locale: id })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Pembayaran</DialogTitle>
          </DialogHeader>
          <PembayaranForm
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            pembelianId={pembelianId}
            namaWarga={namaWarga}
            totalHarga={totalHarga}
            totalDibayar={totalDibayar}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
