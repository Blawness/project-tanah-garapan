# 📚 Tanah Garapan Standalone - Documentation

## 🎯 Project Overview

**Tanah Garapan Standalone** adalah aplikasi manajemen data tanah garapan yang dikembangkan sebagai versi standalone dari modul tanah garapan PKP Studio. Aplikasi ini fokus pada pengelolaan data tanah garapan dengan fitur CRUD, export, print, dan manajemen file dokumen.

## ��️ Technical Architecture

### Tech Stack
- **Frontend**: Next.js 15 + React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Next.js Server Actions + Prisma ORM
- **Database**: MySQL 8.0+ (Windows Laragon compatible)
- **Authentication**: NextAuth.js with JWT
- **File Storage**: Local filesystem with organized structure
- **Validation**: Zod schema validation
- **Forms**: React Hook Form with validation

### Project Structure
```
tanah-garapan-standalone/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── (app)/                     # Main application routes
│   │   │   └── tanah-garapan/         # Tanah garapan management
│   │   ├── (print_views)/             # Print-optimized views
│   │   │   └── garapan/               # Print functionality
│   │   ├── api/                       # API routes
│   │   │   └── auth/[...nextauth]/    # NextAuth.js API
│   │   ├── login/                     # Authentication page
│   │   └── layout.tsx                 # Root layout
│   ├── components/                    # React components
│   │   ├── ui/                        # shadcn/ui base components
│   │   ├── tanah-garapan/             # Feature-specific components
│   │   ├── layout/                    # Layout components
│   │   └── shared/                    # Shared utilities
│   ├── lib/                           # Business logic & utilities
│   │   ├── auth/                      # Authentication utilities
│   │   ├── server-actions/            # Server action handlers
│   │   ├── prisma.ts                  # Database client
│   │   ├── types.ts                   # TypeScript definitions
│   │   └── utils.ts                   # Helper functions
│   ├── contexts/                      # React contexts
│   ├── hooks/                         # Custom React hooks
│   └── types/                         # Global type definitions
├── prisma/
│   ├── schema.prisma                  # Database schema
│   └── seed.ts                        # Database seeding
├── uploads/                           # File storage
│   └── tanah-garapan/                 # Tanah garapan documents
├── docs/                              # Documentation
├── public/                            # Static assets
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── .env.example
```

## 🗄️ Database Schema

### Core Models
```prisma
// User management
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

// Tanah garapan entries
model TanahGarapanEntry {
  id                          String   @id @default(cuid())
  letakTanah                  String
  namaPemegangHak             String
  letterC                     String
  nomorSuratKeteranganGarapan String
  luas                        Int
  file_url                    String?
  keterangan                  String?  @db.Text
  createdAt                   DateTime @default(now())
  updatedAt                   DateTime @updatedAt

  @@index([letakTanah])
  @@index([namaPemegangHak])
  @@index([luas])
  @@index([createdAt])
  @@map("tanah_garapan_entries")
}

// Activity logging
model ActivityLog {
  id        String   @id @default(cuid())
  user      String
  action    String
  details   String
  payload   Json?
  createdAt DateTime @default(now())

  @@index([user])
  @@index([action])
  @@index([createdAt])
  @@map("activity_logs")
}

// User roles
enum UserRole {
  DEVELOPER
  ADMIN
  MANAGER
  USER
}
```

## 🔐 Authentication & Authorization

### Role Hierarchy
```typescript
type UserRole = 'developer' | 'admin' | 'manager' | 'user'

const ROLE_HIERARCHY = {
  user: 1, 
  manager: 2, 
  admin: 3, 
  developer: 4
}
```

