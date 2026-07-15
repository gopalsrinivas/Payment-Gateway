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

Excluded until later parts:

- Products, cart, orders, payments, refunds, payment history, dashboard reports, Razorpay checkout, payment verification, and real webhook event processing

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

cd ..\frontend
npm run lint
npm run build
```

## Next Phase

Part 2 will add the complete database design for products, carts, orders, payments, payment logs, and webhook events. Do not start Part 2 until Part 1 is verified.

