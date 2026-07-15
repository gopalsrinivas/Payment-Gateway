# Payment Gateway Demo

# Part-2 – Database Design

---

# 1. Objective

Part 2 defines and implements the complete PostgreSQL database design required for the Payment Gateway Demo.

This phase extends the Part-1 foundation and introduces the core business tables needed for products, cart, orders, Razorpay payments, payment logs, and webhook event storage.

Part 2 must remain focused on database design, Sequelize models, migrations, relationships, indexes, constraints, and seed data.

Do not implement complete frontend payment screens or full payment processing workflows in this phase.

---

# 2. Part-2 Scope

Part 2 includes:

- Review and preserve Part-1 `roles` and `users` tables.
- Standardize audit columns.
- Add soft-delete support.
- Create product tables.
- Create cart tables.
- Create order tables.
- Create payment tables.
- Create payment log tables.
- Create Razorpay webhook event tables.
- Define Sequelize associations.
- Add database constraints.
- Add useful indexes.
- Add development seed data.
- Add migration and model tests.
- Update database documentation.

---

# 3. Out of Scope

Do not implement the following in Part 2:

- Razorpay Checkout UI.
- Razorpay order API calls.
- Payment signature verification business flow.
- Webhook-driven payment status updates.
- Refund processing.
- Settlement reconciliation.
- Subscription billing.
- Coupon management.
- Inventory reservation.
- Shipping management.
- Production payment credentials.

---

# 4. Database Naming Standards

Use PostgreSQL-compatible snake_case names.

Examples:

```text
created_at
created_by
razorpay_order_id
payment_status
order_items
```

Rules:

- Table names must be plural.
- Column names must use snake_case.
- Primary keys must use `id`.
- Foreign keys must use `<table-singular>_id`.
- Boolean columns must start with `is_`, `has_`, or `can_`.
- Timestamp columns must end with `_at`.
- Use `NUMERIC(12,2)` for application currency amounts.
- Use integer paise values when storing values directly received from or sent to Razorpay.
- Store external IDs as strings.
- Never use floating-point types for money.

---

# 5. Common Audit and Soft-Delete Columns

Every master and transactional table should contain the following columns unless explicitly documented otherwise:

```sql
created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
created_by  BIGINT NULL,
updated_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_by  BIGINT NULL,
is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
deleted_at  TIMESTAMPTZ NULL,
deleted_by  BIGINT NULL
```

Recommended behavior:

- `created_at` is assigned during insert.
- `created_by` stores the authenticated user ID when available.
- `updated_at` changes during every update.
- `updated_by` stores the last modifying user ID.
- `is_deleted = TRUE` means the row is soft deleted.
- `deleted_at` stores deletion time.
- `deleted_by` stores the deleting user ID.
- Normal application queries must exclude `is_deleted = TRUE` rows.
- Do not physically delete business data unless specifically required for test cleanup.

For Sequelize models, use:

```javascript
{
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  paranoid: false,
  underscored: true,
}
```

Soft delete must be managed through `is_deleted`, `deleted_at`, and `deleted_by` so the audit user can be stored.

---

# 6. Core Tables

Part 2 uses these tables:

```text
roles
users
products
cart_items
orders
order_items
payments
payment_logs
webhook_events
```

Part-1 tables:

```text
roles
users
```

New Part-2 tables:

```text
products
cart_items
orders
order_items
payments
payment_logs
webhook_events
```

---

# 7. Roles Table

The `roles` table already exists from Part 1. Preserve existing data and align the schema with audit requirements.

```sql
roles
-----
id              BIGSERIAL PRIMARY KEY
name            VARCHAR(50) NOT NULL
description     VARCHAR(255) NULL
is_active       BOOLEAN NOT NULL DEFAULT TRUE
created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
created_by      BIGINT NULL
updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_by      BIGINT NULL
is_deleted      BOOLEAN NOT NULL DEFAULT FALSE
deleted_at      TIMESTAMPTZ NULL
deleted_by      BIGINT NULL
```

Constraints:

```text
UNIQUE lower(name) for non-deleted rows
name cannot be blank
```

Seed values:

```text
Admin
Customer
```

---

# 8. Users Table

The `users` table already exists from Part 1. Preserve existing authentication behavior and add missing audit fields through a safe migration.

