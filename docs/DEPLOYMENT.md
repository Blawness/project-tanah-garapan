# 🚀 Deployment Guide - Tanah Garapan Standalone

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- PM2 (for process management)
- Docker & Docker Compose (optional)

## 🔧 Production Setup

### 1. Environment Configuration

Create `.env.production` file:

```env
# Database
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

### 2. Database Setup

```bash
# Create production database
mysql -u root -p
CREATE DATABASE tanah_garapan_db;
CREATE USER 'tanah_garapan'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON tanah_garapan_db.* TO 'tanah_garapan'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Run migrations
npm run db:push
npm run db:seed
```

### 3. Build Application

```bash
# Install dependencies
npm ci --production

# Generate Prisma client
npx prisma generate

# Build application
npm run build
```

### 4. PM2 Deployment

```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 5. Nginx Configuration

Create `/etc/nginx/sites-available/tanah-garapan`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

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

    location /uploads/ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/tanah-garapan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🐳 Docker Deployment

### 1. Using Docker Compose

```bash
# Clone repository
git clone <repository-url>
cd tanah-garapan-standalone

# Create environment file
cp .env.example .env.production

# Edit environment variables
nano .env.production

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f app
```

### 2. Manual Docker Build

```bash
# Build image
docker build -t tanah-garapan-app .

# Run container
docker run -d \
  --name tanah-garapan \
  -p 3000:3000 \
  -e DATABASE_URL="mysql://user:pass@host:3306/db" \
  -e NEXTAUTH_SECRET="your-secret" \
  -v $(pwd)/uploads:/app/uploads \
  tanah-garapan-app
```

## 📊 Monitoring & Maintenance

### 1. PM2 Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs tanah-garapan-app

# Restart application
pm2 restart tanah-garapan-app

# Monitor resources
pm2 monit
```

### 2. Database Maintenance

```bash
# Backup database
mysqldump -u root -p tanah_garapan_db > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u root -p tanah_garapan_db < backup_20240101.sql
```

### 3. Log Management

```bash
# View application logs
tail -f logs/combined.log

# Rotate logs (add to crontab)
0 0 * * * pm2 flush
```

## 🔒 Security Considerations

### 1. SSL/HTTPS Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Firewall Configuration

```bash
# UFW setup
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 3. Database Security

```sql
-- Remove test databases
DROP DATABASE IF EXISTS test;

-- Create application user with limited privileges
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON tanah_garapan_db.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;
```

## 📈 Performance Optimization

### 1. Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_tanah_garapan_letak_tanah ON tanah_garapan_entries(letakTanah);
CREATE INDEX idx_tanah_garapan_nama_pemegang ON tanah_garapan_entries(namaPemegangHak);
CREATE INDEX idx_tanah_garapan_created_at ON tanah_garapan_entries(createdAt);
```

### 2. Nginx Caching

```nginx
# Add to nginx configuration
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. PM2 Cluster Mode

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

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check database status
   sudo systemctl status mysql
   
   # Test connection
   mysql -u username -p -h localhost
   ```

2. **Application Won't Start**
   ```bash
   # Check logs
   pm2 logs tanah-garapan-app
   
   # Check environment variables
   pm2 show tanah-garapan-app
   ```

3. **File Upload Issues**
   ```bash
   # Check upload directory permissions
   ls -la uploads/
   sudo chown -R www-data:www-data uploads/
   ```

### Health Checks

```bash
# Application health
curl http://localhost:3000/api/health

# Database health
mysql -u username -p -e "SELECT 1"

# Disk space
df -h

# Memory usage
free -h
```

## 📝 Backup Strategy

### 1. Automated Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="tanah_garapan_db"

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
0 2 * * * /path/to/backup.sh
```

## 🔄 Updates & Maintenance

### 1. Application Updates

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm ci

# Run migrations
npm run db:push

# Restart application
pm2 restart tanah-garapan-app
```

### 2. System Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js (if needed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## 📞 Support

For deployment issues or questions:
- Check logs: `pm2 logs tanah-garapan-app`
- Review documentation: `docs/readme.md`
- Database issues: Check MySQL logs and connection settings
- Performance issues: Monitor with `pm2 monit` and database query analysis
