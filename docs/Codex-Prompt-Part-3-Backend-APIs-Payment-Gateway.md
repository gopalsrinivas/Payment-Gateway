# Codex Prompt – Part 3

# Payment Gateway Demo Backend APIs

## Objective

You are a Senior Full Stack Developer.

Continue the existing Payment Gateway Demo repository and implement ONLY Part 3: Backend APIs.

Read the repository and all existing documentation completely before making changes.

Use these files as the main specifications:

```text
docs/Part-1-Project-Setup-Payment-Gateway.md
docs/Part-2-Database-Design-Payment-Gateway.md
docs/Part-3-Backend-APIs-Payment-Gateway.md
```

Part 3 must implement secured backend APIs for products, cart, application orders, Razorpay Test Mode order creation, payment verification, payment failure recording, payment history, Razorpay webhook processing, and Admin dashboard summaries.

Do not implement frontend product, cart, checkout, order, payment, or dashboard screens in this phase.

---

# Critical Repository Rules

- Inspect the current repository first.
- Run `git status` before editing.
- Read all Part-1, Part-2, and Part-3 documentation.
- Preserve correct existing files.
- Do not overwrite working authentication or database code.
- Do not delete existing documentation.
- Use migrations as the schema source of truth.
- Do not use `sequelize.sync({ force: true })`.
- Do not use `sequelize.sync({ alter: true })`.
- Do not drop the database.
- Preserve existing users, roles, products, and test data.
- Do not hardcode credentials.
- Do not commit real `.env` files.
- Use Razorpay Test Mode only.
- Keep the code small, clear, secure, and interview-friendly.
- Do not add unnecessary enterprise layers.

---

# Required Architecture

Use:

```text
Route
  -> Middleware
  -> Validation
  -> Controller
  -> Service
  -> Sequelize Model / Razorpay SDK
  -> PostgreSQL / Razorpay Test API
```

Rules:

- Controllers must be thin.
- Controllers must not perform direct Sequelize queries.
- Services contain business logic.
- Use `async/await`.
- Use centralized error handling.
- Use transactions for multi-table business operations.
- Do not add a repository layer.
- Reuse existing response, logging, auth, role, request ID, and error helpers.

---

# Part-3 Scope

Implement:

```text
Product CRUD APIs
Product list/search/filter/sort/pagination
Cart APIs
Application Order APIs
Razorpay Test order creation
Payment signature verification
Payment failure recording
Payment history APIs
Razorpay webhook processing
Admin dashboard APIs
Validation
Authorization and ownership checks
Transactions
Idempotency
Swagger
Backend tests
Postman collection
README updates
```

Do not implement:

```text
Frontend business screens
Refunds
Settlements
Subscriptions
Coupons
Shipping
Inventory reservation
Multi-vendor logic
Production credentials
Background job infrastructure
```

---

# Existing Database Models

Inspect and use:

```text
Role
User
Product
CartItem
Order
OrderItem
Payment
PaymentLog
WebhookEvent
```

Confirm associations are correctly configured before implementing APIs.

Normal queries must exclude rows where:

```text
is_deleted = true
```

Use audit fields:

```text
created_by
updated_by
deleted_by
```

from the authenticated user where applicable.

---

# Required Backend Files

Create or update files according to the existing repository conventions.

Expected controllers:

```text
backend/src/controllers/productController.js
backend/src/controllers/cartController.js
backend/src/controllers/orderController.js
backend/src/controllers/paymentController.js
backend/src/controllers/webhookController.js
backend/src/controllers/dashboardController.js
```

Expected services:

```text
backend/src/services/productService.js
backend/src/services/cartService.js
backend/src/services/orderService.js
backend/src/services/paymentService.js
backend/src/services/webhookService.js
backend/src/services/dashboardService.js
```

Expected routes:

```text
backend/src/routes/productRoutes.js
backend/src/routes/cartRoutes.js
backend/src/routes/orderRoutes.js
backend/src/routes/paymentRoutes.js
backend/src/routes/webhookRoutes.js
backend/src/routes/dashboardRoutes.js
```

Expected validations:

```text
backend/src/validations/productValidation.js
backend/src/validations/cartValidation.js
backend/src/validations/orderValidation.js
backend/src/validations/paymentValidation.js
backend/src/validations/commonValidation.js
```

Expected utilities:

```text
backend/src/utils/paymentSignature.js
backend/src/utils/orderNumber.js
backend/src/utils/pagination.js
backend/src/utils/queryHelpers.js
```

Expected tests:

```text
backend/tests/products.test.js
backend/tests/cart.test.js
backend/tests/orders.test.js
backend/tests/payments.test.js
backend/tests/webhooks.test.js
backend/tests/dashboard.test.js
```

Preserve different but correct existing naming instead of duplicating files.

