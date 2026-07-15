# Docker Compose Startup Recovery

This document fixes two local Docker startup failures without deleting data automatically.

## Backend Logger Permission

The backend container runs as `appuser`. Container logging should go to stdout/stderr.

Use file logs only for local non-container development:

```env
LOG_TO_FILES=true
```

Docker Compose sets:

```env
LOG_TO_FILES=false
```

## PostgreSQL Role Mismatch

Development Compose expects:

```env
POSTGRES_DB=payment_gateway_demo
POSTGRES_USER=gopal
POSTGRES_PASSWORD=gopal
DB_HOST=postgres
DB_PORT=5432
DB_NAME=payment_gateway_demo
DB_USER=gopal
DB_PASSWORD=gopal
```

If the existing Docker volume was initialized with another user, PostgreSQL will skip initialization and `gopal` will not be created.

## Option A: Preserve Existing Volume

Start only PostgreSQL:

```cmd
docker compose up -d postgres
docker compose ps
docker compose logs --tail=100 postgres
```

Open a shell using the existing superuser. If the original role was `postgres`, run:

```cmd
docker compose exec postgres psql -U postgres -d postgres
```

If the original role was different, replace `postgres` with that existing role.

Run:

```sql
CREATE ROLE gopal WITH LOGIN PASSWORD 'gopal';
ALTER DATABASE payment_gateway_demo OWNER TO gopal;
GRANT ALL PRIVILEGES ON DATABASE payment_gateway_demo TO gopal;
\c payment_gateway_demo
ALTER SCHEMA public OWNER TO gopal;
GRANT ALL ON SCHEMA public TO gopal;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gopal;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO gopal;
```

If the role already exists, use:

```sql
ALTER ROLE gopal WITH LOGIN PASSWORD 'gopal';
```

Then run:

```cmd
docker compose run --rm backend npm run db:migrate
docker compose run --rm backend npm run db:seed
docker compose up -d backend frontend
docker compose ps
```

## Option B: Fresh Development Volume

Use this only when Docker PostgreSQL data is disposable. This does not affect Windows local PostgreSQL.

Identify the exact volume:

```cmd
docker volume ls
```

For this project the development volume is usually:

```text
payment-gateway_postgres_data
```

Stop services:

```cmd
docker compose down
```

Destructive deletion, only after explicit confirmation:

```cmd
docker volume rm payment-gateway_postgres_data
```

Recreate:

```cmd
docker compose up -d postgres
docker compose run --rm backend npm run db:migrate
docker compose run --rm backend npm run db:seed
docker compose up -d backend frontend
docker compose ps
```
