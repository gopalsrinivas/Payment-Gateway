# Codex Prompt – Part 5

# Razorpay Integration for Payment Gateway Demo

## Objective

You are a Senior Full Stack Developer.

Implement ONLY Part 5 of the existing Payment Gateway Demo application.

Read all existing documentation and inspect the complete repository before changing files.

Use these documents as the specifications, in this order:

```text
docs/Part-1-Project-Setup-Payment-Gateway.md
docs/Part-2-Database-Design-Payment-Gateway.md
docs/Part-3-Backend-APIs-Payment-Gateway.md
docs/Part-4-Frontend-Payment-Gateway.md
docs/Part-5-Razorpay-Integration-Payment-Gateway.md
```

Part 5 must complete and harden Razorpay Test Mode integration across the existing backend and frontend without redesigning correct Parts 1-4 implementation.

---

# Mandatory Repository Inspection

Before coding:

1. Run `git status`.
2. Inspect the root, backend, frontend, docs, postman, tests, and Docker files.
3. Read all five part documents completely.
4. Inspect existing Sequelize models, migrations, associations, constraints, and seeders.
5. Inspect payment, order, cart, webhook, logging, Swagger, and error-handling code.
6. Inspect frontend checkout, payment services, contexts, hooks, and result pages.
7. Inspect current tests and package scripts.
8. Identify existing functionality that is correct and must be preserved.
9. Identify conflicts between documentation and actual code.
10. Provide a concise implementation plan.
11. List files expected to be created or modified.
12. Do not modify files until the inspection summary is complete.

Do not overwrite correct code blindly.

---

# Scope

Implement or complete:

- Razorpay Test Mode configuration validation.
- Server-side Razorpay order creation.
- Trusted amount calculation from PostgreSQL order data.
- Paise conversion using integer-safe logic.
- Checkout.js loading and initialization.
- Checkout success handler.
- Backend payment signature verification.
- Frontend payment failure reporting.
- Raw-body Razorpay webhook verification.
- Supported webhook event processing.
- Duplicate and replay protection.
- Idempotent payment verification.
- Safe order/payment status transitions.
- Payment and webhook audit logging.
- Optional Admin reconciliation endpoint only when it fits the existing design cleanly.
- Swagger and Postman updates.
- Backend and frontend tests.
- README and `.env.example` updates.

---

# Strict Out-of-Scope Rules

Do not implement:

- Razorpay Live Mode.
- Refund APIs or UI.
- Settlements.
- Subscription billing.
- Payment Links.
- Marketplace split payments.
- Multi-currency UI.
- Card storage.
- Production bank payouts.
- Large background-job infrastructure.
- Unrelated UI redesign.
- New repository layer.
- Replacement of Sequelize, Express, Next.js, Axios, or the existing architecture.

Do not start Part 6.

---

# Technology and Architecture

Preserve the existing stack:

## Backend

```text
Node.js
Express.js
Sequelize ORM
PostgreSQL
Razorpay Node SDK
JWT
express-validator
Winston
Swagger
```

## Frontend

```text
Next.js App Router
React
JavaScript
Tailwind CSS
Axios
React Hook Form
React Hot Toast
Razorpay Checkout.js
```

Use the existing backend flow:

```text
Route -> Middleware -> Validation -> Controller -> Service -> Model / Razorpay SDK
```

Rules:

- Keep controllers thin.
- Keep business logic in services.
- Do not query Sequelize directly from controllers.
- Use `async/await`.
- Use centralized errors and standard responses.
- Use database transactions for critical local state changes.
- Do not add a repository layer.

---

# Environment Configuration

Verify or add safe examples:

## Backend

```env
RAZORPAY_KEY_ID=rzp_test_replace_me
RAZORPAY_KEY_SECRET=replace_with_test_secret
RAZORPAY_WEBHOOK_SECRET=replace_with_webhook_secret
RAZORPAY_CURRENCY=INR
RAZORPAY_COMPANY_NAME=Payment Gateway Demo
RAZORPAY_CHECKOUT_DESCRIPTION=Test payment
PAYMENT_VERIFY_MAX_AGE_MINUTES=30
```

