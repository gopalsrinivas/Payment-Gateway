# Payment Gateway Demo

# Part-1 – Project Setup

---

# 1. Project Overview

The Payment Gateway Demo is a small full-stack application created to learn and demonstrate Razorpay payment integration using Test Mode.

The application allows users to register, log in, view products, create orders, complete payments through Razorpay Checkout, verify payment signatures, and view payment history.

This project is intended for:

- Interview demonstrations
- Payment gateway learning
- Backend API practice
- Frontend integration practice
- Webhook implementation
- Payment security understanding
- Docker and CI/CD practice

The application should remain small, clear, and practical.

---

# 2. Main Objectives

- Build a basic payment-enabled web application.
- Understand Razorpay Test Mode.
- Create Razorpay Orders from the backend.
- Open Razorpay Checkout from the frontend.
- Verify payment signatures securely.
- Store order and payment information in PostgreSQL.
- Handle successful and failed payments.
- Process Razorpay webhooks.
- Maintain payment and API logs.
- Build an interview-ready project.

---

# 3. Project Scope

## Authentication

- User registration
- User login
- JWT authentication
- Logout
- Profile

## Product Management

- Create product
- Update product
- Delete product
- View product
- List products
- Search products

## Cart

- Add product to cart
- Update quantity
- Remove product
- View cart
- Calculate cart total

## Order Management

- Create application order
- Generate unique order number
- Store total amount
- Track order status
- View order history
- View order details

## Razorpay Payment

- Create Razorpay order
- Open Razorpay Checkout
- Complete payment
- Verify Razorpay signature
- Save payment details
- Handle payment success
- Handle payment failure
- Process Razorpay webhook
- Store payment status

## Payment History

- View successful payments
- View failed payments
- View pending payments
- Filter payments
- Search payments
- View payment details

## Dashboard

- Total products
- Total orders
- Successful payments
- Failed payments
- Pending payments
- Total collected amount

---

# 4. Out of Scope

- Real production payments
- Multi-vendor marketplace
- Subscription billing
- International payments
- Complex taxation
- Inventory management
- Advanced refunds
- Settlement reconciliation
- Accounting integration
- Multi-currency support
- Production bank payouts

---

# 5. Technology Stack

## Backend

- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL
- JWT
- bcrypt
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

## Payment Gateway

- Razorpay Test Mode
- Razorpay Orders API
- Razorpay Checkout
- Razorpay Signature Verification
- Razorpay Webhooks

## DevOps

- Git
- GitHub
- Docker
- Docker Compose
- GitHub Actions
- CodeQL
- Trivy

---

# 6. High-Level Architecture

```text
User Browser
     |
     v
Next.js Frontend
     |
     v
Express REST API
     |
     +----------------------+
     |                      |
     v                      v
PostgreSQL             Razorpay API
     |                      |
     +----------+-----------+
                |
                v
          Payment Status
```

---

# 7. Payment Flow

```text
User selects a product
        |
        v
Frontend sends checkout request
        |
        v
Backend creates application order
        |
        v
Backend creates Razorpay order
        |
        v
Frontend opens Razorpay Checkout
        |
        v
User completes payment
        |
        v
Razorpay returns payment details
        |
        v
Frontend sends payment details to backend
        |
        v
Backend verifies Razorpay signature
        |
        v
Backend updates payment and order status
        |
        v
Payment success page
```

Webhook flow:

```text
Razorpay
    |
    v
Webhook endpoint
    |
    v
Verify webhook signature
    |
    v
Store webhook event
    |
    v
Update payment/order status
```

---

# 8. Project Folder Structure

