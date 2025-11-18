# Production-Grade Security Implementation

This document outlines the security features implemented in the Forensics Simulator backend.

## Table of Contents
- [Overview](#overview)
- [Rate Limiting](#rate-limiting)
- [CORS Configuration](#cors-configuration)
- [Security Headers (Helmet.js)](#security-headers-helmetjs)
- [JWT Security](#jwt-security)
- [Environment Variables](#environment-variables)
- [Security Best Practices](#security-best-practices)

---

## Overview

The backend has been enhanced with production-grade security features to protect against:
- Brute force attacks
- API abuse and excessive requests
- Cross-site scripting (XSS)
- Clickjacking
- MIME type sniffing
- Unauthorized cross-origin requests
- Man-in-the-middle attacks

---

## Rate Limiting

### Implementation
Rate limiting is implemented using `express-rate-limit` with different limits for different endpoint types.

**File:** `/home/jacob/forensics-simulator/backend/src/middleware/rateLimiter.js`

### Rate Limit Tiers

| Endpoint Type | Default Limit | Window | Environment Variable |
|--------------|---------------|--------|---------------------|
| **General API** | 100 requests | 15 minutes | `RATE_LIMIT_MAX_REQUESTS` |
| **Authentication** | 5 requests | 15 minutes | `RATE_LIMIT_AUTH_MAX` |
| **File Upload** | 10 requests | 15 minutes | `RATE_LIMIT_UPLOAD_MAX` |
| **Admin** | 30 requests | 15 minutes | (hardcoded for security) |

### Configuration

**Environment Variables:**
```bash
# Rate limit window in milliseconds (default: 15 minutes)
RATE_LIMIT_WINDOW_MS=900000

# Maximum requests per window
RATE_LIMIT_MAX_REQUESTS=100       # General API
RATE_LIMIT_AUTH_MAX=5             # Auth endpoints
RATE_LIMIT_UPLOAD_MAX=10          # File uploads
```

### Protected Endpoints

**Strict Rate Limiting (5 req/15min):**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/password`

**Moderate Rate Limiting (10 req/15min):**
- `POST /api/files/upload`
- `POST /api/files/evidence/upload`
- All other `/api/files/*` endpoints

**Admin Rate Limiting (30 req/15min):**
- All `/api/admin/*` endpoints

**General Rate Limiting (100 req/15min):**
- All other API endpoints

### Excluded Endpoints
The following endpoints are exempt from rate limiting:
- `/health` - Health check endpoint
- `/api` - API documentation endpoint

### Error Response
When rate limit is exceeded:
```json
{
  "error": "Too many requests",
  "message": "You have exceeded the rate limit. Please try again later.",
  "retryAfter": "2025-11-15T20:30:00.000Z"
}
```

---

## CORS Configuration

### Implementation
Advanced CORS configuration supporting multiple origins with environment-based controls.

**File:** `/home/jacob/forensics-simulator/backend/src/server.js`

### Features
- **Multiple Origins Support:** Configure comma-separated list of allowed origins
- **Environment-Aware:** Strict in production, permissive in development
- **Credentials Support:** Allows cookies and authorization headers
- **Method Control:** Restricts HTTP methods to GET, POST, PUT, DELETE, OPTIONS
- **Security Logging:** Logs blocked CORS requests

### Configuration

**Single Origin:**
```bash
FRONTEND_URL=https://your-domain.com
```

**Multiple Origins (takes precedence):**
```bash
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com,https://app.your-domain.com
```

### Development Fallback
In development mode (NODE_ENV=development), the following origins are allowed by default:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (React default)

### Production Behavior
- **Requires Explicit Configuration:** CORS origins must be explicitly set
- **No Fallbacks:** No default origins in production
- **Rejects Unknown Origins:** Logs and blocks requests from unauthorized origins

### Socket.IO CORS
Socket.IO uses the same CORS configuration as the REST API for consistency.

**File:** `/home/jacob/forensics-simulator/backend/src/config/socket.js`

---

## Security Headers (Helmet.js)

### Implementation
Helmet.js middleware adds security headers to protect against common web vulnerabilities.

**File:** `/home/jacob/forensics-simulator/backend/src/server.js`

### Headers Applied

| Header | Protection | Configuration |
|--------|-----------|---------------|
| **Content-Security-Policy** | XSS, code injection | Allows same-origin resources, HTTPS images |
| **X-DNS-Prefetch-Control** | Privacy | Disabled |
| **X-Frame-Options** | Clickjacking | DENY |
| **Strict-Transport-Security** | MITM attacks | Forces HTTPS |
| **X-Download-Options** | IE download security | No open |
| **X-Content-Type-Options** | MIME sniffing | nosniff |
| **X-Permitted-Cross-Domain-Policies** | Flash/PDF policy | none |
| **Referrer-Policy** | Privacy | no-referrer |
| **X-XSS-Protection** | Reflected XSS | 1; mode=block |

### CSP Directives
```javascript
{
  defaultSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'"],  // Allow inline styles for React
  scriptSrc: ["'self'"],
  imgSrc: ["'self'", 'data:', 'https:']      // Allow HTTPS images
}
```

### Special Considerations
- **crossOriginEmbedderPolicy:** Disabled to allow Socket.IO embedding
- **crossOriginResourcePolicy:** Set to 'cross-origin' for resource sharing

---

## JWT Security

### Implementation
Enhanced JWT security with production validation and environment checks.

**File:** `/home/jacob/forensics-simulator/backend/src/utils/jwt.js`

### Features

**1. Production Secret Validation:**
- Prevents server startup if JWT_SECRET is not properly configured in production
- Throws critical error if default secret is used in production
- Logs warnings in development mode

**2. Secret Requirements:**
- **Minimum Length:** 32 characters recommended
- **Randomness:** Use cryptographically secure random strings
- **Uniqueness:** Never reuse secrets across environments

**3. Token Expiration:**
```bash
JWT_EXPIRES_IN=7d  # Default: 7 days
```

### Generate Secure Secret
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### Configuration
```bash
# CRITICAL: Change in production!
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

### Security Checks
The application will:
1. **In Production:**
   - Fail to start if JWT_SECRET is missing or uses default value
   - Log critical security error

2. **In Development:**
   - Warn if using default secret
   - Allow startup for convenience

---

## Environment Variables

### Required Variables

**Production (MUST be set):**
```bash
NODE_ENV=production
JWT_SECRET=<strong-random-string-min-32-chars>
DATABASE_URL=postgresql://user:pass@host:5432/db
FRONTEND_URL=https://your-domain.com
```

**Optional (with sensible defaults):**
```bash
PORT=5000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_UPLOAD_MAX=10
JWT_EXPIRES_IN=7d
```

### Multiple Environment Support
```bash
# Development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Production
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### Environment Files
- **Development:** `/home/jacob/forensics-simulator/backend/.env.example`
- **Production:** `/home/jacob/forensics-simulator/.env.production.example`
- **Root:** `/home/jacob/forensics-simulator/.env.example`

---

## Security Best Practices

### 1. Environment Variables
- ✅ All sensitive data in environment variables
- ✅ No hardcoded secrets in source code
- ✅ .env files excluded from version control
- ✅ Example files provided for reference

### 2. Rate Limiting
- ✅ Different limits for different endpoint types
- ✅ Strict limits on authentication endpoints
- ✅ IP-based rate limiting
- ✅ Health checks excluded from rate limits
- ✅ Trust proxy enabled for load balancers

### 3. CORS Security
- ✅ Whitelist-based origin validation
- ✅ No wildcards in production
- ✅ Credentials properly configured
- ✅ Method restrictions in place
- ✅ Logging of blocked requests

### 4. HTTP Security Headers
- ✅ Helmet.js with recommended settings
- ✅ CSP to prevent XSS
- ✅ HSTS for HTTPS enforcement
- ✅ Clickjacking protection
- ✅ MIME sniffing prevention

### 5. JWT Security
- ✅ Production secret validation
- ✅ Token expiration configured
- ✅ Secure token generation
- ✅ Proper error handling

### 6. General Security
- ✅ Body size limits (10MB)
- ✅ Trust proxy for load balancers
- ✅ Development-only logging
- ✅ Error handling middleware
- ✅ Input validation on routes

---

## Testing Security Features

### Test Rate Limiting
```bash
# Test auth rate limit (should block after 5 requests)
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}'
  echo "Request $i"
done
```

### Test CORS
```bash
# Should succeed (allowed origin)
curl -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS http://localhost:5000/api/levels

# Should fail (unknown origin)
curl -H "Origin: http://evil.com" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS http://localhost:5000/api/levels
```

### Test Security Headers
```bash
# Check security headers are present
curl -I http://localhost:5000/health
```

---

## Deployment Checklist

Before deploying to production:

- [ ] Set strong JWT_SECRET (min 32 characters, random)
- [ ] Configure ALLOWED_ORIGINS or FRONTEND_URL
- [ ] Set NODE_ENV=production
- [ ] Configure DATABASE_URL with production credentials
- [ ] Review rate limit values for your use case
- [ ] Enable HTTPS (use reverse proxy like Nginx)
- [ ] Set up monitoring for rate limit violations
- [ ] Configure log aggregation
- [ ] Test all security features
- [ ] Review and rotate secrets regularly

---

## Monitoring

### What to Monitor

**Rate Limiting:**
- Number of rate limit violations
- IP addresses frequently hitting limits
- Patterns of abuse

**CORS:**
- Blocked origin attempts
- Unauthorized access patterns

**Authentication:**
- Failed login attempts
- Suspicious authentication patterns
- Token validation failures

**General:**
- Response times
- Error rates
- Unusual traffic patterns

---

## Support & References

**Documentation:**
- [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)
- [Helmet.js](https://helmetjs.github.io/)
- [CORS Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

**Security Resources:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Last Updated:** 2025-11-15
**Version:** 1.0.0
