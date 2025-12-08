#!/bin/bash
# Database migration script

set -e

echo "================================"
echo "Database Migration"
echo "================================"

# Check if running in Docker or locally
if [ -f /.dockerenv ]; then
    # Running inside Docker container
    echo "Running migrations in Docker container..."
    npx prisma migrate deploy
else
    # Running locally
    echo "Select migration option:"
    echo "1) Run migrations (production)"
    echo "2) Create new migration (development)"
    echo "3) Reset database (WARNING: deletes all data)"
    echo "4) View migration status"
    read -p "Enter choice [1-4]: " choice

    case $choice in
        1)
            echo "Running migrations..."
            cd backend
            npx prisma migrate deploy
            ;;
        2)
            read -p "Enter migration name: " migration_name
            echo "Creating migration: $migration_name"
            cd backend
            npx prisma migrate dev --name "$migration_name"
            ;;
        3)
            read -p "Are you sure you want to reset the database? This will delete all data! (yes/no): " confirm
            if [ "$confirm" = "yes" ]; then
                echo "Resetting database..."
                cd backend
                npx prisma migrate reset
            else
                echo "Reset cancelled"
            fi
            ;;
        4)
            echo "Migration status:"
            cd backend
            npx prisma migrate status
            ;;
        *)
            echo "Invalid choice"
            exit 1
            ;;
    esac
fi

echo ""
echo "================================"
echo "Migration completed!"
echo "================================"
