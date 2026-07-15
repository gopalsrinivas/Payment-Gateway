# Payment Gateway Demo

# Part-3 – Backend APIs

---

# 1. Objective

Part 3 implements the backend business APIs for the Payment Gateway Demo by extending the Part-1 application foundation and the Part-2 PostgreSQL database design.

This phase introduces secured REST APIs for products, cart, application orders, Razorpay order creation, payment verification, payment history, webhook processing, and dashboard summaries.

The implementation must remain small, practical, secure, testable, and interview-ready.

---

# 2. Prerequisites

Before starting Part 3, confirm that:

- Part-1 authentication, JWT, Swagger, logging, error handling, Razorpay configuration, Docker, and health endpoint are working.
- Part-2 migrations and seeders run successfully.
- The following tables exist:

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

- Sequelize associations are configured.
- Admin and Customer roles exist.
- Test products are available.
- Razorpay Test Mode credentials are configured only in the backend.

---

# 3. Part-3 Scope

Implement:

- Product CRUD APIs.
- Product listing, search, filtering, sorting, and pagination.
- Customer cart APIs.
- Application order creation from trusted cart data.
- Order listing and order details.
- Razorpay order creation in Test Mode.
- Razorpay Checkout configuration response.
- Payment signature verification.
- Payment success and failure recording.
- Idempotent payment processing.
- Razorpay webhook signature verification.
- Webhook event persistence and duplicate-event protection.
- Payment history APIs.
- Dashboard summary APIs.
- Request validation.
- Authorization rules.
- Transactions for critical operations.
- Swagger documentation.
- API tests.
- Postman collection updates.

---

# 4. Out of Scope

Do not implement:

- Production Razorpay payments.
- Refund APIs.
- Settlement reconciliation.
- Subscription billing.
- Coupon management.
- Shipping and delivery management.
- Inventory reservation.
- Multi-vendor marketplace logic.
- International payments.
- Multi-currency conversion.
- Frontend payment screens.
- Background queues.
- Advanced event retry infrastructure.

---

# 5. Backend Architecture

Use the existing architecture:

```text
Route
  |
  v
Middleware
  |
  v
Validation
  |
  v
Controller
  |
  v
Service
  |
  v
Sequelize Model / Razorpay SDK
  |
  v
PostgreSQL / Razorpay Test API
```

Rules:

- Controllers must remain thin.
- Services contain business logic.
- Controllers must not directly query Sequelize models.
- Use `async/await`.
- Pass errors through centralized error middleware.
- Use transactions for order and payment state changes.
- Do not add a repository layer for this small project.

---

# 6. Common API Prefix

```text
/api/v1
```

Route groups:

```text
/api/v1/products
/api/v1/cart
/api/v1/orders
/api/v1/payments
/api/v1/webhooks
/api/v1/dashboard
```

Existing routes remain:

```text
/api/v1/auth
/api/v1/health
```

---

# 7. Authentication and Authorization

## Public APIs

```text
GET /api/v1/products
GET /api/v1/products/:id
```

## Customer or Admin APIs

```text
GET    /api/v1/cart
POST   /api/v1/cart/items
PATCH  /api/v1/cart/items/:id
DELETE /api/v1/cart/items/:id
DELETE /api/v1/cart

POST   /api/v1/orders
GET    /api/v1/orders
GET    /api/v1/orders/:id

POST   /api/v1/payments/create-order
POST   /api/v1/payments/verify
POST   /api/v1/payments/failure
GET    /api/v1/payments
GET    /api/v1/payments/:id
```

## Admin-only APIs

```text
POST   /api/v1/products
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id
GET    /api/v1/dashboard/summary
GET    /api/v1/dashboard/recent-payments
```

## Webhook API

```text
POST /api/v1/webhooks/razorpay
```

Webhook authentication uses Razorpay signature verification, not JWT.

---

# 8. Standard Response Format

