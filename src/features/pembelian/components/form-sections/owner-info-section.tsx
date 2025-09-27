/**
 * Owner information section of pembelian form
 * Handles warga (owner) data input
 */

'use client'

import { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PembelianFormData } from '../pembelian-form-schema'

interface OwnerInfoSectionProps {
  form: UseFormReturn<PembelianFormData>
}

/**
 * Owner information section component
 */
export function OwnerInfoSection({ form }: OwnerInfoSectionProps) {
  return (
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
  )
}

