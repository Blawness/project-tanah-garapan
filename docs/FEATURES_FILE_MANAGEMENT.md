# 📁 File Management System

## Overview
Sistem manajemen file yang komprehensif untuk upload, validasi, storage, dan preview dokumen terkait tanah garapan dengan security dan organized structure.

## 🎯 Fitur Utama

### 1. **File Upload System**
- **Multiple Format Support**: PDF, images, documents
- **Drag & Drop Interface**: User-friendly upload interface
- **Progress Tracking**: Real-time upload progress
- **Batch Upload**: Multiple file upload support

### 2. **File Validation**
- **MIME Type Validation**: File type verification
- **Size Validation**: File size limits
- **Security Scanning**: Malware dan virus scanning
- **Format Validation**: Supported format checking

### 3. **Organized Storage**
- **Structured Directory**: Organized file structure
- **Date-based Organization**: Files organized by date
- **Type-based Organization**: Files organized by type
- **Automatic Naming**: Unique file naming system

### 4. **File Preview & Management**
- **File Preview**: Preview files before download
- **File Information**: Detailed file metadata
- **Download Management**: Secure file downloads
- **File Deletion**: Safe file removal

## 🛠️ Technical Implementation

### File Upload API
```typescript
// File upload endpoint
export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  
  // Validation
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }
  
  // File validation
  const validation = validateFile(file)
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }
  
  // Save file
  const filePath = await saveFile(file)
  
  return NextResponse.json({ 
    success: true, 
    filePath,
    fileName: file.name 
  })
}
```

### File Storage Structure
```
uploads/
└── tanah-garapan/
    ├── 2024/
    │   ├── 01/
    │   │   ├── 1758809388446-lhqouxwq9qi.pdf
    │   │   ├── 1758809409615-g3mlh4yutv9.pdf
    │   │   └── 1758809449189-p7xzpfoh2u.pdf
    │   └── 02/
    │       └── 1758812623574-evopat8mo9s.pdf
    └── 2025/
        └── 01/
```

### File Validation Schema
```typescript
interface FileValidation {
  allowedTypes: string[]
  maxSize: number
  allowedExtensions: string[]
}

const FILE_VALIDATION: FileValidation = {
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx']
}
```

## 📱 User Interface Components

### File Upload Component
```typescript
interface FileUploadProps {
  onFileSelect: (file: File) => void
  onUploadComplete: (filePath: string) => void
  onUploadError: (error: string) => void
  acceptedTypes?: string[]
  maxSize?: number
  multiple?: boolean
}
```

### File Preview Component
```typescript
interface FilePreviewProps {
  filePath: string
  fileName: string
  fileType: string
  fileSize: number
  onDownload: () => void
  onDelete: () => void
}
```

### File Management Features
- **Upload Progress**: Real-time upload progress bar
- **File List**: List of uploaded files
- **File Actions**: Download, preview, delete actions
- **File Information**: File metadata display

## 🔧 File Operations

### Upload Operations
```typescript
// File upload with validation
export async function uploadFile(file: File): Promise<UploadResult> {
  // Validate file
  const validation = validateFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }
  
  // Generate unique filename
  const fileName = generateUniqueFileName(file.name)
  
  // Save file
  const filePath = await saveFileToStorage(file, fileName)
  
  // Return result
  return {
    success: true,
    filePath,
    fileName,
    fileSize: file.size,
    fileType: file.type
  }
}
```