```text
payment_gateway_razorpay/
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

# 9. Backend Folder Structure

```text
backend/
|
├── src/
│   ├── config/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── validations/
│   ├── utils/
│   ├── migrations/
│   ├── seeders/
│   ├── logs/
│   ├── swagger/
│   ├── app.js
│   └── server.js
├── tests/
├── .env
├── .env.example
├── .sequelizerc
├── package.json
├── Dockerfile
└── README.md
```

Recommended backend files:

```text
config/razorpay.js
controllers/paymentController.js
controllers/webhookController.js
services/paymentService.js
services/webhookService.js
utils/paymentSignature.js
middlewares/rawBodyMiddleware.js
```

---

# 10. Frontend Folder Structure

```text
frontend/
|
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── contexts/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   ├── config/
│   └── styles/
├── .env.local
├── .env.example
├── package.json
├── next.config.mjs
├── Dockerfile
└── README.md
```

Recommended pages:

```text
/login
/register
/dashboard
/products
/cart
/checkout
/payment-success
/payment-failed
/orders
/payments
```

---

# 11. Software Prerequisites

| Software | Purpose |
|---|---|
| Node.js LTS | Backend and frontend runtime |
| npm | Package management |
| PostgreSQL | Database |
| Git | Source control |
| VS Code | Development |
| Postman | API testing |
| Docker Desktop | Containerization |
| Razorpay Test Account | Payment integration |

---

# 12. Razorpay Test Mode Setup

Use Razorpay Test Mode only.

Required credentials:

```text
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
```

Rules:

- Never expose `RAZORPAY_KEY_SECRET` in the frontend.
- Only `RAZORPAY_KEY_ID` may be sent to the frontend.
- Keep all secrets in environment variables.
- Do not commit test or production secrets.
- Verify payment signatures only in the backend.
- Verify webhook signatures using the raw request body.
- Store Razorpay IDs for audit and troubleshooting.

---

# 13. Backend Environment Variables

Create `backend/.env`:

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=payment_gateway_demo
DB_USER=gopal
DB_PASSWORD=gopal

JWT_SECRET=replace_with_long_random_secret
JWT_EXPIRES_IN=1d

RAZORPAY_KEY_ID=replace_with_test_key_id
RAZORPAY_KEY_SECRET=replace_with_test_key_secret
RAZORPAY_WEBHOOK_SECRET=replace_with_webhook_secret

CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

Create a safe `.env.example` using placeholders only.

---

# 14. Frontend Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=replace_with_test_key_id
```

Do not place the Razorpay Key Secret in frontend environment variables.

---

# 15. Backend Initialization

```cmd
mkdir backend
cd backend
npm init -y
```

Install runtime dependencies:

```cmd
npm install express sequelize pg pg-hstore dotenv cors helmet jsonwebtoken bcryptjs express-validator winston morgan swagger-jsdoc swagger-ui-express razorpay
```

Install development dependencies:

```cmd
npm install --save-dev nodemon eslint prettier sequelize-cli supertest
```

Initialize Sequelize:

```cmd
npx sequelize-cli init
```

---

# 16. Frontend Initialization

```cmd
npx create-next-app@latest frontend
```

Install frontend packages:

```cmd
cd frontend
npm install axios react-hook-form react-hot-toast react-icons jwt-decode
```

Use:

- Next.js App Router
- JavaScript
- Tailwind CSS
- ESLint
- `src/` directory

---

# 17. PostgreSQL Setup

Database name:

```text
payment_gateway_razorpay
```

Create database:

```sql
CREATE DATABASE payment_gateway_razorpay;
```

---

# 18. Common API Prefix

Use:

```text
/api/v1
```

Expected route groups:

```text
/api/v1/auth
/api/v1/products
/api/v1/cart
/api/v1/orders
/api/v1/payments
/api/v1/webhooks
/api/v1/dashboard
/api/v1/health
```

---

# 19. Authentication Foundation

Part 1 should include:

- Register
- Login
- JWT generation
- JWT verification middleware
- Password hashing
- Protected profile route
- Role authorization foundation

Roles:

```text
Admin
Customer
```

---

# 20. Razorpay Configuration Foundation

Create:

```text
backend/src/config/razorpay.js
```

Responsibilities:

- Load credentials from environment variables.
- Initialize Razorpay SDK.
- Validate required variables.
- Export a reusable Razorpay client.
- Never log the key secret.

Do not implement complete payment processing in Part 1.

---

# 21. Webhook Foundation

Create a webhook route foundation with raw-body handling.

Important:

- Signature verification requires the exact raw request body.
- Keep webhook handling separate from normal JSON parsing when required.
- Do not mark payments successful only because the frontend reports success.
- Backend signature verification and trusted webhook events determine final status.

