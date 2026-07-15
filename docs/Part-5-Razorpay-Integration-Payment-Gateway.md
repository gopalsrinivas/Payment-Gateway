# Payment Gateway Demo

# Part-5 – Razorpay Integration

---

# 1. Objective

Part 5 completes and hardens the Razorpay Test Mode integration by extending the Part-1 project foundation, Part-2 database design, Part-3 backend APIs, and Part-4 frontend application.

This phase must provide a secure end-to-end payment lifecycle covering application order creation, Razorpay order creation, Checkout.js, backend signature verification, trusted webhook processing, payment status synchronization, duplicate protection, failure handling, audit logging, tests, and operational documentation.

The implementation must remain small, practical, secure, testable, and interview-ready.

---

# 2. Prerequisites

Before starting Part 5, confirm that:

- Part-1 authentication, configuration, logging, Swagger, Docker, and webhook raw-body foundation work.
- Part-2 migrations, models, associations, indexes, audit fields, and soft-delete fields exist.
- Part-3 product, cart, order, payment, webhook, history, and dashboard APIs exist.
- Part-4 checkout, success, failure, orders, payments, and Admin screens exist.
- Razorpay Test Mode account and credentials are available.
- Backend environment contains `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`.
- Frontend contains only `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
- Real secrets are ignored by Git.
- PostgreSQL is available and migrations are current.

Required tables:

```text
orders
order_items
payments
payment_logs
webhook_events
```

---

# 3. Part-5 Scope

Implement and verify:

- Razorpay Test Mode configuration validation.
- Server-side Razorpay order creation.
- Checkout.js loading and safe initialization.
- Trusted amount and currency handling.
- Checkout success handler.
- Backend payment signature verification.
- Payment failure event handling.
- Razorpay webhook signature verification using the raw request body.
- Webhook persistence and duplicate-event protection.
- Order and payment status synchronization.
- Idempotent create-order and verify operations.
- Payment attempt logging.
- Retry-safe frontend behavior.
- Payment reconciliation support for uncertain states.
- Swagger and Postman examples.
- Backend and frontend automated tests.
- Manual Test Mode verification guide.
- Security review and acceptance criteria.

---

# 4. Out of Scope

Do not implement:

- Live Mode payments.
- Refund initiation.
- Settlement reconciliation.
- Subscription billing.
- Payment Links.
- Route or marketplace split payments.
- International or multi-currency UI.
- Recurring mandates.
- Production PCI compliance certification.
- Card data storage.
- Background queues unless already present and justified.
- Advanced fraud scoring.

---

# 5. Razorpay Integration Architecture

```text
Customer
   |
   v
Next.js Checkout Page
   |
   | POST /api/v1/payments/create-order
   v
Express Backend
   |
   | Validate authenticated user and application order
   | Recalculate amount from trusted order items
   | Create payment attempt
   v
Razorpay Orders API
   |
   v
Razorpay Order ID
   |
   v
Next.js opens Checkout.js
   |
   v
Customer completes or fails payment
   |
   +------------------------------+
   |                              |
   v                              v
Frontend success handler      Frontend failure handler
   |                              |
   | POST /payments/verify        | POST /payments/failure
   v                              v
Backend HMAC verification     Failure log/status update
   |
   v
Payment and order updated transactionally

Independent trusted channel:

Razorpay Webhook
   |
   v
POST /api/v1/webhooks/razorpay
   |
   | Raw-body signature verification
   | Duplicate event check
   | Persist event
   | Update payment/order safely
   v
