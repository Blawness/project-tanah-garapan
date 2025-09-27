import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TanahGarapanTable } from '@/components/tanah-garapan/tanah-garapan-table'
import { toast } from 'sonner'

// Mock fetch globally
global.fetch = jest.fn()
jest.mock('sonner')

// Mock FilePreview component to prevent render issues
jest.mock('@/components/shared/file-preview', () => ({
  FilePreview: () => null
}))

const mockFetch = fetch as jest.MockedFunction<typeof fetch>
const mockToastError = toast.error as jest.MockedFunction<typeof toast.error>

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  value: jest.fn(() => true),
})

// Mock window.open
const mockWindowOpen = jest.fn()
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
})

describe('TanahGarapanTable', () => {
  const mockEntries = [
    {
      id: '1',
      letakTanah: 'Desa Test 1',
      namaPemegangHak: 'John Doe',
      letterC: 'C-001',
      nomorSuratKeteranganGarapan: 'SKG-001',
      luas: 1000,
      file_url: 'http://example.com/file1.pdf',
      keterangan: 'Test keterangan 1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      letakTanah: 'Desa Test 2',
      namaPemegangHak: 'Jane Smith',
      letterC: 'C-002',
      nomorSuratKeteranganGarapan: 'SKG-002',
      luas: 2000,
      file_url: null,
      keterangan: null,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ]

  const mockOnRefresh = jest.fn()
  const mockOnSelectionChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders table with entries', () => {
    render(
      <TanahGarapanTable
        entries={mockEntries}
        onRefresh={mockOnRefresh}
        selectedIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    expect(screen.getByText('Desa Test 1')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('C-001')).toBeInTheDocument()
    expect(screen.getByText('SKG-001')).toBeInTheDocument()
    expect(screen.getByText('1.000')).toBeInTheDocument()

    expect(screen.getByText('Desa Test 2')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('C-002')).toBeInTheDocument()
    expect(screen.getByText('SKG-002')).toBeInTheDocument()
    expect(screen.getByText('2.000')).toBeInTheDocument()
  })

  it('renders empty state when no entries', () => {
    render(
      <TanahGarapanTable
        entries={[]}
        onRefresh={mockOnRefresh}
        selectedIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    expect(screen.getByText('Tidak ada data tanah garapan.')).toBeInTheDocument()
  })

  it('handles select all checkbox', async () => {
    const user = userEvent.setup()
    
    render(
      <TanahGarapanTable
        entries={mockEntries}
        onRefresh={mockOnRefresh}
        selectedIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    // Get the first checkbox which should be the select all checkbox
    const checkboxes = screen.getAllByRole('checkbox')
    const selectAllCheckbox = checkboxes[0]
    await user.click(selectAllCheckbox)

    expect(mockOnSelectionChange).toHaveBeenCalledWith(['1', '2'])
  })

  it('handles individual checkbox selection', async () => {
    const user = userEvent.setup()
    
    render(
      <TanahGarapanTable
        entries={mockEntries}
        onRefresh={mockOnRefresh}
        selectedIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    const checkboxes = screen.getAllByRole('checkbox')
    const firstCheckbox = checkboxes[1] // Skip the select all checkbox
    await user.click(firstCheckbox)

    expect(mockOnSelectionChange).toHaveBeenCalledWith(['1'])
  })

  it('handles deselecting individual checkbox', async () => {
    const user = userEvent.setup()
    
    render(
      <TanahGarapanTable
        entries={mockEntries}
        onRefresh={mockOnRefresh}
        selectedIds={['1']}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    const checkboxes = screen.getAllByRole('checkbox')
    const firstCheckbox = checkboxes[1] // Skip the select all checkbox
    await user.click(firstCheckbox)

    expect(mockOnSelectionChange).toHaveBeenCalledWith([])
  })

  it('handles delete action', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Entry deleted successfully'
      })
    } as Response)

    render(
      <TanahGarapanTable
        entries={mockEntries}
        onRefresh={mockOnRefresh}
        selectedIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    // Click on the dropdown menu for the first entry
    const dropdownButtons = screen.getAllByRole('button', { name: /open menu/i })
    await user.click(dropdownButtons[0])

    // Click on delete option
    const deleteButton = screen.getByText('Hapus')
    await user.click(deleteButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/tanah-garapan', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: '1' })
      })
    })

    expect(mockOnRefresh).toHaveBeenCalled()
  })

  it('handles print action', async () => {
    const user = userEvent.setup()
    
    render(
      <TanahGarapanTable
        entries={mockEntries}
        onRefresh={mockOnRefresh}
        selectedIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    // Click on the dropdown menu for the first entry
    const dropdownButtons = screen.getAllByRole('button', { name: /open menu/i })
    await user.click(dropdownButtons[0])

    // Click on print option
    const printButton = screen.getByText('Print')
    await user.click(printButton)

    expect(window.open).toHaveBeenCalledWith('/garapan/1/print', '_blank')
  })

  it('renders file preview and open buttons when file exists', () => {
    render(
      <TanahGarapanTable
        entries={mockEntries}
        onRefresh={mockOnRefresh}
        selectedIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    // First entry has file, should have buttons with SVG icons (Eye and FileText)
    const allButtons = screen.getAllByRole('button')
    const fileActionButtons = allButtons.filter(button =>
      button.querySelector('svg') !== null // Buttons with SVG icons (file action buttons)
    )

    // Should have at least 2 buttons with icons (Eye and FileText)
    expect(fileActionButtons.length).toBeGreaterThanOrEqual(2)
  })

  it('handles file open action', async () => {
    const user = userEvent.setup()

    render(
      <TanahGarapanTable
        entries={mockEntries}
        onRefresh={mockOnRefresh}
        selectedIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    // Click on the second button (FileText icon) to open file
    const allButtons = screen.getAllByRole('button')
    // Filter out the select all and dropdown menu buttons
    const fileButtons = allButtons.filter(button =>
      !button.hasAttribute('aria-checked') && // Not a checkbox
      !button.hasAttribute('aria-expanded')  // Not a dropdown trigger
    )
    // The FileText button should be the second one (after Eye button)
    const fileOpenButton = fileButtons[1]
    await user.click(fileOpenButton)

    expect(mockWindowOpen).toHaveBeenCalledWith('http://example.com/file1.pdf', '_blank')
  })

  it('shows file actions only when file exists', () => {
    render(
      <TanahGarapanTable
        entries={mockEntries}
        onRefresh={mockOnRefresh}
        selectedIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    // First entry has file, second doesn't
    const fileCells = screen.getAllByText(/file/i)
    expect(fileCells[0]).toBeInTheDocument() // Has file actions
    expect(screen.getByText('-')).toBeInTheDocument() // No file indicator
  })

  it('handles delete error', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: 'Failed to delete entry'
      })
    } as Response)

    render(
      <TanahGarapanTable
        entries={mockEntries}
        onRefresh={mockOnRefresh}
        selectedIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    // Click on the dropdown menu for the first entry
    const dropdownButtons = screen.getAllByRole('button', { name: /open menu/i })
    await user.click(dropdownButtons[0])

    // Click on delete option
    const deleteButton = screen.getByText('Hapus')
    await user.click(deleteButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/tanah-garapan', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: '1' })
      })
    })

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Failed to delete entry')
    })

    expect(mockOnRefresh).not.toHaveBeenCalled()
  })
})