---

# 22. Common Response Format

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

# 23. Error Handling

Implement centralized error handling for:

- Validation errors
- Authentication errors
- Authorization errors
- Not found errors
- Conflict errors
- Sequelize errors
- Razorpay API errors
- Signature verification errors
- Webhook verification errors
- Internal server errors

---

# 24. Logging

Use Winston.

Log:

- User registration
- User login
- Order creation
- Razorpay order creation
- Payment verification
- Payment failure
- Webhook received
- Webhook verification result
- API errors
- Database errors

Do not log:

- Passwords
- JWT tokens
- Razorpay Key Secret
- Webhook Secret
- Card information

---

# 25. Swagger

Swagger URL:

```text
http://localhost:5000/api-docs
```

Document:

- Register
- Login
- Profile
- Health
- JWT bearer authentication
- Request and response schemas
- Validation errors

Use OpenAPI server base URL:

```text
http://localhost:5000/api/v1
```

---

# 26. Docker Foundation

Create:

```text
backend/Dockerfile
frontend/Dockerfile
docker-compose.yml
```

Services:

- PostgreSQL
- Backend
- Frontend

Use:

- Health checks
- Named PostgreSQL volume
- Shared network
- Environment variables
- Multi-stage builds where useful

---

# 27. Security Rules

- Use Test Mode only.
- Never expose the key secret.
- Verify payment signatures in the backend.
- Verify webhook signatures.
- Validate all user input.
- Hash passwords.
- Use JWT expiration.
- Use Helmet and CORS.
- Add rate limiting later for login and payment creation.
- Prevent duplicate payment processing.
- Never trust the amount sent by the frontend.
- Calculate the final amount from trusted product/order data.
- Send amounts to Razorpay in the smallest currency unit.

For INR:

```text
₹500.00 = 50000 paise
```

---

# 28. Coding Standards

- Use async/await.
- Use Route → Middleware → Controller → Service → Model flow.
- Do not use a repository layer for this basic project.
- Keep controllers thin.
- Put business logic in services.
- Use transactions for order/payment updates.
- Use centralized error handling.
- Use reusable response helpers.
- Keep Razorpay integration in dedicated services.

---

# 29. Part-1 Deliverables

Part 1 should produce:

- Root project structure
- Backend project
- Frontend project
- PostgreSQL configuration
- Sequelize configuration
- Authentication foundation
- JWT middleware
- Role authorization foundation
- Razorpay SDK configuration
- Webhook raw-body foundation
- Swagger setup
- Winston logging
- Environment examples
- Docker foundation
- Health endpoint
- README setup instructions

Part 1 should not fully implement:

- Product CRUD
- Cart
- Orders
- Razorpay order creation
- Checkout
- Payment verification
- Webhook event processing
- Payment history
- Refunds

---

# 30. Part-1 Acceptance Criteria

Part 1 is complete when:

- Backend starts successfully.
- Frontend starts successfully.
- PostgreSQL connection works.
- Migrations execute successfully.
- Seeders execute successfully.
- Register API works.
- Login API works.
- JWT is returned.
- Protected profile API works.
- Role middleware exists.
- Swagger opens.
- Health API returns 200.
- Razorpay configuration loads without exposing secrets.
- Docker Compose configuration is valid.
- Backend lint passes.
- Frontend lint passes.
- Frontend production build passes.
- Payment business modules are not implemented prematurely.

---

# 31. Development Order

```text
1. Create repository
2. Add documentation
3. Initialize backend
4. Initialize frontend
5. Configure PostgreSQL
6. Configure Sequelize
7. Add users and roles
8. Add authentication
9. Add common middleware
10. Add logging and Swagger
11. Add Razorpay configuration
12. Add webhook foundation
13. Add Docker foundation
14. Run verification
15. Commit Part 1
```

---

# 32. Next Phase

The next document will be:

```text
Part-2-Database-Design.md
```

It will include:

- Users
- Roles
- Products
- Cart Items
- Orders
- Order Items
- Payments
- Payment Logs
- Webhook Events
- Relationships
- Constraints
- Indexes
- Audit fields
- Seed data