```sql
users
-----
id              BIGSERIAL PRIMARY KEY
name            VARCHAR(120) NOT NULL
email           VARCHAR(255) NOT NULL
password        VARCHAR(255) NOT NULL
role_id         BIGINT NOT NULL
is_active       BOOLEAN NOT NULL DEFAULT TRUE
last_login_at   TIMESTAMPTZ NULL
created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
created_by      BIGINT NULL
updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_by      BIGINT NULL
is_deleted      BOOLEAN NOT NULL DEFAULT FALSE
deleted_at      TIMESTAMPTZ NULL
deleted_by      BIGINT NULL
```

Foreign key:

```text
role_id -> roles.id
ON UPDATE CASCADE
ON DELETE RESTRICT
```

Constraints:

- Email must be stored in lowercase.
- Email must be unique for non-deleted users.
- Password must always contain a hash, never plain text.
- Only active and non-deleted users can log in.

Indexes:

```sql
CREATE UNIQUE INDEX users_email_active_unique
ON users (LOWER(email))
WHERE is_deleted = FALSE;

CREATE INDEX users_role_id_idx ON users(role_id);
CREATE INDEX users_active_idx ON users(is_active, is_deleted);
```

---

# 9. Products Table

The `products` table stores items available for purchase.

```sql
products
--------
id              BIGSERIAL PRIMARY KEY
name            VARCHAR(150) NOT NULL
slug            VARCHAR(180) NOT NULL
description     TEXT NULL
sku             VARCHAR(80) NOT NULL
price           NUMERIC(12,2) NOT NULL
currency        VARCHAR(3) NOT NULL DEFAULT 'INR'
image_url       TEXT NULL
is_active       BOOLEAN NOT NULL DEFAULT TRUE
created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
created_by      BIGINT NULL
updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_by      BIGINT NULL
is_deleted      BOOLEAN NOT NULL DEFAULT FALSE
deleted_at      TIMESTAMPTZ NULL
deleted_by      BIGINT NULL
```

Constraints:

```text
price >= 0
currency = 'INR' for this demo
name cannot be blank
slug cannot be blank
sku cannot be blank
```

Unique partial indexes:

```sql
CREATE UNIQUE INDEX products_slug_active_unique
ON products (LOWER(slug))
WHERE is_deleted = FALSE;

CREATE UNIQUE INDEX products_sku_active_unique
ON products (LOWER(sku))
WHERE is_deleted = FALSE;
```

Other indexes:

```sql
CREATE INDEX products_active_idx
ON products(is_active, is_deleted);

CREATE INDEX products_name_search_idx
ON products(LOWER(name));
```

Business rules:

- Product price is the trusted application price.
- The backend must not trust a price sent by the frontend.
- Deleted or inactive products cannot be added to a cart or new order.

---

# 10. Cart Items Table

The `cart_items` table stores the current cart for each customer.

A separate `carts` table is intentionally avoided to keep this demo small.

```sql
cart_items
----------
id              BIGSERIAL PRIMARY KEY
user_id         BIGINT NOT NULL
product_id      BIGINT NOT NULL
quantity        INTEGER NOT NULL DEFAULT 1
created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
created_by      BIGINT NULL
updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_by      BIGINT NULL
is_deleted      BOOLEAN NOT NULL DEFAULT FALSE
deleted_at      TIMESTAMPTZ NULL
deleted_by      BIGINT NULL
```

Foreign keys:

```text
user_id -> users.id
ON UPDATE CASCADE
ON DELETE RESTRICT

product_id -> products.id
ON UPDATE CASCADE
ON DELETE RESTRICT
```

Constraints:

```text
quantity >= 1
quantity <= 100
```

Indexes:

```sql
CREATE UNIQUE INDEX cart_items_user_product_active_unique
ON cart_items(user_id, product_id)
WHERE is_deleted = FALSE;

CREATE INDEX cart_items_user_id_idx
ON cart_items(user_id, is_deleted);

CREATE INDEX cart_items_product_id_idx
ON cart_items(product_id);
```

Business rules:

- A user can have only one active cart row for the same product.
- Adding the same product again should update quantity.
- Cart totals must be calculated from current product prices in the database.
- Soft-deleted cart rows must not appear in the active cart.

---

# 11. Orders Table

The `orders` table stores the application-level order.

