# Authentication Testing Guide

Quick guide to test the JWT authentication system.

## Prerequisites

1. PostgreSQL running
2. Environment variables configured in `.env`
3. Database migrated with Prisma

## Setup Steps

```bash
# 1. Install dependencies (if not already done)
cd backend
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# 3. Generate Prisma Client
npm run prisma:generate

# 4. Run database migrations
npm run prisma:migrate

# 5. Start the server
npm run dev
```

## Testing with cURL

### 1. Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

**Copy the token from the response!**

### 3. Access Protected Route (Get Profile)

```bash
# Replace YOUR_TOKEN_HERE with the actual token
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "...",
    "_count": {
      "progress": 0,
      "userAnswers": 0,
      "achievements": 0
    },
    "stats": {
      "levelsInProgress": 0,
      "totalAnswers": 0,
      "achievementsEarned": 0
    }
  }
}
```

### 4. Update Password

```bash
curl -X PUT http://localhost:5000/api/auth/password \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword456"
  }'
```

### 5. Test Progress Endpoint

```bash
# Update progress for level 1
curl -X POST http://localhost:5000/api/progress \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "level": 1,
    "score": 85,
    "completed": true
  }'

# Get all progress
curl -X GET http://localhost:5000/api/progress \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Test Achievements Endpoint

```bash
# Award an achievement
curl -X POST http://localhost:5000/api/achievements \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "achievementType": "FIRST_LEVEL_COMPLETE"
  }'

# Get all achievements
curl -X GET http://localhost:5000/api/achievements \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 7. Test Without Token (Should Fail)

```bash
curl -X GET http://localhost:5000/api/auth/profile
```

**Expected Response:**
```json
{
  "error": "No token provided",
  "message": "Authorization header must be in format: Bearer <token>"
}
```

---

## Testing with Postman

### 1. Create a New Collection

1. Open Postman
2. Create new collection: "Forensics Simulator API"

### 2. Set Up Environment Variables

1. Create environment: "Development"
2. Add variables:
   - `baseUrl`: `http://localhost:5000`
   - `token`: (leave empty, will be set automatically)

### 3. Create Requests

#### Register Request

- Method: `POST`
- URL: `{{baseUrl}}/api/auth/register`
- Body (JSON):
  ```json
  {
    "username": "postmanuser",
    "email": "postman@example.com",
    "password": "password123"
  }
  ```
- Tests tab (to save token):
  ```javascript
  const response = pm.response.json();
  pm.environment.set("token", response.token);
  ```

#### Login Request

- Method: `POST`
- URL: `{{baseUrl}}/api/auth/login`
- Body (JSON):
  ```json
  {
    "username": "postmanuser",
    "password": "password123"
  }
  ```
- Tests tab:
  ```javascript
  const response = pm.response.json();
  pm.environment.set("token", response.token);
  ```

#### Get Profile (Protected)

- Method: `GET`
- URL: `{{baseUrl}}/api/auth/profile`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer {{token}}`

---

## Testing Security Features

### 1. Password Hashing

Check the database to verify passwords are hashed:

```bash
npm run prisma:studio
```

Open Users table and verify the `password` field shows a bcrypt hash (starts with `$2b$`).

### 2. Token Expiration

Tokens expire after 7 days by default. To test expiration, you can:

1. Change `JWT_EXPIRES_IN` in `.env` to `10s`
2. Restart server
3. Login to get a token
4. Wait 11 seconds
5. Try to access a protected route (should fail)

### 3. Invalid Token

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer invalid-token-here"
```

**Expected:** 401 error

### 4. Duplicate Registration

Try to register with the same username or email twice:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected:** 400 error - "User with this email or username already exists"

---

## Common Issues

### Database Connection Error

**Error:** "Can't reach database server"

**Solution:**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Create the database if it doesn't exist

### Invalid Token Error

**Error:** "Invalid or expired token"

**Solution:**
- Check if token is properly formatted in Authorization header
- Ensure token hasn't expired
- Login again to get a fresh token

### CORS Error (from frontend)

**Error:** "Access-Control-Allow-Origin"

**Solution:**
- Check `FRONTEND_URL` in `.env`
- Server has CORS configured for `http://localhost:5173`

---

## Next Steps

1. Test all endpoints documented in `API_DOCUMENTATION.md`
2. Integrate with frontend
3. Add rate limiting for production
4. Implement refresh tokens
5. Add email verification
6. Add password reset functionality
