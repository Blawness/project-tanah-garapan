# 🛒 Pembelian Sertifikat System

## Overview
Sistem pembelian sertifikat tanah garapan dari warga untuk keperluan proyek pembangunan dengan tracking budget, negosiasi, kontrak, dan pembayaran bertahap.

## 🎯 Fitur Utama

### 1. **Proyek Pembangunan Management**
- **Project Creation**: Buat dan kelola proyek pembangunan
- **Budget Tracking**: Monitor budget total vs terpakai
- **Timeline Management**: Tanggal mulai dan selesai proyek
- **Status Tracking**: Planning → Ongoing → Completed → Cancelled
- **Project Dashboard**: Overview statistik proyek

### 2. **Pembelian dari Warga**
- **Tanah Selection**: Pilih tanah garapan yang tersedia
- **Negotiation Process**: Proses negosiasi harga dengan warga
- **Contract Generation**: Generate kontrak pembelian
- **Payment Tracking**: Sistem pembayaran bertahap (DP → Pelunasan)
- **Certificate Management**: Generate sertifikat kepemilikan

### 3. **Payment Management**
- **Multi-payment Types**: DP, Cicilan, Pelunasan, Bonus
- **Payment Methods**: Cash, Transfer, QRIS, E-Wallet, Bank Transfer
- **Payment Verification**: Status pending → verified → rejected
- **Payment History**: Complete payment tracking
- **Receipt Generation**: Bukti pembayaran otomatis

## 🛠️ Technical Implementation

### Database Schema

#### Proyek Pembangunan
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
}
```

#### Pembelian Sertifikat
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
}
```

#### Pembayaran
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
}
```

### Enums & Status
```prisma
enum StatusProyek {
  PLANNING
  ONGOING
  COMPLETED
  CANCELLED
}

enum StatusPembelian {
  NEGOTIATION
  AGREED
  CONTRACT_SIGNED
  PAID
  CERTIFICATE_ISSUED
  COMPLETED
  CANCELLED
}

enum StatusSertifikat {
  PENDING
  PROCESSING
  ISSUED
  DELIVERED
}

enum JenisPembayaran {
  DP
  CICILAN
  PELUNASAN
  BONUS
}

enum MetodePembayaran {
  CASH
  TRANSFER
  QRIS
  E_WALLET
  BANK_TRANSFER
}

enum StatusPembayaran {
  PENDING
  VERIFIED
  REJECTED
}
```

## 📱 User Interface Components

### Proyek Components
- **ProyekForm**: Form create/edit proyek pembangunan
- **ProyekTable**: Tabel proyek dengan aksi CRUD
- **ProyekDashboard**: Dashboard statistik proyek

### Pembelian Components
- **PembelianForm**: Form create/edit pembelian sertifikat
- **PembelianTable**: Tabel pembelian dengan status tracking
- **PembelianDashboard**: Dashboard statistik pembelian
- **PembayaranForm**: Form pencatatan pembayaran
- **PembayaranTable**: Tabel riwayat pembayaran

### Dashboard Features
- **Budget Tracking**: Visual budget monitoring
- **Status Overview**: Status distribution charts
- **Payment Summary**: Payment statistics
- **Project Timeline**: Visual project timeline

## 🔧 Server Actions

### Proyek Operations
```typescript
// Proyek CRUD
export async function createProyekPembangunan(data)
export async function updateProyekPembangunan(id, data)
export async function deleteProyekPembangunan(id)
export async function getProyekPembangunan(page, pageSize)
export async function getProyekPembangunanById(id)

// Proyek Statistics
export async function getProyekStats()
export async function getProyekBudgetSummary(id)
```

### Pembelian Operations
```typescript
// Pembelian CRUD
export async function createPembelianSertifikat(data)
export async function updatePembelianSertifikat(id, data)
export async function deletePembelianSertifikat(id)
export async function getPembelianSertifikat(page, pageSize, proyekId)

// Pembelian Statistics
export async function getPembelianStats()
export async function getPembelianByStatus(status)
```

### Pembayaran Operations
```typescript
// Pembayaran CRUD
export async function createPembayaranPembelian(data)
export async function updatePembayaranPembelian(id, data)
export async function getPembayaranByPembelianId(pembelianId)

