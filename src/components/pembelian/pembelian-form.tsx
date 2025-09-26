'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PembelianFormData } from '@/lib/server-actions/pembelian'
import { getTanahGarapanAvailable } from '@/lib/server-actions/pembelian'
import { toast } from 'sonner'
import { FileUpload } from '@/components/shared/file-upload'

const pembelianSchema = z.object({
  proyekId: z.string().min(1, 'Proyek ID is required'),
  tanahGarapanId: z.string().min(1, 'Tanah Garapan is required'),
  namaWarga: z.string().min(1, 'Nama Warga is required'),
  alamatWarga: z.string().min(1, 'Alamat Warga is required'),
  noKtpWarga: z.string().min(16, 'No KTP must be 16 digits').max(16, 'No KTP must be 16 digits'),
  noHpWarga: z.string().min(1, 'No HP is required'),
  hargaBeli: z.coerce.number().positive('Harga must be positive'),
  statusPembelian: z.enum(['NEGOTIATION', 'AGREED', 'CONTRACT_SIGNED', 'PAID', 'CERTIFICATE_ISSUED', 'COMPLETED', 'CANCELLED']),
  tanggalKontrak: z.string().optional(),
  tanggalPembayaran: z.string().optional(),
  metodePembayaran: z.enum(['CASH', 'TRANSFER', 'QRIS', 'E_WALLET', 'BANK_TRANSFER']).optional(),
  buktiPembayaran: z.string().optional(),
  keterangan: z.string().optional(),
  nomorSertifikat: z.string().optional(),
  fileSertifikat: z.string().optional(),
  statusSertifikat: z.enum(['PENDING', 'PROCESSING', 'ISSUED', 'DELIVERED']).optional()
})

interface PembelianFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pembelian?: {
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
  }
  proyekId?: string
  onSuccess?: () => void
}

export function PembelianForm({
  open,
  onOpenChange,
  pembelian,
  proyekId,
  onSuccess
}: PembelianFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [availableTanahGarapan, setAvailableTanahGarapan] = useState<Array<{
    id: string
    letakTanah: string
    namaPemegangHak: string
    luas: number
  }>>([])
  const isEdit = !!pembelian

  const form = useForm<PembelianFormData>({
    resolver: zodResolver(pembelianSchema),
    defaultValues: {
      proyekId: pembelian?.proyekId || proyekId || '',
      tanahGarapanId: pembelian?.tanahGarapanId || '',
      namaWarga: pembelian?.namaWarga || '',
      alamatWarga: pembelian?.alamatWarga || '',
      noKtpWarga: pembelian?.noKtpWarga || '',
      noHpWarga: pembelian?.noHpWarga || '',
      hargaBeli: pembelian?.hargaBeli || 0,
      statusPembelian: pembelian?.statusPembelian || 'NEGOTIATION',
      tanggalKontrak: pembelian?.tanggalKontrak ? new Date(pembelian.tanggalKontrak).toISOString().split('T')[0] : '',
      tanggalPembayaran: pembelian?.tanggalPembayaran ? new Date(pembelian.tanggalPembayaran).toISOString().split('T')[0] : '',
      metodePembayaran: pembelian?.metodePembayaran || 'CASH',
      buktiPembayaran: pembelian?.buktiPembayaran || '',
      keterangan: pembelian?.keterangan || '',
      nomorSertifikat: pembelian?.nomorSertifikat || '',
      fileSertifikat: pembelian?.fileSertifikat || '',
      statusSertifikat: pembelian?.statusSertifikat || 'PENDING'
    },
    mode: 'onChange'
  })

  useEffect(() => {
    if (open && !isEdit) {
      loadAvailableTanahGarapan()
    }
  }, [open, isEdit])

  const loadAvailableTanahGarapan = async () => {
    try {
      const result = await getTanahGarapanAvailable()
      if (result.success) {
        setAvailableTanahGarapan(result.data)
      }
    } catch (error) {
      console.error('Error loading tanah garapan:', error)
    }
  }

  const onSubmit = async (data: PembelianFormData) => {
    setIsLoading(true)

    try {
      const url = isEdit ? `/api/pembelian/${pembelian.id}` : '/api/pembelian'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message || `Pembelian ${isEdit ? 'updated' : 'created'} successfully`)
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


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Pembelian Sertifikat' : 'Tambah Pembelian Sertifikat'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informasi Dasar</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tanahGarapanId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanah Garapan</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tanah garapan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableTanahGarapan.map((tanah) => (
                            <SelectItem key={tanah.id} value={tanah.id}>
                              {tanah.letakTanah} - {tanah.namaPemegangHak} ({tanah.luas} m²)
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
                  name="statusPembelian"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Pembelian</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                          <SelectItem value="AGREED">Agreed</SelectItem>
                          <SelectItem value="CONTRACT_SIGNED">Contract Signed</SelectItem>
                          <SelectItem value="PAID">Paid</SelectItem>
                          <SelectItem value="CERTIFICATE_ISSUED">Certificate Issued</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Owner Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informasi Pemilik</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="namaWarga"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Warga</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama warga" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="noKtpWarga"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No KTP</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan no KTP (16 digit)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alamatWarga"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Warga</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan alamat warga" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="noHpWarga"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No HP</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan no HP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Purchase Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informasi Pembelian</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="hargaBeli"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga Beli (Rp)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Masukkan harga beli"
                          {...field}
                        />
                      </FormControl>
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
                  name="tanggalKontrak"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Kontrak</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
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
            </div>

            {/* Certificate Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informasi Sertifikat</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="nomorSertifikat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Sertifikat</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nomor sertifikat" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="statusSertifikat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Sertifikat</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="PROCESSING">Processing</SelectItem>
                          <SelectItem value="ISSUED">Issued</SelectItem>
                          <SelectItem value="DELIVERED">Delivered</SelectItem>
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
              </div>

              <FormField
                control={form.control}
                name="fileSertifikat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Sertifikat</FormLabel>
                    <FormControl>
                      <FileUpload
                        onUpload={(url) => field.onChange(url)}
                        accept="image/*,application/pdf"
                        maxSize={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                {isLoading ? 'Menyimpan...' : (isEdit ? 'Update' : 'Simpan')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}