```sql
orders
------
id                  BIGSERIAL PRIMARY KEY
order_number        VARCHAR(40) NOT NULL
user_id             BIGINT NOT NULL
subtotal_amount     NUMERIC(12,2) NOT NULL
tax_amount          NUMERIC(12,2) NOT NULL DEFAULT 0
discount_amount     NUMERIC(12,2) NOT NULL DEFAULT 0
total_amount        NUMERIC(12,2) NOT NULL
currency            VARCHAR(3) NOT NULL DEFAULT 'INR'
status              VARCHAR(30) NOT NULL DEFAULT 'PENDING'
payment_status      VARCHAR(30) NOT NULL DEFAULT 'PENDING'
notes               TEXT NULL
placed_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
paid_at             TIMESTAMPTZ NULL
cancelled_at        TIMESTAMPTZ NULL
created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
created_by          BIGINT NULL
updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_by          BIGINT NULL
is_deleted          BOOLEAN NOT NULL DEFAULT FALSE
deleted_at          TIMESTAMPTZ NULL
deleted_by          BIGINT NULL
```

Foreign key:

```text
user_id -> users.id
ON UPDATE CASCADE
ON DELETE RESTRICT
```

Recommended order statuses:

```text
PENDING
PAYMENT_INITIATED
PAID
PAYMENT_FAILED
CANCELLED
```

Recommended payment statuses:

```text
PENDING
CREATED
AUTHORIZED
CAPTURED
FAILED
REFUNDED
PARTIALLY_REFUNDED
```

Constraints:

```text
subtotal_amount >= 0
tax_amount >= 0
discount_amount >= 0
total_amount >= 0
total_amount = subtotal_amount + tax_amount - discount_amount
currency = 'INR'
```

Indexes:

```sql
CREATE UNIQUE INDEX orders_order_number_unique
ON orders(order_number);

CREATE INDEX orders_user_id_idx
ON orders(user_id, created_at DESC);

CREATE INDEX orders_status_idx
ON orders(status, is_deleted);

CREATE INDEX orders_payment_status_idx
ON orders(payment_status, is_deleted);

CREATE INDEX orders_created_at_idx
ON orders(created_at DESC);
```

Order number format:

```text
ORD-YYYYMMDD-000001
```

The exact sequence-generation method may use a database sequence or a transaction-safe generated identifier.

---

# 12. Order Items Table

The `order_items` table stores an immutable snapshot of products purchased in an order.

```sql
order_items
-----------
id                  BIGSERIAL PRIMARY KEY
order_id            BIGINT NOT NULL
product_id          BIGINT NOT NULL
product_name        VARCHAR(150) NOT NULL
product_sku         VARCHAR(80) NOT NULL
unit_price          NUMERIC(12,2) NOT NULL
quantity            INTEGER NOT NULL
line_total          NUMERIC(12,2) NOT NULL
created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
created_by          BIGINT NULL
updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_by          BIGINT NULL
is_deleted          BOOLEAN NOT NULL DEFAULT FALSE
deleted_at          TIMESTAMPTZ NULL
deleted_by          BIGINT NULL
```

Foreign keys:

```text
order_id -> orders.id
ON UPDATE CASCADE
ON DELETE RESTRICT

product_id -> products.id
ON UPDATE CASCADE
ON DELETE RESTRICT
```

Constraints:

```text
unit_price >= 0
quantity >= 1
line_total >= 0
line_total = unit_price * quantity
```

Indexes:

```sql
CREATE INDEX order_items_order_id_idx
ON order_items(order_id, is_deleted);

CREATE INDEX order_items_product_id_idx
ON order_items(product_id);
```

Business rules:

- Copy product name, SKU, and price into order items at order creation.
- Later product changes must not change historical order values.
- Order items should not normally be updated after payment begins.

---

# 13. Payments Table

The `payments` table stores one or more payment attempts for an order.

```sql
payments
--------
id                          BIGSERIAL PRIMARY KEY
order_id                    BIGINT NOT NULL
user_id                     BIGINT NOT NULL
razorpay_order_id           VARCHAR(100) NULL
razorpay_payment_id         VARCHAR(100) NULL
razorpay_signature          VARCHAR(255) NULL
amount                      NUMERIC(12,2) NOT NULL
amount_paise                BIGINT NOT NULL
currency                    VARCHAR(3) NOT NULL DEFAULT 'INR'
status                      VARCHAR(30) NOT NULL DEFAULT 'CREATED'
method                      VARCHAR(50) NULL
error_code                  VARCHAR(100) NULL
error_description           TEXT NULL
signature_verified          BOOLEAN NOT NULL DEFAULT FALSE
webhook_confirmed           BOOLEAN NOT NULL DEFAULT FALSE
attempt_number              INTEGER NOT NULL DEFAULT 1
paid_at                     TIMESTAMPTZ NULL
failed_at                   TIMESTAMPTZ NULL
created_at                  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
created_by                  BIGINT NULL
updated_at                  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_by                  BIGINT NULL
is_deleted                  BOOLEAN NOT NULL DEFAULT FALSE
deleted_at                  TIMESTAMPTZ NULL
deleted_by                  BIGINT NULL
```

