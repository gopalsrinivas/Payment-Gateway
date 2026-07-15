# Payment Gateway Demo

# Part-4 – Frontend

---

# 1. Objective

Part 4 implements the complete frontend for the Payment Gateway Demo by extending the Part-1 Next.js foundation, using the Part-2 database design indirectly through the backend contracts, and consuming the secured Part-3 REST APIs.

The frontend must provide a clear, responsive, interview-ready user experience for authentication, products, cart, checkout, Razorpay Test Mode payment, orders, payment history, profile, and Admin dashboard operations.

The frontend must never access PostgreSQL directly and must never contain Razorpay Key Secret or Webhook Secret.

---

# 2. Prerequisites

Before starting Part 4, confirm that:

- Part-1 frontend foundation is working.
- Register, login, logout, profile, JWT handling, Axios client, and Auth Context exist.
- Part-2 database migrations and seeders are complete.
- Part-3 backend APIs are implemented and tested.
- Swagger is available for API contract verification.
- Razorpay Test Mode Key ID is available to the frontend.
- Razorpay Key Secret and Webhook Secret remain backend-only.

Required backend route groups:

```text
/api/v1/auth
/api/v1/products
/api/v1/cart
/api/v1/orders
/api/v1/payments
/api/v1/dashboard
/api/v1/health
```

---

# 3. Part-4 Scope

Implement:

- Public landing page.
- User registration and login pages.
- Authenticated application layout.
- Role-aware navigation.
- Product listing and product details.
- Product search, filter, sort, and pagination UI.
- Admin product create, update, and soft-delete screens.
- Customer cart management.
- Checkout summary.
- Razorpay Checkout Test Mode integration.
- Payment verification flow.
- Payment success and failure pages.
- Order history and order details.
- Payment history and payment details.
- User profile page.
- Customer dashboard summary.
- Admin dashboard summary and recent payments.
- Loading, empty, success, validation, and error states.
- Responsive design.
- Accessibility basics.
- Frontend tests.
- README documentation.

---

# 4. Out of Scope

Do not implement:

- Production Razorpay payments.
- Refund UI.
- Settlement reconciliation UI.
- Subscription billing UI.
- Coupon UI.
- Shipping and delivery tracking.
- Inventory management UI.
- Multi-vendor marketplace screens.
- Multi-currency support.
- Direct database access.
- Webhook processing in the frontend.
- Storing Razorpay Key Secret in frontend files.
- Complex state-management libraries unless the existing project already uses one correctly.
- Native mobile application.

---

# 5. Frontend Technology Stack

Use the existing project-compatible versions of:

```text
Next.js App Router
React
JavaScript
Tailwind CSS
Axios
React Hook Form
React Hot Toast
React Icons
jwt-decode
Razorpay Checkout.js
```

Optional lightweight additions are allowed only when justified:

```text
Zod or Yup for client-side schema validation
Testing Library
MSW for API mocking
```

Do not replace the existing stack without a clear repository conflict.

---

# 6. Frontend Architecture

Use:

```text
Page / Route
   |
   v
Reusable UI Component
   |
   v
Custom Hook or Context
   |
   v
Service Layer
   |
   v
Axios API Client
   |
   v
Part-3 Backend REST API
```

Rules:

- Pages coordinate rendering and route-level behavior.
- Components remain reusable and focused.
- API calls belong in service modules or dedicated hooks.
- Do not place repeated Axios calls directly across multiple page files.
- Authentication state belongs in Auth Context.
- Cart state may use Cart Context while the backend remains the source of truth.
- Keep business-sensitive validation in the backend even when client validation exists.
- Never trust frontend totals as authoritative.

---

# 7. Recommended Frontend Folder Structure