---

# Route Registration

Register these route groups under `/api/v1`:

```text
/products
/cart
/orders
/payments
/webhooks
/dashboard
```

Preserve existing:

```text
/auth
/health
```

Do not break raw-body handling for the Razorpay webhook route.

---

# Product APIs

Implement:

```text
GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id
```

Authorization:

- List and details are public for active, non-deleted products.
- Create, update, and delete are Admin-only.
- Admin may view inactive products where documented.

List API must support:

```text
page
limit
search
is_active
min_price
max_price
sort_by
sort_order
```

Requirements:

- Maximum `limit` is 100.
- Search name, slug, SKU, and description.
- Sort fields must use an allowlist.
- Price must be greater than zero.
- Currency is INR.
- SKU and slug must be unique among non-deleted rows.
- Generate a slug safely when not supplied.
- Use soft delete.
- Prevent mass assignment of audit fields.

---

# Cart APIs

Implement:

```text
GET    /api/v1/cart
POST   /api/v1/cart/items
PATCH  /api/v1/cart/items/:id
DELETE /api/v1/cart/items/:id
DELETE /api/v1/cart
```

Requirements:

- JWT required.
- Customer or Admin role allowed.
- Users can access only their own cart.
- Validate product is active and not deleted.
- Quantity range: 1 to 99.
- Duplicate product add must increment existing quantity safely.
- Never accept product price from frontend.
- Recalculate cart totals using trusted Product prices.
- Use soft delete for item removal.
- Clear cart inside a transaction.
- Return item count, subtotal, line totals, and currency.

---

# Application Order APIs

Implement:

```text
POST /api/v1/orders
GET  /api/v1/orders
GET  /api/v1/orders/:id
```

Order creation requirements:

1. Load authenticated user's active cart.
2. Reject an empty cart.
3. Validate all products.
4. Calculate amounts from trusted database values.
5. Generate a unique order number.
6. Create Order and OrderItems in one transaction.
7. Store immutable product snapshot values in OrderItems.
8. Set initial order and payment status.
9. Never trust amount or price from request.
10. Return created order with items.

Recommended initial values:

```text
order_status = CREATED
payment_status = PENDING
```

List and detail requirements:

- Customer sees only own orders.
- Admin may see all orders.
- Support pagination and documented filters.
- Details include order items and safe payment summary.

---

# Razorpay Order Creation API

Implement:

```text
POST /api/v1/payments/create-order
```

Request:

```json
{
  "orderId": 1
}
```

Requirements:

- JWT required.
- Verify ownership unless Admin.
- Load trusted application Order total.
- Verify order is not already paid.
- Convert rupees to paise without floating-point errors.
- Create a Razorpay Test Mode order using the backend SDK.
- Persist a local Payment attempt.
- Store Razorpay order ID, receipt, amount, currency, and status.
- Return safe checkout data and only the Razorpay Key ID.
- Never expose Razorpay Key Secret.
- Prevent unnecessary duplicate active payment attempts.
- Handle Razorpay errors safely.

Do not accept the final amount from frontend.

---

# Payment Verification API

Implement:

```text
POST /api/v1/payments/verify
```

Required request fields:

```text
applicationOrderId
razorpayOrderId
razorpayPaymentId
razorpaySignature
```

Verification input:

```text
razorpayOrderId + "|" + razorpayPaymentId
```

Use:

```text
HMAC SHA256 with RAZORPAY_KEY_SECRET
```

Requirements:

- Verify signature only in backend.
- Use timing-safe comparison.
- Confirm Razorpay order ID matches local Payment row.
- Verify user ownership.
- Use a transaction for Payment, Order, PaymentLog, and Cart updates.
- Lock rows where useful.
- Mark success only after valid signature verification.
- Store Razorpay payment ID.
- Update Order payment and order status.
- Add a PaymentLog record.
- Clear purchased cart items after successful verification.
- Repeated verification must return idempotent success.
- Invalid signature must never mark payment successful.
- Do not expose expected signatures or secrets.

---

# Payment Failure API

Implement:

```text
POST /api/v1/payments/failure
```

Requirements:

- Verify authenticated user owns the application order/payment.
- Accept only documented sanitized error fields.
- Do not store card data, CVV, OTP, expiry, or full sensitive payloads.
- Mark the local attempt failed where valid.
- Add a PaymentLog.
- Keep the order retryable when appropriate.
- Do not use this endpoint as proof of final payment status.

---

# Payment History APIs

Implement:

```text
GET /api/v1/payments
GET /api/v1/payments/:id
```

Requirements:

- JWT required.
- Customer sees only own payments.
- Admin may see all payments.
- Support pagination and documented filters.
- Return only safe payment fields.
- Details may include safe order summary and sanitized logs.
- Never return secrets, raw signatures, or payment instrument data.

