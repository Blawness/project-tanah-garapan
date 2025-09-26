# 📊 Activity Logging & Monitoring System

## Overview
Sistem logging dan monitoring yang komprehensif untuk melacak semua aktivitas pengguna, perubahan data, dan event sistem dengan audit trail yang lengkap.

## 🎯 Fitur Utama

### 1. **Comprehensive Activity Tracking**
- **User Actions**: Semua aksi pengguna dicatat
- **Data Changes**: Perubahan data dengan before/after values
- **System Events**: Event sistem dan error tracking
- **Authentication Events**: Login, logout, dan session management

### 2. **Advanced Logging Features**
- **Structured Logging**: JSON-based log format
- **Contextual Information**: User, timestamp, dan action details
- **Payload Storage**: Detailed data dalam JSON format
- **Activity Grouping**: Group logs by date dan user

### 3. **Monitoring Dashboard**
- **Real-time Activity**: Live activity monitoring
- **Statistics Overview**: Activity statistics dan trends
- **User Activity**: Per-user activity tracking
- **System Health**: System performance monitoring

## 🛠️ Technical Implementation

### Database Schema
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
}
```

### Logging Categories
```typescript
enum LogAction {
  // User Management
  CREATE_USER = 'CREATE_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  
  // Tanah Garapan
  CREATE_ENTRY = 'CREATE_ENTRY',
  UPDATE_ENTRY = 'UPDATE_ENTRY',
  DELETE_ENTRY = 'DELETE_ENTRY',
  SEARCH_ENTRY = 'SEARCH_ENTRY',
  EXPORT_CSV = 'EXPORT_CSV',
  
  // Proyek
  CREATE_PROYEK = 'CREATE_PROYEK',
  UPDATE_PROYEK = 'UPDATE_PROYEK',
  DELETE_PROYEK = 'DELETE_PROYEK',
  
  // Pembelian
  CREATE_PEMBELIAN = 'CREATE_PEMBELIAN',
  UPDATE_PEMBELIAN = 'UPDATE_PEMBELIAN',
  DELETE_PEMBELIAN = 'DELETE_PEMBELIAN',
  
  // Pembayaran
  CREATE_PEMBAYARAN = 'CREATE_PEMBAYARAN',
  UPDATE_PEMBAYARAN = 'UPDATE_PEMBAYARAN',
  VERIFY_PEMBAYARAN = 'VERIFY_PEMBAYARAN',
  
  // System
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  SYSTEM_ERROR = 'SYSTEM_ERROR'
}
```

## 📱 User Interface Components

### Activity Logs Page
- **Log List**: Daftar semua activity logs
- **Filter Options**: Filter berdasarkan user, action, date
- **Search Functionality**: Pencarian dalam logs
- **Export Options**: Export logs ke CSV/PDF

### Dashboard Integration
- **Recent Activity**: Recent activities di dashboard
- **Activity Statistics**: Statistik aktivitas
- **User Activity**: Per-user activity summary
- **System Health**: System performance indicators

### Log Details
- **Detailed View**: Detailed log information
- **Payload Viewer**: JSON payload viewer
- **User Context**: User information dan context
- **Action Details**: Detailed action information

## 🔧 Server Actions

### Logging Operations
```typescript
// Core logging functions
export async function logActivity(
  user: string, 
  action: string, 
  details: string, 
  payload?: any
)

// Activity retrieval
export async function getActivityLogs(
  page?: number, 
  pageSize?: number, 
  filters?: LogFilters
)

