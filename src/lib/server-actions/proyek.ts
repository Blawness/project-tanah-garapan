'use server'

// import { prisma } from '@/lib/prisma'
// import { revalidatePath } from 'next/cache' // Temporarily removed for client compatibility
// import { getServerSession } from 'next-auth'
// import { authOptions, canManageData } from '@/lib/auth'
// import { logActivity } from './activity'

// Utility function to convert Decimal objects to numbers
function serializeDecimalObjects(obj: any): any {
  if (obj === null || obj === undefined) return obj

  if (typeof obj !== 'object') {
    return obj
  }

  // Handle Prisma Decimal objects
  if (obj.constructor && obj.constructor.name === 'Decimal') {
    return Number(obj)
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString()
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => serializeDecimalObjects(item))
  }

  // Handle plain objects recursively
  const serialized: Record<string, any> = {}
  for (const key in obj) {
    // Ensure it's an own property to avoid prototype chain issues
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      // Only serialize if it's not a function
      if (typeof value !== 'function') {
        serialized[key] = serializeDecimalObjects(value)
      }
    }
  }
  return serialized
}

export interface ProyekFormData {
  namaProyek: string
  lokasiProyek: string
  deskripsi?: string
  statusProyek: 'PLANNING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  tanggalMulai?: string
  tanggalSelesai?: string
  budgetTotal: number
}

export async function getProyekPembangunan(page: number = 1, pageSize: number = 20, search?: string, statusFilter?: string) {
  try {
    // Temporarily disable authentication for development
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return { success: false, error: 'Unauthorized' }
    // }

    const skip = (page - 1) * pageSize

    // Build where clause
    const where: Record<string, any> = {}

    if (search) {
      where.OR = [
        { namaProyek: { contains: search, mode: 'insensitive' } },
        { lokasiProyek: { contains: search, mode: 'insensitive' } },
        { deskripsi: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (statusFilter && statusFilter !== 'ALL') {
      where.statusProyek = statusFilter
    }

    const [proyek, total] = await Promise.all([
      prisma.proyekPembangunan.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          pembelianSertifikat: {
            include: {
              tanahGarapan: true
            }
          }
        }
      }),
      prisma.proyekPembangunan.count({ where })
    ])

    // Convert Decimal objects to numbers for Client Component compatibility
    const serializedProyek = serializeDecimalObjects(proyek)

    // Ensure budget values are valid numbers
    serializedProyek.forEach((item: any) => {
      if (item.budgetTotal === null || item.budgetTotal === undefined || isNaN(Number(item.budgetTotal))) {
        item.budgetTotal = 0
      }
      if (item.budgetTerpakai === null || item.budgetTerpakai === undefined || isNaN(Number(item.budgetTerpakai))) {
        item.budgetTerpakai = 0
      }
    })

    const totalPages = Math.ceil(total / pageSize)

    return {
      success: true,
      data: {
        data: serializedProyek,
        total,
        totalPages,
        currentPage: page,
        pageSize
      }
    }
  } catch (error) {
    console.error('Error fetching proyek pembangunan:', error)
    return { success: false, error: 'Failed to fetch proyek' }
  }
}

export async function getProyekPembangunanById(id: string) {
  try {
    // Temporarily disable authentication for development
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return { success: false, error: 'Unauthorized' }
    // }

    const proyek = await prisma.proyekPembangunan.findUnique({
      where: { id },
      include: {
        pembelianSertifikat: {
          include: {
            tanahGarapan: true,
            pembayaran: true
          }
        }
      }
    })

    if (!proyek) {
      return { success: false, error: 'Proyek not found' }
    }

    // Convert Decimal objects to numbers for Client Component compatibility
    const serializedProyek = serializeDecimalObjects(proyek)

    // Ensure budget values are valid numbers
    if (serializedProyek.budgetTotal === null || serializedProyek.budgetTotal === undefined || isNaN(Number(serializedProyek.budgetTotal))) {
      serializedProyek.budgetTotal = 0
    }
    if (serializedProyek.budgetTerpakai === null || serializedProyek.budgetTerpakai === undefined || isNaN(Number(serializedProyek.budgetTerpakai))) {
      serializedProyek.budgetTerpakai = 0
    }

    return { success: true, data: serializedProyek }
  } catch (error) {
    console.error('Error fetching proyek by id:', error)
    return { success: false, error: 'Failed to fetch proyek' }
  }
}

