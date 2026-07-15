# Codex Prompt – Part 2

# Payment Gateway Demo Database Design

## Objective

You are a Senior Full Stack Developer.

Continue the existing Payment Gateway Demo application and implement ONLY Part 2.

Read the existing Part-1 documentation and repository completely before making changes.

Use these files as the main specifications:

```text
docs/Part-1-Project-Setup-Payment-Gateway.md
docs/Part-2-Database-Design-Payment-Gateway.md
```

Part 2 must implement the PostgreSQL database design, Sequelize models, migrations, associations, constraints, indexes, seed data, and database-focused tests.

Do not implement complete Product APIs, Cart APIs, Order APIs, Razorpay Checkout, payment signature verification, webhook business processing, payment history APIs, or refunds in this phase.

---

# Important Repository Rules

- First inspect the current repository.
- Run `git status` before editing.
- Preserve all correct Part-1 files.
- Do not overwrite working authentication code.
- Do not remove documentation.
- Preserve existing Part-1 users and roles data.
- Use migrations as the schema source of truth.
- Do not use `sequelize.sync({ force: true })`.
- Do not use `sequelize.sync({ alter: true })`.
- Do not drop the database.
- Do not hardcode credentials.
- Do not commit real `.env` files.
- Do not expose Razorpay secrets.
- Keep the project small and interview-friendly.

---

# Technology Stack

## Backend

- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL
- JWT
- bcryptjs
- express-validator
- Winston
- Swagger
- Razorpay Node SDK foundation from Part 1

## Frontend

Do not add new frontend business screens in Part 2.

---

# Part-2 Scope

Implement:

```text
roles audit-field alignment
users audit-field alignment
products
cart_items
orders
order_items
payments
payment_logs
webhook_events
Sequelize associations
PostgreSQL constraints
PostgreSQL indexes
product seed data
database tests
documentation updates
```

Do not implement:

```text
Product controllers or routes
Cart controllers or routes
Order controllers or routes
Razorpay order creation
Checkout
Payment verification
Webhook event processing
Refunds
Payment history APIs
Frontend product/cart/payment pages
```

---

# Common Audit Columns

Add these columns to every required master and transactional table:

```text
created_at
created_by
updated_at
updated_by
is_deleted
deleted_at
deleted_by
```

PostgreSQL definitions:

```sql
created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
created_by  BIGINT NULL,
updated_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_by  BIGINT NULL,
is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
deleted_at  TIMESTAMPTZ NULL,
deleted_by  BIGINT NULL
```

Requirements:

- Use `created_at` and `updated_at` Sequelize timestamp mappings.
- Manage soft delete explicitly with `is_deleted`, `deleted_at`, and `deleted_by`.
- Normal model queries must exclude soft-deleted rows.
- Do not rely only on Sequelize `paranoid`, because `deleted_by` is required.
- Audit user IDs must remain nullable.
- Audit foreign-key constraints may use `ON DELETE SET NULL` if added.

---

# Existing Tables

Inspect and preserve:

```text
roles
users
```

Safely alter them when required.

## Roles Required Fields

```text
id
name
description
is_active
created_at
created_by
updated_at
updated_by
is_deleted
deleted_at
deleted_by
```

Requirements:

- Preserve Admin and Customer roles.
- Role name must be unique among non-deleted records.
- Do not duplicate roles during seeding.

## Users Required Fields

```text
id
name
email
password
role_id
is_active
last_login_at
created_at
created_by
updated_at
updated_by
is_deleted
deleted_at
deleted_by
```

Requirements:

- Preserve existing registered users.
- Preserve password hashing.
- Preserve email uniqueness for non-deleted users.
- Email should be normalized to lowercase.
- Active and non-deleted users only can log in.
- Password must remain excluded from normal responses.

---

# New Sequelize Models

Create:

```text
backend/src/models/Product.js
backend/src/models/CartItem.js
backend/src/models/Order.js
backend/src/models/OrderItem.js
backend/src/models/Payment.js
backend/src/models/PaymentLog.js
backend/src/models/WebhookEvent.js
```

Update:

```text
backend/src/models/Role.js
backend/src/models/User.js
backend/src/models/index.js
backend/src/utils/constants.js
```

Model rules:

- Use explicit `tableName`.
- Use snake_case database columns.
- Use `createdAt: "created_at"`.
- Use `updatedAt: "updated_at"`.
- Use validation for required fields.
- Use decimal or integer validation for money.
- Do not add controllers, services, or routes for these models yet.
- Configure associations centrally.
- Avoid circular imports.

---

# Products Table

Required fields:

```text
id
name
slug
description
sku
price
currency
image_url
is_active
created_at
created_by
updated_at
updated_by
is_deleted
deleted_at
deleted_by
```

Requirements:

- `price` must use `NUMERIC(12,2)`.
- `price >= 0`.
- Currency defaults to `INR`.
- Active, non-deleted slug must be unique case-insensitively.
- Active, non-deleted SKU must be unique case-insensitively.
- Add indexes for active status and product search.

---

# Cart Items Table

Required fields:

```text
id
user_id
product_id
quantity
created_at
created_by
updated_at
updated_by
is_deleted
deleted_at
deleted_by
```

Requirements:

- `user_id` references users.
- `product_id` references products.
- Quantity must be between 1 and 100.
- One active cart row per user and product.
- Use a PostgreSQL partial unique index for non-deleted records.
- Do not create a separate carts table.

---

# Orders Table

Required fields:

```text
id
order_number
user_id
subtotal_amount
tax_amount
discount_amount
total_amount
currency
status
payment_status
notes
placed_at
paid_at
cancelled_at
created_at
created_by
updated_at
updated_by
is_deleted
deleted_at
deleted_by
```

Requirements:

- `order_number` must be unique.
- `user_id` references users.
- Money fields use `NUMERIC(12,2)`.
- All money values must be non-negative.
- Add a check constraint for:

```text
total_amount = subtotal_amount + tax_amount - discount_amount
```

- Currency defaults to INR.
- Add indexes for user, status, payment status, and creation date.
- Define string status constants; do not use PostgreSQL enum types.

Recommended order statuses:

```text
PENDING
PAYMENT_INITIATED
PAID
PAYMENT_FAILED
CANCELLED
```

Recommended order payment statuses:

```text
PENDING
CREATED
AUTHORIZED
CAPTURED
FAILED
REFUNDED
PARTIALLY_REFUNDED
```

---

# Order Items Table

Required fields:

```text
id
order_id
product_id
product_name
product_sku
unit_price
quantity
line_total
created_at
created_by
updated_at
updated_by
is_deleted
deleted_at
deleted_by
```

Requirements:

- `order_id` references orders.
- `product_id` references products.
- Store product name, SKU, and price snapshots.
- Unit price and line total must be non-negative.
- Quantity must be at least 1.
- Add a check constraint for:

```text
line_total = unit_price * quantity
```

- Add order and product indexes.

---

# Payments Table

Required fields:

```text
id
order_id
user_id
razorpay_order_id
razorpay_payment_id
razorpay_signature
amount
amount_paise
currency
status
method
error_code
error_description
signature_verified
webhook_confirmed
attempt_number
paid_at
failed_at
created_at
created_by
updated_at
updated_by
is_deleted
deleted_at
deleted_by
```

Requirements:

- `order_id` references orders.
- `user_id` references users.
- Application amount uses `NUMERIC(12,2)`.
- Razorpay amount uses `BIGINT` paise.
- Both values must be non-negative.
- `attempt_number >= 1`.
- Razorpay order ID must be unique when present.
- Razorpay payment ID must be unique when present.
- Use PostgreSQL partial unique indexes for nullable external IDs.
- Do not store card number, CVV, expiry, OTP, or bank credentials.
- Do not implement payment API calls in Part 2.

Recommended statuses:

```text
CREATED
AUTHORIZED
CAPTURED
FAILED
REFUNDED
PARTIALLY_REFUNDED
```

---

# Payment Logs Table

Required fields:

```text
id
payment_id
order_id
user_id
event_type
source
status
request_id
message
metadata
created_at
created_by
updated_at
updated_by
is_deleted
deleted_at
deleted_by
```

Requirements:

- Foreign keys may use `ON DELETE SET NULL`.
- `metadata` must use JSONB.
- Add a GIN index for metadata.
- Add indexes for payment, order, event type, and request ID.
- Store only sanitized metadata.
- Do not store secrets, JWTs, passwords, card data, or complete sensitive bodies.