## Frontend

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_replace_me
NEXT_PUBLIC_APP_NAME=Payment Gateway Demo
```

Mandatory rules:

- Never expose Key Secret or Webhook Secret to frontend code.
- Never commit real credentials.
- Never log secrets.
- Use Test Mode only.
- Validate required backend configuration clearly.
- Keep tests independent of real credentials.

---

# Razorpay Configuration

Inspect and harden:

```text
backend/src/config/razorpay.js
```

Requirements:

- Create one reusable Razorpay client.
- Load credentials only through the environment configuration layer.
- Validate missing values.
- Avoid logging secrets.
- Permit test mocking through dependency injection or a controlled module mock.
- Do not instantiate a new client repeatedly per request unless the existing architecture requires it.

---

# Currency Utility

Create or reuse an integer-safe helper such as:

```text
backend/src/utils/currency.js
```

Requirements:

- Convert trusted INR amounts to paise.
- Reject invalid, negative, non-finite, or unsupported values.
- Avoid floating-point rounding errors.
- Add unit tests.

Example:

```text
500.00 INR -> 50000 paise
```

Prefer storing or calculating monetary values in integer minor units when compatible with the current schema.

---

# Create Razorpay Order API

Implement or complete:

```text
POST /api/v1/payments/create-order
```

Request:

```json
{
  "orderId": 101
}
```

Do not accept an authoritative amount from the frontend.

Service requirements:

1. Authenticate user.
2. Validate order ID.
3. Fetch the non-deleted application order and order-item snapshots.
4. Enforce customer ownership or Admin access.
5. Reject non-payable or already-paid orders.
6. Recalculate amount from trusted database data.
7. Convert to paise.
8. Detect an existing reusable unpaid Razorpay order.
9. Prevent uncontrolled concurrent duplicate attempts using database constraints and transaction-safe logic.
10. Create a Razorpay order when necessary.
11. Store `razorpay_order_id`, amount, currency, status, and audit fields.
12. Add a payment log.
13. Return only safe Checkout values.

Razorpay payload:

```javascript
{
  amount: amountInPaise,
  currency: "INR",
  receipt: applicationOrderNumber,
  notes: {
    application_order_id: String(order.id),
    application_order_number: order.orderNumber,
    user_id: String(order.userId)
  }
}
```

Keep receipt and notes within Razorpay-supported constraints. Do not include sensitive information.

---

# Safe External-Call Pattern

A Razorpay API call cannot be rolled back by PostgreSQL.

Implement a clear retry-safe sequence. For example:

1. Lock or validate the local order.
2. Reuse an existing valid gateway order when possible.
3. Create and persist a local payment attempt state.
4. Call Razorpay.
5. Persist returned Razorpay order ID immediately.
6. Mark local failure safely when the gateway call fails.
7. Make retries detect previously completed steps.

Do not hold a database transaction open across a slow external API call unless the existing design explicitly manages that trade-off safely.

Document the chosen pattern in code comments or README.

---

# Frontend Checkout.js Integration

Inspect or create:

```text
frontend/src/hooks/useRazorpay.js
frontend/src/services/paymentService.js
frontend/src/components/checkout/PaymentButton.js
frontend/src/components/checkout/PaymentSummary.js
```

Requirements:

- Load `https://checkout.razorpay.com/v1/checkout.js` once.
- Handle script success and failure.
- Do not run Checkout code during server rendering.
- Disable the Pay button during create-order and verification operations.
- Prevent accidental repeated clicks.
- Use amount, currency, Key ID, and Razorpay order ID returned by the backend.
- Use only safe user profile data for prefill.
- Implement success `handler`.
- Register `payment.failed` listener.
- Implement safe modal-dismiss behavior.
- Clean up temporary UI state.
- Do not show final success until backend verification succeeds.

