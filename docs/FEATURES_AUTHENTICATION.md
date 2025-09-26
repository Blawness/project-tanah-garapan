# 🔐 Authentication & Authorization System

## Overview
Sistem autentikasi dan otorisasi yang komprehensif menggunakan NextAuth.js dengan JWT dan role-based access control.

## 🎯 Fitur Utama

### 1. **Multi-Role Authentication**
- **4 Level Role Hierarchy**: Developer → Admin → Manager → User
- **JWT-based Session Management**: Secure token-based authentication
- **Password Security**: bcrypt hashing untuk keamanan password
- **Session Persistence**: Auto-login dan session management

### 2. **Role-Based Access Control (RBAC)**
```typescript
enum UserRole {
  DEVELOPER  // Full system access
  ADMIN      // Administrative privileges  
  MANAGER    // Data management access
  USER       // Read-only access
}
```

### 3. **Permission Matrix**
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

## 🛠️ Technical Implementation

### Authentication Flow
1. **Login Form** → NextAuth.js credentials provider
2. **Server Validation** → Database user lookup + bcrypt password check
3. **JWT Token** → Secure session management
4. **Route Protection** → Middleware-based access control

### Key Components
- `src/lib/auth.ts` - Authentication utilities dan role checking
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth.js API configuration
- `src/middleware.ts` - Route protection middleware
- `src/app/login/page.tsx` - Login interface

### Security Features
- **Password Hashing**: bcrypt dengan salt rounds
- **JWT Expiration**: Automatic token refresh
- **CSRF Protection**: Built-in NextAuth.js protection
- **Session Validation**: Server-side session verification

## 📱 User Interface

### Login Page
- Clean, responsive login form
- Error handling dan validation
- Remember me functionality
- Loading states

### Session Management
- Auto-redirect based on role
- Session timeout handling
- Logout functionality
- User profile display

## 🔧 Configuration

### Environment Variables
```env
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

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
}
```

## 🚀 Usage Examples

### Role Checking
```typescript
import { canManageData, canViewLogs } from '@/lib/auth'

// Check if user can manage data
if (canManageData(user.role)) {
  // Show edit/delete buttons
}

// Check if user can view logs
if (canViewLogs(user.role)) {
  // Show activity logs
}
```

### Protected Routes
```typescript
// In middleware.ts
export function middleware(request: NextRequest) {
  // Check authentication and role
  // Redirect unauthorized users
}
```

## 📊 Security Considerations

### Password Security
- Minimum password requirements
- bcrypt hashing with salt
- No plain text storage

### Session Security
- JWT token expiration
- Secure cookie settings
- CSRF protection

### Access Control
- Server-side permission checking
- Route-level protection
- Component-level access control

## 🔍 Monitoring & Logging

### Activity Tracking
- Login/logout events
- Permission denied attempts
- Role changes
- Session management

### Audit Trail
- User action logging
- Security event tracking
- Access pattern monitoring

## 🛡️ Best Practices

### Development
- Always check permissions server-side
- Use role-based component rendering
- Implement proper error handling
- Log security events

### Security
- Regular password policy updates
- Session timeout configuration
- Monitor failed login attempts
- Regular security audits

## 📈 Future Enhancements

### Planned Features
- Two-factor authentication (2FA)
- Password reset functionality
- Account lockout policies
- Advanced session management
- OAuth integration options

### Security Improvements
- Rate limiting for login attempts
- IP-based access control
- Advanced audit logging
- Security notifications
