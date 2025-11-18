# Quick Start Guide

## Setup Database with Seed Data

Follow these steps to get your forensics training simulator up and running with sample data.

### 1. Environment Setup

Create `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/forensics_simulator?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Run Database Migrations

```bash
npm run prisma:migrate
```

When prompted for migration name, enter: `init`

### 5. Seed the Database

```bash
npm run db:seed
```

**Expected output:**
```
🌱 Starting database seed...
🗑️  Clearing existing data...
✅ Existing data cleared

📚 Creating levels and tasks...
✅ Created Level 1: "Introduction to Digital Forensics"
   Difficulty: BEGINNER
   Tasks: 10
   Total Points: 130
...
🎉 Database seeded successfully!
```

### 6. Start the Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

### 7. Verify Data

**Option A: Use Prisma Studio**
```bash
npm run prisma:studio
```

Opens a GUI at `http://localhost:5555`

**Option B: Test API Endpoint**
```bash
curl http://localhost:5000/api/levels
```

Should return all 5 levels with task counts.

---

## What Gets Seeded

### 5 Forensics Training Levels

1. **Introduction to Digital Forensics** (BEGINNER)
   - 10 tasks, 130 points
   - Crime scene management, chain of custody, ACPO principles

2. **File System Forensics** (INTERMEDIATE)
   - 12 tasks, 195 points
   - MFT analysis, file carving, timeline analysis

3. **Network Forensics and Traffic Analysis** (INTERMEDIATE)
   - 12 tasks, 175 points
   - Wireshark, tcpdump, protocol analysis

4. **Memory Forensics and Live Analysis** (ADVANCED)
   - 12 tasks, 230 points
   - Volatility framework, process analysis, malware detection

5. **Advanced Malware Analysis and Incident Response** (EXPERT)
   - 15 tasks, 330 points
   - Reverse engineering, YARA, MITRE ATT&CK, APT analysis

**Total:** 59 tasks, 1,060 points

---

## Testing the Seeded Data

### 1. Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "forensics_student",
    "email": "student@example.com",
    "password": "password123"
  }'
```

Save the returned `token`.

### 2. View Levels

```bash
curl http://localhost:5000/api/levels
```

### 3. Get Tasks for Level 1

Get the level ID from the previous response, then:

```bash
curl http://localhost:5000/api/levels/LEVEL_ID/tasks
```

### 4. Submit an Answer

```bash
curl -X POST http://localhost:5000/api/progress/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "TASK_ID",
    "answer": "Secure and isolate the scene"
  }'
```

### 5. Check Progress

```bash
curl -X GET http://localhost:5000/api/progress \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. View Leaderboard

```bash
curl http://localhost:5000/api/leaderboard
```

---

## Common Commands

```bash
# Development
npm run dev                    # Start dev server with nodemon

# Database
npm run prisma:generate        # Generate Prisma client
npm run prisma:migrate         # Run migrations
npm run prisma:studio          # Open Prisma Studio GUI
npm run db:seed                # Seed database

# Production
npm start                      # Start production server
```

---

## Troubleshooting

### "Cannot connect to database"

1. Check PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Verify DATABASE_URL in `.env`

3. Create database if it doesn't exist:
   ```bash
   createdb forensics_simulator
   ```

### "Prisma Client not generated"

```bash
npm run prisma:generate
```

### "Migration failed"

1. Drop and recreate database:
   ```bash
   dropdb forensics_simulator
   createdb forensics_simulator
   npm run prisma:migrate
   ```

2. Re-seed:
   ```bash
   npm run db:seed
   ```

### "Seed script fails"

1. Check Prisma client is generated
2. Verify database connection
3. Check for syntax errors in seed.js
4. View detailed error messages

---

## Next Steps

1. **Explore Prisma Studio** to see the seeded data
2. **Test all API endpoints** using the examples above
3. **Create more users** and test the leaderboard
4. **Complete a full level** to earn achievements
5. **Integrate with frontend** React application

---

## Sample User Journey

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"pass123"}'

# Save token from response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 2. Get all levels
curl http://localhost:5000/api/levels

# 3. Get Level 1 tasks
curl http://localhost:5000/api/levels/LEVEL_1_ID/tasks

# 4. Submit answer to first task
curl -X POST http://localhost:5000/api/progress/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"taskId":"TASK_1_ID","answer":"Secure and isolate the scene"}'

# 5. Request a hint for task 2
curl -X PUT http://localhost:5000/api/progress/hint \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"taskId":"TASK_2_ID"}'

# 6. Complete all tasks, then complete level
curl -X POST http://localhost:5000/api/progress/complete-level \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"levelId":"LEVEL_1_ID"}'

# 7. Check achievements
curl -X GET http://localhost:5000/api/achievements \
  -H "Authorization: Bearer $TOKEN"

# 8. View leaderboard
curl http://localhost:5000/api/leaderboard
```

---

## Resources

- **SEED_DATA.md** - Detailed seed data documentation
- **API_ENDPOINTS.md** - Complete API reference
- **TESTING_GUIDE.md** - Comprehensive testing guide
- **README.md** - Project overview

---

## Database Reset

To completely reset and re-seed:

```bash
# Option 1: Drop and recreate
dropdb forensics_simulator
createdb forensics_simulator
npm run prisma:migrate
npm run db:seed

# Option 2: Reset with Prisma
npx prisma migrate reset
# This will automatically run seed after reset
```

---

## Production Deployment

Before deploying to production:

1. Change JWT_SECRET to a strong random value
2. Set NODE_ENV=production
3. Use a production-grade PostgreSQL instance
4. Enable SSL for database connections
5. Review and customize seed data if needed
6. Consider backing up seed script for disaster recovery

---

## Support

For issues or questions:
- Check error messages in console
- Review logs in development mode
- Consult API documentation
- Verify database connection
- Check Prisma schema matches migrations
