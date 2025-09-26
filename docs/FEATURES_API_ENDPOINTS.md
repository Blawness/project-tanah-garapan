# 🔌 API Endpoints & Server Actions

## Overview
Sistem API endpoints dan server actions yang komprehensif menggunakan Next.js App Router dengan Prisma ORM untuk semua operasi data.

## 🎯 Fitur Utama

### 1. **Server Actions**
- **Data Operations**: CRUD operations untuk semua models
- **Authentication**: User authentication dan authorization
- **File Operations**: File upload dan management
- **Export/Print**: Data export dan print functionality

### 2. **API Routes**
- **Authentication API**: NextAuth.js API routes
- **File API**: File upload dan download endpoints
- **Print API**: Print view endpoints
- **Health Check**: System health monitoring

### 3. **Error Handling**
- **Consistent Error Format**: Standardized error responses
- **Validation**: Input validation dan sanitization
- **Logging**: Comprehensive error logging
- **User Feedback**: User-friendly error messages

## 🛠️ Technical Implementation

### Server Actions Structure
```
src/lib/server-actions/
├── activity.ts          # Activity logging actions
├── pembelian.ts         # Pembelian operations
├── proyek.ts           # Proyek operations
├── tanah-garapan.ts    # Tanah garapan operations
└── users.ts            # User management actions
```

### API Routes Structure
```
src/app/api/
├── auth/
│   └── [...nextauth]/
│       └── route.ts    # NextAuth.js API
├── files/
│   └── [...path]/
│       └── route.ts    # File download API
└── upload/
    └── route.ts        # File upload API
```

## 📱 Server Actions

### Tanah Garapan Actions
```typescript
// Data retrieval
export async function getTanahGarapanEntries(
  page: number = 1, 
  pageSize: number = 20
): Promise<ApiResponse<{data: any[], total: number, totalPages: number}>> {
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

// Data modification
export async function addTanahGarapanEntry(data: TanahGarapanFormData): Promise<ApiResponse<any>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canManageData(session.user.role)) {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate data
    const validatedData = tanahGarapanSchema.parse(data)

    // Create entry
    const entry = await prisma.tanahGarapanEntry.create({
      data: validatedData
    })

    // Log activity
    await logActivity(
      session.user.email,
      'CREATE_ENTRY',
      `Created tanah garapan entry: ${entry.letakTanah}`,
      { entryId: entry.id, data: validatedData }
    )

    revalidatePath('/tanah-garapan')
    return { success: true, data: entry, message: 'Entry created successfully' }
  } catch (error) {
    console.error('Error creating tanah garapan entry:', error)
    return { success: false, error: 'Failed to create entry' }
  }
}

// Search functionality
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
          { keterangan: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: entries }
  } catch (error) {
    console.error('Error searching tanah garapan entries:', error)
    return { success: false, error: 'Search failed' }
  }
}

// Export functionality
export async function exportTanahGarapanToCSV(selectedIds?: string[]): Promise<ApiResponse<string>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canManageData(session.user.role)) {
      return { success: false, error: 'Unauthorized' }
    }

    const whereClause = selectedIds ? { id: { in: selectedIds } } : {}
    const entries = await prisma.tanahGarapanEntry.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    const csv = generateCSV(entries)
    
    // Log activity
    await logActivity(
      session.user.email,
      'EXPORT_CSV',
      `Exported ${entries.length} tanah garapan entries`,
      { entryCount: entries.length, selectedIds }
    )

    return { success: true, data: csv }
  } catch (error) {
    console.error('Error exporting tanah garapan entries:', error)
    return { success: false, error: 'Export failed' }
  }
}
```

### User Management Actions
```typescript
// User CRUD operations
export async function createUser(data: UserFormData): Promise<ApiResponse<any>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canManageUsers(session.user.role)) {
      return { success: false, error: 'Unauthorized' }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return { success: false, error: 'User with this email already exists' }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword
      }
    })

    // Log activity
    await logActivity(
      session.user.email,
      'CREATE_USER',
      `Created user: ${user.name} (${user.email})`,
      { userId: user.id, role: user.role }
    )

    revalidatePath('/users')
    return { success: true, data: user, message: 'User created successfully' }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: 'Failed to create user' }
  }
}

// Get all users
export async function getUsers(): Promise<ApiResponse<any[]>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canViewLogs(session.user.role)) {
      return { success: false, error: 'Unauthorized' }
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: users }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { success: false, error: 'Failed to fetch users' }
  }
}
```

### Activity Logging Actions
```typescript
// Log activity
export async function logActivity(
  user: string,
  action: string,
  details: string,
  payload?: any
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        user,
        action,
        details,
        payload: payload ? JSON.parse(JSON.stringify(payload)) : null
      }
    })
  } catch (error) {
    console.error('Error logging activity:', error)
  }
}

// Get activity logs
export async function getActivityLogs(
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<{data: any[], total: number, totalPages: number}>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canViewLogs(session.user.role)) {
      return { success: false, error: 'Unauthorized' }
    }

    const skip = (page - 1) * pageSize

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.activityLog.count()
    ])

    const totalPages = Math.ceil(total / pageSize)

    return {
      success: true,
      data: {
        data: logs,
        total,
        totalPages,
        currentPage: page,
        pageSize
      }
    }
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return { success: false, error: 'Failed to fetch activity logs' }
  }
}
```

