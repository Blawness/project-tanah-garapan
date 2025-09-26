# 🚀 Deployment Guide - VPS Hostinger + PM2 + CloudPanel

## 📋 Prerequisites

- VPS Hostinger dengan CloudPanel
- Node.js 18+ (install via CloudPanel)
- MySQL 8.0+ (via CloudPanel)
- PM2 (install via CloudPanel atau terminal)

## 🔧 Setup VPS Hostinger

### 1. Login ke CloudPanel

1. Akses CloudPanel di VPS Anda
2. Pastikan Node.js 18+ sudah terinstall
3. Pastikan MySQL 8.0+ sudah running

### 2. Upload Project

**Via Git (Recommended):**
```bash
# SSH ke VPS
ssh root@your-vps-ip

# Clone repository
cd /home/cloudpanel/htdocs
git clone <your-repository-url> tanah-garapan-app
cd tanah-garapan-app
```

**Via File Manager:**
1. Login ke CloudPanel
2. Upload project ke `/home/cloudpanel/htdocs/tanah-garapan-app`
3. Extract file jika dalam format zip

### 3. Install Dependencies

```bash
# Install dependencies
npm install

# Install PM2 globally
npm install -g pm2
```

### 4. Environment Configuration

Buat file `.env` di root project:

```env
# Database (gunakan info dari CloudPanel MySQL)
DATABASE_URL="mysql://username:password@localhost:3306/tanah_garapan_db"

# Authentication
NEXTAUTH_SECRET="your-super-secure-secret-key-here"
NEXTAUTH_URL="https://your-domain.com"

# File Storage
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/*,application/pdf,.doc,.docx"

# Application
NODE_ENV="production"
PORT=3000
```

### 5. Database Setup

**Via CloudPanel MySQL:**
1. Buka CloudPanel → MySQL
2. Buat database baru: `tanah_garapan_db`
3. Buat user baru dengan password yang kuat
4. Berikan semua privileges ke database

**Via Terminal:**
```bash
# Generate Prisma client
npx prisma generate

# Push schema ke database
npx prisma db push

# Seed database (optional)
npm run db:seed
```

### 6. Build Application

```bash
# Build untuk production
npm run build
```

## 🚀 PM2 Deployment

### 1. Setup PM2 Configuration

File `ecosystem.config.js` sudah tersedia, sesuaikan jika perlu:

```javascript
module.exports = {
  apps: [
    {
      name: 'tanah-garapan-app',
      script: 'npm',
      args: 'start',
      cwd: '/home/cloudpanel/htdocs/tanah-garapan-app',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
    },
  ],
}
```

### 2. Start Application dengan PM2

```bash
# Start aplikasi
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 untuk auto-start saat reboot
pm2 startup
# Ikuti instruksi yang muncul

# Monitor aplikasi
pm2 status
pm2 logs tanah-garapan-app
```

## 🌐 Nginx Configuration (CloudPanel)

### 1. Setup Domain di CloudPanel

1. Buka CloudPanel → Sites
2. Tambah site baru dengan domain Anda
3. Pilih "Custom" sebagai aplikasi

### 2. Nginx Configuration