Foreign keys:

```text
order_id -> orders.id
ON UPDATE CASCADE
ON DELETE RESTRICT

user_id -> users.id
ON UPDATE CASCADE
ON DELETE RESTRICT
```

Recommended statuses:

```text
CREATED
AUTHORIZED
CAPTURED
FAILED
REFUNDED
PARTIALLY_REFUNDED
```

Constraints:

```text
amount >= 0
amount_paise >= 0
attempt_number >= 1
currency = 'INR'
amount_paise = ROUND(amount * 100)
```

Indexes:

```sql
CREATE INDEX payments_order_id_idx
ON payments(order_id, created_at DESC);

CREATE INDEX payments_user_id_idx
ON payments(user_id, created_at DESC);

CREATE UNIQUE INDEX payments_razorpay_order_id_unique
ON payments(razorpay_order_id)
WHERE razorpay_order_id IS NOT NULL;

CREATE UNIQUE INDEX payments_razorpay_payment_id_unique
ON payments(razorpay_payment_id)
WHERE razorpay_payment_id IS NOT NULL;

CREATE INDEX payments_status_idx
ON payments(status, is_deleted);

CREATE INDEX payments_created_at_idx
ON payments(created_at DESC);
```

Security rules:

- Do not store card number, CVV, expiry, UPI PIN, or bank credentials.
- The signature may be stored for audit, but must never be logged openly.
- A frontend success callback alone must not mark a payment as captured.
- Final status must come from verified backend signature processing and trusted webhook events.

---

# 14. Payment Logs Table

The `payment_logs` table stores important payment lifecycle events and sanitized API outcomes.

```sql
payment_logs
------------
id                  BIGSERIAL PRIMARY KEY
payment_id          BIGINT NULL
order_id            BIGINT NULL
user_id             BIGINT NULL
event_type          VARCHAR(80) NOT NULL
source              VARCHAR(30) NOT NULL
status              VARCHAR(30) NULL
request_id          VARCHAR(100) NULL
message             TEXT NULL
metadata            JSONB NULL
created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
created_by          BIGINT NULL
updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_by          BIGINT NULL
is_deleted          BOOLEAN NOT NULL DEFAULT FALSE
deleted_at          TIMESTAMPTZ NULL
deleted_by          BIGINT NULL
```

Foreign keys:

```text
payment_id -> payments.id
ON UPDATE CASCADE
ON DELETE SET NULL

order_id -> orders.id
ON UPDATE CASCADE
ON DELETE SET NULL

user_id -> users.id
ON UPDATE CASCADE
ON DELETE SET NULL
```

Recommended sources:

```text
APPLICATION
RAZORPAY_API
FRONTEND_CALLBACK
WEBHOOK
SYSTEM
```

Example event types:

```text
PAYMENT_RECORD_CREATED
RAZORPAY_ORDER_CREATED
CHECKOUT_CALLBACK_RECEIVED
SIGNATURE_VERIFICATION_SUCCESS
SIGNATURE_VERIFICATION_FAILED
PAYMENT_CAPTURED
PAYMENT_FAILED
WEBHOOK_RECEIVED
WEBHOOK_DUPLICATE_IGNORED
```

Indexes:

```sql
CREATE INDEX payment_logs_payment_id_idx
ON payment_logs(payment_id, created_at DESC);

CREATE INDEX payment_logs_order_id_idx
ON payment_logs(order_id, created_at DESC);

CREATE INDEX payment_logs_event_type_idx
ON payment_logs(event_type, created_at DESC);

CREATE INDEX payment_logs_request_id_idx
ON payment_logs(request_id);

CREATE INDEX payment_logs_metadata_gin_idx
ON payment_logs USING GIN(metadata);
```

Logging rules:

- Store only sanitized metadata.
- Never store secrets or complete sensitive request bodies.
- Never store card information.
- Truncate unusually large external messages.