```text
frontend/
|
├── public/
│   ├── images/
│   └── icons/
|
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── login/
│   │   │   │   └── page.js
│   │   │   ├── register/
│   │   │   │   └── page.js
│   │   │   └── layout.js
│   │   |
│   │   ├── (shop)/
│   │   │   ├── products/
│   │   │   │   ├── page.js
│   │   │   │   └── [id]/page.js
│   │   │   └── layout.js
│   │   |
│   │   ├── (protected)/
│   │   │   ├── dashboard/page.js
│   │   │   ├── cart/page.js
│   │   │   ├── checkout/page.js
│   │   │   ├── orders/page.js
│   │   │   ├── orders/[id]/page.js
│   │   │   ├── payments/page.js
│   │   │   ├── payments/[id]/page.js
│   │   │   ├── profile/page.js
│   │   │   ├── payment-success/page.js
│   │   │   ├── payment-failed/page.js
│   │   │   └── layout.js
│   │   |
│   │   ├── admin/
│   │   │   ├── dashboard/page.js
│   │   │   ├── products/page.js
│   │   │   ├── products/new/page.js
│   │   │   ├── products/[id]/edit/page.js
│   │   │   └── layout.js
│   │   |
│   │   ├── unauthorized/page.js
│   │   ├── not-found.js
│   │   ├── error.js
│   │   ├── loading.js
│   │   ├── layout.js
│   │   └── page.js
│   |
│   ├── components/
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── dashboard/
│   │   ├── layout/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── products/
│   │   └── ui/
│   |
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   └── CartContext.js
│   |
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useCart.js
│   │   ├── useDebounce.js
│   │   └── useRazorpay.js
│   |
│   ├── services/
│   │   ├── apiClient.js
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── cartService.js
│   │   ├── orderService.js
│   │   ├── paymentService.js
│   │   └── dashboardService.js
│   |
│   ├── config/
│   │   ├── env.js
│   │   ├── routes.js
│   │   └── navigation.js
│   |
│   ├── utils/
│   │   ├── currency.js
│   │   ├── date.js
│   │   ├── errors.js
│   │   ├── storage.js
│   │   └── constants.js
│   |
│   └── styles/
│       └── globals.css
|
├── tests/
├── .env.example
├── next.config.mjs
├── package.json
├── Dockerfile
└── README.md
```

Preserve a different but clean existing structure instead of creating duplicates.

---

# 8. Environment Variables

