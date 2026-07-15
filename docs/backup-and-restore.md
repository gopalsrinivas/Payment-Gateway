# Backup and Restore

Backups use `pg_dump` custom format and gzip compression. Files are written to `./backups`, which is ignored by Git.

## Backup

```bash
POSTGRES_DB=payment_gateway_demo POSTGRES_USER=gopal ./scripts/backup-postgres.sh
```

## Restore to Disposable Database

```bash
POSTGRES_DB=payment_gateway_demo \
POSTGRES_USER=gopal \
TARGET_DATABASE=payment_gateway_restore_test \
BACKUP_FILE=./backups/payment_gateway_demo_YYYYMMDDTHHMMSSZ.dump.gz \
./scripts/restore-postgres.sh
```

The restore script refuses to restore over `POSTGRES_DB`.

## Verify Backup

```bash
POSTGRES_DB=payment_gateway_demo \
POSTGRES_USER=gopal \
BACKUP_FILE=./backups/payment_gateway_demo_YYYYMMDDTHHMMSSZ.dump.gz \
./scripts/verify-backup.sh
```

## Incident Restore Steps

1. Stop application writes.
2. Confirm target environment.
3. Verify the backup file.
4. Create a restore database.
5. Restore with `pg_restore`.
6. Run verification queries.
7. Run migrations only when appropriate.
8. Restart services.
9. Run smoke tests.
10. Record the recovery result.