Do not put Key Secret or Webhook Secret anywhere in frontend files, browser storage, network payloads, or rendered HTML.

---

# Payment Verification API

Implement or complete:

```text
POST /api/v1/payments/verify
```

Request:

```json
{
  "applicationOrderId": 101,
  "razorpayOrderId": "order_xxxxxxxxxxxxxx",
  "razorpayPaymentId": "pay_xxxxxxxxxxxxxx",
  "razorpaySignature": "signature_value"
}
```

Mandatory backend verification:

```text
message = stored_razorpay_order_id + "|" + razorpay_payment_id
expected = HMAC-SHA256(message, RAZORPAY_KEY_SECRET)
```

Requirements:

- Use the stored Razorpay order ID as the trusted value.
- Reject a request order ID that does not match the stored value.
- Validate identifier formats and lengths.
- Enforce authenticated ownership.
- Compare signatures securely.
- Make repeated valid verification requests idempotent.
- Do not duplicate payment rows or logs unnecessarily.
- Update payment and application order transactionally.
- Preserve final captured state.
- Clear the user's cart only after verified success when compatible with existing flow.
- Return safe payment and order details without returning stored signatures.

Create or reuse:

```text
backend/src/utils/paymentSignature.js
```

Add unit and integration tests.

---

# Payment Failure API

Implement or complete:

```text
POST /api/v1/payments/failure
```

Requirements:

- Validate ownership and identifiers.
- Sanitize gateway error fields.
- Length-limit persisted descriptions.
- Record a payment log.
- Preserve the order for retry.
- Do not clear the cart.
- Do not overwrite a captured payment with failed status.
- Treat frontend failure as telemetry that may later be confirmed or corrected by a trusted webhook.

Do not persist arbitrary unfiltered client objects.

---

# Webhook Raw-Body Handling

Implement or verify:

```text
POST /api/v1/webhooks/razorpay
```

Critical ordering requirement:

- The Razorpay webhook route must receive the exact raw bytes.
- Do not apply normal JSON parsing before capturing the raw webhook body.
- Ensure normal JSON APIs continue to work.

Use the existing middleware foundation when correct.

Possible approach:

```javascript
express.raw({ type: "application/json" })
```

Use the actual project structure and avoid duplicate body parsers.

---

# Webhook Signature Verification

Create or reuse:

```text
backend/src/utils/webhookSignature.js
```

Requirements:

- Read `X-Razorpay-Signature`.
- Calculate HMAC-SHA256 over the exact raw request body using `RAZORPAY_WEBHOOK_SECRET`.
- Compare securely.
- Reject missing or invalid signatures.
- Parse JSON only after successful verification.
- Never log the complete signature or secret.

Do not verify a re-stringified JavaScript object.

---

# Webhook Event Processing

Support:

```text
payment.authorized
payment.captured
payment.failed
order.paid
```

For unknown events:

- Persist safe metadata where appropriate.
- Mark as `IGNORED`.
- Return a safe 2xx response after valid signature verification.

Processing rules:

- Identify payment/order through trusted Razorpay IDs.
- Verify amount and currency before final paid status.
- Do not create unrelated application orders from webhook content.
- Use documented state transitions.
- Never downgrade `CAPTURED` to `FAILED`.
- Update payment and order inside a database transaction.
- Persist processing status and errors.
- Return 2xx for already-processed duplicates.

---

# Idempotency and Database Constraints

Inspect Part-2 migrations and add a migration only when required.

Ensure database-level protection for:

- Razorpay order ID uniqueness where appropriate.
- Razorpay payment ID uniqueness when present.
- Webhook event ID or deterministic event-hash uniqueness.
- Duplicate active attempt prevention according to the chosen schema.

Application-level checks are not sufficient by themselves.

Handle Sequelize unique-constraint races gracefully.

Do not remove audit fields:

```text
created_at
created_by
updated_at
updated_by
is_deleted
deleted_at
deleted_by
```

Use soft delete consistently with Part 2.

---

# Payment State Transitions

