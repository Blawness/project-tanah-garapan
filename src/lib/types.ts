import { z } from 'zod'

// Form validation schemas
export const tanahGarapanSchema = z.object({
  letakTanah: z.string().min(1, "Letak Tanah is required"),
  namaPemegangHak: z.string().min(1, "Nama Pemegang Hak is required"),
  letterC: z.string().min(1, "Letter C is required"),
  nomorSuratKeteranganGarapan: z.string().min(1, "Nomor Surat Keterangan Garapan is required"),
  luas: z.coerce.number().positive({ message: "Luas must be a positive number" }),
  file_url: z.string().optional().nullable(),
  keterangan: z.string().optional().nullable(),
})

export const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['USER', 'MANAGER', 'ADMIN', 'DEVELOPER']),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

// Types
export type TanahGarapanFormData = z.infer<typeof tanahGarapanSchema>
export type UserFormData = z.infer<typeof userSchema>
export type LoginFormData = z.infer<typeof loginSchema>

export type UserRole = 'USER' | 'MANAGER' | 'ADMIN' | 'DEVELOPER'

export interface TanahGarapanEntry {
  id: string
  letakTanah: string
  namaPemegangHak: string
  letterC: string
  nomorSuratKeteranganGarapan: string
  luas: number
  file_url?: string | null
  keterangan?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface ActivityLog {
  id: string
  user: string
  action: string
  details: string
  payload?: any
  createdAt: Date
}

export interface ProyekPembangunan {
  id: string
  namaProyek: string
  lokasiProyek: string
  deskripsi?: string | null
  statusProyek: 'PLANNING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  tanggalMulai?: Date | null
  tanggalSelesai?: Date | null
  budgetTotal: number
  budgetTerpakai: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface PembelianSertifikat {
  id: string
  proyekId: string
  tanahGarapanId: string
  namaWarga: string
  alamatWarga: string
  noKtpWarga: string
  noHpWarga: string
  hargaBeli: number
  statusPembelian: 'NEGOTIATION' | 'AGREED' | 'CONTRACT_SIGNED' | 'PAID' | 'CERTIFICATE_ISSUED' | 'COMPLETED' | 'CANCELLED'
  tanggalKontrak?: Date | null
  tanggalPembayaran?: Date | null
  metodePembayaran?: 'CASH' | 'TRANSFER' | 'QRIS' | 'E_WALLET' | 'BANK_TRANSFER' | null
  buktiPembayaran?: string | null
  keterangan?: string | null
  nomorSertifikat?: string | null
  fileSertifikat?: string | null
  statusSertifikat: 'PENDING' | 'PROCESSING' | 'ISSUED' | 'DELIVERED'
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface PembayaranPembelian {
  id: string
  pembelianId: string
  nomorPembayaran: string
  jumlahPembayaran: number
  jenisPembayaran: 'DP' | 'CICILAN' | 'PELUNASAN' | 'BONUS'
  metodePembayaran: 'CASH' | 'TRANSFER' | 'QRIS' | 'E_WALLET' | 'BANK_TRANSFER'
  tanggalPembayaran: Date
  statusPembayaran: 'PENDING' | 'VERIFIED' | 'REJECTED'
  buktiPembayaran?: string | null
  keterangan?: string | null
  createdBy: string
  createdAt: Date
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Table and pagination types
export interface PaginationParams {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
