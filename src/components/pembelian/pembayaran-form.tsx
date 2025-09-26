'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { addPembayaranPembelian, PembayaranFormData } from '@/lib/server-actions/pembelian'
import { toast } from 'sonner'

const pembayaranSchema = z.object({
  pembelianId: z.string().min(1, 'Pembelian ID is required'),
  nomorPembayaran: z.string().min(1, 'Nomor Pembayaran is required'),
  jumlahPembayaran: z.coerce.number().positive('Jumlah pembayaran harus lebih besar dari 0'),
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
  pembelianId: string
  namaWarga: string
  totalHarga: number
  totalDibayar?: number
  onSuccess?: () => void
}

export function PembayaranForm({
  open,
  onOpenChange,
  pembelianId,
  namaWarga,
  totalHarga,
  totalDibayar = 0,
  onSuccess
}: PembayaranFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const sisaTagihan = totalHarga - totalDibayar

  const form = useForm<PembayaranFormData>({
    resolver: zodResolver(pembayaranSchema),
    defaultValues: {
      pembelianId,
      nomorPembayaran: '',
      jumlahPembayaran: 0,
      jenisPembayaran: 'DP',
      metodePembayaran: 'CASH',
      tanggalPembayaran: new Date().toISOString().split('T')[0],
      statusPembayaran: 'PENDING',
      buktiPembayaran: '',
      keterangan: ''
    },
    mode: 'onChange'
  })

  const watchedJenisPembayaran = form.watch('jenisPembayaran')
  const watchedJumlah = form.watch('jumlahPembayaran')

  useEffect(() => {
    if (watchedJenisPembayaran === 'PELUNASAN') {
      form.setValue('jumlahPembayaran', sisaTagihan)
    }
  }, [watchedJenisPembayaran, sisaTagihan, form])

  const generateNomorPembayaran = () => {
    const now = new Date()
    const timestamp = now.getTime()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `PAY-${timestamp}-${random}`
  }

  const onSubmit = async (data: PembayaranFormData) => {
    setIsLoading(true)

    try {
      // Generate nomor pembayaran jika belum ada
      if (!data.nomorPembayaran) {
        data.nomorPembayaran = generateNomorPembayaran()
      }

      const result = await addPembayaranPembelian(data)

      if (result.success) {
        toast.success('Pembayaran berhasil ditambahkan')
        form.reset()
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(result.error || 'Terjadi kesalahan saat menambah pembayaran')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Terjadi kesalahan yang tidak terduga')
    } finally {
      setIsLoading(false)
    }
  }

  const getJenisPembayaranOptions = () => {
    const options = [
      { value: 'DP', label: 'DP (Uang Muka)' },
      { value: 'CICILAN', label: 'Cicilan' }
    ]

    if (sisaTagihan > 0) {
      options.push({ value: 'PELUNASAN', label: 'Pelunasan' })
    }

    options.push({ value: 'BONUS', label: 'Bonus' })

    return options
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Pembayaran</DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Informasi Pembelian</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Pembeli:</span>
              <div className="font-medium">{namaWarga}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Total Tagihan:</span>
              <div className="font-medium">
                Rp {new Intl.NumberFormat('id-ID').format(totalHarga)}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Sudah Dibayar:</span>
              <div className="font-medium text-green-600">
                Rp {new Intl.NumberFormat('id-ID').format(totalDibayar)}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Sisa Tagihan:</span>
              <div className={`font-medium ${sisaTagihan > 0 ? 'text-red-600' : 'text-green-600'}`}>
                Rp {new Intl.NumberFormat('id-ID').format(Math.max(0, sisaTagihan))}
              </div>
            </div>
          </div>
        </div>

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
                      <div className="flex gap-2">
                        <Input
                          placeholder="Masukkan nomor pembayaran"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => field.onChange(generateNomorPembayaran())}
                        >
                          Generate
                        </Button>
                      </div>
                    </FormControl>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jenisPembayaran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Pembayaran</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis pembayaran" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getJenisPembayaranOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
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
                          <SelectValue placeholder="Pilih metode pembayaran" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CASH">Tunai</SelectItem>
                        <SelectItem value="TRANSFER">Transfer Bank</SelectItem>
                        <SelectItem value="QRIS">QRIS</SelectItem>
                        <SelectItem value="E_WALLET">E-Wallet</SelectItem>
                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      disabled={watchedJenisPembayaran === 'PELUNASAN'}
                    />
                  </FormControl>
                  <div className="text-sm text-muted-foreground">
                    {watchedJenisPembayaran === 'PELUNASAN' && (
                      <span className="text-blue-600">
                        Jumlah pelunasan otomatis disesuaikan dengan sisa tagihan
                      </span>
                    )}
                  </div>
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
                        <SelectValue placeholder="Pilih status pembayaran" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PENDING">Menunggu Verifikasi</SelectItem>
                      <SelectItem value="VERIFIED">Terverifikasi</SelectItem>
                      <SelectItem value="REJECTED">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keterangan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan (Opsional)</FormLabel>
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
                {isLoading ? 'Menyimpan...' : 'Simpan Pembayaran'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
