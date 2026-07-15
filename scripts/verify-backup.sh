#!/usr/bin/env sh
set -eu

TARGET_DATABASE="${TARGET_DATABASE:-payment_gateway_restore_test}"
BACKUP_FILE="${BACKUP_FILE:?BACKUP_FILE is required}"

export TARGET_DATABASE
scripts/restore-postgres.sh

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
SERVICE="${POSTGRES_SERVICE:-postgres}"
USER_NAME="${POSTGRES_USER:?POSTGRES_USER is required}"

docker compose -f "$COMPOSE_FILE" exec -T "$SERVICE" psql -U "$USER_NAME" -d "$TARGET_DATABASE" -c "SELECT COUNT(*) AS tables FROM information_schema.tables WHERE table_schema = 'public';"
echo "Backup verification completed for $TARGET_DATABASE"