### File Validation
```typescript
export function validateFile(file: File): ValidationResult {
  // Check file size
  if (file.size > FILE_VALIDATION.maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${FILE_VALIDATION.maxSize / 1024 / 1024}MB limit`
    }
  }
  
  // Check file type
  if (!FILE_VALIDATION.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported'
    }
  }
  
  // Check file extension
  const extension = getFileExtension(file.name)
  if (!FILE_VALIDATION.allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: 'File extension not allowed'
    }
  }
  
  return { valid: true }
}
```

### File Storage
```typescript
export async function saveFileToStorage(file: File, fileName: string): Promise<string> {
  const buffer = await file.arrayBuffer()
  const filePath = generateFilePath(fileName)
  
  // Ensure directory exists
  await ensureDirectoryExists(filePath)
  
  // Write file
  await writeFile(filePath, Buffer.from(buffer))
  
  return filePath
}
```

## 📊 File Types & Support

### Supported File Types
| Type | Extensions | MIME Types | Max Size |
|------|------------|------------|----------|
| Images | .jpg, .jpeg, .png, .gif | image/jpeg, image/png, image/gif | 5MB |
| PDF | .pdf | application/pdf | 10MB |
| Documents | .doc, .docx | application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document | 5MB |

### File Processing
- **Image Processing**: Resize, compress, format conversion
- **PDF Processing**: Text extraction, metadata extraction
- **Document Processing**: Content extraction, metadata parsing
- **Thumbnail Generation**: Automatic thumbnail creation

## 🔍 File Search & Filtering

### Search Features
- **File Name Search**: Search by filename
- **Content Search**: Search within file content
- **Metadata Search**: Search by file metadata
- **Date Range Search**: Search by upload date

### Filter Options
- **File Type Filter**: Filter by file type
- **Size Filter**: Filter by file size
- **Date Filter**: Filter by upload date
- **User Filter**: Filter by uploader

## 🛡️ Security Features

### File Security
- **Virus Scanning**: Malware detection
- **File Type Validation**: Strict MIME type checking
- **Size Limits**: Configurable file size limits
- **Access Control**: Role-based file access

### Storage Security
- **Secure Paths**: Prevent directory traversal
- **Access Permissions**: Proper file permissions
- **Encryption**: Optional file encryption
- **Backup**: Regular file backups

## 📈 File Analytics

### Upload Statistics
- **Total Files**: Total number of uploaded files
- **Total Size**: Total storage used
- **File Types**: Distribution by file type
- **Upload Trends**: Upload activity over time

### Storage Management
- **Storage Usage**: Current storage usage
- **File Cleanup**: Automatic cleanup of old files
- **Storage Alerts**: Storage limit notifications
- **Quota Management**: User storage quotas

## 🔧 Configuration

### File Upload Configuration
```typescript
const UPLOAD_CONFIG = {
  // File size limits
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxTotalSize: 100 * 1024 * 1024, // 100MB
  
  // Allowed file types
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  
  // Storage settings
  storagePath: './uploads',
  organizeByDate: true,
  generateThumbnails: true
}
```

### Environment Variables
```env
# File upload settings
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/*,application/pdf,.doc,.docx"
ENABLE_FILE_SCANNING=true
STORAGE_QUOTA=1073741824
```

## 📱 User Interface Features

### Upload Interface
- **Drag & Drop**: Intuitive drag and drop interface
- **Progress Bar**: Real-time upload progress
- **File Preview**: Preview before upload
- **Error Handling**: Clear error messages

### File Management Interface
- **File List**: Organized file listing
- **File Actions**: Download, preview, delete
- **File Information**: Detailed file metadata
- **Bulk Operations**: Multiple file operations

### Preview Interface
- **Image Preview**: Image file preview
- **PDF Preview**: PDF file preview
- **Document Preview**: Document content preview
- **Download Options**: Various download formats

## 🚀 Usage Examples

### File Upload
```typescript
// Upload single file
const handleFileUpload = async (file: File) => {
  try {
    const result = await uploadFile(file)
    console.log('File uploaded:', result.filePath)
  } catch (error) {
    console.error('Upload failed:', error.message)
  }
}

// Upload multiple files
const handleMultipleUpload = async (files: FileList) => {
  const uploadPromises = Array.from(files).map(file => uploadFile(file))
  const results = await Promise.all(uploadPromises)
  console.log('All files uploaded:', results)
}
```

### File Management
```typescript
// Get file information
const fileInfo = await getFileInfo(filePath)

// Download file
const downloadFile = async (filePath: string) => {
  const response = await fetch(`/api/files/${filePath}`)
  const blob = await response.blob()
  // Trigger download
}

// Delete file
const deleteFile = async (filePath: string) => {
  await deleteFileFromStorage(filePath)
  // Update UI
}
```

### File Validation
```typescript
// Validate file before upload
const validateBeforeUpload = (file: File) => {
  const validation = validateFile(file)
  if (!validation.valid) {
    showError(validation.error)
    return false
  }
  return true
}
```

## 📊 Performance Optimization

### Upload Performance
- **Chunked Upload**: Large file chunked upload
- **Parallel Upload**: Multiple file parallel upload
- **Progress Tracking**: Real-time progress updates
- **Error Recovery**: Automatic retry on failure

### Storage Performance
- **Efficient Storage**: Optimized file storage
- **Compression**: File compression for storage
- **Caching**: File metadata caching
- **Cleanup**: Automatic old file cleanup

## 🛡️ Security Best Practices

### File Security
- **Input Validation**: Strict input validation
- **File Scanning**: Regular virus scanning
- **Access Control**: Proper access permissions
- **Audit Logging**: File access logging

### Storage Security
- **Secure Paths**: Prevent path traversal
- **File Permissions**: Proper file permissions
- **Backup Security**: Secure backup storage
- **Encryption**: Optional file encryption

## 📈 Future Enhancements

### Planned Features
- **Cloud Storage**: Cloud storage integration
- **Advanced Preview**: Enhanced file preview
- **File Versioning**: File version management
- **Collaboration**: File sharing and collaboration

### Advanced Features
- **AI Processing**: AI-powered file processing
- **OCR Integration**: Text extraction from images
- **File Conversion**: Format conversion capabilities
- **Advanced Search**: Full-text search within files