### Permission Matrix
| Feature | Developer | Admin | Manager | User |
|---------|-----------|-------|---------|------|
| View Data | ✅ | ✅ | ✅ | ✅ |
| Create Entry | ✅ | ✅ | ✅ | ❌ |
| Edit Entry | ✅ | ✅ | ✅ | ❌ |
| Delete Entry | ✅ | ✅ | ✅ | ❌ |
| Export Data | ✅ | ✅ | ✅ | ❌ |
| Print Data | ✅ | ✅ | ✅ | ✅ |
| View Logs | ✅ | ✅ | ❌ | ❌ |

### Authentication Flow
1. **Login Form** → NextAuth.js credentials provider
2. **Server Validation** → Database user lookup + bcrypt password check
3. **JWT Token** → Secure session management
4. **Route Protection** → Middleware-based access control

## �� Core Features

### 1. Data Management
- **CRUD Operations**: Create, Read, Update, Delete tanah garapan entries
- **Form Validation**: Zod schema validation with error handling
- **File Upload**: Support for related document uploads
- **Search & Filter**: Location and holder name based filtering
- **Sorting**: Multi-column sorting with visual indicators

### 2. User Interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Data Table**: Sortable, paginated table with selection
- **Modal Forms**: Create/edit forms in modal dialogs
- **Toast Notifications**: User feedback for all actions
- **Loading States**: Skeleton screens and loading indicators

### 3. Export & Print
- **CSV Export**: Formatted data export with proper escaping
- **Individual Print**: Single record printing with A4 optimization
- **Bulk Print**: Multiple selected records printing
- **Group Print**: Print by location grouping
- **Print Preview**: Auto-trigger print dialog

### 4. File Management
- **Document Upload**: Support for PDF, images, and documents
- **Organized Storage**: Structured file storage by date and type
- **File Validation**: MIME type and size validation
- **Secure Access**: Role-based file access control

## 🛠️ Server Actions

### Tanah Garapan Actions
```typescript
// Data retrieval
export async function getTanahGarapanEntries()
export async function getTanahGarapanEntryById(id: string)
export async function getTanahGarapanEntriesByIds(ids: string[])
export async function getTanahGarapanEntriesByLetakTanah(location: string)

// Data modification
export async function addTanahGarapanEntry(data: TanahGarapanFormData)
export async function updateTanahGarapanEntry(id: string, data: TanahGarapanFormData)
export async function deleteTanahGarapanEntry(id: string)

// Export functionality
export async function exportTanahGarapanToCSV()
```

### Authentication Actions
```typescript
// User management
export async function createUser(data: UserFormData)
export async function updateUser(id: string, data: UserFormData)
export async function deleteUser(id: string)
export async function getUsers()

// Activity logging
export async function logActivity(user: string, action: string, details: string)
export async function getActivityLogs()
```

## �� Component Architecture

### Core Components
```
components/
├── ui/                           # shadcn/ui base components
│   ├── button.tsx
│   ├── input.tsx
│   ├── table.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   └── toast.tsx
├── tanah-garapan/                # Feature components
│   ├── TanahGarapanForm.tsx      # Create/edit form
│   ├── TanahGarapanTable.tsx     # Data table with selection
│   └── ExportTanahGarapanButton.tsx # Export functionality
├── layout/                       # Layout components
│   ├── Sidebar.tsx               # Navigation sidebar
│   ├── Header.tsx                # Top header
│   └── Footer.tsx                # Footer
└── shared/                       # Shared utilities
    ├── DataTablePagination.tsx   # Table pagination
    ├── FileUpload.tsx            # File upload component
    └── LoadingSpinner.tsx        # Loading states
```

### Form Schema
```typescript
const tanahGarapanSchema = z.object({
  letakTanah: z.string().min(1, "Letak Tanah is required"),
  namaPemegangHak: z.string().min(1, "Nama Pemegang Hak is required"),
  letterC: z.string().min(1, "Letter C is required"),
  nomorSuratKeteranganGarapan: z.string().min(1, "Nomor Surat Keterangan Garapan is required"),
  luas: z.coerce.number().positive({ message: "Luas must be a positive number" }),
  file_url: z.string().url().optional().nullable(),
  keterangan: z.string().optional(),
})
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- MySQL 8.0+ (Laragon recommended for Windows)
- npm or yarn

### Installation Steps
```bash
# 1. Clone repository
git clone <repository-url>
cd tanah-garapan-standalone

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Setup database
npm run db:push
npm run db:seed

