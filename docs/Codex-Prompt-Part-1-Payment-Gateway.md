# Codex Prompt – Part 1

# Payment Gateway Demo using Razorpay Test Mode

## Objective

You are a Senior Full Stack Developer.

Build ONLY Part 1 of the Payment Gateway Demo application.

Read the project documentation completely before making any changes.

Use this file as the main specification:

```text
docs/Part-1-Project-Setup-Payment-Gateway.md
```

Do not implement Products, Cart, Orders, Razorpay Checkout, Payment Verification, Payment History, Refunds, or full Webhook processing in this phase.

Part 1 must contain only:

- Project setup
- Backend foundation
- Frontend foundation
- PostgreSQL configuration
- Sequelize configuration
- Authentication foundation
- Razorpay SDK configuration foundation
- Webhook raw-body foundation
- Swagger
- Logging
- Docker foundation
- Health endpoint
- Verification

---

# Important Safety Requirements

- First inspect the current repository.
- Do not overwrite correct existing files.
- Do not remove existing documentation.
- Do not create payment business logic prematurely.
- Do not expose Razorpay secrets.
- Do not hardcode credentials.
- Do not commit real `.env` files.
- Do not log passwords, JWT tokens, Razorpay Key Secret, or Webhook Secret.
- Use Razorpay Test Mode only.
- Keep the application small and interview-friendly.
- Avoid unnecessary enterprise complexity.
- Follow the documented architecture.
- Make the project runnable after environment setup.

---

# Technology Stack

## Backend

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT
- bcryptjs
- express-validator
- Winston
- Swagger
- Razorpay Node SDK

## Frontend

- Next.js
- React
- Tailwind CSS
- Axios
- React Hook Form
- React Hot Toast

## DevOps Foundation

- Docker
- Docker Compose
- Git
- GitHub

---

# Project Structure

Create or preserve this structure:

```text
payment_gateway_demo/
|
├── backend/
├── frontend/
├── docs/
├── postman/
├── scripts/
├── .github/
├── docker-compose.yml
├── .gitignore
├── .env.example
└── README.md
```

---

# Backend Architecture

Use:

```text
Route
  |
Middleware
  |
Controller
  |
Service
  |
Sequelize Model
  |
PostgreSQL
```

Do not use a Repository layer.

Controllers must:

- Use `async/await`.
- Accept `req`, `res`, and `next`.
- Call service methods.
- Return standard responses.
- Pass errors using `next(error)`.
- Avoid business logic.
- Avoid direct Sequelize queries.

Services must:

- Contain business logic.
- Use Sequelize models.
- Handle transactions where required.
- Return plain data.
- Avoid HTTP response handling.

---

# Backend Folder Structure

Create:

```text
backend/
|
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── env.js
│   │   ├── logger.js
│   │   ├── razorpay.js
│   │   └── swagger.js
│   |
│   ├── controllers/
│   │   └── authController.js
│   |
│   ├── services/
│   │   └── authService.js
│   |
│   ├── models/
│   │   ├── index.js
│   │   ├── Role.js
│   │   └── User.js
│   |
│   ├── routes/
│   │   ├── index.js
│   │   ├── authRoutes.js
│   │   ├── healthRoutes.js
│   │   └── webhookRoutes.js
│   |
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── validationMiddleware.js
│   │   ├── requestLoggerMiddleware.js
│   │   ├── rawBodyMiddleware.js
│   │   └── errorMiddleware.js
│   |
│   ├── validations/
│   │   └── authValidation.js
│   |
│   ├── utils/
│   │   ├── responseHandler.js
│   │   ├── jwt.js
│   │   ├── password.js
│   │   ├── requestId.js
│   │   └── constants.js
│   |
│   ├── migrations/
│   ├── seeders/
│   ├── logs/
│   ├── swagger/
│   ├── app.js
│   └── server.js
│
├── tests/
├── .env.example
├── .sequelizerc
├── package.json
├── Dockerfile
└── README.md
```

