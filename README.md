# Payment Gateway

Payment Gateway is a full-stack payment platform with customer and administrative modules. It provides product browsing, cart-based checkout, Razorpay Test Mode payments, order tracking, payment history, administrative product and order management, and operational tooling for containerized deployment.

The application is built with a Next.js frontend, Express.js REST APIs, Sequelize ORM, PostgreSQL, Docker, and GitHub Actions.

## Features

### Authentication

- User registration
- Login
- JWT authentication
- Role-based authorization
- Password hashing

### Customer Features

- Browse products
- View product details
- Manage shopping cart
- Checkout
- Razorpay Test Mode payment
- Order history
- Payment history
- User profile
- Dashboard

### Admin Features

- Dashboard
- Product management
- Order management
- Payment management
- Payment logs
- User management foundation through role-based access

## Architecture

```text
Customer Browser
  |
  v
Next.js Frontend
  |
  v
REST APIs
  |
  v
Express.js
  |
  v
Sequelize ORM
  |
  v
PostgreSQL
```

The backend owns authentication, authorization, payment amount calculation, Razorpay order creation, payment signature verification, webhook validation, logging, and audit metadata. The frontend consumes the REST APIs and exposes separate customer and admin interfaces.

Docker and Docker Compose provide containerized local and deployment-ready runtime foundations. GitHub Actions support CI, Docker image builds, dependency checks, and security scanning.

## Technology Stack

| Area | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Frontend | Next.js 15, React, Tailwind CSS, Axios |
| Database | PostgreSQL 16 |
| Authentication | JWT, bcrypt |
| Payment Gateway | Razorpay Test Mode |
| ORM | Sequelize |
| Logging | Winston, request IDs |
| Documentation | Swagger/OpenAPI |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Security | CodeQL, Trivy, Gitleaks, npm audit, Dependabot |

## Prerequisites

- Node.js 22.x
- npm 10+
- PostgreSQL 16+
- Docker Desktop or Docker Engine
- Git
- Razorpay Test Account

Node.js 22 is the supported runtime for this project.

## Clone the Repository

```bash
git clone <repository-url>
cd Payment-Gateway
```

## PostgreSQL Setup

The application can use either a local PostgreSQL instance or the PostgreSQL service provided by Docker Compose.

### Option A: Local PostgreSQL

Create a PostgreSQL user and database:

```sql
CREATE USER payment_user WITH PASSWORD 'replace_with_secure_password';

CREATE DATABASE payment_gateway
OWNER payment_user;

GRANT ALL PRIVILEGES
ON DATABASE payment_gateway
TO payment_user;
```

Developers may use their own PostgreSQL username, password, and database name. The backend environment variables must match the database credentials that were created.

Use `DB_HOST=localhost` when the backend runs directly on the host machine.

### Option B: Docker PostgreSQL

Docker Compose can start PostgreSQL automatically:

```bash
docker compose up -d postgres
```

Use `DB_HOST=postgres` when the backend runs through Docker Compose because containers communicate through Docker service names.

Do not delete Docker volumes unless troubleshooting disposable data.

## Backend Environment Setup

Create the backend environment file:

```bash
cd backend
cp .env.example .env
```

Windows:

```cmd
copy .env.example .env
```

Example backend configuration:

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=payment_gateway
DB_USER=payment_user
DB_PASSWORD=replace_with_secure_password

JWT_SECRET=replace_with_long_random_secret
JWT_EXPIRES_IN=1d

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=replace_with_test_key_secret
RAZORPAY_WEBHOOK_SECRET=replace_with_webhook_secret

CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
LOG_TO_FILES=true
```

Use Razorpay Test Mode credentials only. Do not commit `.env`.

## Frontend Environment Setup

Create the frontend environment file:

```bash
cd frontend
cp .env.example .env.local
```

Windows:

```cmd
copy .env.example .env.local
```

Example frontend configuration:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
```

Never add `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` to frontend environment files.

## Razorpay Test Mode Setup

1. Create or sign in to a Razorpay account.
2. Switch the dashboard to Test Mode.
3. Open Account & Settings or API Keys.
4. Generate Test API Keys.
5. Copy the Key ID and Key Secret.
6. Add the Key ID and Key Secret to `backend/.env`.
7. Add only the Key ID to `frontend/.env.local`.
8. Create a webhook secret in the Razorpay dashboard.
9. Add that secret to `RAZORPAY_WEBHOOK_SECRET`.

The Key ID is public and may be used by the frontend. The Key Secret and Webhook Secret must remain backend-only.

## Razorpay Webhook Setup

Razorpay cannot send webhooks directly to `localhost`. For local testing, use a secure tunnel such as ngrok:

```bash
ngrok http 5000
```

Webhook URL format:

```text
https://your-public-url/api/v1/webhooks/razorpay
```

Subscribe to:

```text
payment.authorized
payment.captured
payment.failed
order.paid
```

The webhook secret configured in Razorpay must match `RAZORPAY_WEBHOOK_SECRET` in `backend/.env`.

## Backend Installation and Database Initialization

```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

`db:migrate` creates or updates the database schema. `db:seed` adds development roles, an Admin account, and sample products. Seeders should be used only in development unless explicitly reviewed.

Development Admin account:

```text
Email: admin@example.com
Password: Admin@12345
```

Development credentials must be changed or removed before production deployment.

## Frontend Installation and Start

```bash
cd frontend
npm install
npm run dev
```

Local development URLs:

```text
Frontend: http://localhost:3000
Backend: http://localhost:5000
Swagger: http://localhost:5000/api-docs/
Health API: http://localhost:5000/api/v1/health
```

## Running Frontend and Backend Together

Run the backend and frontend in separate terminals. PostgreSQL must already be running.

Startup order:

```text
PostgreSQL
  |
  v
