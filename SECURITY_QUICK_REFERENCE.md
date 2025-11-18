# Security Quick Reference Guide

## Quick Start

### 1. Install Dependencies
```bash
cd /home/jacob/forensics-simulator/backend
npm install
```

This will install the new security packages:
- `express-rate-limit@^7.1.5` - Rate limiting
- `helmet@^7.1.0` - Security headers

### 2. Configure Environment Variables

**Minimum Required (Development):**
```bash
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
DATABASE_URL=postgresql://user:password@localhost:5432/forensics_db
FRONTEND_URL=http://localhost:5173
```

**Recommended (Production):**
```bash
NODE_ENV=production
JWT_SECRET=<generate-strong-random-32-char-string>
DATABASE_URL=postgresql://user:password@host:5432/forensics_db

# CORS Configuration
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_UPLOAD_MAX=10
```

### 3. Generate Secure JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Security Features Overview

| Feature | Status | File Location |
|---------|--------|--------------|
| Rate Limiting | ✅ Implemented | `/backend/src/middleware/rateLimiter.js` |
| CORS Configuration | ✅ Enhanced | `/backend/src/server.js` |
| Security Headers (Helmet) | ✅ Implemented | `/backend/src/server.js` |
| JWT Validation | ✅ Enhanced | `/backend/src/utils/jwt.js` |
| Socket.IO CORS | ✅ Updated | `/backend/src/config/socket.js` |
| Environment Variables | ✅ Documented | `.env.example` files |

---

## Rate Limiting Summary

| Endpoint Type | Max Requests | Time Window | Status Code on Exceed |
|--------------|--------------|-------------|----------------------|
| General API | 100 | 15 minutes | 429 Too Many Requests |
| Authentication | 5 | 15 minutes | 429 Too Many Requests |
| File Uploads | 10 | 15 minutes | 429 Too Many Requests |
| Admin | 30 | 15 minutes | 429 Too Many Requests |

**Protected Routes:**
- `/api/auth/*` - Auth limiter (5 req/15min)
- `/api/files/*` - Upload limiter (10 req/15min)
- `/api/admin/*` - Admin limiter (30 req/15min)
- All other `/api/*` - General limiter (100 req/15min)

**Excluded Routes:**
- `/health` - No rate limiting
- `/api` - No rate limiting

---

## CORS Configuration

**Development Mode:**
- Allows: `http://localhost:5173`, `http://localhost:3000`
- Allows requests with no origin (Postman, curl)

**Production Mode:**
- Requires explicit ALLOWED_ORIGINS or FRONTEND_URL
- Blocks unauthorized origins
- Logs blocked requests

**Configuration:**
```bash
# Option 1: Single origin
FRONTEND_URL=https://your-domain.com

# Option 2: Multiple origins (takes precedence)
ALLOWED_ORIGINS=https://domain1.com,https://domain2.com
```

---

## Security Headers (Helmet.js)

**Applied Headers:**
- Content-Security-Policy
- X-DNS-Prefetch-Control
- X-Frame-Options (DENY)
- Strict-Transport-Security
- X-Download-Options
- X-Content-Type-Options (nosniff)
- X-Permitted-Cross-Domain-Policies
- Referrer-Policy
- X-XSS-Protection

**Verify:**
```bash
curl -I http://localhost:5000/health
```

---

## Testing

### Test Rate Limiting
```bash
# Should block after 5 attempts
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n"
done
```

### Test CORS
```bash
# Should succeed
curl -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS -I http://localhost:5000/api/levels

# Should fail
curl -H "Origin: http://evil.com" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS -I http://localhost:5000/api/levels
```

### Test Security Headers
```bash
curl -I http://localhost:5000/health | grep -i "x-\|content-security"
```

---

## Files Modified

| File | Purpose |
|------|---------|
| `/backend/package.json` | Added express-rate-limit and helmet |
| `/backend/src/middleware/rateLimiter.js` | **NEW** - Rate limiting middleware |
| `/backend/src/server.js` | Added security middleware and enhanced CORS |
| `/backend/src/utils/jwt.js` | Enhanced JWT secret validation |
| `/backend/src/config/socket.js` | Updated Socket.IO CORS |
| `/backend/.env.example` | Added rate limiting and CORS variables |
| `/.env.example` | Added rate limiting and CORS variables |
| `/.env.production.example` | Added rate limiting and CORS variables |

---

## Environment Variable Reference

```bash
# Server
NODE_ENV=development|production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@host:5432/db

# JWT (CRITICAL - MUST CHANGE IN PRODUCTION)
JWT_SECRET=<strong-random-string>
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000        # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100        # General API
RATE_LIMIT_AUTH_MAX=5              # Auth endpoints
RATE_LIMIT_UPLOAD_MAX=10           # File uploads
```

---

## Common Issues & Solutions

### Issue: "JWT_SECRET must be configured in production"
**Solution:** Set a strong JWT_SECRET in your production environment
```bash
export JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

### Issue: "Not allowed by CORS"
**Solution:** Add your frontend URL to ALLOWED_ORIGINS
```bash
export ALLOWED_ORIGINS=https://your-domain.com
```

### Issue: "Too many requests" (429 error)
**Solution:** This is working as intended. Wait for the rate limit window to reset or adjust limits in environment variables

### Issue: Security headers not appearing
**Solution:** Verify helmet middleware is loaded before routes in server.js

---

## Production Deployment Checklist

- [ ] Install dependencies: `npm install`
- [ ] Generate strong JWT_SECRET (32+ characters)
- [ ] Set NODE_ENV=production
- [ ] Configure ALLOWED_ORIGINS with production URLs
- [ ] Set production DATABASE_URL
- [ ] Review rate limit values
- [ ] Test all security features
- [ ] Enable HTTPS (via reverse proxy)
- [ ] Monitor rate limit violations
- [ ] Set up log aggregation
- [ ] Test CORS with production URLs

---

## Support

For detailed documentation, see:
- [SECURITY_IMPLEMENTATION.md](/home/jacob/forensics-simulator/SECURITY_IMPLEMENTATION.md) - Complete security documentation
- [.env.example](/home/jacob/forensics-simulator/backend/.env.example) - Development environment template
- [.env.production.example](/home/jacob/forensics-simulator/.env.production.example) - Production environment template

---

**Version:** 1.0.0
**Last Updated:** 2025-11-15
