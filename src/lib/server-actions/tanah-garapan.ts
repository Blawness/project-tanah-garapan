import { prisma } from '@/lib/prisma'
import { TanahGarapanFormData, tanahGarapanSchema, ApiResponse } from '@/lib/types'
// import { revalidatePath } from 'next/cache' // Temporarily removed for client compatibility
import { getServerSession } from 'next-auth'
import { authOptions, canManageData } from '@/lib/auth'
import { logActivity } from './activity'

export async function getTanahGarapanEntries(page: number = 1, pageSize: number = 20): Promise<ApiResponse<{data: any[], total: number, totalPages: number}>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const skip = (page - 1) * pageSize

    const [entries, total] = await Promise.all([
      prisma.tanahGarapanEntry.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.tanahGarapanEntry.count()
    ])

    const totalPages = Math.ceil(total / pageSize)

    return { 
      success: true, 
      data: {
        data: entries,
        total,
        totalPages,
        currentPage: page,
        pageSize
      }
    }
  } catch (error) {
    console.error('Error fetching tanah garapan entries:', error)
    return { success: false, error: 'Failed to fetch entries' }
  }
}

export async function getTanahGarapanEntryById(id: string): Promise<ApiResponse<any>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const entry = await prisma.tanahGarapanEntry.findUnique({
      where: { id }
    })

    if (!entry) {
      return { success: false, error: 'Entry not found' }
    }

    return { success: true, data: entry }
  } catch (error) {
    console.error('Error fetching tanah garapan entry:', error)
    return { success: false, error: 'Failed to fetch entry' }
  }
}

export async function getTanahGarapanEntriesByIds(ids: string[]): Promise<ApiResponse<any[]>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const entries = await prisma.tanahGarapanEntry.findMany({
      where: { id: { in: ids } },
      orderBy: { letakTanah: 'asc' }
    })

    return { success: true, data: entries }
  } catch (error) {
    console.error('Error fetching tanah garapan entries by IDs:', error)
    return { success: false, error: 'Failed to fetch entries' }
  }
}

export async function getTanahGarapanEntriesByLetakTanah(location: string): Promise<ApiResponse<any[]>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const entries = await prisma.tanahGarapanEntry.findMany({
      where: { 
        letakTanah: {
          contains: location,
          mode: 'insensitive'
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: entries }
  } catch (error) {
    console.error('Error fetching tanah garapan entries by location:', error)
    return { success: false, error: 'Failed to fetch entries' }
  }
}

export async function addTanahGarapanEntry(data: TanahGarapanFormData): Promise<ApiResponse<any>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canManageData(session.user.role)) {
      return { success: false, error: 'Unauthorized' }
    }

    console.log('Received data:', data) // Debug log

    // Clean up data before validation
    const cleanData = {
      letakTanah: data.letakTanah?.trim() || '',
      namaPemegangHak: data.namaPemegangHak?.trim() || '',
      letterC: data.letterC?.trim() || '',
      nomorSuratKeteranganGarapan: data.nomorSuratKeteranganGarapan?.trim() || '',
      luas: Number(data.luas) || 0,
      file_url: data.file_url?.trim() || null,
      keterangan: data.keterangan?.trim() || null,
    }

    console.log('Cleaned data:', cleanData) // Debug log

    const validatedData = tanahGarapanSchema.parse(cleanData)
    console.log('Validated data:', validatedData) // Debug log

    const entry = await prisma.tanahGarapanEntry.create({
      data: validatedData
    })

    await logActivity(
      session?.user?.name || 'System',
      'CREATE_ENTRY',
      `Created new tanah garapan entry: ${entry.letakTanah}`,
      entry
    )

    // revalidatePath('/tanah-garapan') // Temporarily disabled for client compatibility
    return { success: true, data: entry, message: 'Entry created successfully' }
  } catch (error) {
    console.error('Error creating tanah garapan entry:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create entry' }
  }
}

export async function updateTanahGarapanEntry(id: string, data: TanahGarapanFormData): Promise<ApiResponse<any>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canManageData(session.user.role)) {
      return { success: false, error: 'Unauthorized' }
    }

    const validatedData = tanahGarapanSchema.parse(data)

    const existingEntry = await prisma.tanahGarapanEntry.findUnique({
      where: { id }
    })

    if (!existingEntry) {
      return { success: false, error: 'Entry not found' }
    }

    const entry = await prisma.tanahGarapanEntry.update({
      where: { id },
      data: validatedData
    })

    await logActivity(
      session?.user?.name || 'System',
      'UPDATE_ENTRY',
      `Updated tanah garapan entry: ${entry.letakTanah}`,
      { old: existingEntry, new: entry }
    )

    // revalidatePath('/tanah-garapan') // Temporarily disabled for client compatibility
    return { success: true, data: entry, message: 'Entry updated successfully' }
  } catch (error) {
    console.error('Error updating tanah garapan entry:', error)
    return { success: false, error: 'Failed to update entry' }
  }
}

