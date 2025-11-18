# Digital Forensics Training Simulator

A web-based platform for learning digital forensics through interactive scenarios and real forensic tools.

## Features

- 5 progressive forensic investigation levels
- Interactive training scenarios
- Forensic tool integration (Demo Mode)
- Progress tracking and leaderboards
- User authentication and profiles

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+

### Installation

1. **Clone repository**

2. **Install dependencies:**
```bash
cd backend && npm install
cd ../frontend && npm install
```

3. **Setup database:**
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm run db:generate
npm run db:migrate
npm run db:seed
```

4. **Start application:**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

5. **Open http://localhost:5173**

## Project Structure

- `/backend` - Node.js + Express API
- `/frontend` - React + Vite application
- `/docker` - Forensic tool containers (optional)

## Documentation

- [Backend README](./backend/README.md) - API documentation and setup
- [Frontend README](./frontend/README.md) - UI documentation and development
- [Quick Start Guide](./QUICK_START.md) - Detailed setup instructions

## Development Team

**Group 1:** Sara Ahmad, Yazan Rawwashin, Ahmad Azzam, Mohammad Alawneh

## License

MIT
