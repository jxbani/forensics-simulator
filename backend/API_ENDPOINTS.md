# Complete API Endpoints Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## User Management

### Register User
```http
POST /api/auth/register
```

**Access:** Public

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Login User
```http
POST /api/auth/login
```

**Access:** Public

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Get User Profile
```http
GET /api/auth/profile
```

**Access:** Protected (requires authentication)

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
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

---

## Levels

### Get All Levels
```http
GET /api/levels
```

**Access:** Public (shows progress if authenticated)

**Response:** `200 OK`
```json
{
  "levels": [
    {
      "id": "uuid",
      "title": "Introduction to Digital Forensics",
      "description": "Learn the basics of digital forensics",
      "difficulty": "BEGINNER",
      "orderIndex": 1,
      "taskCount": 10,
      "userProgress": {
        "score": 85,
        "completedAt": "2024-01-15T12:00:00.000Z"
      }
    }
  ]
}
```

---

### Get Specific Level
```http
GET /api/levels/:id
```

**Access:** Public (shows progress if authenticated)

**URL Parameters:**
- `id` - Level UUID

**Response:** `200 OK`
```json
{
  "level": {
    "id": "uuid",
    "title": "Introduction to Digital Forensics",
    "description": "Learn the basics of digital forensics",
    "difficulty": "BEGINNER",
    "orderIndex": 1,
    "taskCount": 10,
    "userProgress": {
      "score": 85,
      "completedAt": "2024-01-15T12:00:00.000Z"
    }
  }
}
```

---

### Get Level Tasks
```http
GET /api/levels/:id/tasks
```

**Access:** Public (shows user answers if authenticated)

**URL Parameters:**
- `id` - Level UUID

**Response:** `200 OK`
```json
{
  "level": {
    "id": "uuid",
    "title": "Introduction to Digital Forensics",
    "orderIndex": 1
  },
  "tasks": [
    {
      "id": "uuid",
      "question": "What is the first step in digital forensics?",
      "type": "MULTIPLE_CHOICE",
      "points": 10,
      "hint": "Think about preserving evidence",
      "orderIndex": 1,
      "userAnswer": {
        "taskId": "uuid",
        "answer": "Secure the scene",
        "isCorrect": true,
        "hintsUsed": 0,
        "createdAt": "2024-01-15T11:00:00.000Z"
      }
    }
  ]
}
```

---

## Progress

### Get User Progress
```http
GET /api/progress
```

**Access:** Protected

**Response:** `200 OK`
```json
{
  "progress": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "level": 1,
      "score": 85,
      "completedAt": "2024-01-15T12:00:00.000Z"
    }
  ],
  "totalLevels": 5,
  "completedLevels": 2,
  "totalScore": 350,
  "totalAnswers": 42,
  "correctAnswers": 38,
  "accuracy": "90.48"
}
```

---

### Submit Answer
```http
POST /api/progress/submit
```

**Access:** Protected

**Request Body:**
```json
{
  "taskId": "task-uuid",
  "answer": "Secure the scene"
}
```

**Response:** `201 Created`
```json
{
  "message": "Correct answer!",
  "userAnswer": {
    "id": "uuid",
    "taskId": "task-uuid",
    "answer": "Secure the scene",
    "isCorrect": true,
    "hintsUsed": 0,
    "createdAt": "2024-01-15T11:30:00.000Z"
  },
  "pointsEarned": 10,
  "feedback": "Great job! Your answer is correct."
}
```

**Error Response (Already Answered):** `400 Bad Request`
```json
{
  "error": "You have already submitted an answer for this task",
  "previousAnswer": {
    "answer": "Secure the scene",
    "isCorrect": true,
    "hintsUsed": 0
  }
}
```

---

### Use Hint
```http
PUT /api/progress/hint
```

**Access:** Protected

**Request Body:**
```json
{
  "taskId": "task-uuid"
}
```

**Response:** `200 OK`
```json
{
  "hint": "Think about preserving evidence",
  "message": "Hint revealed! Note: Using hints may reduce your score.",
  "pointPenalty": 2
}
```

**Error Response (No Hint):** `404 Not Found`
```json
{
  "error": "No hint available for this task"
}
```

---

### Complete Level
```http
POST /api/progress/complete-level
```

**Access:** Protected

**Request Body:**
```json
{
  "levelId": "level-uuid"
}
```

**Response:** `200 OK`
```json
{
  "message": "Level completed successfully!",
  "progress": {
    "id": "uuid",
    "userId": "user-uuid",
    "level": 1,
    "score": 95,
    "completedAt": "2024-01-15T14:00:00.000Z"
  },
  "stats": {
    "totalTasks": 10,
    "correctAnswers": 9,
    "totalScore": 95,
    "accuracy": "90.00%"
  },
  "achievementsEarned": ["FIRST_LEVEL_COMPLETE", "PERFECT_SCORE"]
}
```

**Error Response (Incomplete):** `400 Bad Request`
```json
{
  "error": "Cannot complete level: Not all tasks have been answered",
  "completed": 7,
  "total": 10
}
```

---

## Leaderboard

### Get Global Leaderboard
```http
GET /api/leaderboard
```

**Access:** Public (shows user rank if authenticated)

**Query Parameters:**
- `limit` - Number of entries to return (default: 100)

