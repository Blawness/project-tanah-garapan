# 🚀 Deployment & Production System

## Overview
Sistem deployment dan production yang komprehensif dengan konfigurasi untuk berbagai environment dan platform hosting.

## 🎯 Fitur Utama

### 1. **Production Build**
- **Next.js Build**: Optimized production build
- **Static Generation**: Static site generation
- **Asset Optimization**: Image dan file optimization
- **Bundle Analysis**: Bundle size optimization

### 2. **Environment Management**
- **Multi-environment**: Development, staging, production
- **Environment Variables**: Secure configuration management
- **Database Configuration**: Production database setup
- **File Storage**: Production file storage

### 3. **Deployment Options**
- **Vercel Deployment**: One-click Vercel deployment
- **Docker Deployment**: Containerized deployment
- **Traditional Hosting**: Shared hosting deployment
- **Cloud Deployment**: AWS, GCP, Azure deployment

## 🛠️ Technical Implementation

### Build Configuration
```javascript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/tanah-garapan',
        permanent: true,
      },
    ]
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

export default nextConfig
```

### Environment Configuration
```bash
# .env.production
NODE_ENV=production
DATABASE_URL="mysql://username:password@host:3306/production_db"
NEXTAUTH_SECRET="your-production-secret-key"
NEXTAUTH_URL="https://your-domain.com"
UPLOAD_PATH="/var/www/uploads"
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/*,application/pdf,.doc,.docx"
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://root:password@db:3306/tanah_garapan_db
      - NEXTAUTH_SECRET=your-secret-key
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=tanah_garapan_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  mysql_data:
```

## 📱 Deployment Options

### Vercel Deployment
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "NEXTAUTH_URL": "@nextauth_url"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  }
}
```

### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'tanah-garapan',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/tanah-garapan',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/tanah-garapan/error.log',
      out_file: '/var/log/tanah-garapan/out.log',
      log_file: '/var/log/tanah-garapan/combined.log',
      time: true
    }
  ]
}
```

### Nginx Configuration
```nginx
# nginx.conf
upstream nextjs_upstream {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Static files
    location /_next/static/ {
        alias /var/www/tanah-garapan/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Uploads
    location /uploads/ {
        alias /var/www/tanah-garapan/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }

    # API routes
    location /api/ {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Next.js app
    location / {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Build Scripts

### Production Build
```bash
#!/bin/bash
# scripts/build-production.sh

echo "Building production application..."

# Install dependencies
npm ci --only=production

# Generate Prisma client
npx prisma generate

# Build application
npm run build

# Create uploads directory
mkdir -p uploads/tanah-garapan

# Set permissions
chmod -R 755 uploads

echo "Production build completed!"
```

### Deployment Script
```bash
#!/bin/bash
# scripts/deploy.sh

echo "Deploying application..."

# Pull latest code
git pull origin main

# Install dependencies
npm ci --only=production

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Build application
npm run build

# Restart PM2
pm2 restart tanah-garapan

echo "Deployment completed!"
```

## 📊 Environment Management

### Environment Variables
```bash
# Development
NODE_ENV=development
DATABASE_URL="mysql://root:password@localhost:3306/tanah_garapan_dev"
NEXTAUTH_SECRET="dev-secret-key"
NEXTAUTH_URL="http://localhost:3000"
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/*,application/pdf,.doc,.docx"

# Staging
NODE_ENV=staging
DATABASE_URL="mysql://user:pass@staging-db:3306/tanah_garapan_staging"
NEXTAUTH_SECRET="staging-secret-key"
NEXTAUTH_URL="https://staging.your-domain.com"
UPLOAD_PATH="/var/www/staging/uploads"
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/*,application/pdf,.doc,.docx"

# Production
NODE_ENV=production
DATABASE_URL="mysql://user:pass@prod-db:3306/tanah_garapan_prod"
NEXTAUTH_SECRET="production-secret-key"
NEXTAUTH_URL="https://your-domain.com"
UPLOAD_PATH="/var/www/production/uploads"
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/*,application/pdf,.doc,.docx"
```

### Database Configuration
```sql
-- Production database setup
CREATE DATABASE tanah_garapan_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'tanah_garapan_user'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON tanah_garapan_prod.* TO 'tanah_garapan_user'@'%';
FLUSH PRIVILEGES;

-- Set up replication (if needed)
CHANGE MASTER TO
  MASTER_HOST='master-db-host',
  MASTER_USER='replication_user',
  MASTER_PASSWORD='replication_password',
  MASTER_LOG_FILE='mysql-bin.000001',
  MASTER_LOG_POS=0;
```

## 🛡️ Security Configuration

### SSL/TLS Setup
```bash
# Generate SSL certificate with Let's Encrypt
certbot --nginx -d your-domain.com

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

### Firewall Configuration
```bash
# UFW firewall setup
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Fail2ban for SSH protection
apt install fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

### Database Security
```sql
-- Secure MySQL configuration
SET GLOBAL validate_password.policy = STRONG;
SET GLOBAL validate_password.length = 12;
SET GLOBAL validate_password.mixed_case_count = 1;
SET GLOBAL validate_password.number_count = 1;
SET GLOBAL validate_password.special_char_count = 1;

-- Disable root remote access
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
FLUSH PRIVILEGES;
```

## 📈 Monitoring & Logging

### Application Monitoring
```javascript
// monitoring.js
const pm2 = require('pm2');

// Monitor PM2 processes
pm2.connect((err) => {
  if (err) {
    console.error(err);
    process.exit(2);
  }

  pm2.list((err, list) => {
    console.log(list);
    pm2.disconnect();
  });
});
```

### Log Management
```bash
# Log rotation configuration
# /etc/logrotate.d/tanah-garapan
/var/log/tanah-garapan/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Health Checks
```typescript
// health-check.ts
export async function healthCheck() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Check file system
    await fs.access(process.env.UPLOAD_PATH!)
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        filesystem: 'up'
      }
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }
  }
}
```

## 🚀 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:ci
    
    - name: Build application
      run: npm run build
      env:
        NODE_ENV: production
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/tanah-garapan
          git pull origin main
          npm ci --only=production
          npx prisma generate
          npx prisma db push
          npm run build
          pm2 restart tanah-garapan
```

## 📊 Performance Optimization

### Build Optimization
```javascript
// next.config.ts optimizations
const nextConfig = {
  // Enable SWC minification
  swcMinify: true,
  
  // Optimize bundle
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      }
    }
    return config
  }
}
```

### Caching Strategy
```typescript
// Cache configuration
export const cacheConfig = {
  // Static assets
  static: {
    maxAge: 31536000, // 1 year
    immutable: true
  },
  
  // API responses
  api: {
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 60 // 1 minute
  },
  
  // Database queries
  database: {
    maxAge: 60, // 1 minute
    staleWhileRevalidate: 30 // 30 seconds
  }
}
```

## 📈 Future Enhancements

### Planned Features
- **Kubernetes Deployment**: Container orchestration
- **CDN Integration**: Global content delivery
- **Auto-scaling**: Automatic scaling based on load
- **Blue-Green Deployment**: Zero-downtime deployments

### Advanced Features
- **Multi-region Deployment**: Global deployment
- **Database Sharding**: Horizontal database scaling
- **Microservices**: Service decomposition
- **Event-driven Architecture**: Asynchronous processing