---

# Razorpay Webhook Processing

Implement:

```text
POST /api/v1/webhooks/razorpay
```

Critical requirements:

- Use the exact raw request body.
- Read `X-Razorpay-Signature`.
- Verify with `RAZORPAY_WEBHOOK_SECRET`.
- Do not verify a JSON-stringified parsed body.
- Reject invalid signatures.
- Persist webhook event data.
- Prevent duplicate event processing.
- Return idempotent 200 for already processed valid events.

Support at minimum:

```text
payment.authorized
payment.captured
payment.failed
order.paid
```

Processing requirements:

- Locate local Order and Payment using trusted Razorpay IDs or notes.
- Use transactions for multi-table updates.
- Add PaymentLog entries.
- Store processing result and error message.
- Use monotonic state transitions.
- Never downgrade a captured/successful payment because of a stale failed event.
- Do not log secrets or full sensitive payloads.

The webhook route must not break normal JSON routes.

---

# Dashboard APIs

Implement Admin-only:

```text
GET /api/v1/dashboard/summary
GET /api/v1/dashboard/recent-payments
```

Summary must return:

```text
totalProducts
activeProducts
totalOrders
pendingOrders
paidOrders
successfulPayments
failedPayments
pendingPayments
totalCollectedAmount
ordersCreatedToday
paymentsCompletedToday
```

Requirements:

- Use aggregate database queries.
- Exclude soft-deleted records.
- Collected amount includes successful/captured payments only.
- Do not load complete tables into memory.
- Recent payments maximum limit is 50.

---

# Validation

Use `express-validator` and existing validation middleware.

Validate:

- Positive integer IDs.
- Pagination.
- Allowed sort fields and directions.
- Product fields.
- Price and quantity ranges.
- Currency.
- Razorpay identifiers.
- Signature presence and length.
- Date filters and ranges.
- Status values using constants.

Return field-level errors in the existing common response format.

Reject or ignore unknown sensitive fields consistently.

---

# Transactions and Concurrency

Use Sequelize transactions for:

```text
Order + OrderItems creation
Cart clear
Payment verification updates
Webhook business updates
Multi-table payment failure updates where needed
```

Requirements:

- Roll back all related database changes on failure.
- Avoid keeping a database transaction open during a slow Razorpay network request where possible.
- Use unique constraints and row locks to prevent duplicate processing.
- Handle race conditions between frontend verification and webhook processing.
- Both flows must be idempotent and converge to the same final state.

---

# Idempotency

Implement safeguards for:

- Duplicate payment verification.
- Duplicate Razorpay payment IDs.
- Duplicate Razorpay order IDs.
- Repeated webhook delivery.
- Repeated successful callbacks.
- Multiple clicks on Create Payment Order.

Use database unique constraints plus service-level checks.

Do not rely only on in-memory flags.

---

# Audit and Soft Delete

For creates:

```text
created_by = req.user.id
updated_by = req.user.id
```

For updates:

```text
updated_by = req.user.id
```

For soft deletes:

```text
is_deleted = true
deleted_at = current timestamp
deleted_by = req.user.id
```

Normal queries must exclude deleted rows.

Do not expose delete APIs for payment logs or webhook events.

---

# Security Requirements

- Razorpay Test Mode only.
- Never expose Key Secret or Webhook Secret.
- Never trust frontend amount or payment status.
- Verify payment signatures in backend.
- Verify webhooks with raw body.
- Use timing-safe comparison.
- Enforce JWT, role, and resource ownership.
- Prevent mass assignment.
- Validate every input.
- Keep Helmet and CORS enabled.
- Use existing password and JWT security unchanged.
- Do not store card number, CVV, OTP, expiry, or bank credentials.
- Do not log JWT tokens or complete signatures.
- Use rate limiting for sensitive endpoints if it fits the existing project safely.

---

# Logging

Use Winston and request IDs.

Log safely:

```text
product mutations
cart mutations
application order creation
Razorpay order creation result
payment verification result
payment failure
webhook signature result
webhook event type and processing status
transaction failures
external API failures
```

Do not log:

```text
passwords
JWT tokens
Razorpay Key Secret
Webhook Secret
full signatures
card data
CVV
OTP
complete sensitive payloads
```

---

# Swagger

Update Swagger at:

```text
http://localhost:5000/api-docs
```

Document all Part-3 routes with:

- JWT bearer requirements.
- Admin requirements.
- Request schemas.
- Query parameters.
- Pagination schemas.
- Success examples.
- Error examples.
- Razorpay Test Mode examples using placeholders.
- Webhook raw-body and signature header requirements.

Do not place real credentials in examples.

---

# Tests

Use the current Node test framework and Supertest.

