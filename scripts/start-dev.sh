#!/bin/bash
# Start development environment with Docker Compose

set -e

echo "================================"
echo "Starting Development Environment"
echo "================================"

# Check if .env file exists, if not create from example
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "Please update .env with your configuration"
fi

# Start services with development compose file
echo ""
echo "Starting services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for database to be ready
echo ""
echo "Waiting for database..."
sleep 5

# Run migrations
echo ""
echo "Running migrations..."
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev

# Seed database (optional)
read -p "Do you want to seed the database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Seeding database..."
    docker-compose -f docker-compose.dev.yml exec backend npm run db:seed
fi

echo ""
echo "================================"
echo "Development environment ready!"
echo "================================"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:5000"
echo "Database: localhost:5432"
echo ""
echo "To view logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "To stop: docker-compose -f docker-compose.dev.yml down"
