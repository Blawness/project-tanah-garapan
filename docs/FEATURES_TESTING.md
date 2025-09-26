# 🧪 Testing System & Quality Assurance

## Overview
Sistem testing yang komprehensif menggunakan Jest dan React Testing Library untuk memastikan kualitas kode dan fungsionalitas aplikasi.

## 🎯 Fitur Utama

### 1. **Unit Testing**
- **Component Testing**: Test individual React components
- **Server Action Testing**: Test server actions dan API functions
- **Utility Testing**: Test helper functions dan utilities
- **Hook Testing**: Test custom React hooks

### 2. **Integration Testing**
- **API Integration**: Test API endpoints dan server actions
- **Database Integration**: Test database operations
- **Authentication Integration**: Test auth flow
- **File Upload Integration**: Test file operations

### 3. **End-to-End Testing**
- **User Workflows**: Test complete user journeys
- **Cross-browser Testing**: Test across different browsers
- **Performance Testing**: Test application performance
- **Accessibility Testing**: Test accessibility compliance

## 🛠️ Technical Implementation

### Testing Configuration
```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

### Test Setup
```javascript
// jest.setup.js
import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
      },
    },
    status: 'authenticated',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    tanahGarapanEntry: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    activityLog: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
}))

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
```

## 📱 Component Testing

### Tanah Garapan Form Testing
```typescript
// src/__tests__/components/tanah-garapan-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TanahGarapanForm } from '@/components/tanah-garapan/tanah-garapan-form'
import { addTanahGarapanEntry } from '@/lib/server-actions/tanah-garapan'

// Mock server action
jest.mock('@/lib/server-actions/tanah-garapan', () => ({
  addTanahGarapanEntry: jest.fn(),
}))

const mockAddEntry = addTanahGarapanEntry as jest.MockedFunction<typeof addTanahGarapanEntry>

describe('TanahGarapanForm', () => {
  const mockOnSuccess = jest.fn()
  const mockOnOpenChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    render(
      <TanahGarapanForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByLabelText(/letak tanah/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nama pemegang hak/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/letter c/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nomor surat keterangan garapan/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/luas/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/keterangan/i)).toBeInTheDocument()
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

    const submitButton = screen.getByRole('button', { name: /create/i })
    await user.click(submitButton)

    expect(screen.getByText(/letak tanah is required/i)).toBeInTheDocument()
    expect(screen.getByText(/nama pemegang hak is required/i)).toBeInTheDocument()
    expect(screen.getByText(/letter c is required/i)).toBeInTheDocument()
    expect(screen.getByText(/nomor surat keterangan garapan is required/i)).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    mockAddEntry.mockResolvedValue({
      success: true,
      data: { id: '1', letakTanah: 'Test Location' },
      message: 'Entry created successfully'
    })

    render(
      <TanahGarapanForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    // Fill form
    await user.type(screen.getByLabelText(/letak tanah/i), 'Test Location')
    await user.type(screen.getByLabelText(/nama pemegang hak/i), 'Test Owner')
    await user.type(screen.getByLabelText(/letter c/i), 'C-123456')
    await user.type(screen.getByLabelText(/nomor surat keterangan garapan/i), 'SKG-789012')
    await user.type(screen.getByLabelText(/luas/i), '5000')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockAddEntry).toHaveBeenCalledWith({
        letakTanah: 'Test Location',
        namaPemegangHak: 'Test Owner',
        letterC: 'C-123456',
        nomorSuratKeteranganGarapan: 'SKG-789012',
        luas: 5000,
        file_url: '',
        keterangan: ''
      })
    })

    expect(mockOnSuccess).toHaveBeenCalled()
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('handles server errors', async () => {
    const user = userEvent.setup()
    mockAddEntry.mockResolvedValue({
      success: false,
      error: 'Server error'
    })

    render(
      <TanahGarapanForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    // Fill and submit form
    await user.type(screen.getByLabelText(/letak tanah/i), 'Test Location')
    await user.type(screen.getByLabelText(/nama pemegang hak/i), 'Test Owner')
    await user.type(screen.getByLabelText(/letter c/i), 'C-123456')
    await user.type(screen.getByLabelText(/nomor surat keterangan garapan/i), 'SKG-789012')
    await user.type(screen.getByLabelText(/luas/i), '5000')

    const submitButton = screen.getByRole('button', { name: /create/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument()
    })
  })
})
```

### Tanah Garapan Table Testing
```typescript
// src/__tests__/components/tanah-garapan-table.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TanahGarapanTable } from '@/components/tanah-garapan/tanah-garapan-table'
import { deleteTanahGarapanEntry } from '@/lib/server-actions/tanah-garapan'

jest.mock('@/lib/server-actions/tanah-garapan', () => ({
  deleteTanahGarapanEntry: jest.fn(),
}))

const mockDeleteEntry = deleteTanahGarapanEntry as jest.MockedFunction<typeof deleteTanahGarapanEntry>

