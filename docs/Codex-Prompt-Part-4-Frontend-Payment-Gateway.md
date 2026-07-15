# Codex Prompt – Part 4

# Payment Gateway Demo Frontend

## Objective

You are a Senior Full Stack Developer.

Continue the existing Payment Gateway Demo repository and implement ONLY Part 4: Frontend.

Read the current repository and all project documentation completely before making changes.

Use these files as the main specifications:

```text
docs/Part-1-Project-Setup-Payment-Gateway.md
docs/Part-2-Database-Design-Payment-Gateway.md
docs/Part-3-Backend-APIs-Payment-Gateway.md
docs/Part-4-Frontend-Payment-Gateway.md
```

Part 4 must implement the Next.js frontend for authentication, products, cart, checkout, Razorpay Test Mode Checkout, backend payment verification, payment success/failure, orders, payments, profile, and Admin dashboard.

Do not redesign the database or reimplement backend business APIs in this phase.

---

# Critical Repository Rules

- Inspect the current repository first.
- Run `git status` before editing.
- Read all Part-1 through Part-4 documentation.
- Inspect the existing frontend and backend API contracts.
- Preserve correct existing files.
- Do not overwrite working authentication, backend, database, Docker, or documentation code.
- Do not delete existing documentation.
- Do not create duplicate contexts, services, pages, or utilities when correct equivalents already exist.
- Do not rename stable backend endpoints without a documented conflict.
- Do not modify migrations unless a real blocking defect is found and documented.
- Do not use direct database access from the frontend.
- Do not hardcode credentials.
- Do not commit real `.env` files.
- Use Razorpay Test Mode only.
- Keep the application small, clear, responsive, secure, and interview-friendly.
- Avoid unnecessary enterprise complexity.

---

# Security Rules

- Never expose `RAZORPAY_KEY_SECRET`.
- Never expose `RAZORPAY_WEBHOOK_SECRET`.
- Never verify Razorpay signatures in the frontend.
- Never mark a payment successful only from the Razorpay browser callback.
- Never trust prices or payment amounts from local browser state.
- Use backend-created application orders and backend-created Razorpay orders.
- Send the Razorpay callback IDs and signature to the backend verification API.
- Show the success page only after the backend verification API succeeds.
- Do not log JWT tokens, passwords, signatures, gateway payloads, or secrets.
- Do not render raw HTML from backend error messages.
- Do not put sensitive payment details in URL query parameters.
- Keep webhook processing backend-only.
- Preserve the existing Part-1 token-storage strategy unless fixing a documented defect.

---

# Required Architecture

Use:

```text
Next.js Page / Route
  -> Reusable Component
  -> Context or Custom Hook
  -> Service Module
  -> Shared Axios Client
  -> Part-3 Backend API
```

Rules:

- Pages coordinate route behavior.
- Components remain focused and reusable.
- Put API calls in service modules or dedicated hooks.
- Do not scatter direct Axios calls across page files.
- Use Auth Context for authentication state.
- Cart Context is allowed for cart badge and cart actions, while backend cart data remains the source of truth.
- Use `async/await`.
- Normalize API errors.
- Keep field validation aligned with backend rules.
- Do not add Redux or another global state library unless the repository already uses it.

---

# Part-4 Scope

Implement:

```text
Home page
Register page
Login page
Logout flow
Authenticated layouts
Role-aware navigation
Product listing
Product details
Product search/sort/pagination
Admin product list
Admin create product
Admin edit product
Admin soft-delete product
Cart page
Cart badge
Checkout page
Razorpay Test Checkout integration
Backend payment verification
Payment failure handling
Payment success page
Payment failed page
Order history
Order details
Payment history
Payment details
Customer dashboard
Admin dashboard
Profile page
Responsive UI
Loading states
Empty states
Validation states
Error states
Frontend tests
README updates
```

Do not implement:

