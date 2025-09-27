'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus } from 'lucide-react'
import { PembayaranForm } from './pembayaran-form'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface PembayaranTableProps {
  data?: Array<{
    id: string
    pembelianId: string
    nomorPembayaran: string
    jumlahPembayaran: number
    jenisPembayaran: string
    metodePembayaran: string
    tanggalPembayaran: string | Date
    statusPembayaran: string
    buktiPembayaran?: string
    keterangan?: string
  }>
  pembelianId: string
  onRefresh?: () => void
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  VERIFIED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800'
}

const statusLabels = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected'
}

const jenisLabels = {
  DP: 'Down Payment',
  CICILAN: 'Cicilan',
  PELUNASAN: 'Pelunasan',
  BONUS: 'Bonus'
}

const metodeLabels = {
  CASH: 'Cash',
  TRANSFER: 'Transfer',
  QRIS: 'QRIS',
  E_WALLET: 'E-Wallet',
  BANK_TRANSFER: 'Bank Transfer'
}

export function PembayaranTable({ data, pembelianId, onRefresh }: PembayaranTableProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Default refresh function if not provided
  const defaultRefresh = () => {
    window.location.reload()
  }

  const formatCurrency = (amount: number) => {
    const numAmount = Number(amount) || 0
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

  const handleAddPembayaran = () => {
    setIsFormOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Riwayat Pembayaran</CardTitle>
          <Button onClick={handleAddPembayaran}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pembayaran
          </Button>
        </CardHeader>
        <CardContent>
          {data && data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada pembayaran untuk pembelian ini
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor Pembayaran</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? data.map((pembayaran) => (
                  <TableRow key={pembayaran.id}>
                    <TableCell className="font-medium">{pembayaran.nomorPembayaran}</TableCell>
                    <TableCell>{formatCurrency(Number(pembayaran.jumlahPembayaran))}</TableCell>
                    <TableCell>{jenisLabels[pembayaran.jenisPembayaran as keyof typeof jenisLabels]}</TableCell>
                    <TableCell>{metodeLabels[pembayaran.metodePembayaran as keyof typeof metodeLabels]}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[pembayaran.statusPembayaran as keyof typeof statusColors]}>
                        {statusLabels[pembayaran.statusPembayaran as keyof typeof statusLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(pembayaran.tanggalPembayaran)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Belum ada data pembayaran
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PembayaranForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        pembelianId={pembelianId}
        onSuccess={() => {
          setIsFormOpen(false)
          onRefresh ? onRefresh() : defaultRefresh()
        }}
      />
    </>
  )
}