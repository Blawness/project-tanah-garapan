/**
 * Purchase information section of pembelian form
 * Handles purchase details like price, payment method, dates
 */

'use client'

import { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PembelianFormData } from '../pembelian-form-schema'

interface PurchaseInfoSectionProps {
  form: UseFormReturn<PembelianFormData>
}

/**
 * Purchase information section component
 */
export function PurchaseInfoSection({ form }: PurchaseInfoSectionProps) {
  return (
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
                  step="1000"
                  placeholder="0"
                  {...field}
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

        <FormField
          control={form.control}
          name="metodePembayaran"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Metode Pembayaran</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
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
  )
}