Do not create Product, Cart, Order, Payment, PaymentLog, or WebhookEvent models yet.

---

# Frontend Folder Structure

Create:

```text
frontend/
|
├── public/
├── src/
│   ├── app/
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── layout.js
│   │   └── page.js
│   |
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   |
│   ├── contexts/
│   │   └── AuthContext.js
│   |
│   ├── services/
│   │   ├── apiClient.js
│   │   └── authService.js
│   |
│   ├── hooks/
│   ├── utils/
│   ├── config/
│   └── styles/
│
├── .env.example
├── package.json
├── next.config.mjs
├── Dockerfile
└── README.md
```

Do not create Products, Cart, Checkout, Orders, or Payments pages yet.

---

# Backend Initialization

Initialize the backend.

Install runtime dependencies:

```bash
npm install express sequelize pg pg-hstore dotenv cors helmet jsonwebtoken bcryptjs express-validator winston morgan swagger-jsdoc swagger-ui-express razorpay
```

Install development dependencies:

```bash
npm install --save-dev nodemon eslint prettier sequelize-cli supertest
```

Add useful package scripts:

```json
{
  "dev": "nodemon src/server.js",
  "start": "node src/server.js",
  "lint": "eslint src",
  "test": "node --test",
  "db:migrate": "sequelize-cli db:migrate",
  "db:seed": "sequelize-cli db:seed:all",
  "db:migrate:undo": "sequelize-cli db:migrate:undo"
}
```

Use the project-compatible Node.js version.

---

# Frontend Initialization

Create the frontend using Next.js App Router.

Install:

```bash
npm install axios react-hook-form react-hot-toast react-icons jwt-decode
```

Use:

- JavaScript
- Tailwind CSS
- ESLint
- `src/` directory
- App Router

Create only:

- Register page
- Login page
- Basic protected dashboard placeholder
- Auth context
- Axios client
- Logout support

Do not implement payment screens.

---

# PostgreSQL Configuration

Database name:

```text
payment_gateway_demo
```

Configure Sequelize using environment variables.

Create only these tables in Part 1:

```text
roles
users
```

Use migrations and seeders.

Seed roles:

```text
Admin
Customer
```

Seed one local development Admin user.

Use clearly documented local demo credentials.

Do not use real production credentials.

---

# Role Model

Recommended fields:

```text
id
name
description
is_active
created_at
updated_at
deleted_at
```

Requirements:

- Role name unique.
- Use soft delete if consistent with the project.
- Seed Admin and Customer.

---

# User Model

Recommended fields:

```text
id
name
email
password
role_id
is_active
created_at
updated_at
deleted_at
```

Requirements:

- Email unique.
- Password hashed.
- Password excluded from normal queries.
- Role relationship configured.
- Active users only can log in.
- Soft delete if consistent with the project.

---

# Authentication APIs

Implement:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/profile
```

## Register

Requirements:

- Validate name.
- Validate email.
- Validate password minimum length.
- Prevent duplicate email.
- Assign Customer role by default.
- Hash password.
- Return safe user details.
- Do not return password.

## Login

Requirements:

- Validate email and password.
- Reject inactive users.
- Compare hashed password.
- Generate JWT.
- Return token and safe user details.
- Do not log password.

## Profile

Requirements:

- Protected route.
- Return current authenticated user.
- Include role.
- Do not return password.

## Logout

JWT is stateless.

Implement frontend token removal and a backend success response.

Do not add token blacklisting in Part 1.

---

# JWT Requirements

Use environment variables:

```text
JWT_SECRET
JWT_EXPIRES_IN
```

Recommended payload:

```json
{
  "userId": 1,
  "email": "admin@example.com",
  "role": "Admin"
}
```

Do not store:

- Password
- Razorpay secrets
- Payment data
- Sensitive personal data

inside JWT.

---

# Role Authorization Foundation

Create reusable role middleware.

Roles:

```text
Admin
Customer
```

Part 1 verification:

- Admin-only sample protection may be added.
- Customer authentication must work.
- Do not build product management APIs yet.

---

# Razorpay Configuration Foundation

Install and configure the Razorpay Node SDK.

Create:

```text
backend/src/config/razorpay.js
```

Use:

```text
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