export async function addProyekPembangunan(data: ProyekFormData) {
  try {
    // Temporarily disable authentication for development
    // const session = await getServerSession(authOptions)
    // if (!session || !canManageData(session.user.role)) {
    //   return { success: false, error: 'Unauthorized' }
    // }

    const proyek = await prisma.proyekPembangunan.create({
      data: {
        namaProyek: data.namaProyek,
        lokasiProyek: data.lokasiProyek,
        deskripsi: data.deskripsi,
        statusProyek: data.statusProyek,
        tanggalMulai: data.tanggalMulai ? new Date(data.tanggalMulai) : null,
        tanggalSelesai: data.tanggalSelesai ? new Date(data.tanggalSelesai) : null,
        budgetTotal: data.budgetTotal,
        createdBy: session.user.name
      }
    })

    // Convert Decimal objects to numbers for Client Component compatibility
    const serializedProyek = serializeDecimalObjects(proyek)

    await logActivity(
      session.user.name,
      'CREATE_PROYEK',
      `Created new proyek: ${proyek.namaProyek}`,
      serializedProyek
    )

    // revalidatePath('/proyek') // Temporarily disabled for client compatibility
    return { success: true, data: serializedProyek, message: 'Proyek created successfully' }
  } catch (error) {
    console.error('Error creating proyek:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create proyek' }
  }
}

export async function updateProyekPembangunan(id: string, data: ProyekFormData) {
  try {
    // Temporarily disable authentication for development
    // const session = await getServerSession(authOptions)
    // if (!session || !canManageData(session.user.role)) {
    //   return { success: false, error: 'Unauthorized' }
    // }

    const proyek = await prisma.proyekPembangunan.update({
      where: { id },
      data: {
        namaProyek: data.namaProyek,
        lokasiProyek: data.lokasiProyek,
        deskripsi: data.deskripsi,
        statusProyek: data.statusProyek,
        tanggalMulai: data.tanggalMulai ? new Date(data.tanggalMulai) : null,
        tanggalSelesai: data.tanggalSelesai ? new Date(data.tanggalSelesai) : null,
        budgetTotal: data.budgetTotal
      }
    })

    // Convert Decimal objects to numbers for Client Component compatibility
    const serializedProyek = serializeDecimalObjects(proyek)

    await logActivity(
      session.user.name,
      'UPDATE_PROYEK',
      `Updated proyek: ${proyek.namaProyek}`,
      serializedProyek
    )

    // revalidatePath('/proyek') // Temporarily disabled for client compatibility
    return { success: true, data: serializedProyek, message: 'Proyek updated successfully' }
  } catch (error) {
    console.error('Error updating proyek:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to update proyek' }
  }
}

export async function deleteProyekPembangunan(id: string) {
  try {
    // Temporarily disable authentication for development
    // const session = await getServerSession(authOptions)
    // if (!session || !canManageData(session.user.role)) {
    //   return { success: false, error: 'Unauthorized' }
    // }

    const proyek = await prisma.proyekPembangunan.findUnique({
      where: { id },
      include: {
        pembelianSertifikat: true
      }
    })

    if (!proyek) {
      return { success: false, error: 'Proyek not found' }
    }

    if (proyek.pembelianSertifikat.length > 0) {
      return { success: false, error: 'Cannot delete proyek with existing pembelian' }
    }

    await prisma.proyekPembangunan.delete({
      where: { id }
    })

    await logActivity(
      session.user.name,
      'DELETE_PROYEK',
      `Deleted proyek: ${proyek.namaProyek}`,
      proyek
    )

    // revalidatePath('/proyek') // Temporarily disabled for client compatibility
    return { success: true, message: 'Proyek deleted successfully' }
  } catch (error) {
    console.error('Error deleting proyek:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to delete proyek' }
  }
}