---

# 15. Webhook Events Table

The `webhook_events` table stores Razorpay webhook events for idempotency, audit, troubleshooting, and deferred processing.

```sql
webhook_events
--------------
id                  BIGSERIAL PRIMARY KEY
provider            VARCHAR(30) NOT NULL DEFAULT 'RAZORPAY'
provider_event_id   VARCHAR(150) NULL
event_type          VARCHAR(100) NOT NULL
entity_id           VARCHAR(100) NULL
signature           VARCHAR(255) NULL
signature_verified  BOOLEAN NOT NULL DEFAULT FALSE
payload             JSONB NOT NULL
processing_status   VARCHAR(30) NOT NULL DEFAULT 'RECEIVED'
processing_attempts INTEGER NOT NULL DEFAULT 0
processed_at        TIMESTAMPTZ NULL
last_error          TEXT NULL
received_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
created_by          BIGINT NULL
updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_by          BIGINT NULL
is_deleted          BOOLEAN NOT NULL DEFAULT FALSE
deleted_at          TIMESTAMPTZ NULL
deleted_by          BIGINT NULL
```

Recommended processing statuses:

```text
RECEIVED
VERIFIED
PROCESSING
PROCESSED
IGNORED
FAILED
```

Constraints:

```text
processing_attempts >= 0
provider = 'RAZORPAY' for this project
```

Indexes:

```sql
CREATE UNIQUE INDEX webhook_events_provider_event_unique
ON webhook_events(provider, provider_event_id)
WHERE provider_event_id IS NOT NULL;

CREATE INDEX webhook_events_event_type_idx
ON webhook_events(event_type, received_at DESC);

CREATE INDEX webhook_events_processing_status_idx
ON webhook_events(processing_status, received_at);

CREATE INDEX webhook_events_entity_id_idx
ON webhook_events(entity_id);

CREATE INDEX webhook_events_payload_gin_idx
ON webhook_events USING GIN(payload);
```

Security and data rules:

- Raw webhook body must be used for signature verification before JSON parsing changes it.
- Store the parsed payload only after safe size validation.
- Keep the signature out of normal API responses.
- Duplicate provider events must not be processed twice.
- Payload retention should be documented.

---

# 16. Entity Relationships

```text
roles 1 ───────< users

users 1 ───────< cart_items >─────── 1 products

users 1 ───────< orders
orders 1 ──────< order_items >────── 1 products

orders 1 ──────< payments
users 1 ───────< payments

payments 1 ────< payment_logs
orders 1 ──────< payment_logs
users 1 ───────< payment_logs

webhook_events stores external webhook messages independently.
```

Sequelize associations:

```javascript
Role.hasMany(User, { foreignKey: "role_id", as: "users" });
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });

User.hasMany(CartItem, { foreignKey: "user_id", as: "cartItems" });
CartItem.belongsTo(User, { foreignKey: "user_id", as: "user" });
Product.hasMany(CartItem, { foreignKey: "product_id", as: "cartItems" });
CartItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

User.hasMany(Order, { foreignKey: "user_id", as: "orders" });
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });

Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });
Product.hasMany(OrderItem, { foreignKey: "product_id", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

Order.hasMany(Payment, { foreignKey: "order_id", as: "payments" });
Payment.belongsTo(Order, { foreignKey: "order_id", as: "order" });
User.hasMany(Payment, { foreignKey: "user_id", as: "payments" });
Payment.belongsTo(User, { foreignKey: "user_id", as: "user" });

Payment.hasMany(PaymentLog, { foreignKey: "payment_id", as: "logs" });
PaymentLog.belongsTo(Payment, { foreignKey: "payment_id", as: "payment" });
Order.hasMany(PaymentLog, { foreignKey: "order_id", as: "paymentLogs" });
PaymentLog.belongsTo(Order, { foreignKey: "order_id", as: "order" });
User.hasMany(PaymentLog, { foreignKey: "user_id", as: "paymentLogs" });
PaymentLog.belongsTo(User, { foreignKey: "user_id", as: "user" });
```

---

# 17. Foreign-Key Audit Columns

The following audit columns may reference `users.id`:

```text
created_by
updated_by
deleted_by
```

Recommended foreign-key behavior:

```text
ON UPDATE CASCADE
ON DELETE SET NULL
```

To avoid excessive migration complexity, audit foreign keys may initially remain nullable without database constraints, provided the application validates IDs correctly.

