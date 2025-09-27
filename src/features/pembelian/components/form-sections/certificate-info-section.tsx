/**
 * Certificate information section of pembelian form
 * Handles certificate details and file uploads
 */

'use client'

import { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PembelianFormData } from '../pembelian-form-schema'
import { FileUpload } from '@/components/shared/file-upload'

interface CertificateInfoSectionProps {
  form: UseFormReturn<PembelianFormData>
}

/**
 * Certificate information section component
 */
export function CertificateInfoSection({ form }: CertificateInfoSectionProps) {
  return (
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
              <Select onValueChange={field.onChange} value={field.value}>
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
  )
}