# 5. Start development server
npm run dev
```

### Environment Variables
```env
# Database
DATABASE_URL="mysql://root:password@localhost:3306/tanah_garapan_db"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# File Storage
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/*,application/pdf,.doc,.docx"

# Application
NODE_ENV="development"
PORT=3000
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/session` - Get current session

### Tanah Garapan
- `GET /api/tanah-garapan` - Get all entries
- `GET /api/tanah-garapan/[id]` - Get single entry
- `POST /api/tanah-garapan` - Create new entry
- `PUT /api/tanah-garapan/[id]` - Update entry
- `DELETE /api/tanah-garapan/[id]` - Delete entry
- `GET /api/tanah-garapan/export` - Export to CSV

### Print Views
- `GET /garapan/[id]/print` - Print single entry
- `GET /garapan/print/selected` - Print selected entries
- `GET /garapan/print/group/[location]` - Print by location

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:push         # Push schema to database
npm run db:seed         # Seed database with test data
npm run db:studio       # Open Prisma Studio
npm run db:reset        # Reset database

# Code Quality
npm run typecheck       # TypeScript type checking
npm run lint           # ESLint code linting
npm run lint:fix       # Fix linting issues
```

## 📋 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow Next.js 15 App Router patterns
- Use Server Components when possible
- Implement proper error handling
- Add comprehensive logging

### Component Guidelines
- Use shadcn/ui components as base
- Implement proper loading states
- Add accessibility attributes
- Use React Hook Form for forms
- Implement proper validation

### Database Guidelines
- Use Prisma for all database operations
- Implement proper indexing
- Use transactions for complex operations
- Add proper error handling
- Log all database operations

## 🧪 Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Server action testing
- Utility function testing

### Integration Tests
- API endpoint testing
- Database operation testing
- Authentication flow testing

### E2E Tests
- User workflow testing
- Print functionality testing
- Export functionality testing

## �� Deployment

### Production Setup
```bash
# Build application
npm run build

# Start production server
npm run start

# Or use PM2 for process management
pm2 start ecosystem.config.js
```

### Environment Configuration
```env
# Production environment
NODE_ENV="production"
DATABASE_URL="mysql://user:pass@host:3306/prod_db"
NEXTAUTH_URL="https://your-domain.com"
UPLOAD_PATH="/var/www/uploads"
```

## 📊 Performance Optimization

### Database
- Strategic indexing on query fields
- Connection pooling
- Query optimization
- Proper pagination

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- Bundle analysis

### Caching
- Static asset caching
- API response caching
- Database query caching

## 🔒 Security Considerations

### Authentication
- Secure password hashing with bcrypt
- JWT token expiration
- Session management
- Role-based access control

### File Upload
- File type validation
- File size limits
- Secure file storage
- Access control

### Database
- SQL injection prevention
- Input validation
- Parameterized queries
- Audit logging

## 📈 Monitoring & Logging

### Application Monitoring
- Error tracking
- Performance monitoring
- User activity logging
- System health checks

### Logging Strategy
- Structured logging
- Error logging
- Activity logging
- Performance logging

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Implement changes
3. Add tests
4. Update documentation
5. Submit pull request

### Code Review
- Review code quality
- Check security implications
- Verify functionality
- Update documentation

## �� Support

### Documentation
- Check this documentation first
- Review component documentation
- Check API documentation

### Troubleshooting
- Check application logs
- Verify database connectivity
- Check file permissions
- Review error messages

---

*Last updated: 2024 - Tanah Garapan Standalone v1.0*