Create or update `frontend/.env.example`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=replace_with_test_key_id
NEXT_PUBLIC_APP_NAME=Payment Gateway Demo
```

Rules:

- Only public-safe values may use the `NEXT_PUBLIC_` prefix.
- Never add `RAZORPAY_KEY_SECRET`.
- Never add `RAZORPAY_WEBHOOK_SECRET`.
- Never commit real environment files.
- Validate required public variables and show a clear development error when missing.

---

# 9. Route Access Matrix

| Route | Guest | Customer | Admin |
|---|---:|---:|---:|
| `/` | Yes | Yes | Yes |
| `/login` | Yes | Redirect if logged in | Redirect if logged in |
| `/register` | Yes | Redirect if logged in | Redirect if logged in |
| `/products` | Yes | Yes | Yes |
| `/products/:id` | Yes | Yes | Yes |
| `/dashboard` | No | Yes | Optional redirect to Admin dashboard |
| `/cart` | No | Yes | Yes if business rules allow |
| `/checkout` | No | Yes | Yes if business rules allow |
| `/orders` | No | Own orders | All or permitted orders based on API |
| `/orders/:id` | No | Own order | Authorized order |
| `/payments` | No | Own payments | Authorized payments |
| `/payments/:id` | No | Own payment | Authorized payment |
| `/profile` | No | Yes | Yes |
| `/admin/dashboard` | No | No | Yes |
| `/admin/products` | No | No | Yes |
| `/admin/products/new` | No | No | Yes |
| `/admin/products/:id/edit` | No | No | Yes |

Frontend route protection improves user experience, but backend authorization remains mandatory.

---

# 10. Authentication UX

## Register Page

Fields:

```text
Name
Email
Password
Confirm Password
```

Requirements:

- Use React Hook Form.
- Validate required fields.
- Validate email format.
- Require minimum password length based on backend contract.
- Confirm passwords match.
- Display field-level backend validation errors.
- On success, redirect according to the established authentication flow.
- Do not display or log passwords.

## Login Page

Fields:

```text
Email
Password
```

Requirements:

- Submit to the Part-1 login API.
- Store the JWT using the existing project strategy.
- Update Auth Context.
- Redirect Customer to `/dashboard`.
- Redirect Admin to `/admin/dashboard` where appropriate.
- Display invalid credential and inactive-user errors safely.

## Logout

- Call backend logout endpoint where already implemented.
- Remove the local token.
- Clear user and cart state.
- Redirect to `/login` or `/`.

## Auth Context

Expose at minimum:

```text
user
token
isAuthenticated
isLoading
login()
register()
logout()
refreshProfile()
hasRole()
```

Avoid treating a decoded JWT as the only source of current user data. Use the profile API for trusted user information.

---

# 11. Global Layout and Navigation

Create:

- Responsive header.
- Application title/logo.
- Product navigation.
- Cart icon with item count.
- Orders link.
- Payments link.
- Profile link.
- Admin navigation for Admin users.
- Login/Register buttons for guests.
- Logout action for authenticated users.
- Mobile navigation menu.
- Footer with Test Mode notice.

Display a visible notice:

```text
Demo application — Razorpay Test Mode only. No real payment is processed.
```

Do not expose secret configuration values in the UI.

---

# 12. Home Page

The home page should include:

- Project title.
- Short explanation of the demo.
- Test Mode disclaimer.
- CTA to browse products.
- CTA to login or register for guests.
- Summary of the payment flow.
- Clean interview-demo presentation.

Avoid excessive marketing content.

---

# 13. Product Listing Page

Route:

```text
/products
```

Consume:

```text
GET /api/v1/products
```

Features:

- Product cards.
- Product name.
- Short description.
- Price formatted in INR.
- Product image placeholder or safe URL.
- Active/availability indicator where provided.
- View details action.
- Add to cart action for authenticated users.
- Login prompt for guests.
- Search input with debounce.
- Status/category filters only when supported by the API.
- Sort by supported fields.
- Pagination controls.
- Loading skeleton.
- Empty results state.
- Retry action for failed requests.

Use query parameters supported by Part-3, for example:

```text
?page=1&limit=10&search=phone&sortBy=created_at&sortOrder=DESC
```

Do not invent unsupported filters.

---

# 14. Product Details Page

Route:

```text
/products/[id]
```

Consume:

```text
GET /api/v1/products/:id
```

Display:

- Product name.
- Description.
- INR price.
- Product image or placeholder.
- Product status.
- Quantity selector.
- Add to cart button.
- Back to products link.

Handle:

- Invalid product ID.
- Product not found.
- Deleted or inactive product.
- API failure.

---

# 15. Admin Product Management

Routes:

```text
/admin/products
/admin/products/new
/admin/products/[id]/edit
```

Consume:

```text
GET    /api/v1/products
POST   /api/v1/products
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id
```

Admin product list features:

- Search.
- Pagination.
- Product status.
- Price.
- Created date.
- Edit action.
- Soft-delete action.
- Confirmation dialog before delete.
- Success and error toasts.

Product form fields must match the backend contract, such as:

```text
name
sku
description
price
image_url
is_active
```

Requirements:

- Use one reusable Product Form for create and edit.
- Convert user-entered price carefully according to API expectations.
- Never send audit user IDs manually when backend derives them from JWT.
- Do not permanently delete data from the frontend.

---

# 16. Cart

Route:

```text
/cart
```

Consume:

```text
GET    /api/v1/cart
POST   /api/v1/cart/items
PATCH  /api/v1/cart/items/:id
DELETE /api/v1/cart/items/:id
DELETE /api/v1/cart
```

Features:

- Display cart items.
- Product name and price.
- Quantity controls.
- Per-item subtotal.
- Backend-calculated cart total when supplied.
- Remove item.
- Clear cart.
- Continue shopping.
- Proceed to checkout.
- Empty cart state.
- Disable actions while request is processing.

Rules:

- Backend cart data is the source of truth.
- Refresh cart after mutations or update state using confirmed API responses.
- Do not calculate the authoritative payable amount only in the browser.
- Prevent quantity below 1.
- Respect backend maximum quantity validation.

---

# 17. Checkout Page

Route:

```text
/checkout
```

Requirements:

- Protected route.
- Redirect to `/cart` when the cart is empty.
- Show items, quantities, subtotals, and trusted API total.
- Show Test Mode disclaimer.
- Provide a clear “Pay with Razorpay” action.
- Disable duplicate clicks while order/payment creation is in progress.
- Show clear recoverable error states.

Recommended flow:

```text
1. Load current cart.
2. User confirms checkout.
3. Create application order using POST /api/v1/orders.
4. Create Razorpay order using POST /api/v1/payments/create-order.
5. Load Razorpay Checkout.js.
6. Open Razorpay Checkout using backend response.
7. Receive Razorpay success callback.
8. Send payment IDs and signature to POST /api/v1/payments/verify.
9. Redirect to payment success only after backend verification succeeds.
10. On Checkout failure or dismissal, record failure where appropriate and show a safe retry path.
```

Do not mark payment successful from the Razorpay browser callback alone.

---

# 18. Razorpay Checkout Integration

Load:

```text
https://checkout.razorpay.com/v1/checkout.js
```

Use a reusable hook or utility to load the script once.

Checkout options should use backend-provided trusted values:

```javascript
{
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: backendResponse.amount,
  currency: backendResponse.currency,
  name: "Payment Gateway Demo",
  description: "Test Mode Order Payment",
  order_id: backendResponse.razorpayOrderId,
  handler: async function (response) {
    // Send IDs and signature to backend verification API.
  },
  prefill: {
    name: currentUser.name,
    email: currentUser.email
  },
  theme: {}
}
```

Rules:

- Use Razorpay Key ID only.
- Do not expose Key Secret.
- Do not generate or verify signatures in the frontend.
- Do not accept a frontend-entered amount.
- Do not trust the callback without backend verification.
- Prevent duplicate verification requests.
- Handle script load failure.
- Handle Checkout dismissal without falsely marking payment successful.

---

# 19. Payment Success Page

Route:

```text
/payment-success
```

Display only after successful backend verification.

Show:

- Success status.
- Application order number.
- Payment reference where safe.
- Verified amount formatted in INR.
- Payment timestamp.
- View order action.
- View payment action.
- Continue shopping action.

Avoid placing sensitive payment information in URL query parameters.

Preferred approach:

- Use verified response state temporarily.
- Or load order/payment details by an authorized identifier from the backend.

---

# 20. Payment Failure Page

Route:

```text
/payment-failed
```

Show:

- Clear failure or cancellation message.
- Safe non-sensitive reason where available.
- Application order number when known.
- Retry payment action when backend status permits.
- Return to cart or orders.
- Support contact guidance for demo troubleshooting.

Do not display raw gateway error payloads or secrets.

---

# 21. Orders

## Order History

Route:

```text
/orders
```

Consume:

```text
GET /api/v1/orders
```

Display:

- Order number.
- Created date.
- Item count.
- Total amount.
- Order status.
- Payment status where returned.
- View details action.
- Pagination.
- Empty state.

## Order Details

Route:

```text
/orders/[id]
```

Consume:

```text
GET /api/v1/orders/:id
```

Display:

- Order number.
- Order status.
- Created date.
- Item snapshot details.
- Quantity and unit price.
- Total amount.
- Payment summary.
- Retry payment action only for eligible states.

Customer users must never see another customer’s order. The backend enforces ownership; the frontend handles 403 safely.

---

# 22. Payment History

## Payment List

Route:

```text
/payments
```

Consume:

```text
GET /api/v1/payments
```

Display:

- Payment reference.
- Order number.
- Amount.
- Status.
- Payment method where available.
- Created or paid date.
- View details action.
- Filter controls only when supported.
- Pagination.

## Payment Details

Route:

```text
/payments/[id]
```

Consume:

```text
GET /api/v1/payments/:id
```

Display only safe fields:

- Application payment ID.
- Razorpay payment ID where approved for display.
- Order number.
- Amount and currency.
- Status.
- Payment method.
- Error code or description only when sanitized.
- Created, verified, or paid timestamp.

Never display:

- Card number.
- CVV.
- Razorpay secrets.
- Raw signature.
- Raw webhook payload.
- Full sensitive gateway metadata.

---

# 23. Dashboard

## Customer Dashboard

Route:

```text
/dashboard
```

Show practical customer information using existing APIs:

- Welcome message.
- Cart item count.
- Recent orders.
- Recent payments.
- Quick links to products, cart, orders, and payments.

Do not create unsupported backend endpoints only for decorative widgets.

## Admin Dashboard

Route:

```text
/admin/dashboard
```

Consume:

```text
GET /api/v1/dashboard/summary
GET /api/v1/dashboard/recent-payments
```

Display:

- Total products.
- Total orders.
- Successful payments.
- Failed payments.
- Pending payments.
- Total collected amount.
- Recent payment table.
- Simple status breakdown.

Use simple cards and tables. Charts are optional and should not add a large dependency for this small project.

---

# 24. Profile Page

Route:

```text
/profile
```

Consume:

```text
GET /api/v1/auth/profile
```

Display:

- Name.
- Email.
- Role.
- Active status where appropriate.
- Account creation date where available.

Part 4 does not require profile update APIs unless Part-3 already defines them.

---

# 25. API Client

Use one configured Axios instance.

Responsibilities:

- Use `NEXT_PUBLIC_API_BASE_URL`.
- Add JWT Authorization header.
- Set JSON headers where appropriate.
- Do not attach JWT to external Razorpay script requests.
- Normalize backend errors.
- Handle 401 by clearing invalid authentication state.
- Redirect to login when appropriate.
- Handle 403 separately from 401.
- Preserve request IDs from backend error responses for troubleshooting.

Avoid infinite refresh or redirect loops.

---

# 26. Service Layer

Expected service methods include:

```text
authService.register()
authService.login()
authService.logout()
authService.getProfile()

