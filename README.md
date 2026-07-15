# Payment Gateway

Full-stack Razorpay Test Mode payment gateway demo.

## Scope

Included now:

- Express backend with JWT authentication
- PostgreSQL and Sequelize configuration
- Roles and users migrations
- Admin and Customer seeders
- Registration, login, logout, and protected profile APIs
- Role authorization middleware foundation
- Razorpay SDK configuration foundation
- Razorpay webhook raw-body route foundation
- Winston logging, request IDs, centralized errors, Swagger
- Next.js registration, login, protected dashboard, auth context
- Docker Compose foundation
- Part 2 database schema for products, cart items, orders, order items, payments, payment logs, and webhook events
- Part 5 Razorpay Test Mode payment initialization, Checkout.js flow, backend signature verification, webhook processing, idempotency, and payment logs
- Part 6 Docker hardening, Compose deployment foundation, CI, security scans, backups, rollback, and operations documentation

Excluded until later parts:

- Live Mode payments, refunds, settlements, payouts, subscriptions, and real cloud deployment credentials

## Part 6 DevOps Foundation

Use Node.js `22.x` for Docker and CI. The version is pinned in `.nvmrc`, `.node-version`, and package `engines`.

Local Docker:

```cmd
copy .env.example .env
docker compose config
docker compose build
docker compose up -d
docker compose ps
docker compose exec backend npm run db:migrate
docker compose exec backend npm run db:seed
```

Stop containers:

```cmd
docker compose down
```

`docker compose down -v` deletes the local PostgreSQL volume and should be treated as destructive.

Production foundation:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d postgres
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend npm run db:migrate
docker compose -f docker-compose.prod.yml --env-file .env.production up -d backend frontend reverse-proxy
```

Only the reverse proxy exposes public ports in the production foundation. PostgreSQL is internal.

Operational documentation:

- `docs/deployment.md`
- `docs/operations-runbook.md`
- `docs/backup-and-restore.md`
- `docs/security-and-secrets.md`

## Database Tables

Part 2 uses these tables:

- `roles`
- `users`
- `products`
- `cart_items`
- `orders`
- `order_items`
- `payments`
- `payment_logs`
- `webhook_events`

Audit columns use `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `deleted_at`, and `deleted_by`. Soft delete is explicit through `is_deleted`; default model scopes exclude soft-deleted rows.

## Prerequisites

- Node.js LTS
- npm
- PostgreSQL
- Docker Desktop, optional
- Razorpay Test Mode credentials, optional for Part 1 startup until payment work begins

## Environment

```cmd
copy .env.example .env
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env.local
```

Never place `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` in frontend environment files.

Backend Razorpay Test Mode variables:

```env
RAZORPAY_KEY_ID=rzp_test_replace_me
RAZORPAY_KEY_SECRET=replace_with_test_secret
RAZORPAY_WEBHOOK_SECRET=replace_with_webhook_secret
RAZORPAY_CURRENCY=INR
RAZORPAY_COMPANY_NAME=Payment Gateway
RAZORPAY_CHECKOUT_DESCRIPTION=Test payment
```

Frontend exposes only:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_replace_me
```

## Backend

```cmd
cd backend
npm install
npm run db:migrate
npm run db:migrate:status
npm run db:seed
npm run dev
```

Swagger: `http://localhost:5000/api-docs`

Health: `http://localhost:5000/api/v1/health`

Local demo admin:

- Email: `admin@example.com`
- Password: `Admin@12345`

## Frontend

```cmd
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Part 5 Manual Razorpay Test Mode Flow

1. Log in as a Customer.
2. Add a product to cart.
3. Open `/checkout`.
4. Click Pay with Razorpay.
5. Complete Razorpay Test Checkout.
6. Confirm the frontend redirects to `/payment-success` only after `/payments/verify` succeeds.
7. Open `/payments` and `/orders` to confirm local status updates.
8. In the Razorpay Dashboard, configure a Test Mode webhook for `http://localhost:5000/api/v1/webhooks/razorpay` and subscribe to `payment.authorized`, `payment.captured`, `payment.failed`, and `order.paid`.

Use a tunnel such as ngrok for dashboard webhooks during local testing. Do not commit webhook secrets.

## Docker

```cmd
docker compose config
docker compose up --build
```

## Verification

```cmd
cd backend
npm run lint
npm test
npm run db:migrate
npm run db:migrate:status
npm run db:seed

cd ..\frontend
npm run lint
npm run build
```

Useful PostgreSQL checks:

```cmd
psql -U gopal -h localhost -p 5432 -d payment_gateway_demo
```

```sql
\dt
SELECT * FROM "SequelizeMeta" ORDER BY name;
SELECT id, name FROM roles ORDER BY id;
SELECT id, name, sku, price, currency, is_active FROM products ORDER BY id;
```

## Next Phase

Part 6 can add broader testing, CI/CD, deployment, monitoring, and hardening.