PostgreSQL
```

---

# 6. Environment Variables

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

Rules:

- Never expose `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` to the browser.
- Never commit real `.env` files.
- Fail startup clearly when required backend secrets are missing outside test environments.
- Log only masked Key ID where operationally useful.

---

# 7. Payment Status Model

Recommended application order statuses:

```text
PENDING
PAYMENT_PENDING
PAID
PAYMENT_FAILED
CANCELLED
```

Recommended payment statuses:

```text
CREATED
PENDING
AUTHORIZED
CAPTURED
FAILED
CANCELLED
VERIFICATION_FAILED
```

Recommended webhook processing statuses:

```text
RECEIVED
PROCESSED
IGNORED
FAILED
```

Rules:

- Use constants or enums instead of repeated string literals.
- Do not downgrade a final `CAPTURED` payment because of a delayed lower-priority event.
- Do not mark an order `PAID` without trusted backend verification or a trusted webhook state.
- Status transitions must be documented and validated.

---

# 8. Server-Side Razorpay Order Creation

Endpoint:

```text
POST /api/v1/payments/create-order
```

Authenticated roles:

```text
Customer
Admin
```

Recommended request:

```json
{
  "orderId": 101
}
```

The frontend must not send an authoritative amount.

Backend flow:

1. Authenticate the user.
2. Validate `orderId`.
3. Fetch a non-deleted application order with items.
4. Confirm that the user owns the order unless the user is Admin.
5. Confirm the order is payable.
6. Recalculate the amount from trusted order-item snapshots.
7. Convert INR rupees to paise using integer-safe logic.
8. Reuse an existing valid Razorpay order for the same unpaid application order when appropriate.
9. Otherwise create a new Razorpay order.
10. Persist the Razorpay order ID and payment attempt.
11. Return only safe Checkout configuration.

Razorpay create-order payload:

```json
{
  "amount": 50000,
  "currency": "INR",
  "receipt": "ORD-20260715-000101",
  "notes": {
    "application_order_id": "101",
    "application_order_number": "ORD-20260715-000101",
    "user_id": "25"
  }
}
```

Rules:

- Amount is in the smallest currency unit.
- Use integer arithmetic.
- Keep receipt within Razorpay limits.
- Keep notes minimal and non-sensitive.
- Do not place passwords, tokens, addresses, card data, or secrets in notes.
- Use a database transaction for local state changes.
- External Razorpay API calls cannot be rolled back; design retry-safe persistence around this limitation.

Recommended response:

```json
{
  "success": true,
  "message": "Razorpay order created successfully",
  "data": {
    "applicationOrderId": 101,
    "applicationOrderNumber": "ORD-20260715-000101",
    "razorpayOrderId": "order_xxxxxxxxxxxxxx",
    "amount": 50000,
    "currency": "INR",
    "keyId": "rzp_test_xxxxxxxx",
    "companyName": "Payment Gateway Demo",
    "description": "Payment for ORD-20260715-000101"
  },
  "statusCode": 201
}
```

---

# 9. Checkout.js Integration

Use Razorpay Standard Checkout through:

```text
https://checkout.razorpay.com/v1/checkout.js
```

Recommended frontend modules:

```text
src/hooks/useRazorpay.js
src/services/paymentService.js
src/components/checkout/PaymentButton.js
src/components/checkout/PaymentSummary.js
```

Checkout flow:

1. Validate that the user is authenticated.
2. Load the Checkout.js script once.
3. Disable the Pay button while creating a payment order.
4. Call the backend create-order endpoint.
5. Build Checkout options only from the backend response and safe profile values.
6. Open Checkout.
7. Handle success through the Checkout handler.
8. Handle `payment.failed` through the failure event listener.
9. Handle modal dismissal without marking the payment as failed unless the backend contract defines it.
10. Re-enable the UI safely.

Recommended options:

```javascript
{
  key,
  amount,
  currency,
  name,
  description,
  order_id: razorpayOrderId,
  prefill: {
    name: user.name,
    email: user.email
  },
  notes: {
    application_order_number: applicationOrderNumber
  },
  theme: {},
  handler: async (response) => {},
  modal: {
    ondismiss: () => {}
  }
}
```

Rules:

- Never use an amount calculated only in the browser.
- Do not expose the Key Secret.
- Prevent repeated clicks while an attempt is active.
- Do not treat Checkout handler execution alone as final payment success.
- Display success only after backend verification succeeds.
- Preserve order context for safe retry.

---

# 10. Payment Signature Verification

Endpoint:

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

Verification input:

```text
razorpay_order_id + "|" + razorpay_payment_id
```

Expected signature:

```text
HMAC-SHA256(message, RAZORPAY_KEY_SECRET)
```

Backend requirements:

- Load the stored Razorpay order ID from the database.
- Do not trust a mismatched request order ID.
- Compare signatures using timing-safe comparison where practical.
- Reject malformed identifiers.
- Verify authenticated ownership.
- Make the operation idempotent.
- Persist the payment ID and signature verification result.
- Update payment and application order in one database transaction.
- Clear the cart only after verified success when the product flow requires it.
- Add a payment log without storing secrets.

Verified response:

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "applicationOrderId": 101,
    "orderStatus": "PAID",
    "paymentStatus": "CAPTURED",
    "razorpayPaymentId": "pay_xxxxxxxxxxxxxx"
  },
  "statusCode": 200
}
```

Invalid-signature response:

