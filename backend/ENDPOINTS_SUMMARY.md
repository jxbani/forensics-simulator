# API Endpoints Summary

## Complete Endpoint List

### User Management (Authentication)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/profile` | Protected | Get user profile with stats |
| PUT | `/api/auth/password` | Protected | Update password |

### Levels
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/levels` | Public* | Get all levels |
| GET | `/api/levels/:id` | Public* | Get specific level |
| GET | `/api/levels/:id/tasks` | Public* | Get level tasks |

*Public but shows user progress/answers if authenticated

### Progress
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/progress` | Protected | Get user progress across all levels |
| POST | `/api/progress/submit` | Protected | Submit answer to a task |
| PUT | `/api/progress/hint` | Protected | Get hint for a task |
| POST | `/api/progress/complete-level` | Protected | Mark level as complete |

### Leaderboard
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/leaderboard` | Public* | Get global leaderboard |
| GET | `/api/leaderboard/level/:levelId` | Public* | Get level-specific leaderboard |
| GET | `/api/leaderboard/difficulty/:difficulty` | Public* | Get difficulty-based leaderboard |

*Public but shows user rank if authenticated

### Achievements
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/achievements` | Protected | Get user achievements |
| POST | `/api/achievements` | Protected | Award achievement to user |

### Utility
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/health` | Public | Health check |
| GET | `/api` | Public | API documentation overview |

---

## Total Endpoints: 17

### Breakdown:
- **Authentication:** 4 endpoints
- **Levels:** 3 endpoints
- **Progress:** 4 endpoints
- **Leaderboard:** 3 endpoints
- **Achievements:** 2 endpoints
- **Utility:** 2 endpoints

---

## Controllers

1. **authController.js** - User authentication and profile management
   - register
   - login
   - getProfile
   - updatePassword

2. **levelController.js** - Level and task management
   - getAllLevels
   - getLevelById
   - getLevelTasks

3. **progressController.js** - User progress tracking
   - getUserProgress
   - submitAnswer
   - useHint
   - completeLevel

4. **leaderboardController.js** - Leaderboard systems
   - getLeaderboard
   - getLevelLeaderboard
   - getDifficultyLeaderboard

5. **achievementController.js** - Achievement management
   - getUserAchievements
   - awardAchievement

---

## Routes

All route files follow the pattern:
- Import controllers
- Create Express router
- Define routes with appropriate middleware
- Export router

1. **authRoutes.js** - Auth endpoints
2. **levelRoutes.js** - Level endpoints (uses optionalAuth)
3. **progressRoutes.js** - Progress endpoints (all protected)
4. **leaderboardRoutes.js** - Leaderboard endpoints (uses optionalAuth)
5. **achievementRoutes.js** - Achievement endpoints (all protected)

---

## Middleware

### authenticate
- Verifies JWT token
- Attaches user to request object
- Returns 401 if no token or invalid token

### optionalAuth
- Attempts to verify JWT token
- Attaches user to request if valid
- Continues without user if no token (doesn't fail)

---

## Response Patterns

### Success Responses
- **200 OK** - Successful GET request
- **201 Created** - Successful POST request (resource created)

### Error Responses
- **400 Bad Request** - Invalid input or validation error
- **401 Unauthorized** - Authentication required or failed
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

All errors return:
```json
{
  "error": "Error message description"
}
```

---

## Key Features

### 🔐 Security
- JWT token-based authentication
- Bcrypt password hashing (10 rounds)
- Protected routes with middleware
- Input validation
- Case-insensitive answer comparison

### 📊 Gamification
- Points system for correct answers
- Hint system with point penalties
- Achievement tracking
- Multiple leaderboard types
- Progress tracking

### 🎯 Flexibility
- Optional authentication on public endpoints
- Multiple leaderboard views (global, by level, by difficulty)
- Detailed user statistics
- Task type variety (9 types)
- Difficulty levels (4 levels)

### 📈 Analytics
- User progress tracking
- Answer accuracy calculation
- Completion statistics
- Leaderboard rankings
- Achievement counts

---

## Database Models Used

- **User** - Authentication and profile
- **Level** - Training modules
- **Task** - Individual challenges
- **Progress** - User level completion
- **UserAnswer** - Submitted answers
- **Achievement** - Earned achievements

---

## Next Steps for Development

1. **Create seed data** for levels and tasks
2. **Add admin routes** for content management
3. **Implement rate limiting** for auth endpoints
4. **Add pagination** for large result sets
5. **Create webhook** for achievement notifications
6. **Add analytics dashboard** endpoints
7. **Implement search** for levels/tasks
8. **Add filters** for leaderboards
9. **Create bulk operations** for admin
10. **Add export** functionality for progress

---

## Testing

See `TESTING_GUIDE.md` for detailed testing instructions.

Quick test:
```bash
# Start server
npm run dev

# Test endpoint
curl http://localhost:5000/api
```

---

## Documentation Files

- **API_DOCUMENTATION.md** - Detailed auth system documentation
- **API_ENDPOINTS.md** - Complete endpoint reference with examples
- **TESTING_GUIDE.md** - Testing instructions
- **ENDPOINTS_SUMMARY.md** - This file (quick reference)
