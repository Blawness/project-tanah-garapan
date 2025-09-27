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
import { addProyekPembangunan, updateProyekPembangunan, ProyekFormData } from '@/lib/server-actions/proyek'
import { toast } from 'sonner'

const proyekSchema = z.object({
  namaProyek: z.string().min(1, 'Nama Proyek is required'),
  lokasiProyek: z.string().min(1, 'Lokasi Proyek is required'),
  deskripsi: z.string().optional(),
  statusProyek: z.enum(['PLANNING', 'ONGOING', 'COMPLETED', 'CANCELLED']),
  tanggalMulai: z.string().optional(),
  tanggalSelesai: z.string().optional(),
  budgetTotal: z.coerce.number().positive('Budget must be positive')
})

interface ProyekFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proyek?: {
    id: string
    namaProyek: string
    lokasiProyek: string
    deskripsi?: string
    statusProyek: string
    tanggalMulai?: string | Date
    tanggalSelesai?: string | Date
    budgetTotal: number
  }
  onSuccess?: () => void
}

export function ProyekForm({ 
  open, 
  onOpenChange, 
  proyek, 
  onSuccess 
}: ProyekFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEdit = !!proyek

  const form = useForm<ProyekFormData>({
    resolver: zodResolver(proyekSchema),
    defaultValues: {
      namaProyek: '',
      lokasiProyek: '',
      deskripsi: '',
      statusProyek: 'PLANNING',
      tanggalMulai: '',
      tanggalSelesai: '',
      budgetTotal: 0
    },
    mode: 'onChange'
  })

  // Reset form when proyek prop changes (for editing)
  useEffect(() => {
    if (proyek) {
      console.log('Resetting form with proyek data:', proyek)
      console.log('Budget total from proyek:', proyek.budgetTotal, 'type:', typeof proyek.budgetTotal)
      form.reset({
        namaProyek: proyek.namaProyek || '',
        lokasiProyek: proyek.lokasiProyek || '',
        deskripsi: proyek.deskripsi || '',
        statusProyek: proyek.statusProyek || 'PLANNING',
        tanggalMulai: proyek.tanggalMulai ? new Date(proyek.tanggalMulai).toISOString().split('T')[0] : '',
        tanggalSelesai: proyek.tanggalSelesai ? new Date(proyek.tanggalSelesai).toISOString().split('T')[0] : '',
        budgetTotal: proyek.budgetTotal ? Number(proyek.budgetTotal) : 0
      })
    }
  }, [proyek, form])

  const onSubmit = async (data: ProyekFormData) => {
    setIsLoading(true)

    console.log('Form submission data:', data)
    console.log('Budget total from form:', data.budgetTotal, 'type:', typeof data.budgetTotal)

    try {
      const result = isEdit
        ? await updateProyekPembangunan(proyek.id, data)
        : await addProyekPembangunan(data)

      if (result.success) {
        toast.success(result.message || `Proyek ${isEdit ? 'updated' : 'created'} successfully`)
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Proyek' : 'Tambah Proyek Baru'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="namaProyek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Proyek</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama proyek" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lokasiProyek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasi Proyek</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan lokasi proyek" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Masukkan deskripsi proyek" 
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="statusProyek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Proyek</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PLANNING">Planning</SelectItem>
                        <SelectItem value="ONGOING">Ongoing</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tanggalMulai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Mulai</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tanggalSelesai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Selesai</FormLabel>
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
              name="budgetTotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Total (Rp)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1000"
                      placeholder="0"
                      value={field.value?.toString() || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === '' ? 0 : Number(value))
                      }}
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
                {isLoading ? 'Menyimpan...' : (isEdit ? 'Update' : 'Simpan')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
