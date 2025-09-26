# 🛠️ Development Guide - Tanah Garapan Standalone

## 📋 Prerequisites

- Node.js 18+
- MySQL 8.0+ (Laragon recommended for Windows)
- Git
- Code Editor (VS Code recommended)

## 🚀 Quick Start

### Windows
```bash
# Run development setup
dev-setup.bat

# Or manual setup
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

### Linux/Mac
```bash
# Make script executable
chmod +x dev-setup.sh

# Run development setup
./dev-setup.sh

# Or manual setup
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

## 🔧 Development Commands

### Basic Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Database Commands
```bash
# Push schema changes
npm run db:push

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio

# Reset database
npm run db:reset

# Generate Prisma client
npm run generate
```

## 📁 Project Structure

```
tanah-garapan-standalone/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (print_views)/      # Print-optimized views
│   │   ├── api/                # API routes
│   │   ├── dashboard/          # Dashboard page
│   │   ├── login/              # Login page
│   │   ├── tanah-garapan/      # Main feature page
│   │   └── users/              # User management
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── tanah-garapan/      # Feature components
│   │   ├── layout/             # Layout components
│   │   ├── lazy/               # Lazy-loaded components
│   │   └── shared/             # Shared utilities
│   ├── lib/                    # Business logic
│   │   ├── server-actions/     # Server actions
│   │   ├── cache.ts            # Caching utilities
│   │   ├── auth.ts             # Authentication
│   │   ├── prisma.ts           # Database client
│   │   └── types.ts            # TypeScript types
│   └── __tests__/              # Test files
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seeding
├── uploads/                    # File storage
├── docs/                       # Documentation
├── public/                     # Static assets
└── scripts/                    # Development scripts
```

## 🗄️ Database Setup

### 1. MySQL Setup (Laragon)

1. Download and install Laragon
2. Start Laragon services
3. Open phpMyAdmin (http://localhost/phpmyadmin)
4. Create database: `tanah_garapan_db`

### 2. Environment Configuration

Create `.env` file:

```env
# Database
DATABASE_URL="mysql://root:@localhost:3306/tanah_garapan_db"

# Authentication
NEXTAUTH_SECRET="your-development-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# File Storage
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/*,application/pdf,.doc,.docx"

# Application
NODE_ENV="development"
PORT=3000
```

### 3. Database Initialization

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with sample data
npm run db:seed
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- tanah-garapan-form.test.tsx
```

### Test Structure

```
src/__tests__/
├── components/                 # Component tests
│   ├── tanah-garapan-form.test.tsx
│   └── tanah-garapan-table.test.tsx
├── lib/                       # Server action tests
│   └── server-actions/
│       └── tanah-garapan.test.ts
└── utils/                     # Utility tests
```

### Writing Tests

```typescript
// Example component test
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
```

## 🎨 UI Development

### Component Development

1. Create component in appropriate folder
2. Use shadcn/ui components as base
3. Follow TypeScript best practices
4. Add proper error handling
5. Write tests for component

### Styling Guidelines

- Use Tailwind CSS classes
- Follow mobile-first approach
- Use consistent spacing and colors
- Implement proper loading states
- Add accessibility attributes

### Form Development

```typescript
// Example form with validation
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
})

const MyForm = () => {
  const form = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data) => {
    // Handle form submission
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

## 🔧 Server Actions

### Creating Server Actions

```typescript
// lib/server-actions/my-action.ts
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function myServerAction(data: any) {
  try {
    // Validate data
    // Perform database operation
    // Log activity
    // Revalidate cache
    
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### Error Handling

```typescript
// Always wrap in try-catch
try {
  const result = await prisma.model.create({ data })
  return { success: true, data: result }
} catch (error) {
  console.error('Error:', error)
  return { success: false, error: 'Operation failed' }
}
```

## 📊 Performance Optimization

### Lazy Loading

```typescript
// Use lazy loading for heavy components
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

const MyPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <HeavyComponent />
  </Suspense>
)
```

### Caching

```typescript
// Use React cache for expensive operations
import { cache } from 'react'

export const getCachedData = cache(async () => {
  // Expensive operation
  return await prisma.model.findMany()
})
```

## 🐛 Debugging

### Common Issues

1. **Database Connection Error**
   - Check MySQL service is running
   - Verify DATABASE_URL in .env
   - Test connection with Prisma Studio

2. **Build Errors**
   - Check TypeScript errors
   - Verify all imports are correct
   - Run `npm run lint` to check code quality

3. **Test Failures**
   - Check mock implementations
   - Verify test data
   - Run tests individually to isolate issues

### Debug Tools

```bash
# Prisma Studio (Database GUI)
npm run db:studio

# Next.js debugging
NODE_OPTIONS='--inspect' npm run dev

# TypeScript checking
npx tsc --noEmit
```

## 📝 Code Quality

### Linting

```bash
# Check for linting issues
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### TypeScript

- Use strict type checking
- Define proper interfaces
- Avoid `any` type
- Use type guards for runtime checks

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

## 🚀 Deployment Preparation

### Pre-deployment Checklist

- [ ] All tests passing
- [ ] No linting errors
- [ ] TypeScript compilation successful
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Build successful

### Build for Production

```bash
# Build application
npm run build

# Test production build
npm run start
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📞 Support

For development issues:
- Check this documentation
- Review error logs
- Test with minimal reproduction
- Ask for help in team chat
