# 🗄️ Database Schema & Data Models

## Overview
Schema database yang komprehensif menggunakan Prisma ORM dengan MySQL, mendukung semua fitur aplikasi tanah garapan dengan relasi yang terstruktur.

## 🎯 Fitur Utama

### 1. **Core Data Models**
- **User Management**: Model pengguna dengan role-based access
- **Tanah Garapan**: Model data tanah garapan utama
- **Activity Logging**: Model untuk audit trail
- **Proyek & Pembelian**: Model untuk sistem pembelian sertifikat

### 2. **Database Features**
- **Relational Design**: Proper foreign key relationships
- **Indexing Strategy**: Strategic database indexing
- **Data Validation**: Database-level validation
- **Migration Support**: Prisma migration system

### 3. **Performance Optimization**
- **Query Optimization**: Optimized database queries
- **Connection Pooling**: Efficient connection management
- **Caching Strategy**: Database query caching
- **Data Archiving**: Data retention policies

## 🛠️ Technical Implementation

### Prisma Configuration
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### Database Models

#### User Model
```prisma
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

enum UserRole {
  DEVELOPER
  ADMIN
  MANAGER
  USER
}
```

#### Tanah Garapan Model
```prisma
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

  // Relations
  pembelianSertifikat         PembelianSertifikat[]

  @@index([letakTanah])
  @@index([namaPemegangHak])
  @@index([luas])
  @@index([createdAt])
  @@map("tanah_garapan_entries")
}
```

#### Activity Log Model
```prisma
model ActivityLog {
  id        String   @id @default(cuid())
  user      String
  action    String
  details   String
  payload   Json?
  createdAt DateTime @default(now())

  // Relations
  proyekPembangunanId   String?
  proyekPembangunan     ProyekPembangunan? @relation(fields: [proyekPembangunanId], references: [id])
  pembelianSertifikatId String?
  pembelianSertifikat   PembelianSertifikat? @relation(fields: [pembelianSertifikatId], references: [id])
  pembayaranPembelianId String?
  pembayaranPembelian   PembayaranPembelian? @relation(fields: [pembayaranPembelianId], references: [id])

  @@index([user])
  @@index([action])
  @@index([createdAt])
  @@map("activity_logs")
}
```

#### Proyek Pembangunan Model
```prisma
model ProyekPembangunan {
  id                    String   @id @default(cuid())
  namaProyek            String
  lokasiProyek          String
  deskripsi             String?  @db.Text
  statusProyek          StatusProyek @default(PLANNING)
  tanggalMulai          DateTime?
  tanggalSelesai        DateTime?
  budgetTotal           Decimal  @db.Decimal(15,2)
  budgetTerpakai        Decimal  @db.Decimal(15,2) @default(0)
  createdBy             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  // Relations
  pembelianSertifikat   PembelianSertifikat[]
  activityLogs          ActivityLog[]

  @@map("proyek_pembangunan")
}

enum StatusProyek {
  PLANNING
  ONGOING
  COMPLETED
  CANCELLED
}
```

#### Pembelian Sertifikat Model
```prisma
model PembelianSertifikat {
  id                    String   @id @default(cuid())
  proyekId              String
  proyek                ProyekPembangunan @relation(fields: [proyekId], references: [id])
  tanahGarapanId        String
  tanahGarapan          TanahGarapanEntry @relation(fields: [tanahGarapanId], references: [id])
  
  // Data Warga (pemilik asli)
  namaWarga             String
  alamatWarga           String
  noKtpWarga            String
  noHpWarga             String
  
  // Data Pembelian
  hargaBeli             Decimal  @db.Decimal(15,2)
  statusPembelian       StatusPembelian @default(NEGOTIATION)
  tanggalKontrak        DateTime?
  tanggalPembayaran     DateTime?
  metodePembayaran      MetodePembayaran?
  buktiPembayaran       String?
  keterangan            String?  @db.Text
  
  // Data Sertifikat
  nomorSertifikat       String?  @unique
  fileSertifikat        String?
  statusSertifikat      StatusSertifikat @default(PENDING)
  
  createdBy             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  // Relations
  pembayaran            PembayaranPembelian[]
  activityLogs          ActivityLog[]

  @@map("pembelian_sertifikat")
}
```

#### Pembayaran Model
```prisma
model PembayaranPembelian {
  id                    String   @id @default(cuid())
  pembelianId           String
  pembelian             PembelianSertifikat @relation(fields: [pembelianId], references: [id])
  nomorPembayaran       String   @unique
  jumlahPembayaran      Decimal  @db.Decimal(15,2)
  jenisPembayaran       JenisPembayaran
  metodePembayaran      MetodePembayaran
  tanggalPembayaran     DateTime
  statusPembayaran      StatusPembayaran @default(PENDING)
  buktiPembayaran       String?
  keterangan            String?  @db.Text
  createdBy             String
  createdAt             DateTime @default(now())

  // Relations
  activityLogs          ActivityLog[]

  @@map("pembayaran_pembelian")
}
```

