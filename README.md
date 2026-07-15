# Payment Gateway

Full-stack payment gateway application with a Next.js customer/admin frontend, Express REST APIs, PostgreSQL, and Razorpay Test Mode integration.

## Project Status

✅ Part 1 — Project Setup
✅ Part 2 — Database Design
✅ Part 3 — Backend APIs
✅ Part 4 — Frontend
✅ Part 5 — Razorpay Test Mode Integration
✅ Part 6 — DevOps Foundation

Current status: Interview-ready and local demo-ready.

Razorpay integration uses Test Mode only. No real money is charged.

## Final Verification Status

| Verification | Status |
|---|---|
| Backend lint | Passed |
| Backend tests | 29 passed |
| Frontend lint | Passed |
| Frontend tests | 15 passed |
| Frontend production build | Passed in Docker image build; local Node 22 verification recommended |
| Backend Docker image build | Passed |
| Frontend Docker image build | Passed |
| Docker Compose | PostgreSQL, Backend, Frontend healthy |
| Backend health API | HTTP 200 |
| Swagger | HTTP 200 |
| Frontend | HTTP 200 |
| PostgreSQL migrations | All up |
| Docker containers | Non-root |
| Security workflows | Configured |
| GitHub Actions | Pending remote rerun |
| Razorpay Test Mode checkout | Requires user Test credentials |

## Architecture

```text
Customer Browser
-> Next.js Frontend
-> Express REST APIs
-> Sequelize ORM
-> PostgreSQL

Checkout
-> Backend Razorpay Order creation
-> Razorpay Checkout
-> Backend signature verification
-> Payment and Order status update

Webhook
-> Raw request body
-> Signature verification
-> Idempotent event processing
-> Payment logs
```

The system includes a Customer Panel, Admin Panel, role-based authorization, audit fields, soft delete, Docker support, and CI/CD workflows.

## Features

### Customer Features

- Register and login
- Browse products
- Product details
- Add to cart
- Buy Now
- Checkout
- Razorpay Test Mode payment
- Orders
- Payments
- Profile
- Customer dashboard

### Admin Features

- Admin dashboard
- Product CRUD
- Product status and soft delete
- All orders
- Order status updates
- Payments
- Payment logs
- Admin profile

### Technical Features

- JWT authentication
- Role authorization
- PostgreSQL
- Sequelize migrations
- Audit fields
- Soft delete
- Centralized error handling
- Winston logging
- Request ID
- Swagger
- Razorpay signature verification
- Webhook verification
- Idempotency
- Docker Compose
- GitHub Actions
- CodeQL
- Trivy
- Gitleaks
- Dependabot
- Backup/restore scripts
- Graceful shutdown

## Technology Stack

| Area | Technology |
|---|---|
| Backend | Node.js, Express.js, Sequelize |
| Frontend | Next.js 15, React, Tailwind CSS, Axios |
| Database | PostgreSQL 16 |
| Authentication | JWT, bcrypt |
| Payments | Razorpay Test Mode |
| API Docs | Swagger/OpenAPI |
| Logging | Winston |
| Containers | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Security | CodeQL, Trivy, Gitleaks, npm audit, Dependabot |
| Runtime | Node.js 22 for CI and Docker |

Node.js 22 is the supported project runtime. Local Node 26 may show engine warnings or different tool behavior.

## Local Setup

### Prerequisites

- Node.js 22
- npm 10+
- PostgreSQL 16
- Docker Desktop
- Git

### Backend

```cmd
cd /d D:\Workspace\professional\Interview_Tasks\Orfus\Payment-Gateway\backend
copy .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

### Frontend

```cmd
cd /d D:\Workspace\professional\Interview_Tasks\Orfus\Payment-Gateway\frontend
copy .env.example .env.local
npm install
npm run dev
```

### URLs

```text
Frontend: http://localhost:3000
Backend: http://localhost:5000
Swagger: http://localhost:5000/api-docs/
Health: http://localhost:5000/api/v1/health
```

## Docker Setup

```cmd
cd /d D:\Workspace\professional\Interview_Tasks\Orfus\Payment-Gateway

docker compose up -d
docker compose ps
```

Expected:

```text
postgres healthy
backend healthy
frontend healthy
```

Stop:

```cmd
docker compose down
```

Do not run `docker compose down -v` unless Docker database data can be deleted.

## Verification Commands

Backend:

```cmd
cd backend
npm run lint
npm test
npm run db:migrate:status
```

Frontend:

```cmd
cd frontend
npm run lint
npm test
npm run build
```

Docker:

```cmd
docker compose config
docker build -t payment-gateway-backend:local ./backend
docker build -t payment-gateway-frontend:local ./frontend
```

## Demo Credentials

Admin:

```text
Email: admin@example.com
Password: Admin@12345
```

Customer:

```text
Register a new Customer account from /register.
```

Demo credentials are for local development only and must not be used in production.

## Razorpay Test Mode Setup

Backend `.env`:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxx
```

Frontend `.env.local`:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
```

Webhook URL:

```text
https://your-public-domain/api/v1/webhooks/razorpay
```

Events:

```text
payment.authorized
payment.captured
payment.failed
order.paid
```

Use Razorpay Test Mode only. Never expose `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` in frontend code or browser environment variables. Local webhook testing requires a tunnel such as ngrok.

## Interview Demo Flow

1. Open Home page
2. Register/Login as Customer
3. Browse Products
4. Add Product to Cart
5. Create Order
6. Open Razorpay Test Checkout
7. Verify Payment
8. Show Customer Orders and Payments
9. Login as Admin
10. Show Admin Dashboard
11. Show Product Management
12. Show Orders
13. Show Payments and Payment Logs
14. Show Swagger
15. Show Docker containers
16. Explain CI/CD and security workflows

## Project Folder Structure

```text
Payment-Gateway/
├── backend/
├── frontend/
├── docs/
├── postman/
├── scripts/
├── ops/
├── .github/
├── docker-compose.yml
├── docker-compose.prod.yml
└── README.md
```

## CI/CD Status

GitHub Actions workflows are configured for CI, Docker build, CodeQL, Trivy, Gitleaks, npm audit, and Dependabot.

Remote workflow verification is pending after the latest action-version updates.

## Known Limitations

- Razorpay Test Mode only
- No refunds
- No settlements
- No subscriptions
- No payouts
- No Live Mode
- Staging deployment target not configured
- GitHub Actions remote status must be verified
- Demo credentials are development-only

## Security Notes

- Real `.env` files are ignored
- Secrets remain backend-only
- Payment amount is calculated by backend
- Payment success requires backend signature verification
- Webhooks use raw-body signature verification
- Containers run as non-root
- PostgreSQL is not public in production Compose
- Production seeders are not automatic
- Do not commit logs or backups

## Operational Documentation

- `docs/deployment.md`
- `docs/operations-runbook.md`
- `docs/backup-and-restore.md`
- `docs/security-and-secrets.md`