export async function getProyekStats() {
  try {
    // Temporarily disable authentication for development
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return { success: false, error: 'Unauthorized' }
    // }

    const [totalProyek, totalBudgetResult, totalTerpakaiResult, proyekByStatus] = await Promise.all([
      prisma.proyekPembangunan.count(),
      prisma.proyekPembangunan.aggregate({
        _sum: { budgetTotal: true }
      }),
      prisma.proyekPembangunan.aggregate({
        _sum: { budgetTerpakai: true }
      }),
      prisma.proyekPembangunan.groupBy({
        by: ['statusProyek'],
        _count: { id: true }
      })
    ])

    // Handle cases where _sum might be null if no records exist
    const totalBudget = totalBudgetResult._sum.budgetTotal ?? 0;
    const totalTerpakai = totalTerpakaiResult._sum.budgetTerpakai ?? 0;

    console.log('Raw totalBudget result:', totalBudgetResult);
    console.log('Raw totalTerpakai result:', totalTerpakaiResult);
    console.log('Raw totalBudget value:', totalBudget);
    console.log('Raw totalTerpakai value:', totalTerpakai);

    const serializedTotalBudget = serializeDecimalObjects(totalBudget)
    const serializedTotalTerpakai = serializeDecimalObjects(totalTerpakai)

    console.log('Serialized totalBudget:', serializedTotalBudget);
    console.log('Serialized totalTerpakai:', serializedTotalTerpakai);

    return {
      success: true,
      data: {
        totalProyek,
        totalBudget: serializedTotalBudget,
        totalTerpakai: serializedTotalTerpakai,
        proyekByStatus: serializeDecimalObjects(proyekByStatus.reduce((acc, item) => {
          acc[item.statusProyek] = item._count.id
          return acc
        }, {} as Record<string, number>))
      }
    }
  } catch (error) {
    console.error('Error fetching proyek stats:', error)
    return { success: false, error: 'Failed to fetch proyek stats' }
  }
}

export async function exportProyekToCSV(search?: string, statusFilter?: string) {
  try {
    // Temporarily disable authentication for development
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return { success: false, error: 'Unauthorized' }
    // }

    // Build where clause
    const where: Record<string, any> = {}

    if (search) {
      where.OR = [
        { namaProyek: { contains: search, mode: 'insensitive' } },
        { lokasiProyek: { contains: search, mode: 'insensitive' } },
        { deskripsi: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (statusFilter && statusFilter !== 'ALL') {
      where.statusProyek = statusFilter
    }

    const proyek = await prisma.proyekPembangunan.findMany({
      where,
      include: {
        pembelianSertifikat: {
          include: {
            tanahGarapan: true,
            pembayaran: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Convert to CSV format
    const csvHeaders = [
      'ID',
      'Nama Proyek',
      'Lokasi Proyek',
      'Deskripsi',
      'Status Proyek',
      'Tanggal Mulai',
      'Tanggal Selesai',
      'Budget Total',
      'Budget Terpakai',
      'Jumlah Pembelian',
      'Total Pembelian',
      'Dibuat Oleh',
      'Tanggal Dibuat'
    ]

    // Convert Decimal objects to numbers for CSV
    const serializedProyek = serializeDecimalObjects(proyek)

    // Ensure budget values are valid numbers
    serializedProyek.forEach((item: any) => {
      if (item.budgetTotal === null || item.budgetTotal === undefined || isNaN(Number(item.budgetTotal))) {
        item.budgetTotal = 0
      }
      if (item.budgetTerpakai === null || item.budgetTerpakai === undefined || isNaN(Number(item.budgetTerpakai))) {
        item.budgetTerpakai = 0
      }
    })

    const csvData = serializedProyek.map(item => [
      item.id,
      `"${item.namaProyek}"`,
      `"${item.lokasiProyek}"`,
      `"${item.deskripsi || ''}"`,
      item.statusProyek,
      item.tanggalMulai ? item.tanggalMulai.toISOString().split('T')[0] : '',
      item.tanggalSelesai ? item.tanggalSelesai.toISOString().split('T')[0] : '',
      item.budgetTotal,
      item.budgetTerpakai,
      item.pembelianSertifikat.length,
      item.pembelianSertifikat.reduce((sum, pembelian) => sum + Number(pembelian.hargaBeli), 0),
      item.createdBy,
      item.createdAt.toISOString().split('T')[0]
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n')

    return {
      success: true,
      data: csvContent,
      filename: `proyek-pembangunan-${new Date().toISOString().split('T')[0]}.csv`
    }
  } catch (error) {
    console.error('Error exporting proyek to CSV:', error)
    return { success: false, error: 'Failed to export proyek data' }
  }
}