## 📊 Database Indexes

### Primary Indexes
```sql
-- User indexes
CREATE UNIQUE INDEX users_email_key ON users(email);

-- Tanah Garapan indexes
CREATE INDEX tanah_garapan_entries_letak_tanah_idx ON tanah_garapan_entries(letakTanah);
CREATE INDEX tanah_garapan_entries_nama_pemegang_hak_idx ON tanah_garapan_entries(namaPemegangHak);
CREATE INDEX tanah_garapan_entries_luas_idx ON tanah_garapan_entries(luas);
CREATE INDEX tanah_garapan_entries_created_at_idx ON tanah_garapan_entries(createdAt);

-- Activity Log indexes
CREATE INDEX activity_logs_user_idx ON activity_logs(user);
CREATE INDEX activity_logs_action_idx ON activity_logs(action);
CREATE INDEX activity_logs_created_at_idx ON activity_logs(createdAt);

-- Pembelian indexes
CREATE INDEX pembelian_sertifikat_proyek_id_idx ON pembelian_sertifikat(proyekId);
CREATE INDEX pembelian_sertifikat_tanah_garapan_id_idx ON pembelian_sertifikat(tanahGarapanId);
CREATE INDEX pembelian_sertifikat_status_pembelian_idx ON pembelian_sertifikat(statusPembelian);

-- Pembayaran indexes
CREATE INDEX pembayaran_pembelian_pembelian_id_idx ON pembayaran_pembelian(pembelianId);
CREATE INDEX pembayaran_pembelian_status_pembayaran_idx ON pembayaran_pembelian(statusPembayaran);
CREATE INDEX pembayaran_pembelian_tanggal_pembayaran_idx ON pembayaran_pembelian(tanggalPembayaran);
```

### Composite Indexes
```sql
-- Composite indexes for common queries
CREATE INDEX tanah_garapan_location_luas_idx ON tanah_garapan_entries(letakTanah, luas);
CREATE INDEX activity_logs_user_action_idx ON activity_logs(user, action);
CREATE INDEX pembelian_status_created_idx ON pembelian_sertifikat(statusPembelian, createdAt);
```

## 🔗 Data Relationships

### Relationship Diagram
```
User (1) ──→ (N) ActivityLog
User (1) ──→ (N) ProyekPembangunan
User (1) ──→ (N) PembelianSertifikat
User (1) ──→ (N) PembayaranPembelian

ProyekPembangunan (1) ──→ (N) PembelianSertifikat
ProyekPembangunan (1) ──→ (N) ActivityLog

TanahGarapanEntry (1) ──→ (N) PembelianSertifikat

PembelianSertifikat (1) ──→ (N) PembayaranPembelian
PembelianSertifikat (1) ──→ (N) ActivityLog

PembayaranPembelian (1) ──→ (N) ActivityLog
```

### Foreign Key Constraints
```sql
-- Proyek Pembangunan foreign keys
ALTER TABLE pembelian_sertifikat 
ADD CONSTRAINT fk_pembelian_proyek 
FOREIGN KEY (proyekId) REFERENCES proyek_pembangunan(id) ON DELETE CASCADE;

-- Tanah Garapan foreign keys
ALTER TABLE pembelian_sertifikat 
ADD CONSTRAINT fk_pembelian_tanah_garapan 
FOREIGN KEY (tanahGarapanId) REFERENCES tanah_garapan_entries(id) ON DELETE CASCADE;

-- Pembayaran foreign keys
ALTER TABLE pembayaran_pembelian 
ADD CONSTRAINT fk_pembayaran_pembelian 
FOREIGN KEY (pembelianId) REFERENCES pembelian_sertifikat(id) ON DELETE CASCADE;

-- Activity Log foreign keys
ALTER TABLE activity_logs 
ADD CONSTRAINT fk_activity_proyek 
FOREIGN KEY (proyekPembangunanId) REFERENCES proyek_pembangunan(id) ON DELETE SET NULL;

ALTER TABLE activity_logs 
ADD CONSTRAINT fk_activity_pembelian 
FOREIGN KEY (pembelianSertifikatId) REFERENCES pembelian_sertifikat(id) ON DELETE SET NULL;

ALTER TABLE activity_logs 
ADD CONSTRAINT fk_activity_pembayaran 
FOREIGN KEY (pembayaranPembelianId) REFERENCES pembayaran_pembelian(id) ON DELETE SET NULL;
```

## 🔧 Database Operations

### Prisma Client Usage
```typescript
// Database connection
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// Connection management
export async function connectDatabase() {
  try {
    await prisma.$connect()
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Database connection failed:', error)
    throw error
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect()
}
```

