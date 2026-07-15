# Payment Gateway Backend

Express, Sequelize, PostgreSQL, JWT, Swagger, Winston, and Razorpay Test Mode integration.

## Setup

```cmd
cd backend
copy .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Swagger: `http://localhost:5000/api-docs`

Health: `http://localhost:5000/api/v1/health`

## Razorpay Test Mode

Required backend-only variables:

```env
RAZORPAY_KEY_ID=rzp_test_replace_me
RAZORPAY_KEY_SECRET=replace_with_test_secret
RAZORPAY_WEBHOOK_SECRET=replace_with_webhook_secret
RAZORPAY_CURRENCY=INR
RAZORPAY_COMPANY_NAME=Payment Gateway
RAZORPAY_CHECKOUT_DESCRIPTION=Test payment
```

Implemented endpoints:

- `POST /api/v1/payments/initialize`
- `POST /api/v1/payments/create-order`
- `POST /api/v1/payments/verify`
- `POST /api/v1/payments/failure`
- `POST /api/v1/webhooks/razorpay`

Payment amounts are loaded from trusted application orders and converted to paise on the backend. Checkout signatures and webhook signatures are verified on the backend only.

Local demo admin:

- Email: `admin@example.com`
- Password: `Admin@12345`

Live Mode, refunds, settlements, payouts, and subscriptions are intentionally out of scope.
