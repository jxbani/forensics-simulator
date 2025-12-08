# API Documentation

## Authentication System

The API uses **JWT (JSON Web Token)** based authentication with **bcrypt** password hashing.

### Authentication Flow

1. User registers or logs in
2. Server returns a JWT token
3. Client stores the token (localStorage/sessionStorage)
4. Client includes token in `Authorization` header for protected routes
5. Server verifies token and grants access

### Token Format

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### 1. Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Access:** Public

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Validation Rules:**
- `username`: Required, must be unique
- `email`: Required, must be valid email format, must be unique
- `password`: Required, minimum 6 characters

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400`: Missing required fields or validation errors
- `400`: User already exists
- `500`: Internal server error

---

### 2. Login User

Authenticate an existing user.

**Endpoint:** `POST /api/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

Note: `username` can be either username or email.

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400`: Missing username or password
- `401`: Invalid credentials
- `500`: Internal server error

---

### 3. Get User Profile

Get the authenticated user's profile with statistics.

**Endpoint:** `GET /api/auth/profile`

**Access:** Protected (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "_count": {
      "progress": 5,
      "userAnswers": 42,
      "achievements": 8
    },
    "stats": {
      "levelsInProgress": 5,
      "totalAnswers": 42,
      "achievementsEarned": 8
    }
  }
}
```

**Error Responses:**
- `401`: No token provided or invalid token
- `404`: User not found
- `500`: Internal server error

---

### 4. Update Password

Change the authenticated user's password.

**Endpoint:** `PUT /api/auth/password`

**Access:** Protected (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Validation Rules:**
- `currentPassword`: Required, must match current password
- `newPassword`: Required, minimum 6 characters

**Success Response (200):**
```json
{
  "message": "Password updated successfully"
}
```

**Error Responses:**
- `400`: Missing required fields or validation errors
- `401`: Current password is incorrect
- `401`: No token provided or invalid token
- `500`: Internal server error

---

## Progress Endpoints

Track user progress through levels.

### 5. Get All User Progress

Get user's progress across all levels.

**Endpoint:** `GET /api/progress`

**Access:** Protected

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "progress": [
    {
      "id": "uuid-1",
      "userId": "user-uuid",
      "level": 1,
      "score": 85,
      "completedAt": "2024-01-15T12:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "userId": "user-uuid",
      "level": 2,
      "score": 42,
      "completedAt": null
    }
  ],
  "totalLevels": 2,
  "completedLevels": 1,
  "totalScore": 127
}
```

---

### 6. Get Progress for Specific Level

Get progress for a single level.

**Endpoint:** `GET /api/progress/:level`

**Access:** Protected

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `level`: Level number (integer)

**Success Response (200):**
```json
{
  "progress": {
    "id": "uuid-here",
    "userId": "user-uuid",
    "level": 1,
    "score": 85,
    "completedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Invalid level number
- `404`: Progress not found for this level

---

### 7. Update Level Progress

Update or create progress for a level.

**Endpoint:** `POST /api/progress`

**Access:** Protected

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "level": 1,
  "score": 95,
  "completed": true
}
```

**Success Response (200):**
```json
{
  "message": "Progress updated successfully",
  "progress": {
    "id": "uuid-here",
    "userId": "user-uuid",
    "level": 1,
    "score": 95,
    "completedAt": "2024-01-15T14:30:00.000Z"
  }
}
```

---

## Achievement Endpoints

Manage user achievements.

### 8. Get User Achievements

Get all achievements earned by the user.

**Endpoint:** `GET /api/achievements`

**Access:** Protected

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "achievements": [
    {
      "id": "uuid-1",
      "userId": "user-uuid",
      "achievementType": "FIRST_LEVEL_COMPLETE",
      "earnedAt": "2024-01-15T12:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "userId": "user-uuid",
      "achievementType": "PERFECT_SCORE",
      "earnedAt": "2024-01-15T14:30:00.000Z"
    }
  ],
  "totalAchievements": 2
}
```

---

### 9. Award Achievement

Award a new achievement to the user.

**Endpoint:** `POST /api/achievements`

**Access:** Protected

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "achievementType": "FIVE_LEVELS_COMPLETE"
}
```

**Available Achievement Types:**
- `FIRST_LEVEL_COMPLETE`
- `FIVE_LEVELS_COMPLETE`
- `TEN_LEVELS_COMPLETE`
- `ALL_LEVELS_COMPLETE`
- `PERFECT_SCORE`
- `SPEED_DEMON`
- `NO_HINTS_USED`
- `BEGINNER_MASTER`
- `INTERMEDIATE_MASTER`
- `ADVANCED_MASTER`
- `EXPERT_MASTER`
- `STREAK_FIVE`
- `STREAK_TEN`
- `STREAK_TWENTY`
- `FIRST_CORRECT_ANSWER`
- `HUNDRED_TASKS_COMPLETE`

**Success Response (201):**
```json
{
  "message": "Achievement earned!",
  "achievement": {
    "id": "uuid-here",
    "userId": "user-uuid",
    "achievementType": "FIVE_LEVELS_COMPLETE",
    "earnedAt": "2024-01-15T15:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Achievement type required
- `400`: Achievement already earned

---

## Utility Endpoints

### 10. Health Check

Check if the API is running.

**Endpoint:** `GET /health`

**Access:** Public

**Success Response (200):**
```json
{
  "status": "ok",
  "message": "Forensics Simulator API is running",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

---

### 11. API Documentation

Get API endpoint overview.

**Endpoint:** `GET /api`

**Access:** Public

**Success Response (200):**
```json
{
  "message": "Digital Forensics Training Simulator API",
  "version": "1.0.0",
  "endpoints": {
    "auth": { ... },
    "progress": { ... },
    "achievements": { ... }
  }
}
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Security Features

### Password Hashing

- All passwords are hashed using **bcrypt** with 10 salt rounds
- Passwords are never stored in plain text
- Password comparison is done securely with bcrypt.compare()

### JWT Tokens

- Tokens expire after 7 days (configurable)
- Tokens include user ID and username
- Secret key stored in environment variables
- Tokens are verified on every protected route

### Best Practices

1. Always use HTTPS in production
2. Store JWT tokens securely (httpOnly cookies recommended)
3. Never log or expose JWT tokens
4. Implement rate limiting for auth endpoints
5. Use strong JWT secrets (change default in production)
6. Validate all input data
7. Sanitize error messages in production

---

## Example Usage

### Registration Flow

```javascript
// Register
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'johndoe',
    email: 'john@example.com',
    password: 'securepass123'
  })
});

const { token, user } = await response.json();
localStorage.setItem('token', token);
```

### Making Authenticated Requests

```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:5000/api/auth/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const { user } = await response.json();
```

---

## Environment Variables

Required environment variables:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/forensics_simulator
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```
