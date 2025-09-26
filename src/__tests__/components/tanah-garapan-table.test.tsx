import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TanahGarapanTable } from '@/components/tanah-garapan/tanah-garapan-table'
import { deleteTanahGarapanEntry } from '@/lib/server-actions/tanah-garapan'

// Mock the server actions
jest.mock('@/lib/server-actions/tanah-garapan')

const mockDeleteTanahGarapanEntry = deleteTanahGarapanEntry as jest.MockedFunction<typeof deleteTanahGarapanEntry>

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  value: jest.fn(() => true),
})

// Mock window.open
Object.defineProperty(window, 'open', {
  value: jest.fn(),
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
    expect(screen.getByText('1,000')).toBeInTheDocument()

    expect(screen.getByText('Desa Test 2')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('C-002')).toBeInTheDocument()
    expect(screen.getByText('SKG-002')).toBeInTheDocument()
    expect(screen.getByText('2,000')).toBeInTheDocument()
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

    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i })
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
    mockDeleteTanahGarapanEntry.mockResolvedValue({
      success: true,
      message: 'Entry deleted successfully'
    })

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
      expect(mockDeleteTanahGarapanEntry).toHaveBeenCalledWith('1')
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

  it('handles file preview action', async () => {
    const user = userEvent.setup()
    
    render(
      <TanahGarapanTable
        entries={mockEntries}
        onRefresh={mockOnRefresh}
        selectedIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    // Click on the eye icon for file preview
    const previewButtons = screen.getAllByRole('button', { name: /preview/i })
    await user.click(previewButtons[0])

    // Should open file preview dialog
    expect(screen.getByText('File Preview')).toBeInTheDocument()
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

    // Click on the file icon to open file
    const fileButtons = screen.getAllByRole('button', { name: /file/i })
    await user.click(fileButtons[0])

    expect(window.open).toHaveBeenCalledWith('http://example.com/file1.pdf', '_blank')
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
    mockDeleteTanahGarapanEntry.mockResolvedValue({
      success: false,
      error: 'Delete failed'
    })

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
      expect(screen.getByText('Delete failed')).toBeInTheDocument()
    })

    expect(mockOnRefresh).not.toHaveBeenCalled()
  })
})