Preferred approach for this project:

- Add indexes for audit columns only where reporting requires them.
- Do not create Sequelize associations for every audit column.
- Resolve audit users explicitly when needed.

---

# 18. Status Constants

Define constants in:

```text
backend/src/utils/constants.js
```

Recommended values:

```javascript
const ORDER_STATUS = {
  PENDING: "PENDING",
  PAYMENT_INITIATED: "PAYMENT_INITIATED",
  PAID: "PAID",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  CANCELLED: "CANCELLED",
};

const PAYMENT_STATUS = {
  CREATED: "CREATED",
  AUTHORIZED: "AUTHORIZED",
  CAPTURED: "CAPTURED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
  PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
};

const WEBHOOK_PROCESSING_STATUS = {
  RECEIVED: "RECEIVED",
  VERIFIED: "VERIFIED",
  PROCESSING: "PROCESSING",
  PROCESSED: "PROCESSED",
  IGNORED: "IGNORED",
  FAILED: "FAILED",
};
```

Avoid PostgreSQL enum types for this small project because changing enum values later requires more migration care. Use validated strings with database check constraints where practical.

---

# 19. Sequelize Model Files

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
```

Model requirements:

- Use explicit table names.
- Use snake_case database fields.
- Disable automatic pluralization surprises.
- Define validation for required fields.
- Define decimal and integer validations.
- Do not expose password fields.
- Use model scopes for active/non-deleted rows where useful.
- Configure all associations centrally in `models/index.js`.
- Do not call `sequelize.sync({ alter: true })`.
- Use migrations as the source of truth.

---

# 20. Migration Files

Create migrations in dependency order:

```text
1. alter-roles-add-audit-columns
2. alter-users-add-audit-columns-and-last-login
3. create-products
4. create-cart-items
5. create-orders
6. create-order-items
7. create-payments
8. create-payment-logs
9. create-webhook-events
10. add-partial-indexes-and-check-constraints
```

Migration rules:

- Every migration must have `up` and `down` methods.
- `down` must safely reverse only its own changes.
- Preserve existing Part-1 data.
- Use transactions for multi-step schema changes when supported.
- Create tables before dependent foreign keys.
- Drop dependent objects in reverse order.
- Use raw SQL only for PostgreSQL features not fully supported by Sequelize CLI, such as partial indexes or complex check constraints.
- Do not use `force: true`.
- Do not drop the database.

---

# 21. Seed Data

Preserve existing role and admin-user seeders.

Add a product seeder with safe demo data:

```text
1. Interview Preparation Guide – ₹499.00
2. Node.js API Starter – ₹999.00
3. Next.js Dashboard Template – ₹1,499.00
4. Full Stack Demo Package – ₹2,499.00
```

Example fields:

```text
name
slug
sku
price
currency
is_active
created_at
updated_at
is_deleted
```

Seeder rules:

- Seed data must be idempotent where practical.
- Do not duplicate products on repeated runs.
- Do not create fake successful payments.
- Do not seed Razorpay payment IDs.
- Do not include secrets.

---

# 22. Transaction Boundaries for Future Phases

Part 2 documents these future transaction boundaries:

## Order creation transaction

```text
1. Read active cart items.
2. Lock or consistently read product prices.
3. Calculate trusted totals.
4. Create order.
5. Create order item snapshots.
6. Create initial payment row when payment creation begins.
7. Commit.
```

## Payment status transaction

```text
1. Lock payment row.
2. Check current status and idempotency.
3. Update payment.
4. Update order payment status.
5. Insert payment log.
6. Commit.
```

These flows are documented now but complete payment business logic belongs to later parts.

---

# 23. Query Rules

All normal business queries must include:

```sql
WHERE is_deleted = FALSE
```

Recommended Sequelize default scope example:

```javascript
defaultScope: {
  where: { is_deleted: false },
}
```

Use unscoped queries only for:

- Administrative recovery.
- Audit investigations.
- Duplicate checks requiring deleted-row visibility.
- Test cleanup.

Be careful with unique validation and soft-deleted records. Database partial unique indexes are the final protection.

---

# 24. Monetary Data Rules

Application display amounts:

```text
NUMERIC(12,2)
```

Razorpay API amounts:

```text
BIGINT paise
```

Conversion:

```javascript
const amountPaise = Math.round(Number(totalAmount) * 100);
```

Validation:

- Reject negative values.
- Avoid JavaScript floating-point accumulation for order totals.
- Use a decimal-safe library or integer-paise calculations in the payment phase.
- Store both application amount and paise amount in payments for clear auditing.

Example:

```text
₹499.00 = 49900 paise
```

---

# 25. Data Security and Privacy

Never store:

- Card number.
- CVV.
- Card expiry.
- UPI PIN.
- Net-banking credentials.
- OTP.
- Razorpay Key Secret.
- Webhook Secret.
- JWT token.
- Plain-text password.

Sanitize before storing:

- Razorpay error messages.
- External API request or response payloads.
- Webhook metadata.
- User-provided notes.

Use JSONB only for non-secret structured metadata.

---

# 26. Database Tests

Add tests for:

- Product model validation.
- Duplicate active SKU rejection.
- Duplicate active product slug rejection.
- Cart quantity validation.
- One active cart row per user and product.
- Order amount constraints.
- Order item line-total constraints.
- Payment Razorpay ID uniqueness.
- Webhook provider-event idempotency.
- Soft-delete query behavior.
- Model associations.
- Migration up and down behavior where practical.

Do not test actual Razorpay calls in Part 2.

---

# 27. Suggested Database Documentation

Create:

```text
docs/Part-2-Database-Design-Payment-Gateway.md
docs/database-schema.md
docs/database-relationships.md
```

Optional ER diagram:

```text
docs/images/payment-gateway-er-diagram.png
```

The textual relationship diagram in this document is mandatory even when no image is created.

---

# 28. Part-2 Deliverables

Part 2 should produce:

- Updated Role model and migration.
- Updated User model and migration.
- Product model and migration.
- CartItem model and migration.
- Order model and migration.
- OrderItem model and migration.
- Payment model and migration.
- PaymentLog model and migration.
- WebhookEvent model and migration.
- Sequelize associations.
- PostgreSQL constraints.
- Partial unique indexes.
- Search and status indexes.
- Product seed data.
- Database tests.
- Updated README database section.
- Database design documentation.

---

# 29. Part-2 Acceptance Criteria

Part 2 is complete when:

- Existing Part-1 authentication still works.
- Existing users and roles data are preserved.
- All Part-2 migrations run successfully on a clean database.
- All Part-2 migrations run successfully after Part-1 migrations.
- Seeders run successfully.
- Re-running safe seeders does not duplicate data.
- All Sequelize models load successfully.
- All documented associations work.
- Foreign keys prevent invalid references.
- Check constraints reject invalid amounts and quantities.
- Partial unique indexes support soft deletion correctly.
- Audit columns exist on all required tables.
- Soft delete works through `is_deleted`, `deleted_at`, and `deleted_by`.
- Product seed data is available.
- Database tests pass.
- Backend lint passes.
- No Razorpay Checkout or payment processing business flow is implemented.
- No secrets are added to source control.

---

# 30. Development Order

```text
1. Inspect Part-1 implementation and git status.
2. Back up or verify current migrations.
3. Update database design documentation.
4. Add common constants.
5. Alter roles with audit fields.
6. Alter users with audit fields and last_login_at.
7. Create products.
8. Create cart_items.
9. Create orders.
10. Create order_items.
11. Create payments.
12. Create payment_logs.
13. Create webhook_events.
14. Add PostgreSQL indexes and constraints.
15. Create and update Sequelize models.
16. Configure associations.
17. Add product seed data.
18. Run migrations.
19. Run seeders.
20. Run lint and tests.
21. Verify Part-1 APIs still work.
22. Commit Part 2.
```

---

# 31. Verification Commands

Windows CMD examples:

```cmd
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run lint
npm test
npm run dev
```

Useful Sequelize commands:

```cmd
npx sequelize-cli db:migrate:status
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npx sequelize-cli db:migrate:undo
```

PostgreSQL inspection:

```sql
\dt
\d roles
\d users
\d products
\d cart_items
\d orders
\d order_items
\d payments
\d payment_logs
\d webhook_events
```

---

# 32. Next Phase

The next phase may be:

```text
Part-3-Product-and-Cart-APIs.md
```

It should include:

- Product CRUD APIs.
- Product list, search, filtering, and pagination.
- Admin-only product management.
- Customer product browsing.
- Cart add, update, remove, and view APIs.
- Trusted cart total calculation.
- Swagger documentation.
- Validation and tests.

Do not start Part 3 until Part 2 acceptance criteria pass.