Centralize valid transitions in constants or a helper.

Minimum expected rules:

```text
CREATED -> PENDING
CREATED/PENDING -> AUTHORIZED
CREATED/PENDING/AUTHORIZED -> CAPTURED
CREATED/PENDING/AUTHORIZED -> FAILED
CAPTURED -> CAPTURED only
```

Order rules:

```text
PENDING -> PAYMENT_PENDING
PAYMENT_PENDING -> PAID
PAYMENT_PENDING -> PAYMENT_FAILED
PAYMENT_FAILED -> PAYMENT_PENDING on valid retry
PAID -> PAID only
```

Reject or ignore invalid delayed transitions safely and add an audit log.

---

# Reconciliation API

Implement only when it integrates cleanly with existing Part-3 design:

```text
POST /api/v1/payments/:id/reconcile
```

Admin only.

Requirements:

- Fetch payment/order status through backend Razorpay SDK.
- Compare trusted gateway amount, currency, IDs, and state.
- Apply only valid local transitions.
- Add an audit log.
- Return safe details.

Do not expose generic Razorpay proxy APIs.

If not implemented, document why it was unnecessary for this demo.

---

# Logging

Use existing Winston logging and request IDs.

Log:

- Application order ID.
- Razorpay order creation outcome.
- Masked gateway IDs.
- Payment verification outcome.
- Payment state transition.
- Webhook event type and processing result.
- Duplicate-event detection.
- Amount mismatch.
- Reconciliation action.

Do not log:

- Passwords.
- JWT tokens.
- Key Secret.
- Webhook Secret.
- Complete payment signatures.
- Card or banking information.
- Unsanitized full webhook payloads.

---

# Validation and Security

Use `express-validator` or the project's current validation mechanism.

Validate:

- Numeric application order IDs.
- Razorpay ID prefixes/formats without being unnecessarily brittle.
- Signature presence and safe maximum length.
- Error payload fields and lengths.

Security requirements:

- Test Mode only.
- JWT authentication for customer payment APIs.
- Ownership checks.
- Admin authorization for reconciliation and internal views.
- Rate limiting for create-order and verify endpoints when the existing project can support it safely.
- Helmet and strict CORS.
- No frontend-trusted final statuses.
- No frontend-trusted amount.
- No direct database access from frontend.
- No secrets in errors or logs.

---

# Swagger and Postman

Update documentation for:

```text
POST /payments/create-order
POST /payments/verify
POST /payments/failure
POST /webhooks/razorpay
POST /payments/:id/reconcile   if implemented
```

Include:

- Authentication requirements.
- Ownership rules.
- Request and response schemas.
- Test Mode notice.
- Idempotency behavior.
- Invalid-signature examples.
- Webhook raw-body and signature-header requirements.

Update the Postman collection with placeholder values only.

Do not include real credentials.

---

# Backend Tests

Use mocks for the Razorpay SDK and add meaningful tests:

1. Valid create-order.
2. Missing authentication.
3. Wrong customer ownership.
4. Already-paid order.
5. Frontend amount ignored or rejected if present.
6. Correct paise conversion.
7. Duplicate create-order handling.
8. Razorpay SDK failure.
9. Valid payment signature.
10. Invalid payment signature.
11. Repeated verification is idempotent.
12. Frontend failure event recorded safely.
13. Valid raw-body webhook signature.
14. Invalid webhook signature.
15. Missing webhook signature.
16. Captured webhook updates payment/order.
17. Failed webhook updates only allowed states.
18. Duplicate webhook causes no duplicate state change.
19. Unknown webhook is ignored safely.
20. Captured payment cannot be downgraded.
21. Amount mismatch prevents finalization.
22. Database transaction failure leaves consistent local state.

Do not call real Razorpay endpoints in automated tests.

---

# Frontend Tests

Mock `window.Razorpay` and APIs.

Test:

