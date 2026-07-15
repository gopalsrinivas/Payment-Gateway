#!/usr/bin/env sh
set -eu

BACKUP_DIR="${BACKUP_DIR:-./backups}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
SERVICE="${POSTGRES_SERVICE:-postgres}"
DATABASE="${POSTGRES_DB:?POSTGRES_DB is required}"
USER_NAME="${POSTGRES_USER:?POSTGRES_USER is required}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

mkdir -p "$BACKUP_DIR"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_file="$BACKUP_DIR/${DATABASE}_${timestamp}.dump"

docker compose -f "$COMPOSE_FILE" exec -T "$SERVICE" pg_dump -U "$USER_NAME" -d "$DATABASE" -Fc > "$backup_file"
gzip -f "$backup_file"

find "$BACKUP_DIR" -name "${DATABASE}_*.dump.gz" -type f -mtime +"$RETENTION_DAYS" -delete

echo "Backup created: ${backup_file}.gz"