Success:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "statusCode": 200
}
```

Paginated success:

```json
{
  "success": true,
  "message": "Records fetched successfully",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 0,
      "totalPages": 0,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  },
  "statusCode": 200
}
```

Error:

```json
{
  "success": false,
  "message": "Operation failed",
  "errors": [],
  "statusCode": 400,
  "requestId": "REQ-000001"
}
```

---

# 9. Product APIs

## 9.1 List Products

```text
GET /api/v1/products
```

Query parameters:

```text
page=1
limit=10
search=phone
is_active=true
min_price=100
max_price=50000
sort_by=created_at
sort_order=desc
```

Allowed sorting fields:

```text
name
price
created_at
updated_at
```

Rules:

- Return non-deleted products only.
- Public users see active products only.
- Admin may optionally request inactive products.
- Search name, SKU, slug, and description.
- Maximum page size: 100.
- Validate all filters and sorting fields.

## 9.2 Get Product

```text
GET /api/v1/products/:id
```

Rules:

- Return 404 for missing or soft-deleted product.
- Public users cannot fetch inactive products.
- Admin can fetch inactive products.

## 9.3 Create Product

```text
POST /api/v1/products
```

Role: Admin

Request:

```json
{
  "name": "Wireless Keyboard",
  "description": "Compact wireless keyboard",
  "sku": "KB-WL-001",
  "price": 1499.00,
  "currency": "INR",
  "imageUrl": "https://example.com/keyboard.jpg",
  "isActive": true
}
```

Rules:

- Generate a unique slug from name or accept a validated slug.
- SKU must be unique among non-deleted products.
- Price must be greater than zero.
- Currency is `INR` for this project.
- Set `created_by` and `updated_by` from authenticated user.

## 9.4 Update Product

```text
PATCH /api/v1/products/:id
```

Role: Admin

Rules:

- Allow partial updates.
- Do not allow ID or audit fields in request body.
- Maintain unique SKU and slug.
- Set `updated_by` from authenticated user.

## 9.5 Soft Delete Product

```text
DELETE /api/v1/products/:id
```

Role: Admin

Rules:

- Set `is_deleted = true`.
- Set `deleted_at` and `deleted_by`.
- Do not physically delete the product.
- Existing order items remain unchanged.
- Return success for the first delete.
- Repeated delete may return 404 or an idempotent success; choose one behavior and document it consistently.

---

# 10. Cart APIs

A customer has one logical active cart represented by their non-deleted `cart_items` rows.

## 10.1 View Cart

```text
GET /api/v1/cart
```

Response must include:

```text
cart item ID
product ID
product name
SKU
unit price
quantity
line total
currency
cart subtotal
item count
```

Rules:

- Fetch only the authenticated user's cart.
- Exclude deleted cart items.
- Do not expose another user's data.
- Recalculate totals from current trusted product prices.

## 10.2 Add Item to Cart

```text
POST /api/v1/cart/items
```

Request:

```json
{
  "productId": 1,
  "quantity": 2
}
```

Rules:

- Product must exist, be active, and not be deleted.
- Quantity must be between 1 and 99.
- If the product already exists in the cart, increment quantity safely.
- Do not trust product price from request.
- Set audit fields from authenticated user.

## 10.3 Update Cart Item

```text
PATCH /api/v1/cart/items/:id
```

Request:

```json
{
  "quantity": 3
}
```

Rules:

- User may update only their own cart item.
- Quantity must be between 1 and 99.
- Validate that the product is still active.

## 10.4 Remove Cart Item

```text
DELETE /api/v1/cart/items/:id
```

Rules:

- User may remove only their own cart item.
- Soft delete the cart item.
- Set deletion audit fields.

## 10.5 Clear Cart

```text
DELETE /api/v1/cart
```

Rules:

- Soft delete all active cart items belonging to the authenticated user.
- Perform in a transaction.
- Return number of removed items.

---

# 11. Order APIs

## 11.1 Create Application Order

```text
POST /api/v1/orders
```

Optional request:

```json
{
  "notes": "Demo order"
}
```

The backend must:

1. Load the authenticated user's active cart items.
2. Lock or consistently read the required rows inside a transaction.
3. Reject an empty cart.
4. Validate every product is active and non-deleted.
5. Calculate each line amount using trusted database prices.
6. Calculate subtotal and final total.
7. Generate a unique order number.
8. Create the `orders` row with initial status.
9. Copy product name, SKU, unit price, quantity, and line total into `order_items`.
10. Do not clear the cart until a successful application-order creation decision is complete.
11. Commit transaction.

Recommended initial statuses:

```text
order_status = CREATED
payment_status = PENDING
```

Order number format example:

```text
ORD-20260715-000001
```

Rules:

- Never accept amount, product price, subtotal, or total from frontend.
- Store immutable product snapshots in `order_items`.
- Return the application order and order items.

## 11.2 List Orders

```text
GET /api/v1/orders
```

Query parameters:

```text
page
limit
order_status
payment_status
from_date
to_date
sort_order
```

Rules:

- Customer sees only their orders.
- Admin may see all orders when required.
- Return non-deleted records only.
- Include basic payment status.

## 11.3 Get Order Details

```text
GET /api/v1/orders/:id
```

Rules:

- Customer can access only their order.
- Admin can access any order.
- Include order items and associated payments.
- Do not expose secret or internal-only data.

---

# 12. Payment APIs

## 12.1 Create Razorpay Order

```text
POST /api/v1/payments/create-order
```

Request:

```json
{
  "orderId": 1
}
```

Backend flow:

1. Load the application order.
2. Verify ownership unless requester is Admin.
3. Verify order is not deleted.
4. Verify order has `payment_status = PENDING` or an explicitly retryable status.
5. Confirm the order has not already been paid.
6. Convert trusted application amount to paise.
7. Create a Razorpay order using the backend SDK.
8. Create or update the local payment attempt record.
9. Store Razorpay order ID, amount, currency, status, receipt, and notes.
10. Return only safe checkout configuration.

Razorpay request example:

```javascript
{
  amount: 149900,
  currency: "INR",
  receipt: "ORD-20260715-000001",
  notes: {
    applicationOrderId: "1",
    userId: "10"
  }
}
```

Response data example:

```json
{
  "applicationOrderId": 1,
  "applicationOrderNumber": "ORD-20260715-000001",
  "paymentId": 10,
  "razorpayOrderId": "order_Example123",
  "amount": 149900,
  "currency": "INR",
  "keyId": "rzp_test_xxxxx",
  "customer": {
    "name": "Demo Customer",
    "email": "customer@example.com"
  }
}
```

Security:

- Never return `RAZORPAY_KEY_SECRET`.
- Never accept the final amount from frontend.
- Use Razorpay Test Mode only.
- Use idempotency safeguards to prevent unnecessary duplicate attempts.

## 12.2 Verify Payment

```text
POST /api/v1/payments/verify
```

Request:

```json
{
  "applicationOrderId": 1,
  "razorpayOrderId": "order_Example123",
  "razorpayPaymentId": "pay_Example123",
  "razorpaySignature": "signature-value"
}
```

Signature payload:

```text
razorpay_order_id + "|" + razorpay_payment_id
```

Verification:

```text
HMAC SHA256 using RAZORPAY_KEY_SECRET
```

Backend flow:

1. Validate request.
2. Load local order and payment record.
3. Verify ownership.
4. Confirm Razorpay order ID matches the local payment attempt.
5. Compute expected signature in backend.
6. Compare signatures using a timing-safe comparison.
7. Start a database transaction.
8. Lock payment/order rows where practical.
9. If already successfully processed, return idempotent success.
10. Mark payment as successful only after valid backend signature verification.
11. Save Razorpay payment ID and signature verification result.
12. Update order `payment_status` and `order_status`.
13. Add a payment log.
14. Clear the user's purchased cart items only after successful verification.
15. Commit transaction.

Recommended statuses:

```text
payment.status = CAPTURED or SUCCESS
order.payment_status = PAID
order.order_status = PAID
```

Invalid signature:

- Do not mark payment successful.
- Record failure reason safely.
- Return 400 or 422.
- Do not expose key secret or expected signature.

## 12.3 Record Payment Failure

```text
POST /api/v1/payments/failure
```

Request:

```json
{
  "applicationOrderId": 1,
  "razorpayOrderId": "order_Example123",
  "razorpayPaymentId": null,
  "errorCode": "BAD_REQUEST_ERROR",
  "errorDescription": "Payment cancelled or failed",
  "errorSource": "checkout",
  "errorStep": "payment_authentication",
  "errorReason": "payment_cancelled"
}
```

Rules:

- Validate ownership.
- Do not trust this endpoint to decide final success.
- Store sanitized failure information.
- Mark local attempt as failed when appropriate.
- Keep order eligible for a safe retry unless business rules say otherwise.
- Do not store card number, CVV, expiry, OTP, or full sensitive payloads.

## 12.4 List Payment History

```text
GET /api/v1/payments
```

Query parameters:

```text
page
limit
status
order_id
from_date
to_date
search
```

Rules:

- Customer sees only their payments.
- Admin may see all payments.
- Return safe fields only.
- Support pagination.

## 12.5 Get Payment Details

```text
GET /api/v1/payments/:id
```

Rules:

- Customer may access only their payment.
- Admin may access any payment.
- Include associated order summary and sanitized logs.
- Do not return secrets or sensitive payment instrument data.

---

# 13. Razorpay Webhook API

```text
POST /api/v1/webhooks/razorpay
```

Required header:

```text
X-Razorpay-Signature
```

Critical requirement:

- Verify the signature against the exact raw request body using `RAZORPAY_WEBHOOK_SECRET`.
- Do not verify against a re-serialized JSON object.

Recommended supported events:

```text
payment.authorized
payment.captured
payment.failed
order.paid
```

Webhook flow:

1. Read raw request body.
2. Validate signature header.
3. Compute and verify webhook signature.
4. Parse payload only after safe raw-body availability.
5. Extract Razorpay event ID or derive a stable deduplication key.
6. Persist the webhook event.
7. If the event already exists, return idempotent 200.
8. Process supported event types.
9. Locate payment/order using trusted Razorpay IDs and notes.
10. Apply monotonic state transitions.
11. Do not downgrade a successful payment to pending or failed because of an older event.
12. Add payment log entries.
13. Mark webhook processing result.
14. Return 200 promptly after successful processing.

Webhook events must store:

```text
event_id
event_type
entity
payload
signature
signature_verified
processing_status
processed_at
error_message
```

Payload security:

- Store only what is needed for audit and troubleshooting.
- Mask or omit sensitive values.
- Never log secrets.

---

# 14. Payment State Rules

Recommended payment states:

```text
CREATED
PENDING
AUTHORIZED
CAPTURED
FAILED
```

Recommended order payment states:

```text
PENDING
PAID
FAILED
```

Allowed progression example:

```text
CREATED -> PENDING -> AUTHORIZED -> CAPTURED
CREATED -> PENDING -> FAILED
FAILED  -> PENDING for a new retry attempt
```

Rules:

- Successful states must be idempotent.
- A captured payment must not be reverted by an outdated failed event.
- Store each retry as a separate payment attempt when practical.
- Use unique constraints for Razorpay order ID and Razorpay payment ID when non-null.

---

# 15. Dashboard APIs

## 15.1 Dashboard Summary

```text
GET /api/v1/dashboard/summary
```

Role: Admin

Return:

```text
total products
active products
total orders
pending orders
paid orders
successful payments
failed payments
pending payments
total collected amount
orders created today
payments completed today
```

Rules:

- Exclude soft-deleted rows.
- Total collected amount includes successful/captured payments only.
- Use aggregate queries.
- Do not load all rows into application memory.

## 15.2 Recent Payments

```text
GET /api/v1/dashboard/recent-payments?limit=10
```

Role: Admin

Rules:

- Maximum limit: 50.
- Include safe customer, order, amount, status, and date fields.

---

# 16. Validation Requirements

Use `express-validator`.

Validate:

- Route parameters are positive integers.
- Pagination values are valid.
- Sort fields come from an allowlist.
- Product name, SKU, price, currency, and status.
- Cart quantity range.
- Order IDs and payment IDs.
- Razorpay IDs are non-empty strings with reasonable maximum lengths.
- Signature is required for verification.
- Date ranges are valid and `from_date <= to_date`.
- Unknown fields may be rejected for sensitive endpoints.

Return field-level errors using the common response format.

---

# 17. Database Transaction Requirements

Use Sequelize transactions for:

- Creating an application order and its order items.
- Clearing a cart.
- Creating or updating a local payment attempt with Razorpay order details.
- Verifying payment and updating payment, order, logs, and cart.
- Processing a webhook that updates multiple tables.

Rules:

- Roll back all related changes on failure.
- Keep external Razorpay API calls outside a long-running database lock when possible.
- Use a two-step flow when needed: validate data, call Razorpay, then persist result safely.
- Prevent race conditions using row locks, unique constraints, and idempotent checks.

---

# 18. Idempotency and Duplicate Protection

Required safeguards:

- Do not create duplicate successful payment records for the same Razorpay payment ID.
- Repeated payment verification must return the existing successful result.
- Repeated webhook delivery must not repeat business updates.
- Use unique indexes for external IDs where appropriate.
- Use a unique webhook event ID or deterministic deduplication key.
- Use request or operation identifiers in logs.
- Do not rely only on frontend state.

---

# 19. Audit and Soft Delete Rules

For authenticated create/update/delete operations:

```text
created_by = req.user.id
updated_by = req.user.id
deleted_by = req.user.id
```

Soft delete:

```text
is_deleted = true
deleted_at = current timestamp
deleted_by = authenticated user ID
```

Normal API queries must exclude soft-deleted rows.

Payment and webhook records should normally not be deleted through public APIs.

---

# 20. Logging Requirements

Use Winston and request IDs.

Log:

- Product create, update, and delete.
- Cart mutations.
- Application order creation.
- Razorpay order creation attempt and result.
- Payment verification attempt and result.
- Payment failure.
- Webhook receipt, signature result, event type, and processing result.
- Database transaction failures.
- External Razorpay API failures.

Do not log:

- Passwords.
- JWT tokens.
- Razorpay Key Secret.
- Webhook Secret.
- Full payment signatures.
- Card numbers.
- CVV.
- OTP.
- Complete sensitive payloads.

Use masked Razorpay IDs where appropriate in error logs.

---

# 21. Error Handling

Handle:

- Validation errors: 400.
- Missing/invalid JWT: 401.
- Insufficient role: 403.
- Resource not found: 404.
- Duplicate SKU/slug/external ID: 409.
- Invalid payment state: 409.
- Invalid payment signature: 400 or 422.
- Razorpay request errors: map safely to 400, 402, 409, 429, or 502 as appropriate.
- Database errors: safe 500 response.
- Webhook signature failure: 400.
- Unsupported webhook event: acknowledge safely according to documented policy.

Do not expose stack traces in production.

---

# 22. Required Backend Files

Create or update as appropriate:

```text
backend/src/controllers/productController.js
backend/src/controllers/cartController.js
backend/src/controllers/orderController.js
backend/src/controllers/paymentController.js
backend/src/controllers/webhookController.js
backend/src/controllers/dashboardController.js

