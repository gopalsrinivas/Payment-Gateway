# Payment Gateway Frontend

Next.js App Router frontend for Payment Gateway.

## Scope

Part 4 implements authentication UI, role-aware navigation, product browsing, Admin product management, cart management, checkout preparation, order history, payment history, dashboards, profile, and payment success/failure foundations.

This application uses Razorpay Test Mode. No real money is processed.

## Environment

Create `frontend/.env.local` for local development:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=replace_with_test_key_id
NEXT_PUBLIC_APP_NAME=Payment Gateway
```

Only the Razorpay public Key ID is exposed to the browser. Do not add Razorpay secrets, webhook secrets, or database credentials to frontend environment files.

## Architecture

```text
Page -> Component -> Context/Hook -> Service -> Axios Client -> Part 3 Backend API
```

Auth state uses `AuthContext` with the existing `localStorage` JWT strategy. Cart state uses `CartContext`, while the backend remains the source of truth for item totals and order totals.

## Main Routes

Customer/public:

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

## Commands

```cmd
npm install
npm run dev
npm run lint
npm test
npm run build
npm start
```

## Known Limitations

Part 4 does not open Razorpay Checkout, create Razorpay orders, verify signatures, process webhooks, or mark payments successful from browser state. Checkout creates only an application order from the backend-trusted cart.

## Part 5 Readiness

The success/failure pages and public Razorpay Key ID configuration are ready for Part 5, where backend create-order, verification, and gateway failure endpoints should be added before enabling Checkout.
