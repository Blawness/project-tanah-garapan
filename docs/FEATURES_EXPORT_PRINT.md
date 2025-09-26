# 🖨️ Export & Print System

## Overview
Sistem export dan print yang komprehensif untuk data tanah garapan dengan berbagai format output dan print optimization.

## 🎯 Fitur Utama

### 1. **Export Functionality**
- **CSV Export**: Export data ke format CSV dengan formatting
- **Bulk Export**: Export multiple selected records
- **Filtered Export**: Export berdasarkan filter criteria
- **Custom Export**: Export dengan custom field selection

### 2. **Print System**
- **Individual Print**: Print single record dengan A4 optimization
- **Bulk Print**: Print multiple selected records
- **Group Print**: Print berdasarkan lokasi grouping
- **All Data Print**: Print semua data dengan summary

### 3. **Print Optimization**
- **A4 Layout**: Print-friendly layout design
- **Auto Print Dialog**: Automatic print dialog trigger
- **Print Styling**: CSS print media queries
- **Page Breaks**: Proper page break handling

## 🛠️ Technical Implementation

### Export Components
```typescript
// Export functionality
export async function exportTanahGarapanToCSV(selectedIds?: string[])
export async function exportTanahGarapanToExcel(selectedIds?: string[])
export async function exportTanahGarapanToPDF(selectedIds?: string[])

// Print functionality
export async function getTanahGarapanForPrint(ids: string[])
export async function getTanahGarapanByLocation(location: string)
export async function getAllTanahGarapanForPrint()
```

### Print Views Structure
```
src/app/(print_views)/
├── garapan/
│   ├── [id]/print/page.tsx          # Individual print
│   ├── print/
│   │   ├── all/page.tsx             # All data print
│   │   ├── selected/page.tsx        # Selected records print
│   │   └── group/[location]/page.tsx # Group by location print
```

## 📱 User Interface Components

### Export Components
- **ExportButton**: Main export button dengan options
- **ExportDialog**: Export options dialog
- **ExportProgress**: Export progress indicator
- **ExportHistory**: Export history tracking

### Print Components
- **PrintButton**: Print action buttons
- **PrintPreview**: Print preview modal
- **PrintOptions**: Print configuration options
- **PrintStatus**: Print status indicator

## 🖨️ Print Views

### 1. **Individual Print** (`/garapan/[id]/print`)
- **Single Record**: Print satu record tanah garapan
- **Detailed Information**: Informasi lengkap record
- **Official Format**: Format dokumen resmi
- **Print Optimization**: Optimized untuk A4

### 2. **Bulk Print** (`/garapan/print/selected`)
- **Multiple Records**: Print multiple selected records
- **Summary Table**: Tabel ringkasan data
- **Page Breaks**: Proper page break handling
- **Batch Processing**: Efficient batch printing

### 3. **Group Print** (`/garapan/print/group/[location]`)
- **Location Grouping**: Group berdasarkan lokasi
- **Location Summary**: Statistik per lokasi
- **Organized Layout**: Layout terorganisir
- **Location Headers**: Header per lokasi

### 4. **All Data Print** (`/garapan/print/all`)
- **Complete Dataset**: Print semua data
- **Comprehensive Summary**: Ringkasan lengkap
- **Statistics Tables**: Tabel statistik
- **Official Document**: Format dokumen resmi

## 📊 Print Layout Features

### Print Styling
```css
@media print {
  body { margin: 0; }
  .no-print { display: none !important; }
  .print-page { 
    width: 100% !important; 
    margin: 0 !important; 
    padding: 1rem !important;
    box-shadow: none !important;
  }
  .page-break { page-break-before: always; }
}
```

### Layout Components
- **Header Section**: Document header dengan title
- **Summary Section**: Statistical summary
- **Data Table**: Main data table
- **Footer Section**: Document footer dengan signature

### Print Optimization
- **A4 Compatibility**: Optimized untuk A4 paper
- **Font Sizing**: Readable font sizes
- **Margin Control**: Proper margin settings
- **Page Breaks**: Automatic page breaks

## 📈 Export Features

### CSV Export
- **Formatted Data**: Properly formatted CSV output
- **Field Selection**: Select specific fields to export
- **Encoding Support**: UTF-8 encoding support
- **Delimiter Options**: Configurable delimiters

### Excel Export
- **Multiple Sheets**: Multiple worksheet support
- **Formatting**: Cell formatting dan styling
- **Charts**: Embedded charts dan graphs
- **Formulas**: Excel formula support

### PDF Export
- **Professional Layout**: Professional document layout
- **Page Numbering**: Automatic page numbering
- **Headers/Footers**: Custom headers dan footers
- **Watermarks**: Optional watermarks