```json
{
  "success": false,
  "message": "Payment signature verification failed",
  "errors": [],
  "statusCode": 400,
  "requestId": "REQ-000001"
}
```

---

# 11. Payment Failure Handling

Endpoint:

```text
POST /api/v1/payments/failure
```

Recommended request:

```json
{
  "applicationOrderId": 101,
  "razorpayOrderId": "order_xxxxxxxxxxxxxx",
  "razorpayPaymentId": "pay_xxxxxxxxxxxxxx",
  "error": {
    "code": "BAD_REQUEST_ERROR",
    "description": "Payment failed",
    "source": "customer",
    "step": "payment_authentication",
    "reason": "payment_failed"
  }
}
```

Rules:

- Treat frontend failure reporting as useful telemetry, not the only trusted final source.
- Sanitize and length-limit error fields.
- Never store complete sensitive gateway payloads blindly.
- Preserve the order for retry.
- Do not clear the cart.
- Use the webhook as an independent status source.
- Do not overwrite an already captured payment with failed status.

---

# 12. Razorpay Webhook Integration

Endpoint:

```text
POST /api/v1/webhooks/razorpay
```

Required header:

```text
X-Razorpay-Signature
```

Critical requirement:

- Verify the signature against the exact raw request body.
- Do not parse and re-stringify JSON before verification.
- Register the webhook raw-body route before general JSON parsing or use route-specific raw parsing.

Webhook processing flow:

1. Read the raw request body.
2. Read the signature header.
3. Calculate the HMAC using `RAZORPAY_WEBHOOK_SECRET`.
4. Perform secure comparison.
5. Reject invalid signatures.
6. Parse the verified JSON payload.
7. Determine a stable event identity.
8. Check whether the event has already been processed.
9. Persist the event before or during processing.
10. Process supported event types transactionally.
11. Record `PROCESSED`, `IGNORED`, or `FAILED`.
12. Return a 2xx response for successfully accepted duplicate events.

Supported events for this demo:

```text
payment.authorized
payment.captured
payment.failed
order.paid
```

Optional event:

```text
payment.dispute.created
```

For optional events, store and mark ignored unless explicitly implemented.

---

# 13. Webhook Event Mapping

## `payment.authorized`

- Locate payment by Razorpay order ID or payment ID.
- Set payment to `AUTHORIZED` only when current state permits.
- Do not automatically mark order `PAID` unless capture behavior and project rules justify it.

## `payment.captured`

- Set payment to `CAPTURED`.
- Set application order to `PAID`.
- Persist gateway method and safe metadata where available.

## `payment.failed`

- Set payment to `FAILED` only when it is not already captured.
- Set application order to `PAYMENT_FAILED` or leave payable according to the documented retry model.
- Store sanitized failure reason.

## `order.paid`

- Confirm Razorpay order identity and amount.
- Set the corresponding payment/order to final paid state.
- Do not create unrelated application orders from webhook data.

---

# 14. Idempotency and Duplicate Protection

Required protections:

- Unique `razorpay_order_id` where applicable.
- Unique `razorpay_payment_id` when available.
- Unique webhook event identity or deterministic payload hash.
- Database-level unique constraints in addition to service checks.
- Safe repeated verification response.
- Safe repeated webhook response.
- Prevent multiple active create-order requests for the same application order.

Recommended create-order behavior:

- Reuse a current unpaid Razorpay order when it is still valid.
- Create a new attempt only when retry rules require one.
- Store every attempt in `payment_logs` or an explicit attempt model if already designed.

Do not rely only on in-memory locks because the application may run in multiple processes.

---

# 15. Trusted Amount Validation

For every payment operation:

- Fetch order and item snapshots from PostgreSQL.
- Sum item price multiplied by quantity.
- Apply only backend-defined adjustments.
- Compare against stored order total.
- Convert to paise safely.
- Compare webhook amount with the expected amount before finalizing.
- Reject or flag mismatches.

Example:

```text
₹500.00 -> 50000 paise
```

Never use floating-point values for the authoritative paise amount.

---

# 16. Database Update Requirements

## Payments

Persist as available:

```text
application_order_id
user_id
razorpay_order_id
razorpay_payment_id
razorpay_signature
amount
currency
status
payment_method
gateway_error_code
gateway_error_description
verified_at
captured_at
failed_at
created_at
created_by
updated_at
updated_by
is_deleted
deleted_at
deleted_by
```

Store the Razorpay signature only when the existing design requires it; never expose it through normal API responses.

## Payment Logs

Recommended fields:

