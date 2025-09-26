# 👥 User Management System

## Overview
Sistem manajemen pengguna yang komprehensif dengan role-based access control, permission management, dan activity tracking.

## 🎯 Fitur Utama

### 1. **User CRUD Operations**
- **Create User**: Tambah pengguna baru dengan role assignment
- **Read Users**: Lihat daftar semua pengguna dengan filtering
- **Update User**: Edit informasi pengguna dan role
- **Delete User**: Hapus pengguna dengan konfirmasi

### 2. **Role Management**
- **4-Level Hierarchy**: Developer → Admin → Manager → User
- **Permission Matrix**: Detailed permission mapping
- **Role Assignment**: Easy role assignment dan changes
- **Role Validation**: Server-side role validation

### 3. **User Interface**
- **User Dashboard**: Overview semua pengguna
- **User Statistics**: Statistik berdasarkan role
- **User Actions**: Quick actions untuk setiap user
- **Permission Overview**: Visual permission matrix

## 🛠️ Technical Implementation

### Database Schema
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

### Permission System
```typescript
const ROLE_HIERARCHY = {
  user: 1, 
  manager: 2, 
  admin: 3, 
  developer: 4
}

// Permission checking functions
export function canManageData(role: string): boolean
export function canViewLogs(role: string): boolean
export function canManageUsers(role: string): boolean
```

## 📱 User Interface Components

### Main Components
- **UserForm**: Modal form untuk create/edit user
- **UserActions**: Dropdown actions untuk setiap user
- **UserTable**: Tabel daftar users dengan actions
- **PermissionMatrix**: Visual permission overview

### UI Features
- **Responsive Design**: Mobile-friendly interface
- **Role Badges**: Visual role indicators
- **Action Buttons**: Quick access actions
- **Confirmation Dialogs**: Safe delete operations
- **Loading States**: Smooth loading experience

## 🔧 Server Actions

### User Operations
```typescript
// User CRUD
export async function createUser(data: UserFormData)
export async function updateUser(id: string, data: UserFormData)
export async function deleteUser(id: string)
export async function getUsers()

// User validation
export async function validateUserEmail(email: string)
export async function checkUserExists(email: string)
```

### Permission Operations
```typescript
// Permission checking
export function canManageData(role: string): boolean
export function canViewLogs(role: string): boolean
export function canManageUsers(role: string): boolean
export function canExportData(role: string): boolean
export function canPrintData(role: string): boolean
```

## 👤 User Roles & Permissions

