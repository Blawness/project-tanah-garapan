'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TanahGarapanFormData, tanahGarapanSchema } from '@/lib/types'
// Server actions are now called through API routes
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { FileUpload } from '@/components/shared/file-upload'
import { toast } from 'sonner'

interface TanahGarapanFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry?: any
  onSuccess?: () => void
}

export function TanahGarapanForm({ 
  open, 
  onOpenChange, 
  entry, 
  onSuccess 
}: TanahGarapanFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEdit = !!entry

  const form = useForm<TanahGarapanFormData>({
    resolver: zodResolver(tanahGarapanSchema),
    defaultValues: {
      letakTanah: entry?.letakTanah || '',
      namaPemegangHak: entry?.namaPemegangHak || '',
      letterC: entry?.letterC || '',
      nomorSuratKeteranganGarapan: entry?.nomorSuratKeteranganGarapan || '',
      luas: entry?.luas || 0,
      file_url: entry?.file_url || '',
      keterangan: entry?.keterangan || '',
    },
    mode: 'onChange'
  })

  const onSubmit = async (data: TanahGarapanFormData) => {
    setIsLoading(true)
    
    try {
      // Clean up data before sending
      const cleanData = {
        ...data,
        file_url: data.file_url && data.file_url.trim() !== '' ? data.file_url.trim() : null,
        keterangan: data.keterangan && data.keterangan.trim() !== '' ? data.keterangan.trim() : null,
        luas: Number(data.luas) || 0
      }

      console.log('Submitting data:', cleanData) // Debug log

      const response = await fetch('/api/tanah-garapan', {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isEdit ? { id: entry.id, ...cleanData } : cleanData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message || `Entry ${isEdit ? 'updated' : 'created'} successfully`)
        form.reset()
        onOpenChange(false)
        onSuccess?.()
      } else {
        console.error('Server error:', result.error) // Debug log
        toast.error(result.error || 'An error occurred')
      }
    } catch (error) {
      console.error('Form submission error:', error) // Debug log
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Tanah Garapan' : 'Tambah Tanah Garapan'}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? 'Update informasi tanah garapan' 
              : 'Tambahkan data tanah garapan baru ke sistem'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="letakTanah">Letak Tanah</Label>
              <Input
                id="letakTanah"
                placeholder="Contoh: Desa Sukamaju, Kecamatan A"
                {...form.register('letakTanah')}
                disabled={isLoading}
              />
              {form.formState.errors.letakTanah && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.letakTanah.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="namaPemegangHak">Nama Pemegang Hak</Label>
              <Input
                id="namaPemegangHak"
                placeholder="Nama lengkap pemegang hak"
                {...form.register('namaPemegangHak')}
                disabled={isLoading}
              />
              {form.formState.errors.namaPemegangHak && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.namaPemegangHak.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="letterC">Letter C</Label>
              <Input
                id="letterC"
                placeholder="Contoh: C-001/2024"
                {...form.register('letterC')}
                disabled={isLoading}
              />
              {form.formState.errors.letterC && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.letterC.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomorSuratKeteranganGarapan">No. Surat Keterangan Garapan</Label>
              <Input
                id="nomorSuratKeteranganGarapan"
                placeholder="Contoh: SKG-001/2024"
                {...form.register('nomorSuratKeteranganGarapan')}
                disabled={isLoading}
              />
              {form.formState.errors.nomorSuratKeteranganGarapan && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.nomorSuratKeteranganGarapan.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="luas">Luas (m²)</Label>
              <Input
                id="luas"
                type="number"
                placeholder="Contoh: 1500"
                {...form.register('luas')}
                disabled={isLoading}
              />
              {form.formState.errors.luas && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.luas.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <FileUpload
                value={form.watch('file_url') || ''}
                onChange={(url) => form.setValue('file_url', url)}
                onRemove={() => form.setValue('file_url', '')}
                disabled={isLoading}
              />
              {form.formState.errors.file_url && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.file_url.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
            <textarea
              id="keterangan"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Tambahkan keterangan jika diperlukan..."
              {...form.register('keterangan')}
              disabled={isLoading}
            />
            {form.formState.errors.keterangan && (
              <p className="text-sm text-red-600">
                {form.formState.errors.keterangan.message}
              </p>
            )}
          </div>

          <DialogFooter>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