Edit file nginx config untuk domain Anda:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # File upload size
    client_max_body_size 10M;

    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /uploads/ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. SSL Certificate (Let's Encrypt)

1. Di CloudPanel, buka site Anda
2. Klik "SSL" tab
3. Pilih "Let's Encrypt"
4. Masukkan email dan domain
5. Klik "Install"

## 📊 Monitoring & Maintenance

### 1. PM2 Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs tanah-garapan-app

# Restart aplikasi
pm2 restart tanah-garapan-app

# Monitor resources
pm2 monit

# Stop aplikasi
pm2 stop tanah-garapan-app

# Delete aplikasi
pm2 delete tanah-garapan-app
```

### 2. Database Backup

**Via CloudPanel:**
1. Buka CloudPanel → MySQL
2. Pilih database `tanah_garapan_db`
3. Klik "Export" untuk download backup

**Via Terminal:**
```bash
# Backup database
mysqldump -u username -p tanah_garapan_db > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u username -p tanah_garapan_db < backup_20240101.sql
```

### 3. Log Management

```bash
# View application logs
tail -f logs/combined.log

# View PM2 logs
pm2 logs

# Clear logs
pm2 flush
```

## 🔄 Updates & Maintenance

### 1. Update Application

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Run database migrations (jika ada)
npx prisma db push

# Restart aplikasi
pm2 restart tanah-garapan-app
```

### 2. File Permissions

```bash
# Set proper permissions
chown -R cloudpanel:cloudpanel /home/cloudpanel/htdocs/tanah-garapan-app
chmod -R 755 /home/cloudpanel/htdocs/tanah-garapan-app

# Set permissions untuk uploads
chmod -R 777 /home/cloudpanel/htdocs/tanah-garapan-app/uploads
```

## 🚨 Troubleshooting

### Common Issues

1. **Aplikasi tidak start**
   ```bash
   # Check logs
   pm2 logs tanah-garapan-app
   
   # Check environment
   pm2 show tanah-garapan-app
   ```

2. **Database connection error**
   ```bash
   # Test database connection
   mysql -u username -p -h localhost
   
   # Check database status
   systemctl status mysql
   ```

3. **File upload issues**
   ```bash
   # Check upload directory permissions
   ls -la uploads/
   chmod -R 777 uploads/
   ```

4. **Port 3000 sudah digunakan**
   ```bash
   # Check port usage
   netstat -tulpn | grep :3000
   
   # Kill process yang menggunakan port
   kill -9 <PID>
   ```

### Health Checks

```bash
# Check aplikasi status
curl http://localhost:3000

# Check database
mysql -u username -p -e "SELECT 1"

# Check disk space
df -h

# Check memory usage
free -h
```

## 📈 Performance Optimization

### 1. PM2 Cluster Mode

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'tanah-garapan-app',
    script: 'npm',
    args: 'start',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    // ... other config
  }]
}
```

### 2. Nginx Caching

```nginx
# Add to nginx config
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_tanah_garapan_letak_tanah ON tanah_garapan_entries(letakTanah);
CREATE INDEX idx_tanah_garapan_nama_pemegang ON tanah_garapan_entries(namaPemegangHak);
CREATE INDEX idx_tanah_garapan_created_at ON tanah_garapan_entries(createdAt);
```

## 🔒 Security Considerations

### 1. Firewall Setup

```bash
# Allow only necessary ports
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### 2. Database Security

```sql
-- Remove test databases
DROP DATABASE IF EXISTS test;

-- Create application user with limited privileges
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON tanah_garapan_db.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. File Permissions

```bash
# Secure file permissions
chmod 600 .env
chmod 755 uploads/
chmod 644 logs/*.log
```

## 📝 Backup Strategy

### 1. Automated Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/cloudpanel/backups"
DB_NAME="tanah_garapan_db"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u root -p $DB_NAME > $BACKUP_DIR/db_$DATE.sql

# File backup
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz uploads/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

### 2. Cron Job Setup

```bash
# Add to crontab
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * /home/cloudpanel/htdocs/tanah-garapan-app/backup.sh
```

---

## 📞 Support

Untuk deployment issues:
- Check PM2 logs: `pm2 logs tanah-garapan-app`
- Check CloudPanel logs
- Review database connection settings
- Monitor resource usage dengan `pm2 monit`

## 🎯 Quick Commands

```bash
# Start aplikasi
pm2 start ecosystem.config.js

# Restart aplikasi
pm2 restart tanah-garapan-app

# Stop aplikasi
pm2 stop tanah-garapan-app

# View logs
pm2 logs tanah-garapan-app

# Monitor
pm2 monit

# Update aplikasi
git pull && npm install && pm2 restart tanah-garapan-app
```
