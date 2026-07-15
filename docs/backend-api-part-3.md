# Part 3 Backend APIs

This backend API layer covers product browsing and administration, cart management, trusted order creation, payment history/log reads, and dashboard summaries.

Razorpay payment execution is intentionally not implemented here. Real Razorpay order creation, payment signature verification, and final webhook event processing remain reserved for Part 5.

## Base URL

```text
http://localhost:5000/api/v1
```

## Implemented Routes

| Area | Method | Path | Access |
| --- | --- | --- | --- |
| Products | GET | `/products` | Public |
| Products | GET | `/products/:id` | Public |
| Products | POST | `/products` | Admin |
| Products | PUT/PATCH | `/products/:id` | Admin |
| Products | PATCH | `/products/:id/status` | Admin |
| Products | DELETE | `/products/:id` | Admin |
| Cart | GET | `/cart` | Authenticated |
| Cart | POST | `/cart/items` | Authenticated |
| Cart | PATCH | `/cart/items/:id` | Item owner |
| Cart | DELETE | `/cart/items/:id` | Item owner |
| Cart | DELETE | `/cart` | Authenticated |
| Orders | POST | `/orders` | Authenticated |
| Orders | GET | `/orders` | Customer owns / Admin all |
| Orders | GET | `/orders/:id` | Customer owns / Admin |
| Orders | GET | `/orders/:id/items` | Customer owns / Admin |
| Orders | PATCH | `/orders/:id/status` | Admin |
| Payments | GET | `/payments` | Customer owns / Admin all |
| Payments | GET | `/payments/history` | Authenticated |
| Payments | GET | `/payments/:id` | Customer owns / Admin |
| Payments | GET | `/orders/:orderId/payments` | Order owner / Admin |
| Payment Logs | GET | `/payment-logs` | Admin |
| Payment Logs | GET | `/payment-logs/:id` | Admin |
| Payment Logs | GET | `/payments/:paymentId/logs` | Admin |
| Dashboard | GET | `/dashboard/customer` | Authenticated |
| Dashboard | GET | `/dashboard/admin` | Admin |
| Dashboard | GET | `/dashboard/summary` | Admin |
| Dashboard | GET | `/dashboard/recent-payments` | Admin |

## Important Safety Rules

- Product prices, order totals, and order item snapshots are calculated on the server.
- Client-supplied trusted order fields such as `total`, `totalAmount`, `subtotal`, `currency`, `paymentStatus`, and `status` are rejected during order creation.
- Customers can only read their own cart, orders, and payments.
- Admin-only routes are protected with the existing JWT authentication and role middleware.
- Payment responses omit sensitive Razorpay signature fields.

## Verification

Run from `backend/`:

```cmd
npm run lint
npm test
```

The interactive API documentation is available at:

```text
http://localhost:5000/api-docs
```