```text
Backend business APIs
New database design
Production payments
Refunds
Settlements
Subscriptions
Coupons
Shipping
Inventory management
Multi-vendor screens
Webhook processing in frontend
Native mobile application
```

---

# Before Making Changes

Perform these steps first:

1. Run `git status`.
2. Inspect the root folder structure.
3. Inspect `frontend/package.json`.
4. Inspect the Next.js version and App Router structure.
5. Inspect `AuthContext`, Axios client, login, register, and dashboard foundation from Part 1.
6. Inspect Part-3 Swagger and route implementations.
7. Confirm the exact response envelope and pagination format.
8. Confirm backend amount units: rupees or paise.
9. Confirm order and payment status values.
10. Confirm role values and casing.
11. Confirm Razorpay create-order and verify-payment response fields.
12. Summarize the implementation plan.
13. List files expected to be created or modified.
14. Identify conflicts before editing.

Do not begin implementation until this inspection is complete.

---

# Environment Configuration

Create or preserve:

```text
frontend/.env.example
```

Required safe values:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=replace_with_test_key_id
NEXT_PUBLIC_APP_NAME=Payment Gateway Demo
```

Requirements:

- Never add Razorpay Key Secret.
- Never add Webhook Secret.
- Do not commit `frontend/.env.local`.
- Add a small environment validation helper if one does not already exist.
- Fail clearly in development when required public configuration is absent.

---

# Expected Frontend Structure

Create or update files according to current repository conventions.

Expected route groups and pages:

```text
frontend/src/app/page.js
frontend/src/app/login/page.js
frontend/src/app/register/page.js
frontend/src/app/dashboard/page.js
frontend/src/app/products/page.js
frontend/src/app/products/[id]/page.js
frontend/src/app/cart/page.js
frontend/src/app/checkout/page.js
frontend/src/app/orders/page.js
frontend/src/app/orders/[id]/page.js
frontend/src/app/payments/page.js
frontend/src/app/payments/[id]/page.js
frontend/src/app/profile/page.js
frontend/src/app/payment-success/page.js
frontend/src/app/payment-failed/page.js
frontend/src/app/admin/dashboard/page.js
frontend/src/app/admin/products/page.js
frontend/src/app/admin/products/new/page.js
frontend/src/app/admin/products/[id]/edit/page.js
frontend/src/app/unauthorized/page.js
frontend/src/app/not-found.js
frontend/src/app/error.js
frontend/src/app/loading.js
```

Using route groups such as `(public)`, `(shop)`, or `(protected)` is allowed if it preserves clean URLs.

Expected components:

```text
frontend/src/components/layout/Header.js
frontend/src/components/layout/Footer.js
frontend/src/components/layout/Sidebar.js
frontend/src/components/layout/MobileMenu.js
frontend/src/components/auth/ProtectedRoute.js
frontend/src/components/auth/RoleGuard.js
frontend/src/components/products/ProductCard.js
frontend/src/components/products/ProductGrid.js
frontend/src/components/products/ProductFilters.js
frontend/src/components/products/ProductForm.js
frontend/src/components/cart/CartItem.js
frontend/src/components/cart/CartSummary.js
frontend/src/components/checkout/CheckoutSummary.js
frontend/src/components/orders/OrderCard.js
frontend/src/components/orders/OrderStatusBadge.js
frontend/src/components/payments/PaymentStatusBadge.js
frontend/src/components/dashboard/SummaryCard.js
frontend/src/components/ui/Button.js
frontend/src/components/ui/Input.js
frontend/src/components/ui/Select.js
frontend/src/components/ui/Modal.js
frontend/src/components/ui/Pagination.js
frontend/src/components/ui/Spinner.js
frontend/src/components/ui/EmptyState.js
frontend/src/components/ui/ErrorState.js
```

Expected contexts and hooks:

```text
frontend/src/contexts/AuthContext.js
frontend/src/contexts/CartContext.js
frontend/src/hooks/useAuth.js
frontend/src/hooks/useCart.js
frontend/src/hooks/useDebounce.js
frontend/src/hooks/useRazorpay.js
```

Expected services:

```text
frontend/src/services/apiClient.js
frontend/src/services/authService.js
frontend/src/services/productService.js
frontend/src/services/cartService.js
frontend/src/services/orderService.js
frontend/src/services/paymentService.js
frontend/src/services/dashboardService.js
```

Expected utilities/config:

```text
frontend/src/config/env.js
frontend/src/config/routes.js
frontend/src/config/navigation.js
frontend/src/utils/currency.js
frontend/src/utils/date.js
frontend/src/utils/errors.js
frontend/src/utils/storage.js
frontend/src/utils/constants.js
```

Preserve different but correct existing names. Do not duplicate functionality.

---

# API Contract Rules

Use the Part-3 API prefix:

```text
/api/v1
```

Expected route groups:

```text
/auth
/products
/cart
/orders
/payments
/dashboard
```

Before coding each service method, inspect the actual backend implementation or Swagger for:

- URL.
- Method.
- Request body.
- Query parameters.
- Response envelope.
- Pagination metadata.
- Error shape.
- Role requirement.
- Ownership rule.

Do not guess field names.

---

# Shared Axios Client

Create or update one Axios instance.

Requirements:

- Base URL from `NEXT_PUBLIC_API_BASE_URL`.
- Add bearer token when available.
- Do not attach JWT to unrelated external requests.
- Handle normal JSON requests.
- Normalize backend error response.
- Preserve backend `requestId`.
- On 401, clear invalid auth state and redirect safely.
- On 403, route to `/unauthorized` or show an authorization message.
- Avoid redirect loops.
- Do not log sensitive headers or response bodies.

Do not implement token refresh unless the backend already supports it.

---

# Authentication Implementation

Preserve and complete Part-1 authentication.

Auth Context must expose a clean API such as:

```text
user
token
isAuthenticated
isLoading
login(credentials)
register(payload)
logout()
refreshProfile()
hasRole(role)
```

Register page:

- Name required.
- Valid email.
- Password minimum length per backend.
- Confirm password match.
- Field-level errors.
- Safe success redirect.

Login page:

- Valid email.
- Password required.
- Display invalid login safely.
- Redirect Customer to `/dashboard`.
- Redirect Admin to `/admin/dashboard` when appropriate.

Logout:

- Call backend logout endpoint if part of the existing flow.
- Remove local token.
- Clear user and cart state.
- Redirect safely.

Use the profile endpoint to load trusted current user data. Do not rely only on decoded JWT contents.

---

# Route Protection

Implement reusable protection for:

```text
Authenticated routes
Admin-only routes
Guest-only routes
```

Requirements:

- Guests cannot open cart, checkout, orders, payments, profile, or dashboards.
- Customer cannot open Admin routes.
- Logged-in users should not remain on login/register pages.
- Show a loading state while authentication is being restored.
- Backend RBAC remains authoritative.
- Handle backend 403 even when frontend guards were bypassed.

Use middleware only if it is compatible with the existing token strategy. Otherwise use client layout guards without forcing a risky architecture change.

---

# Shared Layout

Implement a responsive application shell:

- Header.
- Brand or app title.
- Product link.
- Cart badge.
- Orders link.
- Payments link.
- Profile link.
- Admin links for Admin users.
- Login/Register for guests.
- Logout for authenticated users.
- Mobile menu.
- Footer.

Show a visible Test Mode message:

```text
Demo application — Razorpay Test Mode only. No real payment is processed.
```

---

# Product APIs and UI

Use:

```text
GET    /products
GET    /products/:id
POST   /products
PATCH  /products/:id
DELETE /products/:id
```

Product list:

- Render product cards.
- Search with debounce.
- Use supported sort and pagination query parameters.
- Preserve query state in URL when practical.
- Show loading skeleton.
- Show empty state.
- Show retryable error state.
- Add to cart for authenticated users.
- Prompt guests to login.

Product details:

- Load by ID.
- Show name, description, image/placeholder, active status, and INR price.
- Quantity selector.
- Add to cart.
- Handle invalid ID, 404, deleted, and inactive cases.

Admin products:

- Admin-only list.
- Reusable Product Form for create/edit.
- Client validation aligned with backend.
- Confirmation modal for soft delete.
- Use API response after create/update/delete.
- Do not send `created_by`, `updated_by`, or `deleted_by`; backend must derive these from JWT.

---

# Cart APIs and UI

Use:

```text
GET    /cart
POST   /cart/items
PATCH  /cart/items/:id
DELETE /cart/items/:id
DELETE /cart
```

Implement:

- Cart Context if useful.
- Cart badge count.
- Cart page.
- Quantity update.
- Remove item.
- Clear cart.
- Empty cart state.
- Continue shopping.
- Proceed to checkout.

Rules:

- Backend cart is source of truth.
- Refresh or reconcile state after mutations.
- Prevent quantity below 1.
- Respect backend validation limits.
- Disable repeated mutation clicks.
- Do not treat browser subtotal as authoritative.

---

# Order APIs and UI

Use:

```text
POST /orders
GET  /orders
GET  /orders/:id
```

Checkout must create an application order from backend-trusted cart data.

Order list:

- Order number.
- Date.
- Total.
- Status.
- Payment status where supplied.
- Pagination.
- Empty state.

Order details:

- Order snapshot items.
- Unit prices.
- Quantities.
- Total.
- Status.
- Payment summary.
- Retry action only when backend state permits.

Handle 403 ownership errors safely.

---

# Razorpay Checkout Integration

Create a reusable Checkout script loader or hook.

Load:

```text
https://checkout.razorpay.com/v1/checkout.js
```

Required flow:

```text
1. Fetch current cart.
2. Create application order through backend.
3. Call backend Razorpay create-order endpoint.
4. Receive trusted amount, currency, Razorpay order ID, and application order/payment references.
5. Open Razorpay Checkout with public Key ID.
6. Receive success callback.
7. Send razorpay_order_id, razorpay_payment_id, and razorpay_signature to backend verification endpoint.
8. Wait for backend verified success response.
9. Redirect to success page only after verification succeeds.
10. Record payment failure when the documented backend endpoint applies.
```

Checkout options must use backend values, not browser-calculated values.

Handle:

- Checkout script load failure.
- Razorpay object unavailable.
- Create-order API failure.
- User dismissal.
- Gateway failure callback.
- Verification failure.
- Duplicate button clicks.
- Duplicate verification requests.

Never generate HMAC in frontend.

---

# Payment APIs and UI

Use actual Part-3 endpoints, expected to include:

```text
POST /payments/create-order
POST /payments/verify
POST /payments/failure
GET  /payments
GET  /payments/:id
```

Payment success page:

- Show only backend-verified result.
- Display safe order and payment reference.
- Display verified INR amount.
- Link to order and payment details.
- Do not include raw signature.

Payment failed page:

- Display sanitized error or cancellation message.
- Provide retry when allowed.
- Link to cart or orders.
- Do not display raw gateway payload.

Payment history:

- Own payments for Customer.
- Authorized data for Admin based on backend.
- Status badge.
- Amount.
- Order number.
- Date.
- Pagination and supported filters.

Payment details:

- Display safe fields only.
- Never display card data, signature, raw webhook payload, or secrets.

---

# Dashboard UI

Customer dashboard:

- Welcome message.
- Cart count.
- Recent orders using existing order API.
- Recent payments using existing payment API.
- Quick navigation.

Admin dashboard:

Use:

```text
GET /dashboard/summary
GET /dashboard/recent-payments
```

Display:

- Total products.
- Total orders.
- Successful payments.
- Failed payments.
- Pending payments.
- Total collected amount.
- Recent payment table.

Keep charts optional. Do not add a heavy chart library unless it provides clear value and is justified.

---

# Profile UI

Use:

```text
GET /auth/profile
```

Display safe fields:

- Name.
- Email.
- Role.
- Status where appropriate.
- Account creation date where available.

Do not implement profile update unless an existing backend endpoint supports it.

---

# Formatting Utilities

Create one currency utility.

Confirm backend amount units before implementation.

Use INR formatting:

```javascript
new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR"
});
```

Create one date formatting utility using backend ISO timestamps.

Do not duplicate rupee/paise conversion logic in multiple pages.

---

# UX Requirements

Every data-driven page must support:

```text
Initial loading
Action loading
Empty state
Validation error
Authorization error
Not found
Network/server error
Success state
```

Requirements:

- Disable submit during requests.
- Prevent duplicate payment submissions.
- Preserve form data after recoverable errors.
- Use toasts for action feedback.
- Use page-level error states for fetch errors.
- Show backend request ID when useful.
- Never show stack traces.
- Avoid browser `alert()` for normal UX.

---

# Responsive and Accessibility Requirements

Support:

```text
Mobile
Tablet
Desktop
```

Implement:

- Responsive product grid.
- Mobile navigation.
- Scrollable or card-based tables on small screens.
- Semantic HTML.
- Input labels.
- Keyboard-accessible controls and modals.
- Visible focus states.
- Image alt text.
- Status text in addition to status colors.
- Readable color contrast.

---

# Testing Requirements

Use the project-compatible frontend test setup. Add Testing Library and MSW only if needed and compatible.

Expected test files may include:

```text
frontend/tests/auth.test.js
frontend/tests/products.test.js
frontend/tests/cart.test.js
frontend/tests/checkout.test.js
frontend/tests/orders.test.js
frontend/tests/payments.test.js
frontend/tests/dashboard.test.js
```

Test:

## Authentication

- Form validation.
- Successful login state.
- API login error.
- Guest route protection.
- Customer blocked from Admin page.

## Products

- List rendering.
- Search behavior.
- Empty state.
- Add to cart.
- Admin product form validation.

## Cart

- Item rendering.
- Quantity update.
- Remove item.
- Clear cart.
- Empty cart checkout restriction.

## Checkout

- Script load failure.
- Duplicate click prevention.
- Create application order call.
- Create Razorpay order call.
- Success callback sends backend verification.
- Success UI appears only after verification response.
- Verification failure follows failure flow.

## Orders and Payments

- List rendering.
- Empty state.
- Ownership/403 handling.
- Details rendering.

## Dashboard

- Admin summary rendering.
- Recent payment rendering.
- API failure state.

Mock `window.Razorpay`. Never call real Razorpay in tests.

---

# Package Scripts

Preserve existing scripts and add compatible scripts where missing:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "<project-compatible test command>"
}
```

