# Database Relationships

```text
roles 1 ----< users

users 1 ----< cart_items >---- 1 products

users 1 ----< orders
orders 1 ----< order_items >---- 1 products

orders 1 ----< payments
users 1 ----< payments

payments 1 ----< payment_logs
orders 1 ----< payment_logs
users 1 ----< payment_logs

webhook_events stores provider webhook records independently in Part 2.
```

## Foreign Key Actions

- `users.role_id -> roles.id`: `ON UPDATE CASCADE`, `ON DELETE RESTRICT`.
- `cart_items.user_id -> users.id`: preserves carts from accidental user deletion with `ON DELETE RESTRICT`.
- `cart_items.product_id -> products.id`: preserves product references with `ON DELETE RESTRICT`.
- `orders.user_id -> users.id`: preserves order history with `ON DELETE RESTRICT`.
- `order_items.order_id -> orders.id`: preserves order item history with `ON DELETE RESTRICT`.
- `order_items.product_id -> products.id`: avoids losing historical item snapshots with `ON DELETE RESTRICT`.
- `payments.order_id -> orders.id`: preserves payment attempts with `ON DELETE RESTRICT`.
- `payments.user_id -> users.id`: preserves user payment history with `ON DELETE RESTRICT`.
- `payment_logs` references to payments, orders, and users use `ON DELETE SET NULL` so logs survive cleanup or administrative changes.
- Audit user columns are nullable and use `ON DELETE SET NULL` where constrained.

## Part 3 Readiness

The schema supports product browsing, cart management, order creation, payment-attempt records, and webhook event persistence. Business APIs and Razorpay workflows remain intentionally unimplemented until later parts.

