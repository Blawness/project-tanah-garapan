'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addPembayaranPembelian } from '@/lib/server-actions/pembelian'
import { toast } from 'sonner'

const pembayaranSchema = z.object({
  pembelianId: z.string().min(1, 'Pembelian ID is required'),
  nomorPembayaran: z.string().min(1, 'Nomor Pembayaran is required'),
  jumlahPembayaran: z.coerce.number().positive('Jumlah must be positive'),
  jenisPembayaran: z.enum(['DP', 'CICILAN', 'PELUNASAN', 'BONUS']),
  metodePembayaran: z.enum(['CASH', 'TRANSFER', 'QRIS', 'E_WALLET', 'BANK_TRANSFER']),
  tanggalPembayaran: z.string().min(1, 'Tanggal Pembayaran is required'),
  statusPembayaran: z.enum(['PENDING', 'VERIFIED', 'REJECTED']),
  buktiPembayaran: z.string().optional(),
  keterangan: z.string().optional()
})

interface PembayaranFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pembelianId?: string
  onSuccess?: () => void
}

export function PembayaranForm({
  open,
  onOpenChange,
  pembelianId,
  onSuccess
}: PembayaranFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(pembayaranSchema),
    defaultValues: {
      pembelianId: pembelianId || '',
      nomorPembayaran: '',
      jumlahPembayaran: 0,
      jenisPembayaran: 'DP' as const,
      metodePembayaran: 'CASH' as const,
      tanggalPembayaran: new Date().toISOString().split('T')[0],
      statusPembayaran: 'PENDING' as const,
      buktiPembayaran: '',
      keterangan: ''
    },
    mode: 'onChange'
  })

  const onSubmit = async (data: {
    pembelianId: string
    nomorPembayaran: string
    jumlahPembayaran: number
    jenisPembayaran: 'DP' | 'CICILAN' | 'PELUNASAN' | 'BONUS'
    metodePembayaran: 'CASH' | 'TRANSFER' | 'QRIS' | 'E_WALLET' | 'BANK_TRANSFER'
    tanggalPembayaran: string
    statusPembayaran: 'PENDING' | 'VERIFIED' | 'REJECTED'
    buktiPembayaran?: string
    keterangan?: string
  }) => {
    setIsLoading(true)

    try {
      const result = await addPembayaranPembelian(data)

      if (result.success) {
        toast.success('Pembayaran berhasil ditambahkan')
        form.reset()
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(result.error || 'An error occurred')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tambah Pembayaran</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nomorPembayaran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Pembayaran</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nomor pembayaran" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jumlahPembayaran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Pembayaran (Rp)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Masukkan jumlah pembayaran"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jenisPembayaran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Pembayaran</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DP">DP (Down Payment)</SelectItem>
                        <SelectItem value="CICILAN">Cicilan</SelectItem>
                        <SelectItem value="PELUNASAN">Pelunasan</SelectItem>
                        <SelectItem value="BONUS">Bonus</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metodePembayaran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metode Pembayaran</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih metode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="TRANSFER">Transfer</SelectItem>
                        <SelectItem value="QRIS">QRIS</SelectItem>
                        <SelectItem value="E_WALLET">E-Wallet</SelectItem>
                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tanggalPembayaran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Pembayaran</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="statusPembayaran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Pembayaran</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="VERIFIED">Verified</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="keterangan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan keterangan tambahan"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}