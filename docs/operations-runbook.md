# Operations Runbook

## Start

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d postgres
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend npm run db:migrate
docker compose -f docker-compose.prod.yml --env-file .env.production up -d backend frontend reverse-proxy
```

## Stop

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production down
```

Do not run `down -v` unless intentionally deleting the PostgreSQL volume.

## Logs and Health

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=100 backend
curl -fsS https://your-domain.example/api/v1/health
curl -fsS https://your-domain.example/
```

## Migrations and Seeds

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend npm run db:migrate
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend npm run db:migrate:status
```

Development seeders are opt-in:

```bash
docker compose exec backend npm run db:seed
```

## Troubleshooting

- Database connection: check `postgres` health, `DB_HOST=postgres`, and credentials.
- Frontend API URL: verify `NEXT_PUBLIC_API_BASE_URL` was set when building the frontend image.
- Webhook: verify HTTPS, Razorpay Test Mode webhook secret, and `/api/v1/webhooks/razorpay`.
- Payment initialization: check backend logs for safe Razorpay errors and order payable state.
- Disk: check Docker volume usage and backup retention.

## Secret Rotation

- `JWT_SECRET`: update secret and restart backend; users log in again.
- Database password: update database role, `.env.production`, and restart backend.
- Razorpay key secret: update protected backend secret, restart backend, test order creation.
- Webhook secret: update Razorpay dashboard and backend secret, restart backend, send test webhook.
