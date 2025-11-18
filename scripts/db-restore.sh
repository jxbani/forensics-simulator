#!/bin/bash
# Database restore script

set -e

echo "================================"
echo "Database Restore"
echo "================================"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

BACKUP_DIR="${BACKUP_DIR:-./backups}"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "Error: Backup directory not found: $BACKUP_DIR"
    exit 1
fi

# List available backups
echo "Available backups:"
echo ""
select backup_file in "$BACKUP_DIR"/forensics_db_backup_*.sql.gz; do
    if [ -n "$backup_file" ]; then
        echo "Selected: $backup_file"
        break
    else
        echo "Invalid selection"
    fi
done

# Confirm restoration
echo ""
read -p "WARNING: This will overwrite the current database. Are you sure? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

# Decompress if needed
if [[ $backup_file == *.gz ]]; then
    echo "Decompressing backup..."
    gunzip -c "$backup_file" > "${backup_file%.gz}"
    RESTORE_FILE="${backup_file%.gz}"
    CLEANUP_TEMP=true
else
    RESTORE_FILE="$backup_file"
    CLEANUP_TEMP=false
fi

echo "Restoring database..."

# Check if running with Docker
if command -v docker-compose &> /dev/null && docker-compose ps database | grep -q "Up"; then
    echo "Using Docker container..."
    cat "$RESTORE_FILE" | docker-compose exec -T database psql -U "${DB_USER:-forensics}" "${DB_NAME:-forensics_simulator}"
else
    echo "Using local PostgreSQL..."
    PGPASSWORD="${DB_PASSWORD}" psql -h localhost -U "${DB_USER:-forensics}" "${DB_NAME:-forensics_simulator}" < "$RESTORE_FILE"
fi

# Clean up temporary file if created
if [ "$CLEANUP_TEMP" = true ]; then
    rm "$RESTORE_FILE"
fi

echo ""
echo "================================"
echo "Restore completed!"
echo "================================"
