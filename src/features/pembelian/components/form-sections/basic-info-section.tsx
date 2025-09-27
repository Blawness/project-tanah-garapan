/**
 * Basic information section of pembelian form
 * Handles proyek selection and tanah garapan selection
 */

'use client'

import { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PembelianFormData } from '../pembelian-form-schema'
import { AvailableProyek, AvailableTanahGarapan } from '../../services/pembelian-form-service'

interface BasicInfoSectionProps {
  form: UseFormReturn<PembelianFormData>
  availableProyek: AvailableProyek[]
  availableTanahGarapan: AvailableTanahGarapan[]
  isLoadingProyek: boolean
}

/**
 * Basic information section component
 */
export function BasicInfoSection({
  form,
  availableProyek,
  availableTanahGarapan,
  isLoadingProyek
}: BasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Informasi Dasar</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="proyekId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proyek Pembangunan</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingProyek ? "Memuat proyek..." : (field.value ? "Proyek dipilih" : "Pilih proyek pembangunan")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingProyek ? (
                    <div className="py-2 px-2 text-sm text-gray-500 text-center">
                      Memuat proyek...
                    </div>
                  ) : availableProyek.length > 0 ? (
                    availableProyek.map((proyek) => (
                      <SelectItem key={proyek.id} value={proyek.id}>
                        {proyek.namaProyek} - {proyek.lokasiProyek}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="py-2 px-2 text-sm text-gray-500 text-center">
                      Tidak ada proyek tersedia
                    </div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tanahGarapanId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanah Garapan</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
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
              <Select onValueChange={field.onChange} value={field.value}>
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
  )
}

