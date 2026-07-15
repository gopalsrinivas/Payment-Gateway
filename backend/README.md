# Backend

Express, Sequelize, PostgreSQL, JWT, Swagger, Winston, and Razorpay SDK foundation for Part 1.

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

Local demo admin:

- Email: `admin@example.com`
- Password: `Admin@12345`

Razorpay payment creation, verification, refunds, and webhook processing are intentionally excluded from Part 1.

