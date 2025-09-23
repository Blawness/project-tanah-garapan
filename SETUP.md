# 🚀 Setup Guide - Project Tanah Garapan

## Prerequisites

1. **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
2. **MySQL 8.0+** - Use Laragon for Windows: [Download Laragon](https://laragon.org/)
3. **Git** (optional) - For version control

## Quick Start

### 1. Setup MySQL Database

**Using Laragon (Recommended for Windows):**
1. Download and install Laragon
2. Start Laragon
3. Click "Start All" to start Apache and MySQL
4. Open HeidiSQL (included with Laragon)
5. Create a new database named `tanah_garapan_db`

**Or using MySQL Command Line:**
```sql
CREATE DATABASE tanah_garapan_db;
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

The `.env` file is already configured with default values:

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

**⚠️ IMPORTANT:** Update the `DATABASE_URL` if your MySQL credentials are different:
- Default Laragon: `root` user with empty password: `mysql://root:@localhost:3306/tanah_garapan_db`
- XAMPP/WAMP: Usually `root` with empty password
- Custom setup: Update username/password accordingly

### 4. Setup Database Schema

```bash
# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` - you'll be redirected to the login page.

## Demo Accounts

The seeding process creates demo accounts with different permission levels:

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| `developer@example.com` | `password123` | Developer | Full access |
| `admin@example.com` | `password123` | Admin | Administrative access |
| `manager@example.com` | `password123` | Manager | Data management |
| `user@example.com` | `password123` | User | Read-only access |

## File Structure

```
project-tanah-garapan/
├── src/
│   ├── app/                      # Next.js 15 App Router
│   │   ├── (print_views)/        # Print-optimized pages
│   │   ├── api/                  # API routes
│   │   ├── login/                # Login page
│   │   ├── tanah-garapan/        # Main application
│   │   ├── dashboard/            # Dashboard
│   │   ├── users/                # User management
│   │   └── activity-logs/        # Activity logs
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── layout/               # Layout components
│   │   ├── tanah-garapan/        # Feature components
│   │   └── shared/               # Shared components
│   ├── lib/                      # Utilities & business logic
│   │   ├── server-actions/       # Server actions
│   │   ├── auth.ts               # Authentication config
│   │   ├── prisma.ts             # Database client
│   │   └── types.ts              # Type definitions
│   └── middleware.ts             # Route protection
├── prisma/                       # Database schema & seeds
├── uploads/                      # File uploads
└── docs/                         # Documentation
```

## Features Overview

### 🔐 Authentication
- NextAuth.js with credentials provider
- Role-based access control (Developer, Admin, Manager, User)
- Secure password hashing with bcrypt
- JWT session management

### 📊 Data Management
- Complete CRUD operations for tanah garapan
- Form validation with Zod schemas
- Real-time search and filtering
- Data sorting and pagination

### 📁 File Management
- Secure file upload (images, PDFs, Word docs)
- File type and size validation (max 5MB)
- Organized file storage structure
- Role-based file access control

### 📤 Export & Print
- CSV export with proper formatting
- Individual record printing (A4 optimized)
- Bulk printing for selected records
- Print all records with statistics
- Auto-print trigger functionality

### 🎨 User Interface
- Modern, responsive design with Tailwind CSS
- Professional shadcn/ui components
- Mobile-first approach
- Dark/light theme support (via system)
- Toast notifications for user feedback

### 📈 Monitoring
- Activity logging for all user actions
- User management interface
- System statistics and analytics
- Permission matrix overview

## Available Scripts

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
npm run generate        # Generate Prisma client

# Code Quality
npm run lint           # ESLint code linting
```

## Environment Configuration

### Development
- Uses SQLite or MySQL locally
- File uploads to local `./uploads` directory
- Hot reload enabled
- Detailed error messages

### Production
- MySQL database required
- Secure file upload handling
- Optimized build output
- Error logging

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL is running (Laragon/XAMPP)
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **Permission Denied on Login**
   - Use demo accounts provided above
   - Check user role in database

3. **File Upload Issues**
   - Ensure `uploads` directory exists and is writable
   - Check file size (max 5MB)
   - Verify file type is allowed

4. **Print Not Working**
   - Enable browser pop-ups for the site
   - Check browser print settings
   - Ensure printer is available

### Database Reset

If you need to reset the database:

```bash
npm run db:reset
npm run db:seed
```

### Clear Uploads

To clear uploaded files:

```bash
# Windows
rmdir /s uploads
mkdir uploads
mkdir uploads\tanah-garapan

# Linux/Mac
rm -rf uploads
mkdir -p uploads/tanah-garapan
```

## Security Considerations

### Authentication
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with expiration
- Route protection middleware
- Role-based authorization

### File Upload
- File type validation
- File size limits
- Secure file storage
- Access control for files

### Database
- Parameterized queries (Prisma ORM)
- Input validation with Zod
- SQL injection prevention
- Audit logging

## Development Guidelines

### Adding New Features
1. Create types in `src/lib/types.ts`
2. Add server actions in `src/lib/server-actions/`
3. Create UI components in `src/components/`
4. Add pages in `src/app/`
5. Update permissions if needed

### Code Style
- TypeScript for type safety
- Zod for runtime validation
- Prisma for database operations
- Tailwind CSS for styling
- ESLint for code quality

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in browser console
3. Check database connectivity
4. Verify file permissions

## License

This project is private and proprietary.

---

**Ready to start?** Run `npm run dev` and visit `http://localhost:3000`!