// Payment Processing
export async function verifyPembayaran(id)
export async function rejectPembayaran(id, reason)
```

## 📊 Workflow & Status Management

### Pembelian Workflow
```
Tanah Tersedia → Negosiasi → Kontrak → DP → Sertifikat → Pelunasan → Selesai
     ↓              ↓          ↓       ↓        ↓           ↓          ↓
  Available    NEGOTIATION  AGREED  CONTRACT  PAID    CERTIFICATE  COMPLETED
                              ↓       ↓        ↓        ↓           ↓
                         CONTRACT_SIGNED  PAID  CERTIFICATE_ISSUED  COMPLETED
```

### Payment Workflow
```
Pembayaran Dibuat → Pending → Verified/Rejected
        ↓              ↓           ↓
   PENDING        VERIFIED    REJECTED
```

### Certificate Workflow
```
Sertifikat Dibuat → Processing → Issued → Delivered
        ↓              ↓           ↓         ↓
     PENDING      PROCESSING    ISSUED   DELIVERED
```

## 💰 Budget Management

### Budget Tracking
- **Total Budget**: Budget keseluruhan proyek
- **Used Budget**: Budget yang sudah terpakai
- **Remaining Budget**: Sisa budget available
- **Budget Alerts**: Notifikasi budget limit

### Payment Tracking
- **Payment History**: Riwayat semua pembayaran
- **Payment Summary**: Ringkasan pembayaran per proyek
- **Outstanding Payments**: Pembayaran yang belum lunas
- **Payment Verification**: Proses verifikasi pembayaran

## 📈 Dashboard & Analytics

### Proyek Dashboard
- **Total Proyek**: Jumlah proyek keseluruhan
- **Budget Overview**: Total budget vs terpakai
- **Status Distribution**: Distribusi status proyek
- **Timeline View**: Visual project timeline

### Pembelian Dashboard
- **Total Pembelian**: Jumlah pembelian keseluruhan
- **Total Harga**: Total nilai pembelian
- **Status Tracking**: Tracking status pembelian
- **Payment Summary**: Ringkasan pembayaran

### Financial Reports
- **Budget Reports**: Laporan budget per proyek
- **Payment Reports**: Laporan pembayaran
- **Cost Analysis**: Analisis biaya
- **ROI Tracking**: Return on investment tracking

## 🖨️ Document Generation

### Contract Generation
- **Purchase Agreement**: Kontrak pembelian
- **Payment Terms**: Syarat pembayaran
- **Legal Documents**: Dokumen hukum
- **Certificate Templates**: Template sertifikat

### Report Generation
- **Project Reports**: Laporan proyek
- **Payment Reports**: Laporan pembayaran
- **Financial Reports**: Laporan keuangan
- **Audit Reports**: Laporan audit

## 🔍 Search & Filter Features

### Advanced Filtering
- **Project Filter**: Filter berdasarkan proyek
- **Status Filter**: Filter berdasarkan status
- **Date Range**: Filter berdasarkan tanggal
- **Amount Range**: Filter berdasarkan jumlah
- **Payment Status**: Filter status pembayaran

### Search Capabilities
- **Warga Search**: Pencarian berdasarkan nama warga
- **Location Search**: Pencarian berdasarkan lokasi
- **Contract Search**: Pencarian nomor kontrak
- **Certificate Search**: Pencarian nomor sertifikat

## 🛡️ Security & Validation

### Data Validation
- **Form Validation**: Client dan server-side validation
- **Business Rules**: Validasi aturan bisnis
- **Amount Validation**: Validasi jumlah pembayaran
- **Date Validation**: Validasi tanggal

### Access Control
- **Role-based Access**: Akses berdasarkan role
- **Project Access**: Akses berdasarkan proyek
- **Payment Access**: Kontrol akses pembayaran
- **Audit Trail**: Log semua aktivitas

## 📊 Future Enhancements

### Planned Features
- **Contract Templates**: Template kontrak yang dapat dikustomisasi
- **Payment Reminders**: Pengingat pembayaran otomatis
- **Integration**: Integrasi dengan sistem keuangan
- **Mobile App**: Aplikasi mobile untuk field work
- **Document OCR**: OCR untuk dokumen fisik

### Advanced Features
- **Workflow Automation**: Otomasi workflow
- **Notification System**: Sistem notifikasi
- **Reporting Engine**: Mesin laporan yang powerful
- **API Integration**: Integrasi dengan sistem eksternal