Backend
  |
  v
Frontend
```

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

## Docker Setup

Start all services:

```bash
docker compose up -d --build
docker compose ps
```

Expected services:

```text
postgres
backend
frontend
```

Stop services:

```bash
docker compose down
```

Do not run `docker compose down -v` unless the Docker database data can be deleted.

Docker Compose uses container service names internally, so the backend connects to PostgreSQL with `DB_HOST=postgres` in the Compose network.

## Application Flow

Customer flow:

```text
Register/Login
  |
  v
Browse Products
  |
  v
Add to Cart
  |
  v
Checkout
  |
  v
Create Order
  |
  v
Razorpay Test Payment
  |
  v
Payment Verification
  |
  v
Orders and Payments
```

Admin flow:

```text
Admin Login
  |
  v
Dashboard
  |
  v
Product Management
  |
  v
Order Management
  |
  v
Payments
  |
  v
Payment Logs
```

## Validation and Health Checks

Check backend health:

```bash
curl http://localhost:5000/api/v1/health
```

Expected health status:

```text
Application status healthy
Database connected
```

Swagger documentation is available at:

```text
http://localhost:5000/api-docs/
```

## API Documentation

The backend exposes Swagger/OpenAPI documentation at:

```text
/api-docs
```

The API documentation includes authentication, product, cart, order, payment, webhook, dashboard, and payment-log endpoints.

## Database

The application uses PostgreSQL with Sequelize models and migrations. Database support includes:

- Versioned migrations
- Seeders for local bootstrap data
- Audit fields
- Soft delete support
- Relational constraints for users, products, carts, orders, payments, logs, and webhook events

## Payment Flow

```text
Customer
  |
  v
Cart
  |
  v
Order
  |
  v
Backend Order Creation
  |
  v
Razorpay Checkout
  |
  v
Payment Verification
  |
  v
Webhook Verification
  |
  v
Payment Logs
  |
  v
Order Completion
```

Payment amounts are calculated by the backend. Browser-side payment callbacks are not trusted until the backend verifies the Razorpay signature. Webhooks are verified using the raw request body and processed idempotently.

## Security

- JWT authentication
- bcrypt password hashing
- Role-based authorization
- Backend-owned payment amount calculation
- Razorpay payment signature verification
- Razorpay webhook signature validation
- Request validation
- Centralized error handling
- Winston logging
- Request IDs
- Backend-only secrets

## DevOps

- Dockerized backend and frontend
- Docker Compose orchestration
- Production-oriented Compose foundation
- GitHub Actions workflows
- CodeQL scanning
- Trivy scanning
- Gitleaks secret scanning
- Dependabot updates
- Backup and restore scripts
- Operational documentation

## Environment Variables

### Backend

```text
NODE_ENV
PORT

DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD

JWT_SECRET
JWT_EXPIRES_IN

RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
RAZORPAY_CURRENCY
RAZORPAY_COMPANY_NAME
RAZORPAY_CHECKOUT_DESCRIPTION

CORS_ORIGIN
LOG_LEVEL
LOG_TO_FILES
TRUST_PROXY
```

### Frontend

```text
NEXT_PUBLIC_API_BASE_URL
NEXT_PUBLIC_RAZORPAY_KEY_ID
NEXT_PUBLIC_APP_NAME
NEXT_PUBLIC_APP_ENV
NEXT_PUBLIC_APP_VERSION
```

Do not expose backend secrets, Razorpay key secrets, webhook secrets, database credentials, or JWT secrets in frontend environment variables.

## Testing

Backend:

```bash
cd backend
npm run lint
npm test
```

Frontend:

```bash
cd frontend
npm run lint
npm test
npm run build
```

Docker validation:

```bash
docker compose config
```

The project includes unit tests, integration tests, API tests, Docker validation, linting, and security scanning.

## Troubleshooting

### PostgreSQL authentication failed

Check:

```text
DB_USER
DB_PASSWORD
DB_NAME
DB_HOST
DB_PORT
```

### Backend cannot reach PostgreSQL in Docker

Use:

```text
DB_HOST=postgres
```

### Razorpay Checkout does not open

Check:

```text
NEXT_PUBLIC_RAZORPAY_KEY_ID
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

Restart backend and frontend after changing environment variables.

### Webhook verification failed

Check:

```text
RAZORPAY_WEBHOOK_SECRET
Webhook URL
x-razorpay-signature
Raw request body handling
```

### Frontend cannot call backend

Check:

```text
NEXT_PUBLIC_API_BASE_URL
CORS_ORIGIN
Backend health endpoint
```

### Docker database role mismatch

Refer to:

```text
docs/docker-compose-startup-recovery.md
```

## Security Notes

- Never commit `.env` or `.env.local`.
- Never expose Razorpay Key Secret.
- Never expose Webhook Secret.
- Never store card numbers, CVV, or OTP.
- Payment amount is calculated on the backend.
- Payment success requires backend signature verification.
- Webhooks require raw-body signature verification.
- Change development credentials before deployment.

## Folder Structure

```text
backend/
frontend/
docs/
postman/
scripts/
ops/
.github/
README.md
```

## Future Enhancements

- Refund management
- Subscription payments
- Settlement reports
- Multi-currency support
- Notification services
- Analytics dashboard
- Expanded user administration
- Production observability integrations

## License

MIT License