export async function deleteTanahGarapanEntry(id: string): Promise<ApiResponse<void>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canManageData(session.user.role)) {
      return { success: false, error: 'Unauthorized' }
    }

    const existingEntry = await prisma.tanahGarapanEntry.findUnique({
      where: { id }
    })

    if (!existingEntry) {
      return { success: false, error: 'Entry not found' }
    }

    await prisma.tanahGarapanEntry.delete({
      where: { id }
    })

    await logActivity(
      session?.user?.name || 'System',
      'DELETE_ENTRY',
      `Deleted tanah garapan entry: ${existingEntry.letakTanah}`,
      existingEntry
    )

    // revalidatePath('/tanah-garapan') // Temporarily disabled for client compatibility
    return { success: true, message: 'Entry deleted successfully' }
  } catch (error) {
    console.error('Error deleting tanah garapan entry:', error)
    return { success: false, error: 'Failed to delete entry' }
  }
}

export async function searchTanahGarapanEntries(query: string): Promise<ApiResponse<any[]>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const entries = await prisma.tanahGarapanEntry.findMany({
      where: {
        OR: [
          { letakTanah: { contains: query, mode: 'insensitive' } },
          { namaPemegangHak: { contains: query, mode: 'insensitive' } },
          { letterC: { contains: query, mode: 'insensitive' } },
          { nomorSuratKeteranganGarapan: { contains: query, mode: 'insensitive' } },
          { keterangan: { contains: query, mode: 'insensitive' } },
        ]
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: entries }
  } catch (error) {
    console.error('Error searching tanah garapan entries:', error)
    return { success: false, error: 'Failed to search entries' }
  }
}

export async function advancedSearchTanahGarapanEntries(filters: {
  query?: string
  location?: string
  minLuas?: string
  maxLuas?: string
  dateFrom?: string
  dateTo?: string
}): Promise<ApiResponse<any[]>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const whereConditions: any = {}

    // Text search
    if (filters.query && filters.query.trim()) {
      whereConditions.OR = [
        { letakTanah: { contains: filters.query, mode: 'insensitive' } },
        { namaPemegangHak: { contains: filters.query, mode: 'insensitive' } },
        { letterC: { contains: filters.query, mode: 'insensitive' } },
        { nomorSuratKeteranganGarapan: { contains: filters.query, mode: 'insensitive' } },
        { keterangan: { contains: filters.query, mode: 'insensitive' } },
      ]
    }

    // Location filter
    if (filters.location && filters.location.trim()) {
      whereConditions.letakTanah = { contains: filters.location, mode: 'insensitive' }
    }

    // Luas range filter
    if (filters.minLuas || filters.maxLuas) {
      whereConditions.luas = {}
      if (filters.minLuas) {
        whereConditions.luas.gte = parseInt(filters.minLuas)
      }
      if (filters.maxLuas) {
        whereConditions.luas.lte = parseInt(filters.maxLuas)
      }
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      whereConditions.createdAt = {}
      if (filters.dateFrom) {
        whereConditions.createdAt.gte = new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo)
        endDate.setHours(23, 59, 59, 999) // End of day
        whereConditions.createdAt.lte = endDate
      }
    }

    const entries = await prisma.tanahGarapanEntry.findMany({
      where: whereConditions,
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: entries }
  } catch (error) {
    console.error('Error in advanced search:', error)
    return { success: false, error: 'Failed to perform advanced search' }
  }
}

export async function exportTanahGarapanToCSV(): Promise<ApiResponse<string>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canManageData(session.user.role)) {
      return { success: false, error: 'Unauthorized' }
    }

    const entries = await prisma.tanahGarapanEntry.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Create CSV content
    const headers = [
      'ID',
      'Letak Tanah',
      'Nama Pemegang Hak',
      'Letter C',
      'Nomor Surat Keterangan Garapan',
      'Luas (m²)',
      'File URL',
      'Keterangan',
      'Created At',
      'Updated At'
    ]

    const csvContent = [
      headers.join(','),
      ...entries.map(entry => [
        entry.id,
        `"${entry.letakTanah}"`,
        `"${entry.namaPemegangHak}"`,
        `"${entry.letterC}"`,
        `"${entry.nomorSuratKeteranganGarapan}"`,
        entry.luas,
        entry.file_url || '',
        `"${entry.keterangan || ''}"`,
        entry.createdAt.toISOString(),
        entry.updatedAt.toISOString()
      ].join(','))
    ].join('\n')

    await logActivity(
      session?.user?.name || 'System',
      'EXPORT_CSV',
      'Exported tanah garapan data to CSV',
      { count: entries.length }
    )

    return { success: true, data: csvContent }
  } catch (error) {
    console.error('Error exporting to CSV:', error)
    return { success: false, error: 'Failed to export to CSV' }
  }
}