```text
payment_id
application_order_id
event_type
source
status
message
safe_metadata
request_id
created_at
created_by
```

## Webhook Events

Recommended fields:

```text
event_id_or_hash
event_type
razorpay_entity_id
signature_verified
processing_status
payload
processed_at
error_message
created_at
updated_at
```

Payload storage rules:

- Store only when useful for audit/debugging.
- Restrict access to Admin or internal services.
- Redact unnecessary personal data.
- Apply retention rules in production designs.

---

# 17. Reconciliation Endpoint

Optional Admin-only endpoint for uncertain local states:

```text
POST /api/v1/payments/:id/reconcile
```

Purpose:

- Fetch the Razorpay payment or order using the backend SDK.
- Compare gateway state against local state.
- Update local state only through documented transition rules.
- Write a payment log.

This endpoint is recommended for interview demonstration but should remain simple.

Do not expose Razorpay fetch APIs directly to customers.

---

# 18. Frontend User Experience

Checkout page must show:

- Order number.
- Product summary.
- Quantity and trusted displayed total.
- Test Mode notice.
- Pay button.
- Loading state.
- Safe retry message.

Payment success page must:

- Load the verified order/payment from the backend.
- Avoid trusting only query parameters.
- Show order number and payment reference.
- Provide links to order and payment history.

Payment failure page must:

- Show a safe message.
- Avoid showing raw gateway stack/error objects.
- Allow retry for payable orders.
- Avoid duplicate order creation when retrying.

---

# 19. Error Handling

Handle:

- Missing Razorpay configuration.
- Razorpay SDK initialization failure.
- Razorpay API timeout.
- Invalid application order.
- Already-paid order.
- Amount mismatch.
- Duplicate payment attempt.
- Invalid Checkout response.
- Invalid payment signature.
- Missing webhook signature.
- Invalid webhook signature.
- Unknown webhook event.
- Duplicate webhook event.
- Database transaction failure.
- Frontend script load failure.
- User-closes-checkout scenario.

Return safe standard responses and preserve request IDs.

---

# 20. Logging and Audit

Log:

- Application order ID and order number.
- Razorpay order creation success/failure.
- Masked Razorpay IDs where appropriate.
- Signature verification outcome.
- Payment state transitions.
- Webhook receipt and event type.
- Duplicate webhook detection.
- Amount mismatch.
- Reconciliation action.
- Request ID and authenticated user ID.

Do not log:

- Razorpay Key Secret.
- Webhook Secret.
- JWT tokens.
- Passwords.
- Card numbers, CVV, or banking credentials.
- Full sensitive webhook payloads in normal logs.
- Complete payment signatures.

---

# 21. Security Requirements

- Use Razorpay Test Mode only.
- Create Razorpay orders only from the backend.
- Verify Checkout signatures only in the backend.
- Verify webhooks with the raw request body.
- Never trust frontend amount, currency, order status, or success result.
- Enforce authentication and ownership.
- Use transactions for local critical updates.
- Add rate limiting to payment creation and verification endpoints.
- Validate IDs and payload lengths.
- Use Helmet and strict CORS configuration.
- Use HTTPS in deployed environments.
- Prevent replay and duplicate processing through database constraints.
- Restrict Admin payment-log/webhook views.
- Avoid open redirects from payment result pages.

---

# 22. Swagger and Postman

Document:

```text
POST /payments/create-order
POST /payments/verify
POST /payments/failure
POST /webhooks/razorpay
POST /payments/:id/reconcile   optional Admin API
```

Include:

- JWT requirements.
- Request schemas.
- Success and error examples.
- Ownership behavior.
- Idempotent behavior.
- Test Mode notice.
- Raw webhook body requirement.
- Signature-header requirement.

Do not place real credentials in Swagger or Postman files.

---

# 23. Backend Tests

Add tests for:

- Create Razorpay order for a valid payable application order.
- Reject unauthenticated create-order request.
- Reject another customer's order.
- Reject already-paid order.
- Ignore frontend-supplied amount.
- Correct rupees-to-paise conversion.
- Reuse or safely handle duplicate create-order request.
- Verify a valid payment signature.
- Reject an invalid payment signature.
- Make repeated verification idempotent.
- Record frontend payment failure safely.
- Verify valid webhook signature using raw body.
- Reject invalid webhook signature.
- Process captured-payment webhook.
- Process failed-payment webhook.
- Ignore unknown event safely.
- Accept duplicate webhook without duplicate state change.
- Prevent captured-to-failed downgrade.
- Roll back local transaction on database failure.