### Role Hierarchy
```
DEVELOPER (Level 4)
├── Full system access
├── All permissions
└── System administration

ADMIN (Level 3)
├── User management
├── Data management
├── Export/Print access
└── Activity logs access

MANAGER (Level 2)
├── Data management
├── Export/Print access
└── Limited user access

USER (Level 1)
├── View data only
├── Print access
└── No management access
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
| Manage Users | ✅ | ✅ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ |

## 📊 User Dashboard

### Statistics Cards
- **Total Users**: Jumlah total pengguna
- **Developers**: Jumlah developer
- **Admins**: Jumlah administrator
- **Managers**: Jumlah manager
- **Regular Users**: Jumlah user biasa

### User List Features
- **User Cards**: Individual user cards dengan info
- **Role Badges**: Visual role indicators
- **Action Buttons**: Quick access actions
- **Search/Filter**: Find users quickly
- **Sorting**: Sort by name, role, date

## 🔐 Security Features

### Password Security
- **bcrypt Hashing**: Secure password storage
- **Password Validation**: Strong password requirements
- **No Plain Text**: Never store plain text passwords
- **Salt Rounds**: Configurable salt rounds

### Access Control
- **Server-side Validation**: All permissions checked server-side
- **Route Protection**: Middleware-based route protection
- **Component Protection**: Role-based component rendering
- **API Protection**: Server action protection

### Audit Trail
- **User Actions**: Log all user management actions
- **Role Changes**: Track role modifications
- **Login Events**: Monitor login activities
- **Permission Changes**: Track permission updates

## 📝 User Form Features

### Form Fields
- **Name**: User full name
- **Email**: Unique email address
- **Password**: Secure password input
- **Role**: Role selection dropdown
- **Confirmation**: Password confirmation

### Validation
- **Email Uniqueness**: Check for duplicate emails
- **Password Strength**: Strong password requirements
- **Required Fields**: All fields required
- **Format Validation**: Proper email format

### Form States
- **Create Mode**: Add new user
- **Edit Mode**: Update existing user
- **Loading State**: Form submission loading
- **Error Handling**: User-friendly error messages

## 🎨 UI/UX Features

### Visual Design
- **Role Color Coding**: Different colors for each role
- **Status Indicators**: Visual status indicators
- **Action Icons**: Intuitive action icons
- **Responsive Layout**: Mobile-friendly design

### User Experience
- **Quick Actions**: Fast access to common actions
- **Confirmation Dialogs**: Safe operation confirmations
- **Toast Notifications**: Real-time feedback
- **Loading States**: Smooth loading transitions

## 📈 User Analytics

### User Statistics
- **Total Users**: Overall user count
- **Role Distribution**: Users per role
- **Active Users**: Recently active users
- **New Users**: Recently created users

### Activity Tracking
- **User Actions**: Track user activities
- **Login History**: Monitor login patterns
- **Permission Usage**: Track permission usage
- **System Access**: Monitor system access

## 🔧 Configuration

### Environment Variables
```env
# User management settings
DEFAULT_USER_ROLE=USER
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_SPECIAL=true
USER_SESSION_TIMEOUT=3600
```

### Role Configuration
```typescript
// Role hierarchy configuration
const ROLE_CONFIG = {
  DEVELOPER: {
    level: 4,
    permissions: ['ALL'],
    description: 'Full system access'
  },
  ADMIN: {
    level: 3,
    permissions: ['MANAGE_USERS', 'MANAGE_DATA', 'VIEW_LOGS'],
    description: 'Administrative privileges'
  },
  MANAGER: {
    level: 2,
    permissions: ['MANAGE_DATA', 'EXPORT_DATA'],
    description: 'Data management access'
  },
  USER: {
    level: 1,
    permissions: ['VIEW_DATA', 'PRINT_DATA'],
    description: 'Read-only access'
  }
}
```

## 🚀 Usage Examples

### Creating New User
```typescript
const userData = {
  name: "John Doe",
  email: "john@example.com",
  password: "securePassword123",
  role: "MANAGER"
}

const result = await createUser(userData)
```

### Checking Permissions
```typescript
// Check if user can manage data
if (canManageData(user.role)) {
  // Show edit/delete buttons
}

// Check if user can view logs
if (canViewLogs(user.role)) {
  // Show activity logs
}
```

### Role-based Rendering
```typescript
// Show user management only for admins
{canManageUsers(user.role) && (
  <UserManagementPanel />
)}

// Show data management for managers and above
{canManageData(user.role) && (
  <DataManagementPanel />
)}
```

## 🛡️ Security Best Practices

### Password Security
- Use strong password requirements
- Implement password hashing with bcrypt
- Never store plain text passwords
- Regular password policy updates

### Access Control
- Always validate permissions server-side
- Use role-based component rendering
- Implement proper session management
- Regular security audits

### User Management
- Implement user deactivation
- Track all user management actions
- Regular permission reviews
- Monitor suspicious activities

## 📊 Future Enhancements

### Planned Features
- **User Groups**: Group-based permissions
- **Two-Factor Authentication**: Enhanced security
- **Password Reset**: Self-service password reset
- **User Profiles**: Extended user profiles
- **Bulk Operations**: Bulk user management

### Advanced Features
- **LDAP Integration**: Enterprise authentication
- **SSO Support**: Single sign-on integration
- **Advanced Analytics**: User behavior analytics
- **Custom Roles**: User-defined roles
- **Permission Templates**: Reusable permission sets