productService.listProducts()
productService.getProduct()
productService.createProduct()
productService.updateProduct()
productService.deleteProduct()

cartService.getCart()
cartService.addItem()
cartService.updateItem()
cartService.removeItem()
cartService.clearCart()

orderService.createOrder()
orderService.listOrders()
orderService.getOrder()

paymentService.createRazorpayOrder()
paymentService.verifyPayment()
paymentService.recordFailure()
paymentService.listPayments()
paymentService.getPayment()

dashboardService.getSummary()
dashboardService.getRecentPayments()
```

Return normalized API data or throw normalized errors.

---

# 27. Error Handling UX

Handle:

- Offline/network failure.
- API timeout.
- 400 validation error.
- 401 unauthenticated.
- 403 unauthorized.
- 404 not found.
- 409 duplicate/conflict.
- 422 business validation failure where used.
- 429 rate limit.
- 500 server error.
- Razorpay script load error.
- Payment verification failure.

Requirements:

- Use field errors for form validation.
- Use toast for action results.
- Use page-level error components for fetch failures.
- Show backend `requestId` when useful for support.
- Never display stack traces.
- Never display secrets or full raw gateway errors.

---

# 28. Loading and Empty States

Every data page must define:

```text
Initial loading state
Background action loading state
Empty state
Error state
Success state
```

Examples:

- Product skeleton cards.
- Empty cart illustration or message.
- No orders message.
- No payment history message.
- Disabled payment button during processing.

Avoid duplicate submissions.

---

# 29. Form Standards

- Use labels for every input.
- Show required indicators.
- Use correct input types.
- Trim text values where safe.
- Disable submit during request.
- Show field-level errors.
- Preserve user input after recoverable errors.
- Confirm destructive actions.
- Do not rely only on placeholder text.
- Do not use browser alerts for normal application flow.

---

# 30. Currency and Date Formatting

Currency:

```javascript
new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR"
}).format(amount)
```

Confirm whether backend amounts are returned in rupees or paise and centralize conversion in one utility.

Never apply conversion inconsistently across pages.

Dates:

- Use a shared formatter.
- Display human-readable local date/time.
- Preserve backend ISO timestamps internally.
- Handle null payment dates safely.

---

# 31. Responsive Design

Support at minimum:

```text
Mobile
Tablet
Desktop
```

Requirements:

- Product grids adapt by screen size.
- Tables become scrollable or card-based on mobile.
- Forms remain readable.
- Checkout CTA remains accessible.
- Mobile navigation works with keyboard and touch.
- Avoid fixed-width layouts.

---

# 32. Accessibility Basics

- Semantic HTML.
- Associated labels.
- Keyboard-accessible buttons and dialogs.
- Visible focus states.
- Meaningful button text.
- Alt text for product images.
- Color contrast appropriate for normal reading.
- Do not communicate status using color alone.
- Use `aria-live` or equivalent for important dynamic status where useful.

---

# 33. Frontend Security Rules

- Never expose Razorpay Key Secret.
- Never expose Webhook Secret.
- Never verify signatures in the browser.
- Never trust price or amount from browser state.
- Never mark a payment successful before backend verification.
- Do not render raw HTML from API responses.
- Do not store passwords.
- Do not log JWT tokens or payment payloads.
- Avoid sensitive data in query parameters.
- Protect Admin routes in the UI and rely on backend RBAC.
- Handle expired tokens safely.
- Use Test Mode only.

Token storage must follow the existing Part-1 implementation. Do not silently migrate storage strategy during Part 4 unless fixing a documented security defect.

---

# 34. State Management

Use:

- Auth Context for authenticated user state.
- Cart Context for cart badge and cart actions if useful.
- Local component state for page-specific UI.
- URL query parameters for product search, sort, and pagination where practical.

Do not add Redux or another global state library for this small application unless the existing repository already uses it.

Backend remains the source of truth for:

```text
User identity
Role
Products
Cart
Orders
Payments
Dashboard totals
```

---

# 35. SEO and Metadata

Add basic metadata for:

- Home.
- Products.
- Login.
- Register.
- Dashboard.
- Orders.
- Payments.

Do not expose user-specific or payment-sensitive information in metadata.

---

# 36. Swagger and API Contract Alignment

Before implementing each feature:

- Verify endpoint.
- Verify HTTP method.
- Verify request body.
- Verify query parameters.
- Verify response envelope.
- Verify pagination format.
- Verify allowed statuses.
- Verify authorization rule.

Do not guess API field names when Swagger or Part-3 documentation provides them.

---

# 37. Frontend Tests

Add meaningful tests for:

## Authentication

- Login form validation.
- Successful login behavior.
- Login API error display.
- Protected route behavior.
- Admin route denial for Customer.

## Products

- Product list rendering.
- Search request behavior.
- Empty state.
- Add to cart action.
- Admin product form validation.

## Cart

- Cart item rendering.
- Quantity update.
- Remove item.
- Empty cart.
- Checkout disabled when empty.

## Checkout and Payment

- Razorpay script load failure.
- Payment button prevents duplicate clicks.
- Successful callback sends verification request.
- Success page shown only after backend verification.
- Verification failure shows failure path.

## Orders and Payments

- Order list rendering.
- Order ownership error handling.
- Payment list rendering.
- Empty states.

## Dashboard

- Admin summary cards.
- Recent payments table.
- API error state.

Mock backend and Razorpay Checkout safely. Do not call real Razorpay APIs in automated tests.

---

# 38. Docker Requirements

Use the existing frontend Dockerfile and Docker Compose service.

Confirm:

- Frontend builds successfully.
- Public environment variables are available at the correct build/runtime stage.
- Frontend reaches backend using the configured URL.
- No secret backend variables are copied into the frontend image.
- Docker production build does not depend on local-only files.

---

# 39. README Updates

Update root and frontend README with:

- Part-4 scope.
- Frontend architecture.
- Environment variables.
- Installation command.
- Development command.
- Production build command.
- Test command.
- Required backend dependency.
- Razorpay Test Mode setup.
- Test payment instructions.
- Main routes.
- Admin and Customer flows.
- Security notes.
- Known limitations.
- Screenshots section placeholder.
- Next phase.

Clearly state that no real money is processed.

---

# 40. Recommended Development Order

```text
1. Inspect existing frontend.
2. Verify Part-3 Swagger contracts.
3. Fix or complete shared API client.
4. Complete Auth Context and route guards.
5. Build shared layout and navigation.
6. Build product listing and details.
7. Build Admin product management.
8. Build Cart Context and cart page.
9. Build checkout page.
10. Integrate Razorpay Checkout Test Mode.
11. Implement backend verification flow.
12. Build success and failure pages.
13. Build orders pages.
14. Build payments pages.
15. Build Customer dashboard.
16. Build Admin dashboard.
17. Build profile page.
18. Add loading, empty, and error states.
19. Add responsive and accessibility fixes.
20. Add tests.
21. Run lint, tests, and production build.
22. Validate Docker.
23. Update README.
24. Commit Part 4.
```

---

# 41. Part-4 Deliverables

Part 4 should produce:

- Completed Next.js frontend.
- Public and protected layouts.
- Authentication UI.
- Role-aware navigation.
- Product catalog.
- Admin product management.
- Cart UI.
- Checkout UI.
- Razorpay Checkout Test Mode integration.
- Backend payment verification integration.
- Payment success and failure pages.
- Order history and details.
- Payment history and details.
- Customer dashboard.
- Admin dashboard.
- Profile page.
- Reusable UI components.
- Service modules.
- Shared formatting and error utilities.
- Frontend tests.
- README updates.

---

# 42. Part-4 Acceptance Criteria

Part 4 is complete only when:

- Frontend development server starts.
- Frontend production build passes.
- Frontend lint passes.
- Frontend tests pass.
- Register works.
- Login works.
- Logout works.
- Protected routes reject guests.
- Customer cannot access Admin screens.
- Product list and details work.
- Product search and pagination work according to API support.
- Admin can create, update, and soft-delete products.
- Customer can add, update, remove, and clear cart items.
- Checkout uses backend cart/order amounts.
- Razorpay Test Checkout opens.
- Payment verification is sent to backend.
- Payment success is shown only after backend verification.
- Payment failure and cancellation are handled safely.
- Order history and details work.
- Payment history and details work.
- Admin dashboard loads summary data.
- Responsive layouts work on mobile and desktop.
- Loading, empty, validation, and error states exist.
- No Razorpay Key Secret appears in frontend source or build output.
- No Webhook Secret appears in frontend source or build output.
- No raw payment signature is stored or displayed.
- Docker Compose remains valid.
- README is updated.

---

# 43. Manual Verification Checklist

```text
1. Open home page.
2. Register a Customer.
3. Login as Customer.
4. Browse products.
5. Search products.
6. Open product details.
7. Add product to cart.
8. Update quantity.
9. Remove and re-add an item.
10. Open checkout.
11. Create application order.
12. Open Razorpay Test Checkout.
13. Complete a successful test payment.
14. Confirm backend verification.
15. Open payment success page.
16. Confirm order appears in order history.
17. Confirm payment appears in payment history.
18. Test a failed or dismissed payment.
19. Confirm failure UI does not show success.
20. Login as Admin.
21. Open Admin dashboard.
22. Create a product.
23. Edit the product.
24. Soft-delete the product.
25. Confirm deleted product is not shown in normal Customer listing.
26. Test unauthorized Admin route access as Customer.
27. Test mobile navigation.
28. Confirm browser console contains no secrets or sensitive payloads.
```

---

# 44. Windows CMD Commands

Install dependencies:

```cmd
cd frontend
npm install
```

Run development server:

```cmd
npm run dev
```

Run lint:

```cmd
npm run lint
```

Run tests:

```cmd
npm test
```

Run production build:

```cmd
npm run build
```

Start production build:

```cmd
npm start
```

Validate Docker Compose from project root:

```cmd
docker compose config
```

Start full stack:

```cmd
docker compose up --build
```

---

# 45. Next Phase

The recommended next document is:

```text
Part-5-Testing-DevOps-Deployment.md
```

It may include:

- End-to-end testing.
- Postman/Newman automation.
- CI/CD.
- GitHub Actions.
- CodeQL.
- Trivy.
- Docker hardening.
- Deployment.
- Monitoring.
- Final interview demonstration script.

