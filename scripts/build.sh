#!/bin/bash
# Build script for production deployment

set -e  # Exit on error

echo "================================"
echo "Building Forensics Simulator"
echo "================================"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Build backend
echo ""
echo "Building backend..."
cd backend
npm ci --only=production
npx prisma generate
cd ..

# Build frontend
echo ""
echo "Building frontend..."
cd frontend
npm ci
npm run build
cd ..

echo ""
echo "================================"
echo "Build completed successfully!"
echo "================================"
