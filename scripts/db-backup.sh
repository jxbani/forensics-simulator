#!/bin/bash
# Database backup script

set -e

echo "================================"
echo "Database Backup"
echo "================================"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Create backup directory if it doesn't exist
BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/forensics_db_backup_$TIMESTAMP.sql"

echo "Creating backup..."
echo "Backup file: $BACKUP_FILE"

# Check if running with Docker
if command -v docker-compose &> /dev/null && docker-compose ps database | grep -q "Up"; then
    echo "Using Docker container..."
    docker-compose exec -T database pg_dump -U "${DB_USER:-forensics}" "${DB_NAME:-forensics_simulator}" > "$BACKUP_FILE"
else
    echo "Using local PostgreSQL..."
    PGPASSWORD="${DB_PASSWORD}" pg_dump -h localhost -U "${DB_USER:-forensics}" "${DB_NAME:-forensics_simulator}" > "$BACKUP_FILE"
fi

# Compress backup
echo "Compressing backup..."
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

# Get file size
FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo ""
echo "================================"
echo "Backup completed!"
echo "================================"
echo "File: $BACKUP_FILE"
echo "Size: $FILE_SIZE"
echo ""

# Clean up old backups (keep last 30 days)
if [ "${BACKUP_RETENTION_DAYS:-30}" -gt 0 ]; then
    echo "Cleaning up backups older than ${BACKUP_RETENTION_DAYS:-30} days..."
    find "$BACKUP_DIR" -name "forensics_db_backup_*.sql.gz" -type f -mtime +${BACKUP_RETENTION_DAYS:-30} -delete
    echo "Cleanup completed"
fi
