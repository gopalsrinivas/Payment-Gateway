#!/usr/bin/env sh
set -eu

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
SERVICE="${POSTGRES_SERVICE:-postgres}"
TARGET_DATABASE="${TARGET_DATABASE:?TARGET_DATABASE is required and must not be the production database}"
USER_NAME="${POSTGRES_USER:?POSTGRES_USER is required}"
BACKUP_FILE="${BACKUP_FILE:?BACKUP_FILE is required}"

if [ "$TARGET_DATABASE" = "${POSTGRES_DB:-}" ]; then
  echo "Refusing to restore over POSTGRES_DB. Set TARGET_DATABASE to a disposable restore database."
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "Restoring $BACKUP_FILE into disposable database $TARGET_DATABASE"
docker compose -f "$COMPOSE_FILE" exec -T "$SERVICE" createdb -U "$USER_NAME" "$TARGET_DATABASE" 2>/dev/null || true

case "$BACKUP_FILE" in
  *.gz) gzip -dc "$BACKUP_FILE" | docker compose -f "$COMPOSE_FILE" exec -T "$SERVICE" pg_restore -U "$USER_NAME" -d "$TARGET_DATABASE" --clean --if-exists ;;
  *) docker compose -f "$COMPOSE_FILE" exec -T "$SERVICE" pg_restore -U "$USER_NAME" -d "$TARGET_DATABASE" --clean --if-exists < "$BACKUP_FILE" ;;
esac

echo "Restore completed into $TARGET_DATABASE"
