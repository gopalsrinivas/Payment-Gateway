# Deployment Guide

Primary deployment path:

```text
Ubuntu VM -> Docker Engine -> Docker Compose -> Nginx -> frontend/backend -> PostgreSQL
```

Razorpay stays in Test Mode. Configure the public webhook URL as:

```text
https://your-domain.example/api/v1/webhooks/razorpay
```

## Linux VM Commands

```bash
git clone <repository-url> payment-gateway
cd payment-gateway
cp .env.production.example .env.production
docker compose -f docker-compose.prod.yml --env-file .env.production config
docker compose -f docker-compose.prod.yml --env-file .env.production up -d postgres
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend npm run db:migrate
docker compose -f docker-compose.prod.yml --env-file .env.production up -d backend frontend reverse-proxy
docker compose -f docker-compose.prod.yml --env-file .env.production ps
```

Edit `.env.production` only on the server or in protected deployment secrets. Do not commit it.

## HTTPS and CORS

Use Let's Encrypt or a managed TLS proxy. Set:

```env
CORS_ORIGIN=https://your-domain.example
TRUST_PROXY=true
NEXT_PUBLIC_API_BASE_URL=https://your-domain.example/api/v1
```

Frontend `NEXT_PUBLIC_*` values are embedded at build time, so rebuild the frontend image per environment.

## Migration Strategy

Run migrations once before sending traffic to a new backend image:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend npm run db:migrate
```

Do not run production seeders automatically. Do not automatically undo migrations on failure.

## Verification

```bash
FRONTEND_URL=https://your-domain.example BACKEND_URL=https://your-domain.example ./scripts/smoke-test.sh
```

Alternative platforms such as Azure Container Apps, AWS ECS, Render, Railway, and DigitalOcean can use the same images with managed PostgreSQL and protected environment variables.