Requirements:

- Load credentials from environment variables.
- Initialize one reusable Razorpay client.
- Validate missing configuration clearly.
- Never log the Key Secret.
- Never expose the Key Secret to the frontend.
- Do not create Razorpay orders in Part 1.
- Do not implement checkout in Part 1.
- Do not call live Razorpay APIs unless configuration is explicitly available.
- The application should still provide a clear startup/configuration error when required values are missing.

Use Test Mode only.

---

# Webhook Foundation

Create a webhook route foundation:

```text
POST /api/v1/webhooks/razorpay
```

Requirements:

- Prepare raw-body handling.
- Keep webhook processing separate from normal JSON body parsing when required.
- Do not fully process events yet.
- Return a safe placeholder response indicating that webhook processing belongs to the payment phase.
- Do not mark payments successful.
- Do not create payment tables in Part 1.
- Do not verify fake payloads.

The route foundation must not break normal JSON APIs.

---

# Environment Variables

Create safe example files.

## backend/.env.example

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=payment_gateway_demo
DB_USER=postgres
DB_PASSWORD=replace_with_database_password

JWT_SECRET=replace_with_long_random_secret
JWT_EXPIRES_IN=1d

RAZORPAY_KEY_ID=replace_with_test_key_id
RAZORPAY_KEY_SECRET=replace_with_test_key_secret
RAZORPAY_WEBHOOK_SECRET=replace_with_webhook_secret

CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

## frontend/.env.example

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=replace_with_test_key_id
```

## Root .env.example

```env
POSTGRES_DB=payment_gateway_demo
POSTGRES_USER=postgres
POSTGRES_PASSWORD=replace_with_database_password

BACKEND_PORT=5000
FRONTEND_PORT=3000
```

Do not place `RAZORPAY_KEY_SECRET` in the frontend.

---

# Common API Prefix

Use:

```text
/api/v1
```

Register:

```javascript
app.use("/api/v1", apiRoutes);
```

Part 1 routes:

```text
/api/v1/auth
/api/v1/health
/api/v1/webhooks
```

Do not register incomplete product or payment routes.

---

# Health Endpoint

Implement:

```text
GET /api/v1/health
```

Return:

- Application status
- Timestamp
- Environment
- Database connectivity where practical

Do not expose secrets.

---

# Standard Responses

Success:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "statusCode": 200
}
```

Error:

```json
{
  "success": false,
  "message": "Operation failed",
  "errors": [],
  "statusCode": 400,
  "requestId": "REQ-000001"
}
```

---

# Error Handling

Create:

- Custom application error
- Validation error handling
- Authentication error handling
- Authorization error handling
- Not found handling
- Conflict handling
- Sequelize error handling
- Razorpay configuration error handling
- Global error middleware

Do not expose stack traces in production.

---

# Validation

Use `express-validator`.

Validate:

## Register

- Name required
- Valid email
- Password minimum 8 characters

## Login

- Valid email
- Password required

Return field-level errors.

---

# Logging

Use Winston.

Log:

- User registration
- User login
- Authentication failure
- Health checks where useful
- API errors
- Database connection status

Do not log:

- Passwords
- JWT tokens
- Razorpay secrets
- Complete request bodies containing sensitive values

Add request IDs.

---

# Swagger

Configure Swagger at:

```text
http://localhost:5000/api-docs
```

Use OpenAPI server:

```text
http://localhost:5000/api/v1
```

Document:

```text
POST /auth/register
POST /auth/login
POST /auth/logout
GET  /auth/profile
GET  /health
POST /webhooks/razorpay
```

Swagger requirements:

- Path parameters where applicable
- Request bodies
- Validation schemas
- JWT bearer authentication
- Success responses
- Error responses
- Example payloads

