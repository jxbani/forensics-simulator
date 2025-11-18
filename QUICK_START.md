# Quick Start Guide

Get the Digital Forensics Training Simulator running in under 5 minutes.

## First Time Setup

1. **Install dependencies:**
```bash
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

2. **Configure environment:**
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit both .env files with your settings
```

3. **Setup database:**
```bash
cd backend
npm run db:generate
npm run db:migrate
npm run db:seed
cd ..
```

## Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **API Health:** http://localhost:5000/health

## Default Credentials

After seeding the database, you can login with:

**Student Account:**
- Email: `student@example.com`
- Password: `password123`

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`

## Demo Mode

The application runs in **Demo Mode** by default - forensic tools show documentation instead of launching containers. No Docker installation required for basic testing.

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify DATABASE_URL in `backend/.env`
- Run `npm run db:generate` to regenerate Prisma client

### Frontend can't connect to API
- Verify backend is running on port 5000
- Check VITE_API_URL in `frontend/.env`
- Check browser console for CORS errors

### Database errors
```bash
cd backend
npm run db:reset  # WARNING: This deletes all data
npm run db:seed
```

### Port already in use
```bash
# Find process using port 5000 (backend)
lsof -i :5000
kill -9 <PID>

# Find process using port 5173 (frontend)
lsof -i :5173
kill -9 <PID>
```

## Key Features

- **5 Progressive Levels** - From basic file analysis to advanced forensics
- **Interactive Tasks** - Step-by-step guidance with hints
- **Progress Tracking** - Complete tasks and earn points
- **Leaderboard** - Compete with other students
- **Admin Dashboard** - Manage users and content
- **Demo Mode** - Try tools without Docker installation

## Next Steps

- Review the [Main README](./README.md) for project overview
- Check [Backend README](./backend/README.md) for API details
- Check [Frontend README](./frontend/README.md) for UI details
- Complete Level 1 to learn the basics

## Production Deployment

For production deployment instructions, see the backend and frontend README files for specific deployment configurations.

---

**Development Team:** Group 1 - Sara Ahmad, Yazan Rawwashin, Ahmad Azzam, Mohammad Alawneh