Use the correct lint command for the installed Next.js version. Do not blindly use deprecated commands.

---

# Docker Requirements

Preserve the existing Docker foundation.

Verify:

- Frontend Docker build passes.
- Frontend can call backend using configured URL.
- Required public environment variables are available correctly.
- No backend secret enters frontend build output.
- Docker Compose config remains valid.
- Local non-Docker development still works.

---

# README Updates

Update root and frontend README with:

- Part-4 scope.
- Frontend architecture.
- Environment variables.
- Install and run commands.
- Lint, test, and build commands.
- Main frontend routes.
- Customer flow.
- Admin flow.
- Razorpay Test Mode instructions.
- Test payment steps.
- Security rules.
- Known limitations.
- Screenshots placeholder.
- Next phase.

Clearly state:

```text
This application uses Razorpay Test Mode. No real money is processed.
```

---

# Development Order

Follow this order unless the repository requires a documented adjustment:

```text
1. Inspect frontend and backend contracts.
2. Complete environment helper.
3. Complete Axios client.
4. Complete Auth Context.
5. Add route guards.
6. Add shared layout and navigation.
7. Implement products.
8. Implement Admin products.
9. Implement cart.
10. Implement checkout summary.
11. Integrate Razorpay Checkout Test Mode.
12. Implement backend payment verification.
13. Implement success/failure pages.
14. Implement orders.
15. Implement payments.
16. Implement Customer dashboard.
17. Implement Admin dashboard.
18. Implement profile.
19. Add loading, empty, and error states.
20. Add responsive and accessibility improvements.
21. Add tests.
22. Run lint.
23. Run tests.
24. Run production build.
25. Validate Docker.
26. Update README.
```