Clearly mark the Razorpay webhook endpoint as a Part 1 foundation only.

---

# Docker Foundation

Create:

```text
backend/Dockerfile
frontend/Dockerfile
docker-compose.yml
```

Services:

```text
postgres
backend
frontend
```

Requirements:

- PostgreSQL named volume
- Health checks
- Shared network
- Environment variables
- Correct service hostnames
- Backend waits or retries for PostgreSQL
- Frontend points to backend correctly
- No real secrets
- Preserve local non-Docker execution

Do not over-optimize Docker in Part 1.

---

# Security Requirements

- Razorpay Test Mode only.
- Never expose Razorpay Key Secret.
- Never trust amounts from the frontend.
- Do not implement payment amount calculation yet.
- Hash passwords.
- Use JWT expiration.
- Enable Helmet.
- Configure CORS.
- Validate all inputs.
- Use rate limiting only if it can be added safely without unnecessary complexity.
- Keep real `.env` files ignored.
- Do not commit secrets.
- Do not log sensitive values.

---

# README

Create or update the root README.

Include:

- Project overview
- Part 1 scope
- Technology stack
- Folder structure
- Prerequisites
- PostgreSQL setup
- Razorpay Test Mode setup
- Environment setup
- Backend installation
- Frontend installation
- Migration commands
- Seeder commands
- Backend run command
- Frontend run command
- Docker commands
- Default local Admin login
- Swagger URL
- Health URL
- Known limitations
- Next phase

Clearly state that actual payment processing is not implemented in Part 1.

---

# Tests

Add meaningful Part 1 backend tests:

- Successful registration
- Duplicate registration rejected
- Successful login
- Invalid login rejected
- Protected profile rejects missing token
- Protected profile works with token
- Health endpoint returns 200

Do not add payment tests yet.

Use the existing Node test setup or Supertest.

Clean up test-created data safely.

---

# Before Making Changes

1. Inspect the current repository.
2. Run `git status`.
3. Read `docs/Part-1-Project-Setup-Payment-Gateway.md` completely.
4. Inspect existing files.
5. Summarize the implementation plan.
6. List all files expected to be created or modified.
7. Identify any conflicts before changing files.

---

# After Implementation

1. List all created files.
2. List all modified files.
3. Run backend lint.
4. Run backend tests.
5. Run frontend lint.
6. Run frontend production build.
7. Validate Docker Compose.
8. Run migrations.
9. Run seeders.
10. Start backend.
11. Verify health endpoint.
12. Verify Swagger.
13. Verify register.
14. Verify login.
15. Verify protected profile.
16. Confirm Razorpay configuration foundation exists.
17. Confirm Razorpay Key Secret is not exposed.
18. Confirm webhook raw-body foundation exists.
19. Confirm no Product, Cart, Order, or Payment business modules were implemented.
20. Provide exact Windows CMD commands.
21. List remaining manual steps.
22. Do not start Part 2.

---

# Acceptance Criteria

Part 1 is complete only when:

- Backend starts successfully.
- Frontend starts successfully.
- PostgreSQL connects.
- Roles and Users migrations run.
- Seeders run.
- Register works.
- Login works.
- JWT is returned.
- Profile route works.
- Role middleware exists.
- Swagger works.
- Health endpoint returns 200.
- Razorpay client configuration exists.
- Secrets remain backend-only.
- Webhook raw-body foundation exists.
- Backend lint passes.
- Backend tests pass.
- Frontend lint passes.
- Frontend build passes.
- Docker Compose config is valid.
- Payment business modules are not implemented.

---

# Final Output Format

Provide:

## Summary

## Files Created

## Files Modified

## Backend Setup

## Frontend Setup

## Database Setup

## Authentication

## Razorpay Configuration Foundation

## Webhook Foundation

## Swagger

## Docker

## Tests

## Verification Results

## Windows CMD Commands

## Remaining Manual Steps

## Part 2 Readiness