### Query Examples
```typescript
// Get tanah garapan with pagination
export async function getTanahGarapanEntries(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize
  
  const [entries, total] = await Promise.all([
    prisma.tanahGarapanEntry.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.tanahGarapanEntry.count()
  ])
  
  return {
    data: entries,
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage: page,
    pageSize
  }
}

// Get statistics
export async function getTanahGarapanStats() {
  const [totalEntries, totalLuas, entries] = await Promise.all([
    prisma.tanahGarapanEntry.count(),
    prisma.tanahGarapanEntry.aggregate({
      _sum: { luas: true }
    }),
    prisma.tanahGarapanEntry.findMany({
      select: {
        letakTanah: true,
        luas: true,
        createdAt: true
      }
    })
  ])
  
  return {
    totalEntries,
    totalLuas: totalLuas._sum.luas || 0,
    averageLuas: totalLuas._sum.luas ? totalLuas._sum.luas / totalEntries : 0,
    entriesByLocation: groupByLocation(entries),
    entriesByMonth: groupByMonth(entries)
  }
}
```

## 📊 Data Validation

### Database Constraints
```sql
-- User constraints
ALTER TABLE users ADD CONSTRAINT chk_user_email CHECK (email LIKE '%@%');
ALTER TABLE users ADD CONSTRAINT chk_user_role CHECK (role IN ('DEVELOPER', 'ADMIN', 'MANAGER', 'USER'));

-- Tanah Garapan constraints
ALTER TABLE tanah_garapan_entries ADD CONSTRAINT chk_luas_positive CHECK (luas > 0);
ALTER TABLE tanah_garapan_entries ADD CONSTRAINT chk_required_fields CHECK (
  letakTanah IS NOT NULL AND 
  namaPemegangHak IS NOT NULL AND 
  letterC IS NOT NULL AND 
  nomorSuratKeteranganGarapan IS NOT NULL
);

-- Proyek constraints
ALTER TABLE proyek_pembangunan ADD CONSTRAINT chk_budget_positive CHECK (budgetTotal > 0);
ALTER TABLE proyek_pembangunan ADD CONSTRAINT chk_budget_terpakai CHECK (budgetTerpakai >= 0);
ALTER TABLE proyek_pembangunan ADD CONSTRAINT chk_budget_limit CHECK (budgetTerpakai <= budgetTotal);

-- Pembelian constraints
ALTER TABLE pembelian_sertifikat ADD CONSTRAINT chk_harga_positive CHECK (hargaBeli > 0);
ALTER TABLE pembelian_sertifikat ADD CONSTRAINT chk_ktp_format CHECK (noKtpWarga REGEXP '^[0-9]{16}$');

-- Pembayaran constraints
ALTER TABLE pembayaran_pembelian ADD CONSTRAINT chk_jumlah_positive CHECK (jumlahPembayaran > 0);
ALTER TABLE pembayaran_pembelian ADD CONSTRAINT chk_tanggal_pembayaran CHECK (tanggalPembayaran <= NOW());
```

### Prisma Validation
```typescript
// Zod schema validation
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

## 🚀 Migration Management

### Prisma Migrations
```bash
# Create migration
npx prisma migrate dev --name init

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

### Migration Files
```sql
-- Migration: 20240101000000_init.sql
CREATE TABLE users (
  id VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  name VARCHAR(191) NOT NULL,
  password VARCHAR(191) NOT NULL,
  role ENUM('DEVELOPER', 'ADMIN', 'MANAGER', 'USER') NOT NULL DEFAULT 'USER',
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  PRIMARY KEY (id)
);

CREATE UNIQUE INDEX users_email_key ON users(email);
```

## 📈 Performance Optimization

### Query Optimization
```typescript
// Optimized query with select
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

// Batch operations
export async function createMultipleEntries(entries: TanahGarapanFormData[]) {
  return await prisma.tanahGarapanEntry.createMany({
    data: entries,
    skipDuplicates: true
  })
}
```

### Connection Pooling
```typescript
// Prisma client with connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?connection_limit=5&pool_timeout=20"
    }
  }
})
```

## 🛡️ Security Features

### Data Protection
- **Input Sanitization**: Prevent SQL injection
- **Parameterized Queries**: Use Prisma ORM
- **Access Control**: Role-based data access
- **Audit Logging**: Track all data changes

### Backup Strategy
```sql
-- Daily backup
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql

-- Restore from backup
mysql -u username -p database_name < backup_20240101.sql
```

## 📊 Future Enhancements

### Planned Features
- **Data Archiving**: Archive old data
- **Read Replicas**: Read-only replicas for performance
- **Partitioning**: Table partitioning for large datasets
- **Full-text Search**: Advanced search capabilities

### Advanced Features
- **Data Encryption**: Encrypt sensitive data
- **Audit Trail**: Enhanced audit capabilities
- **Data Analytics**: Advanced analytics queries
- **API Integration**: External data source integration
