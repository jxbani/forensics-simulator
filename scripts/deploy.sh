#!/bin/bash
# Deployment script for production

set -e  # Exit on error

echo "================================"
echo "Deploying Forensics Simulator"
echo "================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please create .env from .env.example"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Build Docker images
echo ""
echo "Building Docker images..."
docker-compose build --no-cache

# Stop existing containers
echo ""
echo "Stopping existing containers..."
docker-compose down

# Run database migrations
echo ""
echo "Running database migrations..."
docker-compose run --rm backend npx prisma migrate deploy

# Start services
echo ""
echo "Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo ""
echo "Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "Checking service health..."
docker-compose ps

echo ""
echo "================================"
echo "Deployment completed!"
echo "================================"
echo ""
echo "Frontend: http://localhost:${FRONTEND_PORT:-80}"
echo "Backend API: http://localhost:${BACKEND_PORT:-5000}"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
