# Database Schema

Part 2 extends the Part 1 authentication schema with the business tables needed for later product, cart, order, payment, payment-log, and webhook phases.

## Tables

- `roles`: Admin and Customer role records.
- `users`: Authenticated users with hashed passwords and role membership.
- `products`: Sellable demo products with trusted backend prices.
- `cart_items`: Active customer cart rows; there is no separate `carts` table.
- `orders`: Application-level order headers.
- `order_items`: Immutable product snapshots for each order.
- `payments`: Razorpay payment attempt records and external identifiers.
- `payment_logs`: Sanitized payment lifecycle audit messages.
- `webhook_events`: Razorpay webhook payload records for later idempotent processing.

## Audit Fields

Business tables use:

```text
created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by
```

`created_by`, `updated_by`, and `deleted_by` are nullable so system-created seed data and background processes can be represented. Where foreign keys are present for audit user IDs, they use `ON DELETE SET NULL`.

## Soft Delete

Soft delete is explicit, not Sequelize `paranoid`:

```text
is_deleted = true
deleted_at = deletion timestamp
deleted_by = nullable deleting user id
```

Normal Sequelize model queries use default scopes that exclude `is_deleted = true`. Controlled test cleanup may hard delete test-created records.

## Key Constraints

- Case-insensitive partial uniqueness for active/non-deleted role names, user emails, product slugs, and product SKUs.
- One active cart item per `user_id` and `product_id`.
- Unique order numbers.
- Nullable Razorpay IDs are unique when present.
- Webhook provider event IDs are unique when present.
- Monetary values are non-negative.
- `orders.total_amount = subtotal_amount + tax_amount - discount_amount`.
- `order_items.line_total = unit_price * quantity`.
- Cart quantity is between 1 and 100.

## Indexes

Indexes cover foreign keys, status filters, creation timestamps, product search, active product listing, payment identifiers, webhook idempotency, and JSONB metadata/payload inspection.

## Migration Order

1. `20260715000300-alter-roles-add-audit-fields`
2. `20260715000400-alter-users-add-audit-fields`
3. `20260715000500-create-products`
4. `20260715000600-create-cart-items`
5. `20260715000700-create-orders`
6. `20260715000800-create-order-items`
7. `20260715000900-create-payments`
8. `20260715001000-create-payment-logs`
9. `20260715001100-create-webhook-events`
10. `20260715001200-add-partial-indexes-and-check-constraints`

## Reset Commands

```cmd
cd /d D:\Workspace\professional\Interview_Tasks\Orfus\Payment-Gateway\backend
npm run db:migrate:undo
npm run db:migrate
npm run db:seed
```

Use destructive database resets only in local development.

## Limitations

Part 2 does not implement Product APIs, Cart APIs, Order APIs, Razorpay order creation, checkout, payment verification, refunds, or webhook business processing.