Mock Razorpay SDK network calls.

Required test coverage:

## Products

- Public list.
- Admin create/update/delete.
- Customer denied for Admin actions.
- Duplicate SKU rejected.
- Soft-deleted product hidden.

## Cart

- Add item.
- Duplicate add increments quantity.
- Update quantity.
- Ownership enforcement.
- Trusted-price total.
- Remove item.
- Clear cart.

## Orders

- Empty cart rejected.
- Transactional order creation.
- Trusted amount calculation.
- Product snapshot preserved.
- Customer isolation.
- Admin access.

## Payments

- Razorpay order amount uses database total.
- Key Secret not returned.
- Valid signature success.
- Invalid signature rejected.
- Repeated verification idempotent.
- Duplicate payment ID prevented.
- Failure recorded safely.

## Webhooks

- Valid signature accepted.
- Invalid signature rejected.
- Exact raw body used.
- Duplicate event idempotent.
- Captured event updates records.
- Stale failure cannot downgrade success.

## Dashboard

- Admin access works.
- Customer denied.
- Aggregates correct.
- Collected total includes only successful payments.

Preserve and run all existing Part-1 and Part-2 tests.

---

# Postman

Create or update:

```text
postman/Payment-Gateway-Part-3.postman_collection.json
postman/Payment-Gateway-Local.postman_environment.json
```

Include login token automation and all Part-3 routes.

Use placeholders for Razorpay IDs and signatures.

---

# README

Update the root and backend README as needed.

Document:

- Part-3 scope.
- API list.
- Role rules.
- Database migration and seeding commands.
- Razorpay Test Mode setup.
- Webhook setup and raw-body requirement.
- Local run commands.
- Test commands.
- Swagger URL.
- Postman usage.
- Known limitations.
- Next phase.

Clearly state that frontend checkout UI belongs to Part 4.

---

# Before Making Changes

1. Run `git status`.
2. Inspect the repository tree.
3. Read all three documentation files completely.
4. Inspect existing routes, controllers, services, models, middleware, tests, and Swagger.
5. Run existing backend lint and tests.
6. Inspect existing migrations and seeders.
7. Confirm database schema and associations.
8. Summarize the implementation plan.
9. List files expected to be created or modified.
10. Identify conflicts before editing.

---

# After Implementation

1. List created files.
2. List modified files.
3. Run backend lint.
4. Run all backend tests.
5. Run migrations.
6. Run seeders.
7. Start backend.
8. Verify health endpoint.
9. Verify Swagger.
10. Verify Product APIs.
11. Verify Cart APIs.
12. Verify Order APIs.
13. Verify Razorpay Test order creation with mocked or configured Test Mode client.
14. Verify valid and invalid payment signatures.
15. Verify idempotent payment verification.
16. Verify payment history authorization.
17. Verify webhook raw-body signature processing.
18. Verify duplicate webhook handling.
19. Verify dashboard authorization and totals.
20. Confirm Key Secret and Webhook Secret are not exposed.
21. Confirm no frontend business screens were added.
22. Run frontend lint and production build to ensure no regression.
23. Validate Docker Compose.
24. Provide exact Windows CMD commands.
25. List remaining manual Razorpay dashboard steps.
26. Do not start Part 4.

---

# Acceptance Criteria

Part 3 is complete only when:

- Existing authentication still works.
- All database migrations and seeders work.
- Product CRUD and public listing work.
- Role authorization is enforced.
- Cart ownership is enforced.
- Cart totals use trusted database prices.
- Application orders are created transactionally.
- Order item snapshots are stored.
- Razorpay Test order creation uses trusted amounts.
- Razorpay Key Secret remains backend-only.
- Valid payment signatures succeed.
- Invalid payment signatures cannot mark success.
- Payment verification is idempotent.
- Payment failure recording is safe.
- Payment history respects ownership and roles.
- Webhook verification uses exact raw body.
- Invalid webhook signatures are rejected.
- Duplicate webhook events are idempotent.
- Successful payment status cannot be downgraded by stale events.
- Dashboard aggregates are correct.
- Swagger covers all Part-3 APIs.
- Backend lint passes.
- All backend tests pass.
- Frontend lint and build still pass.
- Docker Compose remains valid.
- No Part-4 frontend business implementation was added.

---

# Final Output Format

Provide:

```text
## Summary
## Repository Inspection
## Files Created
## Files Modified
## Route Summary
## Product APIs
## Cart APIs
## Order APIs
## Razorpay Order Creation
## Payment Verification
## Payment Failure Handling
## Payment History
## Webhook Processing
## Dashboard APIs
## Security and Idempotency
## Swagger
## Tests
## Verification Results
## Windows CMD Commands
## Remaining Manual Steps
## Part-4 Readiness
```
