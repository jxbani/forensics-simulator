#!/bin/bash

echo "🚀 Deploying Forensics Simulator with Lab Tools..."

# Build Docker images
echo "📦 Building Docker images..."
docker-compose build

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Set up database
echo "🗄️ Setting up database..."
cd backend
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
cd ..

# Build frontend
echo "🏗️ Building frontend..."
cd frontend
npm run build
cd ..

echo "✅ Deployment complete!"
echo "📍 Run 'cd backend && npm start' to start backend"
echo "📍 Run 'cd frontend && npm run dev' to start frontend"