describe('TanahGarapanTable', () => {
  const mockEntries = [
    {
      id: '1',
      letakTanah: 'Desa ABC',
      namaPemegangHak: 'John Doe',
      letterC: 'C-123456',
      nomorSuratKeteranganGarapan: 'SKG-789012',
      luas: 5000,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      letakTanah: 'Desa XYZ',
      namaPemegangHak: 'Jane Smith',
      letterC: 'C-789012',
      nomorSuratKeteranganGarapan: 'SKG-345678',
      luas: 3000,
      createdAt: '2024-01-02T00:00:00Z'
    }
  ]

  const mockProps = {
    entries: mockEntries,
    onRefresh: jest.fn(),
    selectedIds: [],
    onSelectionChange: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders table with data', () => {
    render(<TanahGarapanTable {...mockProps} />)

    expect(screen.getByText('Desa ABC')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Desa XYZ')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('handles row selection', async () => {
    const user = userEvent.setup()
    render(<TanahGarapanTable {...mockProps} />)

    const checkbox = screen.getByRole('checkbox', { name: /select row 1/i })
    await user.click(checkbox)

    expect(mockProps.onSelectionChange).toHaveBeenCalledWith(['1'])
  })

  it('handles delete action', async () => {
    const user = userEvent.setup()
    mockDeleteEntry.mockResolvedValue({
      success: true,
      message: 'Entry deleted successfully'
    })

    render(<TanahGarapanTable {...mockProps} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await user.click(deleteButton)

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockDeleteEntry).toHaveBeenCalledWith('1')
    })
  })

  it('handles edit action', async () => {
    const user = userEvent.setup()
    render(<TanahGarapanTable {...mockProps} />)

    const editButton = screen.getByRole('button', { name: /edit/i })
    await user.click(editButton)

    // Should open edit form (mocked)
    expect(screen.getByText(/edit entry/i)).toBeInTheDocument()
  })
})
```

## 🔧 Server Action Testing

### Tanah Garapan Actions Testing
```typescript
// src/__tests__/lib/server-actions/tanah-garapan.test.ts
import { getTanahGarapanEntries, addTanahGarapanEntry } from '@/lib/server-actions/tanah-garapan'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    tanahGarapanEntry: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
}))

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('Tanah Garapan Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTanahGarapanEntries', () => {
    it('returns entries for authenticated user', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'ADMIN' }
      } as any)

      const mockEntries = [
        { id: '1', letakTanah: 'Desa ABC', namaPemegangHak: 'John Doe' }
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
        pageSize: 20
      })
    })

    it('returns error for unauthenticated user', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const result = await getTanahGarapanEntries(1, 20)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })
  })

  describe('addTanahGarapanEntry', () => {
    it('creates entry for authorized user', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'ADMIN' }
      } as any)

      const mockEntry = {
        id: '1',
        letakTanah: 'Desa ABC',
        namaPemegangHak: 'John Doe',
        letterC: 'C-123456',
        nomorSuratKeteranganGarapan: 'SKG-789012',
        luas: 5000
      }

      mockPrisma.tanahGarapanEntry.create.mockResolvedValue(mockEntry as any)

      const formData = {
        letakTanah: 'Desa ABC',
        namaPemegangHak: 'John Doe',
        letterC: 'C-123456',
        nomorSuratKeteranganGarapan: 'SKG-789012',
        luas: 5000,
        file_url: '',
        keterangan: ''
      }

      const result = await addTanahGarapanEntry(formData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockEntry)
      expect(mockPrisma.tanahGarapanEntry.create).toHaveBeenCalledWith({
        data: formData
      })
    })

    it('returns error for unauthorized user', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'USER' }
      } as any)

      const formData = {
        letakTanah: 'Desa ABC',
        namaPemegangHak: 'John Doe',
        letterC: 'C-123456',
        nomorSuratKeteranganGarapan: 'SKG-789012',
        luas: 5000,
        file_url: '',
        keterangan: ''
      }

      const result = await addTanahGarapanEntry(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })
  })
})
```

## 🧪 Test Utilities

### Test Helpers
```typescript
// src/__tests__/utils/test-helpers.ts
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { SessionProvider } from 'next-auth/react'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider session={null}>
      {children}
    </SessionProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock data generators
export const createMockEntry = (overrides = {}) => ({
  id: '1',
  letakTanah: 'Desa ABC',
  namaPemegangHak: 'John Doe',
  letterC: 'C-123456',
  nomorSuratKeteranganGarapan: 'SKG-789012',
  luas: 5000,
  file_url: null,
  keterangan: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'ADMIN',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides
})

// Test data factories
export const createMockEntries = (count: number) => 
  Array.from({ length: count }, (_, i) => createMockEntry({
    id: `${i + 1}`,
    letakTanah: `Desa ${String.fromCharCode(65 + i)}`,
    namaPemegangHak: `User ${i + 1}`,
    letterC: `C-${String(i + 1).padStart(6, '0')}`,
    nomorSuratKeteranganGarapan: `SKG-${String(i + 1).padStart(6, '0')}`,
    luas: 1000 + (i * 500)
  }))
```

### Mock Functions
```typescript
// src/__tests__/mocks/server-actions.ts
export const mockServerActions = {
  getTanahGarapanEntries: jest.fn(),
  addTanahGarapanEntry: jest.fn(),
  updateTanahGarapanEntry: jest.fn(),
  deleteTanahGarapanEntry: jest.fn(),
  searchTanahGarapanEntries: jest.fn(),
  exportTanahGarapanToCSV: jest.fn(),
}

// Reset all mocks
export const resetAllMocks = () => {
  Object.values(mockServerActions).forEach(mock => mock.mockReset())
}
```

## 📊 Test Coverage

### Coverage Configuration
```javascript
// jest.config.js coverage settings
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/components/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/lib/server-actions/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
}
```

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## 🚀 Test Scripts

### Package.json Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:debug": "jest --detectOpenHandles --forceExit"
  }
}
```

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:ci
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

## 📈 Future Enhancements

### Planned Features
- **E2E Testing**: Playwright atau Cypress integration
- **Visual Testing**: Screenshot testing
- **Performance Testing**: Load testing
- **Accessibility Testing**: Automated a11y testing

### Advanced Features
- **Test Data Management**: Centralized test data
- **Parallel Testing**: Parallel test execution
- **Test Reporting**: Enhanced test reporting
- **Mutation Testing**: Code quality testing