// Statistics
export async function getActivityStats()
export async function getUserActivity(user: string)
export async function getActivityByDateRange(startDate: string, endDate: string)
```

### Logging Utilities
```typescript
// Automatic logging for common actions
export async function logUserAction(user: string, action: string, details: string)
export async function logDataChange(user: string, entity: string, action: string, data: any)
export async function logSystemEvent(event: string, details: string, level: 'INFO' | 'WARN' | 'ERROR')
```

## 📊 Log Categories & Types

### User Management Logs
- **User Creation**: New user registration
- **User Updates**: Profile dan role changes
- **User Deletion**: User account removal
- **Permission Changes**: Role dan permission updates

### Data Management Logs
- **CRUD Operations**: Create, read, update, delete operations
- **Data Exports**: Export operations dan file downloads
- **Search Operations**: Search queries dan filters
- **Bulk Operations**: Bulk data operations

### System Event Logs
- **Authentication**: Login, logout, session events
- **Error Events**: System errors dan exceptions
- **Performance**: Performance metrics dan slow queries
- **Security**: Security events dan access attempts

### Business Process Logs
- **Proyek Management**: Project creation dan updates
- **Pembelian Process**: Purchase workflow events
- **Payment Processing**: Payment events dan verification
- **Document Generation**: Document creation dan printing

## 📈 Activity Dashboard

### Statistics Overview
- **Total Activities**: Total number of logged activities
- **Today's Activities**: Activities logged today
- **This Week**: Activities in the last 7 days
- **Top Users**: Most active users
- **Popular Actions**: Most common actions

### Activity Trends
- **Daily Activity**: Activity trends over time
- **User Activity**: Per-user activity patterns
- **Action Distribution**: Distribution of action types
- **Peak Hours**: Busiest times of day

### Real-time Monitoring
- **Live Activity**: Real-time activity feed
- **System Alerts**: Important system events
- **Error Tracking**: Error occurrence tracking
- **Performance Metrics**: System performance indicators

## 🔍 Search & Filter Features

### Advanced Filtering
- **User Filter**: Filter by specific users
- **Action Filter**: Filter by action types
- **Date Range**: Filter by date range
- **Payload Search**: Search within JSON payloads
- **Status Filter**: Filter by log status

### Search Capabilities
- **Full-text Search**: Search across all log fields
- **Exact Match**: Exact string matching
- **Regex Search**: Regular expression search
- **Case Sensitivity**: Case-sensitive/insensitive options

## 📊 Log Analysis & Reporting

### Activity Reports
- **User Activity Report**: Per-user activity summary
- **Action Summary**: Action type distribution
- **Time-based Reports**: Activity over time
- **Custom Reports**: User-defined report criteria

### Export Options
- **CSV Export**: Export logs to CSV format
- **PDF Reports**: Generate PDF reports
- **JSON Export**: Raw data export
- **Scheduled Reports**: Automated report generation

### Analytics
- **Usage Patterns**: User behavior analysis
- **System Performance**: Performance trend analysis
- **Error Analysis**: Error pattern identification
- **Security Analysis**: Security event analysis

## 🛡️ Security & Privacy

### Data Protection
- **Sensitive Data**: Mask sensitive information in logs
- **PII Protection**: Protect personally identifiable information
- **Data Retention**: Configurable data retention policies
- **Access Control**: Role-based log access

### Audit Trail
- **Immutable Logs**: Prevent log tampering
- **Digital Signatures**: Verify log integrity
- **Backup & Recovery**: Log backup strategies
- **Compliance**: Meet regulatory requirements

## 🔧 Configuration

### Logging Configuration
```typescript
const LOGGING_CONFIG = {
  // Log levels
  levels: ['ERROR', 'WARN', 'INFO', 'DEBUG'],
  
  // Retention policy
  retention: {
    days: 90,
    maxSize: '1GB'
  },
  
  // Sensitive fields to mask
  sensitiveFields: ['password', 'token', 'secret'],
  
  // Log rotation
  rotation: {
    maxFiles: 10,
    maxSize: '100MB'
  }
}
```

### Environment Variables
```env
# Logging configuration
LOG_LEVEL=INFO
LOG_RETENTION_DAYS=90
LOG_MAX_SIZE=100MB
ENABLE_AUDIT_LOGS=true
```

## 📱 UI Features

### Activity Logs Interface
- **Timeline View**: Chronological activity display
- **Grouped View**: Group by date atau user
- **Detailed View**: Expandable log details
- **Quick Actions**: Fast access to common actions

### Filtering Interface
- **Quick Filters**: Predefined filter options
- **Advanced Filters**: Custom filter criteria
- **Saved Filters**: Save frequently used filters
- **Filter Presets**: Common filter combinations

### Export Interface
- **Export Options**: Multiple export formats
- **Date Range Picker**: Easy date selection
- **Filter Integration**: Export filtered results
- **Progress Tracking**: Export progress indication

## 🚀 Usage Examples

### Basic Logging
```typescript
// Log user action
await logActivity(
  'user@example.com',
  'CREATE_ENTRY',
  'Created new tanah garapan entry',
  { entryId: '123', location: 'Desa ABC' }
)

// Log data change
await logDataChange(
  'user@example.com',
  'TanahGarapanEntry',
  'UPDATE',
  { id: '123', changes: { luas: 5000 } }
)
```

### Advanced Logging
```typescript
// Log with detailed payload
await logActivity(
  'user@example.com',
  'EXPORT_CSV',
  'Exported tanah garapan data',
  {
    filters: { location: 'Desa ABC' },
    recordCount: 150,
    fileSize: '2.5MB'
  }
)
```

### Querying Logs
```typescript
// Get recent activities
const recentLogs = await getActivityLogs(1, 20)

// Get user-specific logs
const userLogs = await getUserActivity('user@example.com')

// Get logs by date range
const dateRangeLogs = await getActivityByDateRange(
  '2024-01-01',
  '2024-01-31'
)
```

## 📊 Future Enhancements

### Planned Features
- **Real-time Notifications**: Live activity notifications
- **Advanced Analytics**: Machine learning-based insights
- **Custom Dashboards**: User-defined dashboards
- **API Integration**: External system integration
- **Mobile App**: Mobile activity monitoring

### Advanced Features
- **Log Aggregation**: Centralized log collection
- **Alert System**: Automated alert generation
- **Performance Monitoring**: Advanced performance metrics
- **Security Monitoring**: Enhanced security event tracking
- **Compliance Reporting**: Automated compliance reports