## 🔧 Export Configuration

### Export Options
```typescript
interface ExportOptions {
  format: 'CSV' | 'Excel' | 'PDF'
  fields: string[]
  filters?: FilterOptions
  includeHeaders: boolean
  dateRange?: DateRange
  groupBy?: string
}
```

### Field Selection
```typescript
const EXPORT_FIELDS = [
  'letakTanah',
  'namaPemegangHak',
  'letterC',
  'nomorSuratKeteranganGarapan',
  'luas',
  'createdAt',
  'keterangan'
]
```

## 📊 Print Statistics

### Summary Tables
- **Total Entries**: Jumlah total entries
- **Total Luas**: Total luas keseluruhan
- **Location Count**: Jumlah lokasi berbeda
- **Date Range**: Range tanggal data

### Location Statistics
- **Per Location**: Statistik per lokasi
- **Average Size**: Rata-rata luas per lokasi
- **Entry Count**: Jumlah entries per lokasi
- **Size Distribution**: Distribusi luas

## 🎨 Print Design

### Document Structure
```
┌─────────────────────────────────────┐
│           DOCUMENT HEADER           │
├─────────────────────────────────────┤
│         SUMMARY SECTION             │
├─────────────────────────────────────┤
│           DATA TABLE                │
│  ┌─────────────────────────────┐    │
│  │ Entry 1 | Entry 2 | Entry 3 │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│         STATISTICS SECTION          │
├─────────────────────────────────────┤
│           FOOTER SECTION            │
└─────────────────────────────────────┘
```

### Styling Features
- **Professional Header**: Official document header
- **Table Styling**: Clean table design
- **Typography**: Readable font choices
- **Spacing**: Proper spacing dan margins

## 🔍 Print Filtering

### Filter Options
- **Date Range**: Filter berdasarkan tanggal
- **Location Filter**: Filter berdasarkan lokasi
- **Size Range**: Filter berdasarkan luas
- **Status Filter**: Filter berdasarkan status

### Grouping Options
- **By Location**: Group berdasarkan lokasi
- **By Date**: Group berdasarkan tanggal
- **By Size**: Group berdasarkan ukuran
- **Custom Grouping**: Custom grouping criteria

## 📱 User Interface

### Export Interface
- **Export Button**: Main export trigger
- **Format Selection**: Choose export format
- **Field Selection**: Select fields to export
- **Filter Integration**: Apply filters to export

### Print Interface
- **Print Buttons**: Various print options
- **Print Preview**: Preview before printing
- **Print Settings**: Configure print options
- **Print Status**: Track print progress

## 🚀 Usage Examples

### CSV Export
```typescript
// Export all data
const csvData = await exportTanahGarapanToCSV()

// Export selected records
const selectedCsv = await exportTanahGarapanToCSV(selectedIds)

// Export with filters
const filteredCsv = await exportTanahGarapanToCSV(undefined, filters)
```

### Print Operations
```typescript
// Print individual record
window.open(`/garapan/${id}/print`)

// Print selected records
window.open(`/garapan/print/selected?ids=${selectedIds.join(',')}`)

// Print by location
window.open(`/garapan/print/group/${location}`)

// Print all data
window.open('/garapan/print/all')
```

### Print Configuration
```typescript
// Print options
const printOptions = {
  pageSize: 'A4',
  orientation: 'portrait',
  margins: '1cm',
  header: true,
  footer: true,
  pageNumbers: true
}
```

## 📊 Performance Optimization

### Export Performance
- **Streaming Export**: Stream large datasets
- **Chunked Processing**: Process data in chunks
- **Memory Management**: Efficient memory usage
- **Progress Tracking**: Real-time progress updates

### Print Performance
- **Lazy Loading**: Load print data on demand
- **Caching**: Cache print layouts
- **Optimization**: Optimize print rendering
- **Background Processing**: Background print preparation

## 🛡️ Security & Access Control

### Export Security
- **Permission Checking**: Role-based export access
- **Data Filtering**: Filter sensitive data
- **Audit Logging**: Log all export activities
- **Access Control**: Control export permissions

### Print Security
- **Print Logging**: Log all print activities
- **Access Control**: Control print permissions
- **Data Protection**: Protect sensitive information
- **Watermarking**: Optional document watermarks

## 📈 Future Enhancements

### Planned Features
- **Advanced Export Formats**: More export formats
- **Custom Templates**: User-defined print templates
- **Batch Processing**: Advanced batch operations
- **Scheduled Exports**: Automated export scheduling

### Advanced Features
- **Real-time Export**: Live data export
- **API Integration**: External system integration
- **Cloud Storage**: Cloud-based export storage
- **Mobile Printing**: Mobile print support
