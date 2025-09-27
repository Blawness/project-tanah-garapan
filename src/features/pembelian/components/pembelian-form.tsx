/**
 * Main pembelian form component
 * Combines all form sections and handles form submission
 */

'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { toast } from 'sonner'
import { pembelianSchema, PembelianFormData } from './pembelian-form-schema'
import {
  loadAvailableTanahGarapan,
  loadAvailableProyek,
  getFormDefaultValues,
  PembelianFormState
} from '../services/pembelian-form-service'
import { BasicInfoSection } from './form-sections/basic-info-section'
import { OwnerInfoSection } from './form-sections/owner-info-section'
import { PurchaseInfoSection } from './form-sections/purchase-info-section'
import { CertificateInfoSection } from './form-sections/certificate-info-section'

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

/**
 * Main pembelian form component
 */
export function PembelianForm({
  open,
  onOpenChange,
  pembelian,
  proyekId,
  onSuccess
}: PembelianFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formState, setFormState] = useState<PembelianFormState>({
    availableTanahGarapan: [],
    availableProyek: [],
    isLoadingProyek: false,
    isLoadingTanahGarapan: false
  })

  const isEdit = !!pembelian

  const form = useForm<PembelianFormData>({
    resolver: zodResolver(pembelianSchema),
    defaultValues: {
      proyekId: '',
      tanahGarapanId: '',
      namaWarga: '',
      alamatWarga: '',
      noKtpWarga: '',
      noHpWarga: '',
      hargaBeli: 0,
      statusPembelian: 'NEGOTIATION',
      tanggalKontrak: '',
      tanggalPembayaran: '',
      metodePembayaran: 'CASH',
      buktiPembayaran: '',
      keterangan: '',
      nomorSertifikat: '',
      fileSertifikat: '',
      statusSertifikat: 'PENDING'
    },
    mode: 'onSubmit'
  })

  useEffect(() => {
    if (open) {
      loadFormData()
    }
  }, [open])

  // Reset form when pembelian prop changes (for editing)
  useEffect(() => {
    if (pembelian) {
      console.log('Resetting pembelian form with data:', pembelian)
      console.log('Harga beli from pembelian:', pembelian.hargaBeli, 'type:', typeof pembelian.hargaBeli)
      const defaultValues = getFormDefaultValues(pembelian, proyekId)
      console.log('Form default values:', defaultValues)
      form.reset(defaultValues)
    }
  }, [pembelian, proyekId, form])

  // Update form when proyekId prop changes
  useEffect(() => {
    if (proyekId) {
      form.setValue('proyekId', proyekId)
    }
  }, [proyekId, form])

  const loadFormData = async () => {
    try {
      const [tanahGarapanData, proyekData] = await Promise.all([
        loadAvailableTanahGarapan(),
        loadAvailableProyek()
      ])

      setFormState({
        availableTanahGarapan: tanahGarapanData,
        availableProyek: proyekData,
        isLoadingProyek: false,
        isLoadingTanahGarapan: false
      })
    } catch (error) {
      console.error('Error loading form data:', error)
      toast.error('Gagal memuat data form')
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
        console.error('API Error Response:', result)
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
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.log('Form validation errors:', errors)
            const firstError = Object.values(errors)[0]
            if (firstError?.message) {
              toast.error(firstError.message)
            } else {
              toast.error('Please fix the validation errors before submitting')
            }
          })} className="space-y-6">

            <BasicInfoSection
              form={form}
              availableProyek={formState.availableProyek}
              availableTanahGarapan={formState.availableTanahGarapan}
              isLoadingProyek={formState.isLoadingProyek}
            />

            <OwnerInfoSection form={form} />

            <PurchaseInfoSection form={form} />

            <CertificateInfoSection form={form} />

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

