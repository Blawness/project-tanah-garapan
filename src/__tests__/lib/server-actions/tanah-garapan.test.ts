import { 
  getTanahGarapanEntries,
  getTanahGarapanEntryById,
  addTanahGarapanEntry,
  updateTanahGarapanEntry,
  deleteTanahGarapanEntry,
  searchTanahGarapanEntries,
  advancedSearchTanahGarapanEntries,
  exportTanahGarapanToCSV
} from '@/lib/server-actions/tanah-garapan'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { canManageData } from '@/lib/auth'

// Mock dependencies
jest.mock('@/lib/prisma')
jest.mock('next-auth')
jest.mock('@/lib/auth')
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockCanManageData = canManageData as jest.MockedFunction<typeof canManageData>

describe('Tanah Garapan Server Actions', () => {
  const mockSession = {
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'ADMIN',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServerSession.mockResolvedValue(mockSession)
    mockCanManageData.mockReturnValue(true)
  })

  describe('getTanahGarapanEntries', () => {
    it('returns entries successfully', async () => {
      const mockEntries = [
        {
          id: '1',
          letakTanah: 'Desa Test',
          namaPemegangHak: 'John Doe',
          letterC: 'C-001',
          nomorSuratKeteranganGarapan: 'SKG-001',
          luas: 1000,
          file_url: null,
          keterangan: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.tanahGarapanEntry.findMany.mockResolvedValue(mockEntries)
      mockPrisma.tanahGarapanEntry.count.mockResolvedValue(1)

      const result = await getTanahGarapanEntries(1, 20)

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        data: mockEntries,
        total: 1,
        totalPages: 1,
        currentPage: 1,
        pageSize: 20,
      })
    })

    it('returns unauthorized when no session', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const result = await getTanahGarapanEntries()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('handles database error', async () => {
      mockPrisma.tanahGarapanEntry.findMany.mockRejectedValue(new Error('Database error'))

      const result = await getTanahGarapanEntries()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to fetch entries')
    })
  })

  describe('getTanahGarapanEntryById', () => {
    it('returns entry successfully', async () => {
      const mockEntry = {
        id: '1',
        letakTanah: 'Desa Test',
        namaPemegangHak: 'John Doe',
        letterC: 'C-001',
        nomorSuratKeteranganGarapan: 'SKG-001',
        luas: 1000,
        file_url: null,
        keterangan: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.tanahGarapanEntry.findUnique.mockResolvedValue(mockEntry)

      const result = await getTanahGarapanEntryById('1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockEntry)
    })

    it('returns not found when entry does not exist', async () => {
      mockPrisma.tanahGarapanEntry.findUnique.mockResolvedValue(null)

      const result = await getTanahGarapanEntryById('1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Entry not found')
    })
  })

  describe('addTanahGarapanEntry', () => {
    it('creates entry successfully', async () => {
      const mockData = {
        letakTanah: 'Desa Test',
        namaPemegangHak: 'John Doe',
        letterC: 'C-001',
        nomorSuratKeteranganGarapan: 'SKG-001',
        luas: 1000,
        file_url: null,
        keterangan: null,
      }

      const mockCreatedEntry = {
        id: '1',
        ...mockData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.tanahGarapanEntry.create.mockResolvedValue(mockCreatedEntry)

      const result = await addTanahGarapanEntry(mockData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockCreatedEntry)
      expect(result.message).toBe('Entry created successfully')
    })

    it('returns unauthorized when user cannot manage data', async () => {
      mockCanManageData.mockReturnValue(false)

      const result = await addTanahGarapanEntry({} as never)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('handles validation error', async () => {
      const invalidData = {
        letakTanah: '',
        namaPemegangHak: '',
        letterC: '',
        nomorSuratKeteranganGarapan: '',
        luas: -1,
        file_url: null,
        keterangan: null,
      }

      const result = await addTanahGarapanEntry(invalidData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('required')
    })
  })

  describe('updateTanahGarapanEntry', () => {
    it('updates entry successfully', async () => {
      const mockData = {
        letakTanah: 'Desa Updated',
        namaPemegangHak: 'John Doe',
        letterC: 'C-001',
        nomorSuratKeteranganGarapan: 'SKG-001',
        luas: 1000,
        file_url: null,
        keterangan: null,
      }

      const mockExistingEntry = {
        id: '1',
        letakTanah: 'Desa Test',
        namaPemegangHak: 'John Doe',
        letterC: 'C-001',
        nomorSuratKeteranganGarapan: 'SKG-001',
        luas: 1000,
        file_url: null,
        keterangan: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockUpdatedEntry = {
        id: '1',
        ...mockData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.tanahGarapanEntry.findUnique.mockResolvedValue(mockExistingEntry)
      mockPrisma.tanahGarapanEntry.update.mockResolvedValue(mockUpdatedEntry)

      const result = await updateTanahGarapanEntry('1', mockData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUpdatedEntry)
      expect(result.message).toBe('Entry updated successfully')
    })

    it('returns not found when entry does not exist', async () => {
      const validData = {
        letakTanah: 'Desa Test',
        namaPemegangHak: 'John Doe',
        letterC: 'C-001',
        nomorSuratKeteranganGarapan: 'SKG-001',
        luas: 1000,
        file_url: null,
        keterangan: null,
      }

      mockPrisma.tanahGarapanEntry.findUnique.mockResolvedValue(null)

      const result = await updateTanahGarapanEntry('1', validData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Entry not found')
    })
  })

  describe('deleteTanahGarapanEntry', () => {
    it('deletes entry successfully', async () => {
      const mockExistingEntry = {
        id: '1',
        letakTanah: 'Desa Test',
        namaPemegangHak: 'John Doe',
        letterC: 'C-001',
        nomorSuratKeteranganGarapan: 'SKG-001',
        luas: 1000,
        file_url: null,
        keterangan: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.tanahGarapanEntry.findUnique.mockResolvedValue(mockExistingEntry)
      mockPrisma.tanahGarapanEntry.delete.mockResolvedValue(mockExistingEntry)

      const result = await deleteTanahGarapanEntry('1')

      expect(result.success).toBe(true)
      expect(result.message).toBe('Entry deleted successfully')
    })

    it('returns not found when entry does not exist', async () => {
      mockPrisma.tanahGarapanEntry.findUnique.mockResolvedValue(null)

      const result = await deleteTanahGarapanEntry('1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Entry not found')
    })
  })

  describe('searchTanahGarapanEntries', () => {
    it('searches entries successfully', async () => {
      const mockEntries = [
        {
          id: '1',
          letakTanah: 'Desa Test',
          namaPemegangHak: 'John Doe',
          letterC: 'C-001',
          nomorSuratKeteranganGarapan: 'SKG-001',
          luas: 1000,
          file_url: null,
          keterangan: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.tanahGarapanEntry.findMany.mockResolvedValue(mockEntries)

      const result = await searchTanahGarapanEntries('test')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockEntries)
    })
  })

  describe('advancedSearchTanahGarapanEntries', () => {
    it('performs advanced search successfully', async () => {
      const mockEntries = [
        {
          id: '1',
          letakTanah: 'Desa Test',
          namaPemegangHak: 'John Doe',
          letterC: 'C-001',
          nomorSuratKeteranganGarapan: 'SKG-001',
          luas: 1000,
          file_url: null,
          keterangan: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.tanahGarapanEntry.findMany.mockResolvedValue(mockEntries)

      const filters = {
        query: 'test',
        location: 'Desa Test',
        minLuas: '500',
        maxLuas: '1500',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
      }

      const result = await advancedSearchTanahGarapanEntries(filters)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockEntries)
    })
  })

  describe('exportTanahGarapanToCSV', () => {
    it('exports data to CSV successfully', async () => {
      const mockEntries = [
        {
          id: '1',
          letakTanah: 'Desa Test',
          namaPemegangHak: 'John Doe',
          letterC: 'C-001',
          nomorSuratKeteranganGarapan: 'SKG-001',
          luas: 1000,
          file_url: null,
          keterangan: null,
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z'),
        },
      ]

      mockPrisma.tanahGarapanEntry.findMany.mockResolvedValue(mockEntries)

      const result = await exportTanahGarapanToCSV()

      expect(result.success).toBe(true)
      expect(result.data).toContain('ID,Letak Tanah,Nama Pemegang Hak')
      expect(result.data).toContain('1,"Desa Test","John Doe"')
    })

    it('returns unauthorized when user cannot manage data', async () => {
      mockCanManageData.mockReturnValue(false)

      const result = await exportTanahGarapanToCSV()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })
  })
})
