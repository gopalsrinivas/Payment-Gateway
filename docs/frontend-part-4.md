# Part 4 Frontend Implementation

The Part 4 frontend extends the existing Next.js App Router foundation and consumes the Part 3 backend APIs.

## Architecture

```text
Page
-> Reusable Component
-> Context or Hook
-> Frontend Service
-> Axios API Client
-> Backend REST API
```

## Implemented Route Groups

Public and Customer:

- `/`
- `/login`
- `/register`
- `/products`
- `/products/:id`
- `/dashboard`
- `/cart`
- `/checkout`
- `/orders`
- `/orders/:id`
- `/payments`
- `/payments/:id`
- `/profile`
- `/payment-success`
- `/payment-failed`

Admin:

- `/admin/dashboard`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/:id/edit`
- `/admin/orders`
- `/admin/payments`
- `/admin/payment-logs`

## Auth Flow

- JWT token storage follows the existing Part 1 `localStorage` approach.
- `AuthContext` fetches `/auth/profile` on refresh.
- Protected routes redirect guests to `/login`.
- Admin pages use role guards and still rely on backend RBAC as final authority.

## Cart and Order Flow

- Cart UI uses `/cart` APIs and backend-returned totals.
- Checkout loads the current cart and creates a pending application order with `POST /orders`.
- The frontend never sends price, total, user ID, payment status, or order status during checkout.

## Payment Flow

Payment pages are read-only in Part 4:

- Customers can view payment history where records exist.
- Admins can view payment lists and payment logs.
- Payment success/failure pages are safe foundations only.

Full Razorpay Checkout, create-order, signature verification, and webhook processing are reserved for Part 5.

## Environment

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=replace_with_test_key_id
NEXT_PUBLIC_APP_NAME=Payment Gateway
```

No Razorpay secret, webhook secret, or database credential belongs in the frontend.

## Verification Commands

Run from `frontend/`:

```cmd
npm run lint
npm test
npm run build
npm run dev
```

Run from the project root:

```cmd
docker compose config
```
