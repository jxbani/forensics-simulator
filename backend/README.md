# Forensics Simulator - Backend API

Digital Forensics Training Simulator backend server built with Node.js, Express, and PostgreSQL.

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Database configuration
│   │   └── socket.js             # WebSocket configuration
│   ├── controllers/
│   │   ├── achievementController.js
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── fileController.js
│   │   ├── leaderboardController.js
│   │   ├── levelController.js
│   │   └── progressController.js
│   ├── middleware/
│   │   ├── admin.js              # Admin authorization
│   │   ├── auth.js               # JWT authentication
│   │   └── fileUpload.js         # File upload handling
│   ├── routes/
│   │   ├── achievementRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── fileRoutes.js
│   │   ├── leaderboardRoutes.js
│   │   ├── levelRoutes.js
│   │   ├── progressRoutes.js
│   │   └── toolRoutes.js
│   ├── services/
│   │   ├── dockerService.js      # Docker container management
│   │   └── fileService.js        # File operations
│   ├── utils/
│   │   └── jwt.js                # JWT token utilities
│   └── server.js                 # Express server entry point
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.js                   # Database seeding
├── tests/                        # Test files
├── uploads/                      # User uploaded files
├── user_data/                    # User-specific data
├── .env.example                  # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Setup database:**
   ```bash
   npm run db:generate    # Generate Prisma client
   npm run db:migrate:dev # Run database migrations
   npm run db:seed        # Seed initial data
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with hot reload |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations (production) |
| `npm run db:migrate:dev` | Run database migrations (development) |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:reset` | Reset database (⚠️ deletes all data) |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests only |

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/forensics_db"

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Docker Configuration
FORCE_MOCK_DOCKER=true

# File Upload Configuration
MAX_FILE_SIZE=10737418240
UPLOAD_PATH=./uploads
```

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/password` - Update password (protected)

### Levels
- `GET /api/levels` - Get all levels
- `GET /api/levels/:id` - Get specific level
- `GET /api/levels/:id/tasks` - Get level tasks

### Progress
- `GET /api/progress` - Get user progress (protected)
- `POST /api/progress/submit` - Submit answer (protected)
- `PUT /api/progress/hint` - Use hint (protected)
- `POST /api/progress/complete-level` - Complete level (protected)

### Forensic Tools
- `GET /api/tools/available` - List available tools (protected)
- `POST /api/tools/start` - Start forensic tool (protected)
- `POST /api/tools/stop/:dockerId` - Stop tool (protected)
- `GET /api/tools/list` - List active tools (protected)

### Leaderboard
- `GET /api/leaderboard` - Global leaderboard
- `GET /api/leaderboard/level/:levelId` - Level-specific leaderboard
- `GET /api/leaderboard/difficulty/:difficulty` - Difficulty-based leaderboard

### Admin (Protected)
- `GET /api/admin/users` - List all users
- `GET /api/admin/analytics` - System analytics
- `POST /api/admin/levels` - Create new level
- And more... (see `/api` endpoint for full list)

For complete API documentation, visit `http://localhost:5000/api` when the server is running.

## 🗄️ Database

This project uses PostgreSQL with Prisma ORM.

### Database Schema

Main entities:
- **User** - User accounts and profiles
- **Level** - Training levels and challenges
- **Task** - Individual tasks within levels
- **UserProgress** - User progress tracking
- **Achievement** - User achievements
- **File** - Uploaded evidence files
- **AdminAuditLog** - Admin action logging

### Migrations

Create a new migration:
```bash
npm run db:migrate:dev -- --name your_migration_name
```

Apply migrations in production:
```bash
npm run db:migrate
```

## 🐳 Docker Support

The backend supports Docker for forensic tool containers. When Docker is unavailable, it automatically falls back to demo mode.

### Demo Mode
- Enabled by default via `FORCE_MOCK_DOCKER=true`
- Tools launch with documentation links instead of actual containers
- Perfect for development and demonstration

### Production Mode
- Set `FORCE_MOCK_DOCKER=false`
- Requires Docker daemon running
- Launches real forensic tool containers

## 🧪 Testing

Run tests:
```bash
npm test              # All tests
npm run test:unit     # Unit tests only
npm run test:integration  # Integration tests only
npm run test:coverage # With coverage report
```

## 🔧 Development

### Code Organization
- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and data operations
- **Middleware**: Authentication, validation, error handling
- **Routes**: API endpoint definitions
- **Config**: Application configuration

### Adding a New Feature

1. Create controller in `src/controllers/`
2. Add routes in `src/routes/`
3. Update database schema in `prisma/schema.prisma` if needed
4. Create migration: `npm run db:migrate:dev`
5. Add tests in `tests/`
6. Update API documentation

## 📝 Logging

Logs are output to console with different levels:
- Server startup and shutdown
- API requests (development mode)
- Errors and warnings
- Background job execution

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Admin-only routes
- File upload validation
- SQL injection protection via Prisma

## 🚨 Troubleshooting

### Database Connection Error
```bash
# Verify PostgreSQL is running
sudo service postgresql status

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Test connection
npm run db:studio
```

### Port Already in Use
```bash
# Change PORT in .env
# Or kill process using port 5000
lsof -ti:5000 | xargs kill -9
```

### Prisma Client Issues
```bash
# Regenerate Prisma client
npm run db:generate
```

## 📚 Additional Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [API Endpoints](./API_ENDPOINTS.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Quick Start](./QUICK_START.md)
- [Sample Data](./SEED_DATA.md)

## 📄 License

ISC

## 👥 Support

For issues and questions, please check the main project documentation.
