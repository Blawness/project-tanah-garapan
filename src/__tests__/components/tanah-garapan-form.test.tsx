import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TanahGarapanForm } from '@/components/tanah-garapan/tanah-garapan-form'
import { toast } from 'sonner'

// Mock fetch globally
global.fetch = jest.fn()
jest.mock('sonner')

const mockFetch = fetch as jest.MockedFunction<typeof fetch>
const mockToastError = toast.error as jest.MockedFunction<typeof toast.error>

describe('TanahGarapanForm', () => {
  const mockOnSuccess = jest.fn()
  const mockOnOpenChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders create form correctly', () => {
    render(
      <TanahGarapanForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByText('Tambah Tanah Garapan')).toBeInTheDocument()
    expect(screen.getByLabelText('Letak Tanah')).toBeInTheDocument()
    expect(screen.getByLabelText('Nama Pemegang Hak')).toBeInTheDocument()
    expect(screen.getByLabelText('Letter C')).toBeInTheDocument()
    expect(screen.getByLabelText('No. Surat Keterangan Garapan')).toBeInTheDocument()
    expect(screen.getByLabelText('Luas (m²)')).toBeInTheDocument()
    expect(screen.getByText('Simpan')).toBeInTheDocument()
  })

  it('renders edit form correctly', () => {
    const mockEntry = {
      id: '1',
      letakTanah: 'Desa Test',
      namaPemegangHak: 'John Doe',
      letterC: 'C-001',
      nomorSuratKeteranganGarapan: 'SKG-001',
      luas: 1000,
      file_url: null,
      keterangan: 'Test keterangan',
    }

    render(
      <TanahGarapanForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        entry={mockEntry}
      />
    )

    expect(screen.getByText('Edit Tanah Garapan')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Desa Test')).toBeInTheDocument()
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('C-001')).toBeInTheDocument()
    expect(screen.getByDisplayValue('SKG-001')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument()
    expect(screen.getByText('Update')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    
    render(
      <TanahGarapanForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    const submitButton = screen.getByText('Simpan')
    await user.click(submitButton)

    expect(screen.getByText('Letak Tanah is required')).toBeInTheDocument()
    expect(screen.getByText('Nama Pemegang Hak is required')).toBeInTheDocument()
    expect(screen.getByText('Letter C is required')).toBeInTheDocument()
    expect(screen.getByText('Nomor Surat Keterangan Garapan is required')).toBeInTheDocument()
    expect(screen.getByText('Luas must be a positive number')).toBeInTheDocument()
  })

  it('submits form with valid data for create', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: '1', letakTanah: 'Desa Test' },
        message: 'Entry created successfully'
      })
    } as Response)

    render(
      <TanahGarapanForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    await user.type(screen.getByLabelText('Letak Tanah'), 'Desa Test')
    await user.type(screen.getByLabelText('Nama Pemegang Hak'), 'John Doe')
    await user.type(screen.getByLabelText('Letter C'), 'C-001')
    await user.type(screen.getByLabelText('No. Surat Keterangan Garapan'), 'SKG-001')
    await user.type(screen.getByLabelText('Luas (m²)'), '1000')

    const submitButton = screen.getByText('Simpan')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/tanah-garapan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          letakTanah: 'Desa Test',
          namaPemegangHak: 'John Doe',
          letterC: 'C-001',
          nomorSuratKeteranganGarapan: 'SKG-001',
          luas: 1000,
          file_url: null,
          keterangan: null
        })
      })
    })

    expect(mockOnSuccess).toHaveBeenCalled()
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('submits form with valid data for edit', async () => {
    const user = userEvent.setup()
    const mockEntry = {
      id: '1',
      letakTanah: 'Desa Test',
      namaPemegangHak: 'John Doe',
      letterC: 'C-001',
      nomorSuratKeteranganGarapan: 'SKG-001',
      luas: 1000,
      file_url: null,
      keterangan: null,
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: '1' },
        message: 'Entry updated successfully'
      })
    } as Response)

    render(
      <TanahGarapanForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        entry={mockEntry}
      />
    )

    await user.clear(screen.getByLabelText('Letak Tanah'))
    await user.type(screen.getByLabelText('Letak Tanah'), 'Desa Updated')

    const submitButton = screen.getByText('Update')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/tanah-garapan', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: '1',
          letakTanah: 'Desa Updated',
          namaPemegangHak: 'John Doe',
          letterC: 'C-001',
          nomorSuratKeteranganGarapan: 'SKG-001',
          luas: 1000,
          file_url: null,
          keterangan: null,
        })
      })
    })

    expect(mockOnSuccess).toHaveBeenCalled()
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('handles form submission error', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: 'Server error'
      })
    } as Response)

    render(
      <TanahGarapanForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    await user.type(screen.getByLabelText('Letak Tanah'), 'Desa Test')
    await user.type(screen.getByLabelText('Nama Pemegang Hak'), 'John Doe')
    await user.type(screen.getByLabelText('Letter C'), 'C-001')
    await user.type(screen.getByLabelText('No. Surat Keterangan Garapan'), 'SKG-001')
    await user.type(screen.getByLabelText('Luas (m²)'), '1000')

    const submitButton = screen.getByText('Simpan')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/tanah-garapan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          letakTanah: 'Desa Test',
          namaPemegangHak: 'John Doe',
          letterC: 'C-001',
          nomorSuratKeteranganGarapan: 'SKG-001',
          luas: 1000,
          file_url: null,
          keterangan: null
        })
      })
    })

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Server error')
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
    expect(mockOnOpenChange).not.toHaveBeenCalledWith(false)
  })

  it('closes form when cancel button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <TanahGarapanForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    const cancelButton = screen.getByText('Batal')
    await user.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })
})