backend/src/services/productService.js
backend/src/services/cartService.js
backend/src/services/orderService.js
backend/src/services/paymentService.js
backend/src/services/webhookService.js
backend/src/services/dashboardService.js

backend/src/routes/productRoutes.js
backend/src/routes/cartRoutes.js
backend/src/routes/orderRoutes.js
backend/src/routes/paymentRoutes.js
backend/src/routes/webhookRoutes.js
backend/src/routes/dashboardRoutes.js
backend/src/routes/index.js

backend/src/validations/productValidation.js
backend/src/validations/cartValidation.js
backend/src/validations/orderValidation.js
backend/src/validations/paymentValidation.js
backend/src/validations/commonValidation.js

backend/src/utils/paymentSignature.js
backend/src/utils/orderNumber.js
backend/src/utils/pagination.js
backend/src/utils/queryHelpers.js
backend/src/utils/constants.js

backend/src/swagger/product.yaml or equivalent
backend/src/swagger/cart.yaml or equivalent
backend/src/swagger/order.yaml or equivalent
backend/src/swagger/payment.yaml or equivalent
backend/src/swagger/dashboard.yaml or equivalent

backend/tests/products.test.js
backend/tests/cart.test.js
backend/tests/orders.test.js
backend/tests/payments.test.js
backend/tests/webhooks.test.js
backend/tests/dashboard.test.js
```

Preserve the repository's existing naming and Swagger approach when different.

---

# 23. Swagger Documentation

Swagger remains available at:

```text
http://localhost:5000/api-docs
```

Document:

- Authentication requirements.
- Role requirements.
- Request schemas.
- Response schemas.
- Pagination.
- Validation errors.
- Product APIs.
- Cart APIs.
- Order APIs.
- Payment APIs.
- Dashboard APIs.
- Razorpay webhook endpoint.
- Example Test Mode payloads.

Never include real secrets in Swagger examples.

---

# 24. Testing Requirements

Use the existing Node test setup and Supertest.

## Product tests

- Public product list works.
- Admin creates product.
- Customer cannot create product.
- Duplicate SKU is rejected.
- Admin updates product.
- Admin soft deletes product.
- Deleted product does not appear publicly.

## Cart tests

- Customer adds active product.
- Duplicate add increments quantity.
- Invalid quantity is rejected.
- Customer cannot modify another user's cart.
- Cart total uses database price.
- Item removal is soft delete.
- Clear cart works.

## Order tests

- Empty cart order is rejected.
- Order is created from cart.
- Frontend amount is ignored or rejected.
- Order items preserve product snapshots.
- Customer sees only own orders.
- Admin can view all orders.

## Payment tests

- Razorpay order creation uses trusted amount.
- Key Secret is never returned.
- Valid signature marks payment successful.
- Invalid signature does not mark success.
- Repeated verification is idempotent.
- Duplicate Razorpay payment ID is prevented.
- Payment failure is recorded safely.

Mock Razorpay SDK calls in automated tests.

## Webhook tests

- Valid signature is accepted.
- Invalid signature is rejected.
- Raw body is used.
- Duplicate event is idempotent.
- Captured event updates payment/order.
- Old failed event does not downgrade successful payment.

## Dashboard tests

- Customer cannot access Admin dashboard.
- Summary counts are correct.
- Collected amount includes only successful payments.

Clean up test-created data safely without dropping the database.

---

# 25. Postman Collection

Update or create:

```text
postman/Payment-Gateway-Part-3.postman_collection.json
postman/Payment-Gateway-Local.postman_environment.json
```

Include:

- Login and token storage.
- Product CRUD.
- Cart flow.
- Order creation.
- Razorpay order creation.
- Payment verification sample.
- Payment failure sample.
- Payment history.
- Dashboard.
- Webhook sample documentation.

Use placeholders for secrets and Test Mode IDs.

---

# 26. Security Requirements

- Razorpay Test Mode only.
- Backend calculates all amounts.
- Never expose Razorpay Key Secret.
- Verify checkout signatures in backend.
- Verify webhook signatures using raw body.
- Use timing-safe signature comparison.
- Enforce ownership checks.
- Enforce role checks.
- Validate all input.
- Use parameterized Sequelize queries.
- Do not store payment instrument secrets.
- Add reasonable rate limiting to login and payment-order creation if it fits the existing project.
- Keep CORS restricted to configured frontend origin.
- Keep Helmet enabled.
- Prevent mass assignment of audit and status fields.
- Do not trust frontend payment success callbacks as final truth.

---

# 27. Part-3 Deliverables

Part 3 should produce:

- Product APIs.
- Cart APIs.
- Order APIs.
- Razorpay Test Mode order creation.
- Payment verification API.
- Payment failure API.
- Payment history APIs.
- Razorpay webhook processing.
- Dashboard APIs.
- Validation modules.
- Services and controllers.
- Swagger updates.
- Tests.
- Postman collection.
- README updates.

---

# 28. Part-3 Acceptance Criteria

Part 3 is complete when:

- Backend starts successfully.
- Existing authentication remains working.
- Product CRUD works with role authorization.
- Cart APIs enforce ownership.
- Cart totals use trusted database prices.
- Application orders are created transactionally.
- Order items store immutable product snapshots.
- Razorpay Test order creation works.
- Razorpay Key Secret is never exposed.
- Payment signature verification works.
- Invalid signatures cannot mark payments successful.
- Payment verification is idempotent.
- Payment failure is stored safely.
- Payment history respects ownership and roles.
- Webhook signature uses raw request body.
- Duplicate webhooks are idempotent.
- Successful payment state cannot be downgraded by stale events.
- Dashboard aggregates are correct.
- Swagger documents all Part-3 APIs.
- Backend lint passes.
- Backend tests pass.
- Existing frontend build remains unaffected.
- Docker Compose remains valid.

---

# 29. Recommended Development Order

```text
1. Inspect Part-1 and Part-2 implementation
2. Run existing lint and tests
3. Add common pagination and validation helpers
4. Implement Product APIs
5. Implement Cart APIs
6. Implement Application Order APIs
7. Implement Razorpay order creation
8. Implement payment signature verification
9. Implement payment failure recording
10. Implement payment history
11. Implement webhook processing
12. Implement dashboard APIs
13. Update Swagger
14. Add tests and mocks
15. Update Postman collection
16. Run migrations and seeders
17. Run full verification
18. Commit Part 3
```

---

# 30. Next Phase

The next phase can be:

```text
Part-4 – Frontend Integration and Razorpay Checkout UI
```

It should include:

- Product screens.
- Cart screens.
- Checkout flow.
- Razorpay Checkout integration.
- Payment success and failure pages.
- Orders and payment history screens.
- Admin product management screens.
- Dashboard UI.
