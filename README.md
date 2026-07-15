# Payment Gateway Demo

Part 1 foundation for a Razorpay Test Mode payment gateway demo.

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

Excluded until later parts:

- Products, cart, orders, payments, refunds, payment history, dashboard reports, Razorpay checkout, payment verification, and real webhook event processing
- Product/cart/order/payment business APIs and frontend business screens

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

Part 3 can add Product and Cart APIs on top of this database foundation. Payment processing is still intentionally not implemented.