Mock Razorpay SDK calls. Do not make real network calls in automated tests.

---

# 24. Frontend Tests

Add tests for:

- Checkout script loading success and failure.
- Pay button disabled during request.
- Backend create-order response used for Checkout options.
- Checkout handler calls backend verify endpoint.
- Success navigation occurs only after verification.
- Invalid verification displays failure state.
- Payment failure event calls failure endpoint.
- Modal dismissal does not mark payment successful.
- Retry does not create uncontrolled duplicate requests.
- Razorpay secrets never appear in frontend configuration.

Mock `window.Razorpay` and backend APIs.

---

# 25. Manual Test Mode Scenarios

Verify at minimum:

1. Successful Test Mode payment.
2. Failed Test Mode payment.
3. Checkout closed by customer.
4. Repeated Pay button click.
5. Repeated verify request.
6. Valid webhook event.
7. Invalid webhook signature.
8. Duplicate webhook delivery.
9. Frontend success callback followed by delayed webhook.
10. Webhook received before frontend verification.
11. Already-paid order retry.
12. Amount mismatch simulation in automated tests.

Record expected database state for each scenario.

---

# 26. Recommended Implementation Files

Backend:

```text
src/config/razorpay.js
src/controllers/paymentController.js
src/controllers/webhookController.js
src/services/razorpayService.js
src/services/paymentService.js
src/services/webhookService.js
src/validations/paymentValidation.js
src/middlewares/rawBodyMiddleware.js
src/utils/paymentSignature.js
src/utils/webhookSignature.js
src/utils/currency.js
src/utils/paymentStatus.js
src/routes/paymentRoutes.js
src/routes/webhookRoutes.js
tests/payment.integration.test.js
tests/webhook.integration.test.js
```

Frontend:

```text
src/hooks/useRazorpay.js
src/services/paymentService.js
src/components/checkout/PaymentButton.js
src/components/checkout/PaymentSummary.js
src/app/(protected)/checkout/page.js
src/app/(protected)/payment-success/page.js
src/app/(protected)/payment-failed/page.js
```

Preserve correct existing files and adapt names to the actual repository.

---

# 27. Implementation Order

```text
1. Inspect Parts 1-4 implementation
2. Verify database constraints and payment states
3. Harden Razorpay configuration
4. Implement currency conversion helper
5. Implement create-order service
6. Implement Checkout.js hook and button flow
7. Implement backend payment verification
8. Implement failure reporting
9. Implement raw-body webhook verification
10. Implement event processing and idempotency
11. Add reconciliation support if selected
12. Update Swagger and Postman
13. Add backend tests
14. Add frontend tests
15. Run manual Test Mode scenarios
16. Update README
17. Verify secrets and logs
18. Commit Part 5
```

---

# 28. Part-5 Deliverables

- Working Razorpay Test Mode end-to-end flow.
- Secure backend order creation.
- Safe Checkout.js integration.
- Backend payment signature verification.
- Trusted webhook processing.
- Idempotency and duplicate protection.
- Payment failure handling.
- Transactional status synchronization.
- Payment and webhook audit logs.
- Swagger and Postman updates.
- Backend and frontend tests.
- Manual test guide.
- Updated README and environment examples.

---

# 29. Acceptance Criteria

Part 5 is complete only when:

- Razorpay orders are created only by the backend.
- Amount is recalculated from trusted database data.
- Amount is sent in paise.
- Checkout opens with the backend-created Razorpay order ID.
- Key Secret and Webhook Secret are never exposed to the frontend.
- Frontend success is not treated as final until backend verification succeeds.
- Valid payment signatures pass.
- Invalid payment signatures fail safely.
- Valid webhook signatures pass using the exact raw body.
- Invalid webhook signatures are rejected.
- Duplicate verification and webhook deliveries are idempotent.
- Captured payments cannot be downgraded by delayed failed events.
- Order and payment states remain consistent.
- Failed and dismissed payments remain retryable where appropriate.
- Backend tests pass.
- Frontend tests pass.
- Backend lint passes.
- Frontend lint and production build pass.
- Swagger documents the integration.
- No real secrets exist in Git-tracked files.
- A complete successful Test Mode payment is demonstrated.

---

# 30. Next Phase

Recommended next document:

```text
Part-6-Testing-DevOps-Deployment.md
```

It may include:

- Full integration testing.
- CI/CD.
- Docker hardening.
- Deployment.
- Monitoring.
- Security scanning.
- Demo preparation.