1. Checkout script loads once.
2. Script load failure shows safe error.
3. Pay button disables during processing.
4. Backend values populate Checkout options.
5. Checkout success calls verify endpoint.
6. Navigation to success happens only after verified backend response.
7. Invalid verification shows failure state.
8. `payment.failed` calls failure endpoint.
9. Modal dismiss resets UI without success.
10. Repeated click is prevented.
11. Retry remains possible.
12. No secret names or values are bundled into frontend code.

Use the current frontend test setup. Add Testing Library only if required and compatible.

---

# Manual Verification

After implementation, run a documented Razorpay Test Mode check for:

- Successful payment.
- Failed payment.
- Checkout dismissal.
- Duplicate Pay click.
- Repeated verify request.
- Valid webhook.
- Invalid webhook signature.
- Duplicate webhook.
- Webhook before frontend verification.
- Webhook after frontend verification.
- Already-paid order retry.

Show the expected and actual database statuses for order, payment, payment log, and webhook event.

Do not expose test credentials in the report.

---

# README Updates

Update root/backend/frontend README files where appropriate.

Include:

- Part-5 scope.
- Razorpay Test Mode setup.
- Required environment variables.
- Dashboard webhook configuration steps.
- Local webhook testing guidance.
- Payment flow diagram.
- Supported events.
- Test commands.
- Manual verification steps.
- Security notes.
- Known limitations.
- Confirmation that Live Mode, refunds, and settlements are out of scope.

---

# Required Verification Commands

Use project-compatible commands and provide exact Windows CMD commands.

At minimum verify:

```text
backend install
backend lint
backend tests
backend migration status
backend start
frontend install
frontend lint
frontend tests
frontend production build
Docker Compose config
health endpoint
Swagger
create-order API
payment verification test
webhook signature test
```

Do not claim a command passed unless it was actually executed successfully.

If credentials prevent a real Test Mode checkout, complete all mocked/integration checks and clearly list the one remaining manual credential-dependent step.

---

# Acceptance Criteria

Part 5 is complete only when:

- Razorpay order creation is backend-only.
- Trusted database data determines amount.
- Paise conversion is correct.
- Checkout uses backend-created order ID.
- Frontend contains only Key ID.
- Key Secret and Webhook Secret remain backend-only.
- Checkout success requires backend signature verification.
- Invalid signatures fail safely.
- Webhooks use exact raw-body verification.
- Supported events update local state correctly.
- Duplicate verification and webhook processing are idempotent.
- Captured state cannot be downgraded.
- Amount mismatch is detected.
- Payment and order status remain consistent.
- Audit logs are written without secrets.
- Backend lint and tests pass.
- Frontend lint, tests, and build pass.
- Swagger and Postman are updated.
- No real secrets are tracked.
- Manual Test Mode steps are documented.
- Parts 1-4 functionality remains working.
- Part 6 is not implemented.

---

# After Implementation

Provide:

1. Summary of the chosen Razorpay flow.
2. Existing functionality preserved.
3. Files created.
4. Files modified.
5. Database migration changes.
6. Create-order implementation.
7. Checkout.js implementation.
8. Signature verification implementation.
9. Webhook implementation.
10. Idempotency strategy.
11. State-transition strategy.
12. Logging and security review.
13. Swagger and Postman updates.
14. Backend test results.
15. Frontend test results.
16. Lint and build results.
17. Docker validation results.
18. Exact Windows CMD commands.
19. Manual Razorpay Dashboard steps.
20. Remaining limitations.
21. Part-6 readiness.

---

# Final Output Format

Use exactly these headings:

```text
## Summary
## Repository Inspection
## Implementation Plan
## Files Created
## Files Modified
## Database Changes
## Razorpay Configuration
## Create Order Flow
## Frontend Checkout Flow
## Payment Verification
## Payment Failure Handling
## Webhook Processing
## Idempotency and State Transitions
## Security Review
## Swagger and Postman
## Backend Tests
## Frontend Tests
## Verification Results
## Windows CMD Commands
## Manual Dashboard Steps
## Remaining Limitations
## Part 6 Readiness
```
