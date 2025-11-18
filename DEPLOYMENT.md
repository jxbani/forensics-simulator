# Deployment Guide

This guide covers deploying the Digital Forensics Training Simulator to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Docker Deployment](#docker-deployment)
- [Production Checklist](#production-checklist)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- Node.js 18+ (LTS recommended)
- npm 9+
- Git
- SQLite 3 (included with Node.js) OR PostgreSQL 14+ (for production scale)
- SSL certificate (for HTTPS)
- Domain name (optional but recommended)

### Recommended Services
- Cloud hosting: AWS, Google Cloud, DigitalOcean, Heroku, Railway
- CDN: Cloudflare, AWS CloudFront
- Database: Managed PostgreSQL (AWS RDS, DigitalOcean Managed DB)
- File storage: AWS S3, Google Cloud Storage (for uploads)
- Monitoring: New Relic, Datadog, Sentry

---

## Environment Configuration

### 1. Backend Environment Variables

Create `/backend/.env` file with production values:

```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# Database (Choose one)
# SQLite (for small deployments):
DATABASE_URL="file:./prisma/production.db"

# PostgreSQL (recommended for production):
# DATABASE_URL="postgresql://username:password@hostname:5432/forensics_db?schema=public"

# JWT Configuration (REQUIRED - Generate secure secret!)
JWT_SECRET=CHANGE_THIS_TO_A_SECURE_RANDOM_STRING_AT_LEAST_32_CHARS
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.com

# Optional: Email Configuration
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
# SMTP_FROM=noreply@forensics-simulator.com

# Optional: File Upload Limits
# MAX_UPLOAD_SIZE=5368709120  # 5GB in bytes

# Optional: Rate Limiting
# RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
# RATE_LIMIT_MAX_REQUESTS=100
```

**Generate secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Frontend Environment Variables

Create `/frontend/.env.production`:

```bash
# API Configuration
VITE_API_URL=https://your-backend-domain.com/api

# Optional: Feature Flags
VITE_ENABLE_WEBSOCKET=true
VITE_ENABLE_FILE_UPLOAD=true
```

---

## Database Setup

### Option 1: SQLite (Development/Small Scale)

**Advantages:** Simple, no separate server, file-based
**Limitations:** Not ideal for high concurrency, limited scaling

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data (5 levels with tasks)
npm run db:seed
```

Database file location: `backend/prisma/production.db`

**Backup:** Regularly copy `production.db` file

### Option 2: PostgreSQL (Production/Scale)

**Advantages:** Better performance, scalability, concurrent users
**Recommended for:** Production deployments with multiple users

#### 2.1 Create PostgreSQL Database

**Using managed service (recommended):**
- AWS RDS, DigitalOcean Managed Database, or Google Cloud SQL
- Create database instance
- Note connection string

**Using local PostgreSQL:**
```bash
# Install PostgreSQL
sudo apt-get install postgresql  # Ubuntu/Debian
# OR
brew install postgresql  # macOS

# Create database
sudo -u postgres psql
CREATE DATABASE forensics_db;
CREATE USER forensics_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE forensics_db TO forensics_user;
\q
```

#### 2.2 Update Prisma Schema

Edit `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

#### 2.3 Run Migrations

```bash
cd backend

# Update DATABASE_URL in .env
# Example: DATABASE_URL="postgresql://forensics_user:password@localhost:5432/forensics_db"

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed
```

**Backup:** Use `pg_dump` for backups
```bash
pg_dump -U forensics_user -h localhost forensics_db > backup.sql
```

---

## Backend Deployment

### Option 1: Traditional VPS (DigitalOcean, AWS EC2, Linode)

#### 1.1 Server Setup

```bash
# SSH into server
ssh user@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install process manager
sudo npm install -g pm2

# Install Git
sudo apt-get install git
```

#### 1.2 Clone and Setup

```bash
# Clone repository
git clone https://github.com/your-repo/forensics-simulator.git
cd forensics-simulator/backend

# Install dependencies
npm ci --production

# Create .env file
nano .env
# (Add production environment variables)

# Setup database
npm run db:generate
npm run db:migrate
npm run db:seed
```

#### 1.3 Start with PM2

```bash
# Start application
pm2 start src/server.js --name forensics-backend

# Enable auto-restart on server reboot
pm2 startup
pm2 save

# View logs
pm2 logs forensics-backend

# Monitor
pm2 monit
```

#### 1.4 Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt-get install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/forensics-backend
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/forensics-backend /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 1.5 Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.your-domain.com

# Auto-renewal is setup automatically
```

### Option 2: Platform as a Service (Heroku, Railway, Render)

#### Heroku Deployment

1. **Install Heroku CLI:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

2. **Login and Create App:**
```bash
heroku login
cd backend
heroku create forensics-backend
```

3. **Add PostgreSQL:**
```bash
heroku addons:create heroku-postgresql:mini
```

4. **Set Environment Variables:**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
heroku config:set FRONTEND_URL=https://your-frontend.netlify.app
```

5. **Create Procfile:**
```bash
echo "web: npm start" > Procfile
```

6. **Deploy:**
```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku master

# Run migrations
heroku run npm run db:migrate
heroku run npm run db:seed
```

### Option 3: Docker Deployment

**See [Docker Deployment](#docker-deployment) section below.**

---

## Frontend Deployment

### Option 1: Static Hosting (Netlify, Vercel, AWS S3)

#### Netlify Deployment (Recommended - Easiest)

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Build Frontend:**
```bash
cd frontend

# Create .env.production
echo "VITE_API_URL=https://api.your-domain.com/api" > .env.production

# Build
npm run build
```

3. **Deploy:**
```bash
# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

**Or use Netlify UI:**
- Connect GitHub repository
- Build command: `cd frontend && npm run build`
- Publish directory: `frontend/dist`
- Environment variables: Add `VITE_API_URL`

#### Vercel Deployment

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
cd frontend
vercel --prod
```

Follow prompts and set `VITE_API_URL` in Vercel dashboard.

#### AWS S3 + CloudFront

1. **Build:**
```bash
cd frontend
npm run build
```

2. **Create S3 Bucket:**
- Go to AWS S3 console
- Create bucket with static website hosting
- Upload `dist/` contents

3. **Setup CloudFront:**
- Create CloudFront distribution
- Point to S3 bucket
- Enable HTTPS
- Set custom domain (optional)

### Option 2: Same Server as Backend

```bash
# Build frontend
cd frontend
npm run build

# Copy to backend public folder
mkdir -p ../backend/public
cp -r dist/* ../backend/public/

# Serve from Express (already configured in server.js)
```

---

## Docker Deployment

### Full Stack with Docker Compose

1. **Create docker-compose.prod.yml:**

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: forensics_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: forensics_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U forensics_user']
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      PORT: 5000
      DATABASE_URL: postgresql://forensics_user:${DB_PASSWORD}@database:5432/forensics_db
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 7d
      FRONTEND_URL: ${FRONTEND_URL}
    ports:
      - '5000:5000'
    depends_on:
      database:
        condition: service_healthy
    restart: unless-stopped
    volumes:
      - uploads:/app/uploads
      - user_data:/app/user_data

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: ${VITE_API_URL}
    ports:
      - '80:80'
      - '443:443'
    restart: unless-stopped
    depends_on:
      - backend

volumes:
  postgres_data:
  uploads:
  user_data:
```

2. **Create .env file for Docker:**

```bash
# .env
DB_PASSWORD=your_secure_database_password
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=https://your-domain.com
VITE_API_URL=https://api.your-domain.com/api
```

3. **Deploy:**

```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate

# Seed database
docker-compose -f docker-compose.prod.yml exec backend npm run db:seed

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## Production Checklist

### Security

- [ ] JWT secret is strong and unique (32+ characters)
- [ ] All environment variables use `.env` (not hardcoded)
- [ ] CORS configured for specific frontend domain only
- [ ] Rate limiting enabled on all API endpoints
- [ ] HTTPS/SSL enabled for all domains
- [ ] Database credentials are secure
- [ ] File upload size limits configured
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS protection enabled
- [ ] Helmet.js security headers enabled
- [ ] .env files NOT committed to Git

### Performance

- [ ] Frontend built with production optimizations (`npm run build`)
- [ ] Gzip compression enabled
- [ ] Static assets served via CDN
- [ ] Database indexes configured
- [ ] Image optimization enabled
- [ ] Response caching where appropriate
- [ ] Connection pooling configured (if using PostgreSQL)

### Reliability

- [ ] Process manager configured (PM2, systemd, or Docker restart policies)
- [ ] Database backups automated
- [ ] Logs centralized and monitored
- [ ] Error tracking setup (Sentry recommended)
- [ ] Health check endpoints working
- [ ] Uptime monitoring configured
- [ ] Auto-restart on failure enabled

### Monitoring

- [ ] Application logs accessible
- [ ] Error rate monitoring
- [ ] Performance metrics tracked
- [ ] Database performance monitored
- [ ] Disk space alerts configured
- [ ] API response time tracked

---

## Monitoring & Maintenance

### Application Logs

**With PM2:**
```bash
pm2 logs forensics-backend
pm2 logs forensics-backend --lines 1000
pm2 flush  # Clear logs
```

**With Docker:**
```bash
docker-compose logs -f backend
docker-compose logs --tail=100 backend
```

### Database Maintenance

**SQLite:**
```bash
# Backup
cp backend/prisma/production.db backup-$(date +%Y%m%d).db

# Optimize
sqlite3 backend/prisma/production.db "VACUUM;"
```

**PostgreSQL:**
```bash
# Backup
pg_dump -U forensics_user forensics_db > backup-$(date +%Y%m%d).sql

# Restore
psql -U forensics_user forensics_db < backup.sql

# Vacuum (optimize)
psql -U forensics_user -d forensics_db -c "VACUUM ANALYZE;"
```

### Updates and Upgrades

```bash
# Pull latest code
git pull origin main

# Backend updates
cd backend
npm ci --production
npm run db:migrate  # Run new migrations
pm2 restart forensics-backend

# Frontend updates
cd frontend
npm ci
npm run build
# Deploy new build to hosting
```

### Health Checks

**Backend health endpoint:** `GET https://api.your-domain.com/health`

Expected response:
```json
{
  "status": "ok",
  "message": "Forensics Simulator API is running",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## Troubleshooting

### Backend won't start

1. **Check logs:**
```bash
pm2 logs forensics-backend
# or
docker-compose logs backend
```

2. **Common issues:**
- Database connection failed: Check DATABASE_URL
- Port already in use: Check if another process uses port 5000
- Missing dependencies: Run `npm install`
- Migration errors: Check database schema

3. **Test database connection:**
```bash
cd backend
npx prisma studio  # Opens database GUI
```

### Frontend not loading

1. **Check build output:**
```bash
cd frontend
npm run build
# Check for errors
```

2. **Verify API URL:**
- Check `.env.production` has correct `VITE_API_URL`
- Check browser console for CORS errors
- Test API directly: `curl https://api.your-domain.com/health`

3. **Check CORS configuration:**
- Backend CORS should allow frontend domain
- Check `FRONTEND_URL` environment variable

### Database issues

1. **Connection errors:**
```bash
# Test PostgreSQL connection
psql -U forensics_user -h localhost -d forensics_db

# Check SQLite file exists
ls -lh backend/prisma/*.db
```

2. **Migration errors:**
```bash
# Reset database (WARNING: Deletes all data!)
npm run db:reset

# Or manually run migrations
npm run db:migrate
```

### Performance issues

1. **Check resource usage:**
```bash
pm2 monit  # PM2 monitoring
# or
docker stats  # Docker resource usage
```

2. **Check database performance:**
```bash
# PostgreSQL: Check slow queries
psql -U forensics_user -d forensics_db -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

3. **Enable query logging** (development only):
Edit `backend/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
  log      = ["query"]
}
```

---

## Rollback Procedure

If deployment fails:

1. **Rollback code:**
```bash
git reset --hard previous-commit-hash
pm2 restart forensics-backend
```

2. **Rollback database:**
```bash
# Restore from backup
psql -U forensics_user forensics_db < backup-YYYYMMDD.sql
```

3. **Rollback frontend:**
- Netlify/Vercel: Use platform's rollback feature
- S3: Restore previous version from S3 versioning

---

## Support and Resources

- **GitHub Issues:** https://github.com/your-repo/forensics-simulator/issues
- **Documentation:** See README.md and QUICK_START.md
- **Node.js Docs:** https://nodejs.org/docs/
- **Prisma Docs:** https://www.prisma.io/docs/
- **React Docs:** https://react.dev/

---

**Development Team:** Group 1 - Sara Ahmad, Yazan Rawwashin, Ahmad Azzam, Mohammad Alawneh

Last Updated: January 2025