**Example:** `GET /api/leaderboard?limit=50`

**Response:** `200 OK`
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "uuid",
      "username": "alice",
      "totalScore": 1250,
      "completedLevels": 15,
      "achievementsCount": 12,
      "lastActive": "2024-01-15T14:00:00.000Z"
    },
    {
      "rank": 2,
      "userId": "uuid",
      "username": "bob",
      "totalScore": 1180,
      "completedLevels": 14,
      "achievementsCount": 10,
      "lastActive": "2024-01-15T13:00:00.000Z"
    }
  ],
  "total": 250,
  "userRank": {
    "rank": 15,
    "userId": "current-user-uuid",
    "username": "johndoe",
    "totalScore": 850,
    "completedLevels": 10,
    "achievementsCount": 8,
    "lastActive": "2024-01-15T12:00:00.000Z",
    "isCurrentUser": true
  }
}
```

---

### Get Level Leaderboard
```http
GET /api/leaderboard/level/:levelId
```

**Access:** Public (shows user rank if authenticated)

**URL Parameters:**
- `levelId` - Level UUID

**Query Parameters:**
- `limit` - Number of entries to return (default: 100)

**Response:** `200 OK`
```json
{
  "level": {
    "id": "uuid",
    "title": "Introduction to Digital Forensics",
    "orderIndex": 1
  },
  "leaderboard": [
    {
      "rank": 1,
      "userId": "uuid",
      "username": "alice",
      "score": 100,
      "completedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "total": 50,
  "userRank": {
    "rank": 5,
    "userId": "current-user-uuid",
    "username": "johndoe",
    "score": 95,
    "completedAt": "2024-01-15T12:00:00.000Z",
    "isCurrentUser": true
  }
}
```

---

### Get Difficulty Leaderboard
```http
GET /api/leaderboard/difficulty/:difficulty
```

**Access:** Public (shows user rank if authenticated)

**URL Parameters:**
- `difficulty` - One of: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT`

**Query Parameters:**
- `limit` - Number of entries to return (default: 100)

**Example:** `GET /api/leaderboard/difficulty/BEGINNER?limit=25`

**Response:** `200 OK`
```json
{
  "difficulty": "BEGINNER",
  "leaderboard": [
    {
      "rank": 1,
      "userId": "uuid",
      "username": "alice",
      "totalScore": 450,
      "completedLevels": 5,
      "totalLevels": 5,
      "achievementsCount": 8
    }
  ],
  "total": 100,
  "userRank": {
    "rank": 10,
    "userId": "current-user-uuid",
    "username": "johndoe",
    "totalScore": 380,
    "completedLevels": 4,
    "totalLevels": 5,
    "achievementsCount": 5,
    "isCurrentUser": true
  }
}
```

**Error Response (Invalid Difficulty):** `400 Bad Request`
```json
{
  "error": "Invalid difficulty",
  "validValues": ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]
}
```

---

## Achievements

### Get User Achievements
```http
GET /api/achievements
```

**Access:** Protected

**Response:** `200 OK`
```json
{
  "achievements": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "achievementType": "FIRST_LEVEL_COMPLETE",
      "earnedAt": "2024-01-15T12:00:00.000Z"
    },
    {
      "id": "uuid",
      "userId": "user-uuid",
      "achievementType": "PERFECT_SCORE",
      "earnedAt": "2024-01-15T14:00:00.000Z"
    }
  ],
  "totalAchievements": 2
}
```

---

### Award Achievement
```http
POST /api/achievements
```

**Access:** Protected

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

**Response:** `201 Created`
```json
{
  "message": "Achievement earned!",
  "achievement": {
    "id": "uuid",
    "userId": "user-uuid",
    "achievementType": "FIVE_LEVELS_COMPLETE",
    "earnedAt": "2024-01-15T15:00:00.000Z"
  }
}
```

---

## Utility Endpoints

### Health Check
```http
GET /health
```

**Access:** Public

**Response:** `200 OK`
```json
{
  "status": "ok",
  "message": "Forensics Simulator API is running",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

---

### API Documentation
```http
GET /api
```

**Access:** Public

**Response:** `200 OK`
```json
{
  "message": "Digital Forensics Training Simulator API",
  "version": "1.0.0",
  "endpoints": { ... },
  "documentation": "See API_DOCUMENTATION.md for detailed API documentation"
}
```

---

## Error Responses

### Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Error Response Format

All errors return a JSON object with an `error` field:

```json
{
  "error": "Error message description"
}
```

---

## Task Types

Available task types in the system:

- `MULTIPLE_CHOICE` - Multiple choice question
- `TRUE_FALSE` - True/False question
- `SHORT_ANSWER` - Short text answer
- `FILE_ANALYSIS` - File analysis task
- `COMMAND_LINE` - Command line exercise
- `NETWORK_ANALYSIS` - Network traffic analysis
- `MEMORY_FORENSICS` - Memory dump analysis
- `DISK_FORENSICS` - Disk image analysis
- `LOG_ANALYSIS` - Log file analysis

---

## Difficulty Levels

- `BEGINNER` - Introductory level
- `INTERMEDIATE` - Moderate difficulty
- `ADVANCED` - Advanced concepts
- `EXPERT` - Expert-level challenges
