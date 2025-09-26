# 🗺️ Tanah Garapan Management System

## Overview
Sistem manajemen data tanah garapan yang komprehensif dengan fitur CRUD, pencarian, export, dan print functionality.

## 🎯 Fitur Utama

### 1. **Data Management (CRUD)**
- **Create**: Tambah data tanah garapan baru
- **Read**: Lihat dan browse data dengan pagination
- **Update**: Edit data existing dengan validasi
- **Delete**: Hapus data dengan konfirmasi

### 2. **Advanced Search & Filtering**
- **Basic Search**: Pencarian berdasarkan letak tanah, nama pemegang hak, atau keterangan
- **Advanced Search**: Filter multi-kriteria dengan:
  - Letak tanah (dropdown dengan data existing)
  - Range luas tanah
  - Tanggal pembuatan
  - Status dokumen
- **Real-time Search**: Instant search dengan debouncing

### 3. **Export & Print System**
- **CSV Export**: Export data ke format CSV dengan formatting
- **Individual Print**: Print single record dengan A4 optimization
- **Bulk Print**: Print multiple selected records
- **Group Print**: Print berdasarkan lokasi grouping
- **Print Preview**: Auto-trigger print dialog

### 4. **File Management**
- **Document Upload**: Support PDF, images, dan documents
- **File Validation**: MIME type dan size validation
- **Organized Storage**: Structured file storage by date dan type
- **File Preview**: Preview dokumen sebelum download

## 🛠️ Technical Implementation

### Database Schema
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
}
```

### Form Validation
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

## 📱 User Interface Components

### Main Components
- **TanahGarapanForm**: Modal form untuk create/edit
- **TanahGarapanTable**: Data table dengan sorting dan selection
- **AdvancedSearch**: Advanced filtering component
- **ExportButton**: Export functionality dengan options
- **FileUpload**: File upload dengan validation

### UI Features
- **Responsive Design**: Mobile-first approach
- **Loading States**: Skeleton screens dan loading indicators
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Real-time feedback
- **Pagination**: Efficient data browsing

## 🔧 Server Actions

### Data Operations
```typescript
// Data retrieval
export async function getTanahGarapanEntries(page, pageSize)
export async function getTanahGarapanEntryById(id)
export async function getTanahGarapanEntriesByIds(ids)
export async function getTanahGarapanEntriesByLetakTanah(location)

// Data modification
export async function addTanahGarapanEntry(data)
export async function updateTanahGarapanEntry(id, data)
export async function deleteTanahGarapanEntry(id)

// Search functionality
export async function searchTanahGarapanEntries(query)
export async function advancedSearchTanahGarapanEntries(filters)

// Export functionality
export async function exportTanahGarapanToCSV()
```

### Performance Optimizations
- **Pagination**: Efficient data loading
- **Caching**: Server-side caching untuk stats
- **Lazy Loading**: Component lazy loading
- **Database Indexing**: Strategic indexes untuk queries

## 📊 Dashboard & Analytics

### Statistics Cards
- **Total Entries**: Jumlah data tanah garapan
- **Total Luas**: Total luas keseluruhan
- **Selected Items**: Data yang dipilih untuk action
- **Recent Activity**: Aktivitas terbaru

### Data Visualization
- **Location Grouping**: Group data by letak tanah
- **Size Distribution**: Luas tanah distribution
- **Time-based Stats**: Data berdasarkan waktu

## 🖨️ Print System

### Print Views
- **Individual Print**: `/garapan/[id]/print`
- **Bulk Print**: `/garapan/print/selected`
- **Group Print**: `/garapan/print/group/[location]`
- **All Data Print**: `/garapan/print/all`

### Print Features
- **A4 Optimization**: Print-friendly layout
- **Auto Print Dialog**: Automatic print trigger
- **Print Styling**: CSS print media queries
- **Summary Tables**: Statistical summaries
- **Official Format**: Professional document format

## 📁 File Management

### Supported Formats
- **Documents**: PDF, DOC, DOCX
- **Images**: JPG, PNG, GIF
- **Size Limits**: Configurable file size limits
- **MIME Validation**: File type verification

### Storage Structure
```
uploads/
└── tanah-garapan/
    ├── 2024/
    │   ├── 01/
    │   │   ├── file1.pdf
    │   │   └── file2.jpg
    │   └── 02/
    └── 2025/
```

## 🔍 Search & Filter Features

### Basic Search
- **Multi-field Search**: Search across multiple fields
- **Real-time Results**: Instant search results
- **Search Highlighting**: Highlight matching terms
- **Search History**: Recent search queries

### Advanced Search
- **Location Filter**: Dropdown dengan existing locations
- **Size Range**: Min/max luas filter
- **Date Range**: Created date filtering
- **File Status**: Document availability filter
- **Combination Logic**: AND/OR logic untuk filters

## 📈 Performance Features

### Optimization
- **Lazy Loading**: Components loaded on demand
- **Virtual Scrolling**: Large dataset handling
- **Caching**: Server-side data caching
- **Debouncing**: Search input debouncing

### Monitoring
- **Query Performance**: Database query monitoring
- **Load Times**: Component load tracking
- **Error Tracking**: Error monitoring dan reporting

## 🛡️ Security & Validation

### Data Validation
- **Client-side**: React Hook Form + Zod validation
- **Server-side**: Server action validation
- **File Validation**: MIME type dan size checking
- **SQL Injection**: Prisma ORM protection

### Access Control
- **Role-based Access**: Permission-based features
- **Data Ownership**: User-based data access
- **Audit Logging**: All actions logged

## 🚀 Usage Examples

### Creating New Entry
```typescript
const formData = {
  letakTanah: "Desa ABC, Kecamatan XYZ",
  namaPemegangHak: "John Doe",
  letterC: "C-123456",
  nomorSuratKeteranganGarapan: "SKG-789012",
  luas: 5000,
  file_url: "https://example.com/document.pdf",
  keterangan: "Additional notes"
}

const result = await addTanahGarapanEntry(formData)
```

### Advanced Search
```typescript
const filters = {
  letakTanah: "Desa ABC",
  minLuas: 1000,
  maxLuas: 10000,
  startDate: "2024-01-01",
  endDate: "2024-12-31"
}

const results = await advancedSearchTanahGarapanEntries(filters)
```

## 📊 Future Enhancements

### Planned Features
- **Bulk Import**: Excel/CSV import functionality
- **Data Validation**: Advanced data integrity checks
- **Map Integration**: Geographic data visualization
- **Document OCR**: Text extraction from images
- **API Integration**: External data sources

### UI Improvements
- **Advanced Filtering**: More filter options
- **Data Visualization**: Charts dan graphs
- **Mobile App**: Native mobile application
- **Offline Support**: Offline data access
