import '@testing-library/jest-dom'

// Mock TextEncoder and other Node.js APIs
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js server components and APIs
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
  headers: jest.fn(() => ({
    get: jest.fn(),
  })),
}))

// Mock Next.js session (server-side)
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
  NextAuth: jest.fn(),
  __esModule: true,
}))

jest.mock('next-auth/next', () => ({
  NextAuth: jest.fn(),
  __esModule: true,
}))

// Mock Next.js session (client-side)
jest.mock('next-auth/react', () => ({
  useSession() {
    return {
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'ADMIN',
        },
      },
      status: 'authenticated',
    }
  },
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    tanahGarapanEntry: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    pembelianSertifikat: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    pembayaranPembelian: {
      findMany: jest.fn(),
      create: jest.fn(),
      groupBy: jest.fn(),
    },
    proyekPembangunan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    activityLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
  __esModule: true,
}))

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password')),
  compare: jest.fn(() => Promise.resolve(true)),
  __esModule: true,
}))

// Mock file upload and fetch
global.fetch = jest.fn(() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({}),
  blob: () => Promise.resolve(new Blob()),
}))

// Mock FormData
global.FormData = class FormData {
  append() {}
  get() {}
  has() {}
}

// Mock window APIs
Object.defineProperty(window, 'print', {
  value: jest.fn(),
})

Object.defineProperty(window, 'open', {
  value: jest.fn(),
})

Object.defineProperty(URL, 'createObjectURL', {
  value: jest.fn(() => 'mocked-url'),
})

Object.defineProperty(URL, 'revokeObjectURL', {
  value: jest.fn(),
})

Object.defineProperty(window, 'confirm', {
  value: jest.fn(() => true),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
})

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
})

// Mock HTMLElement.scrollIntoView
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: jest.fn(),
})

// Mock HTMLElement.offsetHeight and offsetWidth
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  value: 100,
})

Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  value: 100,
})

// Mock HTMLElement.getBoundingClientRect
Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  value: () => ({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  }),
})

// Mock crypto for secure random values
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr) => arr.map(() => Math.floor(Math.random() * 256)),
    randomUUID: () => 'mock-uuid-' + Math.random().toString(36).substr(2, 9),
  },
})

// Mock process.env for tests
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'