---

# Webhook Events Table

Required fields:

```text
id
provider
provider_event_id
event_type
entity_id
signature
signature_verified
payload
processing_status
processing_attempts
processed_at
last_error
received_at
created_at
created_by
updated_at
updated_by
is_deleted
deleted_at
deleted_by
```

Requirements:

- Provider defaults to `RAZORPAY`.
- Payload uses JSONB.
- Processing attempts must be non-negative.
- Provider event ID must be idempotent when present.
- Create a partial unique index on provider and provider_event_id.
- Add processing status, event type, entity ID, and payload indexes.
- Do not process webhook business events yet.
- Preserve Part-1 raw-body webhook foundation.

Recommended processing statuses:

```text
RECEIVED
VERIFIED
PROCESSING
PROCESSED
IGNORED
FAILED
```

---

# Associations

Configure:

```text
Role hasMany User
User belongsTo Role

User hasMany CartItem
CartItem belongsTo User
Product hasMany CartItem
CartItem belongsTo Product

User hasMany Order
Order belongsTo User

Order hasMany OrderItem
OrderItem belongsTo Order
Product hasMany OrderItem
OrderItem belongsTo Product

Order hasMany Payment
Payment belongsTo Order
User hasMany Payment
Payment belongsTo User

Payment hasMany PaymentLog
PaymentLog belongsTo Payment
Order hasMany PaymentLog
PaymentLog belongsTo Order
User hasMany PaymentLog
PaymentLog belongsTo User
```

WebhookEvent remains independent in Part 2.

Use clear aliases exactly as documented in the Part-2 design file.

---

# Migration Order

Create migrations in this dependency order:

```text
1. alter roles audit columns
2. alter users audit columns and last_login_at
3. create products
4. create cart_items
5. create orders
6. create order_items
7. create payments
8. create payment_logs
9. create webhook_events
10. add PostgreSQL partial indexes and check constraints
```

Migration requirements:

- Every migration must have reversible `up` and `down` methods.
- Preserve existing data.
- Use transactions for multi-step changes where practical.
- Do not remove Part-1 columns without a verified migration need.
- Do not rename existing fields blindly.
- Inspect actual Part-1 schema first and adapt safely.
- Use raw SQL only for PostgreSQL features that Sequelize CLI cannot express cleanly.
- Quote identifiers safely.
- Drop dependent indexes and constraints before dropping columns in `down`.

---

# Index Requirements

At minimum, create:

```text
roles lower(name) partial unique index
users lower(email) partial unique index
products lower(slug) partial unique index
products lower(sku) partial unique index
cart_items user_id + product_id partial unique index
orders order_number unique index
payments razorpay_order_id partial unique index
payments razorpay_payment_id partial unique index
webhook_events provider + provider_event_id partial unique index
```

Also create useful foreign-key, status, timestamp, and JSONB GIN indexes documented in Part 2.

Avoid unnecessary indexes that duplicate primary-key or unique-index coverage.

---

# Check Constraints

Create database-level checks where practical:

```text
products.price >= 0
cart_items.quantity BETWEEN 1 AND 100
orders monetary values >= 0
orders.total_amount = subtotal_amount + tax_amount - discount_amount
order_items.unit_price >= 0
order_items.quantity >= 1
order_items.line_total = unit_price * quantity
payments.amount >= 0
payments.amount_paise >= 0
payments.attempt_number >= 1
webhook_events.processing_attempts >= 0
```

Use decimal-safe PostgreSQL expressions.

---

# Seed Data

Preserve:

```text
Admin role
Customer role
local development Admin user
```

Add products:

```text
Interview Preparation Guide – 499.00 INR
Node.js API Starter – 999.00 INR
Next.js Dashboard Template – 1499.00 INR
Full Stack Demo Package – 2499.00 INR
```

Seeder requirements:

- Be idempotent where practical.
- Avoid duplicate products.
- Use stable SKUs and slugs.
- Set audit timestamps.
- Set `is_deleted = false`.
- Do not seed successful payments.
- Do not seed Razorpay external IDs.
- Do not include secrets.

---

# Constants

Update:

```text
backend/src/utils/constants.js
```