## 🔌 API Routes

### Authentication API
```typescript
// NextAuth.js API route
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

### File Upload API
```typescript
// File upload endpoint
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Generate unique filename
    const fileName = generateUniqueFileName(file.name)
    const filePath = path.join(process.env.UPLOAD_PATH!, 'tanah-garapan', fileName)

    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true })

    // Save file
    const buffer = await file.arrayBuffer()
    await fs.writeFile(filePath, Buffer.from(buffer))

    return NextResponse.json({
      success: true,
      filePath: `/uploads/tanah-garapan/${fileName}`,
      fileName: file.name
    })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
```

### File Download API
```typescript
// File download endpoint
export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = path.join(process.env.UPLOAD_PATH!, ...params.path)
    
    // Check if file exists
    if (!await fs.access(filePath).then(() => true).catch(() => false)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Get file stats
    const stats = await fs.stat(filePath)
    const fileBuffer = await fs.readFile(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': getMimeType(filePath),
        'Content-Length': stats.size.toString(),
        'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`
      }
    })
  } catch (error) {
    console.error('File download error:', error)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
```

## 📊 Response Format

### Standard API Response
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Success response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}

// Error response
{
  "success": false,
  "error": "Error message",
  "message": "Operation failed"
}
```

### Pagination Response
```typescript
interface PaginatedResponse<T> {
  success: boolean
  data: {
    data: T[]
    total: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}
```

## 🔍 Error Handling

### Error Types
```typescript
enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

interface ApiError {
  type: ErrorType
  message: string
  details?: any
  timestamp: string
}
```

### Error Handling Middleware
```typescript
export function handleApiError(error: any): ApiResponse<null> {
  console.error('API Error:', error)

  if (error instanceof ValidationError) {
    return {
      success: false,
      error: 'Validation failed',
      message: error.message
    }
  }

  if (error instanceof AuthenticationError) {
    return {
      success: false,
      error: 'Authentication required',
      message: 'Please log in to continue'
    }
  }

  if (error instanceof AuthorizationError) {
    return {
      success: false,
      error: 'Access denied',
      message: 'You do not have permission to perform this action'
    }
  }

  return {
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  }
}
```

## 🛡️ Security Features

### Authentication Middleware
```typescript
export async function requireAuth(): Promise<Session> {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    throw new AuthenticationError('Authentication required')
  }
  
  return session
}

export async function requireRole(requiredRole: string): Promise<Session> {
  const session = await requireAuth()
  
  if (!hasRole(session.user.role, requiredRole)) {
    throw new AuthorizationError('Insufficient permissions')
  }
  
  return session
}
```

### Input Validation
```typescript
export function validateInput<T>(data: unknown, schema: z.ZodSchema<T>): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        error.errors.map(e => e.message).join(', ')
      )
    }
    throw error
  }
}
```

## 📈 Performance Optimization

### Caching Strategy
```typescript
// Cache frequently accessed data
export async function getCachedTanahGarapanStats() {
  const cacheKey = 'tanah-garapan-stats'
  const cached = await getFromCache(cacheKey)
  
  if (cached) {
    return cached
  }
  
  const stats = await calculateTanahGarapanStats()
  await setCache(cacheKey, stats, 300) // 5 minutes
  return stats
}
```

### Database Optimization
```typescript
// Optimized queries with select
export async function getTanahGarapanEntriesOptimized(page: number, pageSize: number) {
  return await prisma.tanahGarapanEntry.findMany({
    select: {
      id: true,
      letakTanah: true,
      namaPemegangHak: true,
      letterC: true,
      nomorSuratKeteranganGarapan: true,
      luas: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize
  })
}
```

## 🚀 Usage Examples

### Client-side Usage
```typescript
// Call server action
const handleCreateEntry = async (data: TanahGarapanFormData) => {
  const result = await addTanahGarapanEntry(data)
  
  if (result.success) {
    toast.success(result.message)
    // Refresh data
  } else {
    toast.error(result.error)
  }
}

// Search functionality
const handleSearch = async (query: string) => {
  const result = await searchTanahGarapanEntries(query)
  
  if (result.success) {
    setSearchResults(result.data)
  }
}
```

### API Route Usage
```typescript
// Call API route
const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  })
  
  const result = await response.json()
  return result
}
```

## 📊 Future Enhancements

### Planned Features
- **GraphQL API**: GraphQL endpoint for complex queries
- **WebSocket Support**: Real-time updates
- **Rate Limiting**: API rate limiting
- **API Documentation**: OpenAPI/Swagger documentation

### Advanced Features
- **Caching Layer**: Redis caching
- **API Versioning**: Versioned API endpoints
- **Webhook Support**: Webhook notifications
- **API Analytics**: API usage analytics