---

# After Implementation

Perform and report:

1. List all created files.
2. List all modified files.
3. Run frontend lint.
4. Run frontend tests.
5. Run frontend production build.
6. Validate Docker Compose.
7. Start backend and frontend where environment permits.
8. Verify registration.
9. Verify login.
10. Verify logout.
11. Verify protected routes.
12. Verify Admin role guards.
13. Verify product list and details.
14. Verify Admin product create/update/delete.
15. Verify cart add/update/remove/clear.
16. Verify order creation.
17. Verify Razorpay Test Checkout opens.
18. Verify backend payment verification.
19. Verify success is not shown before backend verification.
20. Verify failed/dismissed payment handling.
21. Verify order history and details.
22. Verify payment history and details.
23. Verify Admin dashboard.
24. Search frontend source and build output for `RAZORPAY_KEY_SECRET`.
25. Search frontend source and build output for `RAZORPAY_WEBHOOK_SECRET`.
26. Confirm no raw signature is logged or displayed.
27. Provide exact Windows CMD commands.
28. List remaining manual steps.
29. Do not start Part 5.

When external Razorpay Test credentials are unavailable, complete all non-secret implementation and tests using mocks, then clearly list live manual verification as pending.

---

# Acceptance Criteria

Part 4 is complete only when:

- Frontend starts successfully.
- Frontend lint passes.
- Frontend tests pass.
- Frontend production build passes.
- Register works.
- Login works.
- Logout works.
- Auth restoration works after refresh according to existing token strategy.
- Guest protection works.
- Customer cannot access Admin pages.
- Products list and details work.
- Supported search, sort, and pagination work.
- Admin can create and edit products.
- Admin soft-delete works.
- Customer cart operations work.
- Checkout uses backend-trusted order data.
- Razorpay Test Checkout opens with Key ID only.
- Browser callback is sent to backend verification.
- Success page is displayed only after verified backend response.
- Failure and dismissal paths do not show success.
- Orders list and details work.
- Payments list and details work.
- Customer dashboard works.
- Admin dashboard works.
- Profile works.
- Loading, empty, validation, unauthorized, not-found, and server-error states exist.
- Mobile and desktop layouts work.
- No Razorpay Key Secret is present in frontend.
- No Webhook Secret is present in frontend.
- No signature or sensitive payment data is logged.
- Docker Compose remains valid.
- README is updated.

---

# Windows CMD Commands

Provide exact project-compatible commands, including at minimum:

```cmd
cd frontend
npm install
npm run dev
npm run lint
npm test
npm run build
npm start
```

From project root:

```cmd
docker compose config
docker compose up --build
```

Adjust commands only when the repository scripts differ, and report the actual commands used.

---

# Final Output Format

Provide:

## Summary

## Repository Inspection

## Files Created

## Files Modified

## Frontend Architecture

## Authentication and Route Protection

## Product UI

## Admin Product Management

## Cart

## Checkout and Razorpay Integration

## Payment Verification Flow

## Orders

## Payments

## Dashboards

## Profile

## Responsive and Accessibility Work

## Tests

## Security Verification

## Docker Verification

## Verification Results

## Windows CMD Commands

## Remaining Manual Steps

## Part 5 Readiness