Add order, payment, webhook processing, and payment-log source constants.

Do not scatter status strings throughout model definitions.

---

# Soft Delete Requirements

- Soft delete uses `is_deleted`, `deleted_at`, and `deleted_by`.
- Normal queries must exclude deleted rows.
- Add reusable model scope or helper logic.
- Partial unique indexes must allow a new active row after an old row is soft deleted.
- Do not physically delete orders, payments, payment logs, or webhook events in application code.
- Hard delete is allowed only in controlled test cleanup.

---

# Security Requirements

Never store or log:

```text
plain passwords
JWT tokens
Razorpay Key Secret
Webhook Secret
card number
CVV
card expiry
OTP
UPI PIN
bank credentials
```

Requirements:

- Keep payment metadata sanitized.
- Keep webhook signatures out of normal API responses.
- Do not expose raw webhook payloads through public APIs.
- Do not add real payment credentials.
- Preserve Test Mode configuration.

---

# Tests

Add meaningful database-focused tests for:

- Model initialization.
- Associations.
- Product validation.
- Product SKU uniqueness.
- Product slug uniqueness.
- Cart quantity limits.
- Active cart item uniqueness.
- Order amount constraints.
- Order-item line-total constraints.
- Payment external-ID uniqueness.
- Webhook event idempotency.
- Soft-delete filtering.
- Part-1 registration and login still working.

Do not call Razorpay APIs.

Use the existing Node test setup or Supertest where API regression verification is needed.

Clean up test data safely.

---

# Documentation Updates

Create or update:

```text
docs/Part-2-Database-Design-Payment-Gateway.md
docs/database-schema.md
docs/database-relationships.md
README.md
```

README updates must include:

- Part-2 scope.
- New table list.
- Migration commands.
- Seeder commands.
- Soft-delete behavior.
- Audit columns.
- Database verification commands.
- Current limitations.
- Next phase.

Clearly state that payment business processing is not implemented in Part 2.

---

# Before Making Changes

1. Inspect the current repository.
2. Run `git status`.
3. Read Part-1 documentation completely.
4. Read Part-2 database design completely.
5. Inspect current migrations, seeders, models, and tests.
6. Inspect the actual roles and users schema.
7. Summarize the implementation plan.
8. List files expected to be created or modified.
9. Identify schema conflicts before editing.
10. Do not continue blindly when a migration name or field differs from documentation; adapt safely and report the difference.

---

# After Implementation

1. List all created files.
2. List all modified files.
3. Show migration order.
4. Run backend lint.
5. Run backend tests.
6. Run Part-1 authentication regression tests.
7. Run migrations on a clean test database where practical.
8. Run migrations against the existing Part-1 schema.
9. Run seeders.
10. Inspect migration status.
11. Verify all expected tables exist.
12. Verify all foreign keys.
13. Verify partial unique indexes.
14. Verify check constraints.
15. Verify audit columns.
16. Verify soft-delete behavior.
17. Verify models and associations load.
18. Confirm no payment business APIs were added.
19. Confirm no frontend business screens were added.
20. Confirm no secrets were added.
21. Provide exact Windows CMD commands.
22. List remaining manual steps.
23. Do not start Part 3.

---

# Acceptance Criteria

Part 2 is complete only when:

- Existing Part-1 application remains functional.
- Roles and users data are preserved.
- All migrations run successfully.
- All seeders run successfully.
- All expected tables exist.
- All Sequelize models load successfully.
- All associations are correctly configured.
- Audit columns exist where required.
- Soft delete works correctly.
- Foreign-key constraints work.
- Partial unique indexes work.
- Monetary and quantity check constraints work.
- Product seed records exist without duplication.
- Backend lint passes.
- Backend tests pass.
- Part-1 authentication tests still pass.
- No Razorpay Checkout exists.
- No payment verification flow exists.
- No webhook business processing exists.
- No secrets are exposed.

---

# Final Output Format

Provide:

## Summary

## Repository Inspection

## Schema Decisions

## Files Created

## Files Modified

## Migrations

## Sequelize Models

## Associations

## Constraints

## Indexes

## Audit and Soft Delete

## Seed Data

## Tests

## Verification Results

## Windows CMD Commands

## Remaining Manual Steps

## Part 3 Readiness
