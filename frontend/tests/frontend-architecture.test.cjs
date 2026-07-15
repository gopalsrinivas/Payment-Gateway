const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const exists = (relative) => fs.existsSync(path.join(root, relative));

test("Part 4 route files exist", () => {
  [
    "src/app/page.js",
    "src/app/login/page.js",
    "src/app/register/page.js",
    "src/app/dashboard/page.js",
    "src/app/products/page.js",
    "src/app/products/[id]/page.js",
    "src/app/cart/page.js",
    "src/app/checkout/page.js",
    "src/app/orders/page.js",
    "src/app/orders/[id]/page.js",
    "src/app/payments/page.js",
    "src/app/payments/[id]/page.js",
    "src/app/profile/page.js",
    "src/app/payment-success/page.js",
    "src/app/payment-failed/page.js",
    "src/app/admin/dashboard/page.js",
    "src/app/admin/products/page.js",
    "src/app/admin/products/new/page.js",
    "src/app/admin/products/[id]/edit/page.js",
    "src/app/admin/orders/page.js",
    "src/app/admin/orders/[id]/page.js",
    "src/app/admin/payments/page.js",
    "src/app/admin/payment-logs/page.js",
    "src/app/admin/profile/page.js",
  ].forEach((file) => assert.equal(exists(file), true, `${file} should exist`));
});

test("service layer targets Part 3 backend route groups", () => {
  const services = [
    read("src/services/productService.js"),
    read("src/services/cartService.js"),
    read("src/services/orderService.js"),
    read("src/services/paymentService.js"),
    read("src/services/paymentLogService.js"),
    read("src/services/dashboardService.js"),
  ].join("\n");

  ["/products", "/cart", "/orders", "/payments", "/payment-logs", "/dashboard"].forEach((route) => {
    assert.match(services, new RegExp(route.replace("/", "\\/")));
  });
});

test("frontend does not expose backend-only Razorpay secrets", () => {
  const files = fs
    .readdirSync(path.join(root, "src"), { recursive: true })
    .filter((file) => typeof file === "string" && file.endsWith(".js"))
    .map((file) => read(path.join("src", file)));
  const source = files.join("\n");

  assert.equal(source.includes("RAZORPAY_KEY_SECRET"), false);
  assert.equal(source.includes("RAZORPAY_WEBHOOK_SECRET"), false);
});

test("checkout uses Part 5 Razorpay verification flow", () => {
  const checkout = read("src/app/checkout/page.js");
  const paymentService = read("src/services/paymentService.js");
  const razorpayHook = read("src/hooks/useRazorpay.js");

  assert.match(checkout, /createOrder/);
  assert.match(checkout, /initializePayment/);
  assert.match(checkout, /verifyPayment/);
  assert.match(checkout, /recordPaymentFailure/);
  assert.match(checkout, /router\.push\(`\/payment-success\?paymentId=/);
  assert.match(paymentService, /\/payments\/initialize/);
  assert.match(paymentService, /\/payments\/verify/);
  assert.match(paymentService, /\/payments\/failure/);
  assert.match(razorpayHook, /https:\/\/checkout\.razorpay\.com\/v1\/checkout\.js/);
  assert.match(razorpayHook, /new window\.Razorpay/);
});

test("role rendering and comparisons use normalization", () => {
  const files = fs
    .readdirSync(path.join(root, "src"), { recursive: true })
    .filter((file) => typeof file === "string" && file.endsWith(".js"))
    .filter((file) => file !== path.join("utils", "auth.js"))
    .map((file) => [file, read(path.join("src", file))]);

  for (const [file, source] of files) {
    assert.doesNotMatch(source, /\{user\?\.role\}/, `${file} should not render user.role directly`);
    assert.doesNotMatch(source, /user\?\.role\s*[!=]==/, `${file} should not compare user.role directly`);
  }
});

test("product details exposes customer cart actions", () => {
  const productDetails = read("src/app/products/[id]/page.js");
  assert.match(productDetails, /Add to Cart/);
  assert.match(productDetails, /Buy Now/);
  assert.match(productDetails, /router\.push\("\/checkout"\)/);
});

test("API validation errors prefer field-level backend messages", () => {
  const errors = read("src/utils/errors.js");
  assert.match(errors, /fieldMessages\[0\]/);
  assert.match(errors, /requestId/);
});

test("visible frontend branding uses Payment Gateway", () => {
  const sourceFiles = fs
    .readdirSync(path.join(root, "src"), { recursive: true })
    .filter((file) => typeof file === "string" && file.endsWith(".js"))
    .map((file) => read(path.join("src", file)))
    .join("\n");

  assert.match(sourceFiles, /Payment Gateway/);
  assert.equal(sourceFiles.includes("Payment Gateway Demo"), false);
  assert.equal(sourceFiles.includes("Demo application"), false);
});

test("customer and admin layouts are structurally separated", () => {
  const appShell = read("src/components/layout/AppShell.js");
  const customerNavbar = read("src/components/layout/CustomerNavbar.js");
  const adminSidebar = read("src/components/layout/AdminSidebar.js");

  assert.match(appShell, /AdminLayout/);
  assert.match(appShell, /CustomerLayout/);
  assert.match(customerNavbar, /Customer Panel/);
  assert.match(customerNavbar, /Dashboard/);
  assert.match(customerNavbar, /Cart/);
  assert.match(customerNavbar, /aria-label=\{`Cart with \$\{itemCount\} items`\}/);
  assert.doesNotMatch(customerNavbar, /Payment Logs/);
  assert.doesNotMatch(customerNavbar, /Product Management/);
  assert.match(adminSidebar, /Admin Panel/);
  assert.match(adminSidebar, /Product Management/);
  assert.match(adminSidebar, /Payment Logs/);
  assert.doesNotMatch(adminSidebar, /Cart|Buy Now|Customer Panel/);
});

test("customer order filters omit empty and all values before API requests", () => {
  const queryUtils = read("src/utils/query.js");
  const orderService = read("src/services/orderService.js");
  const ordersPage = read("src/app/orders/page.js");

  assert.match(queryUtils, /value !== ""/);
  assert.match(queryUtils, /value !== "ALL"/);
  assert.match(orderService, /cleanQueryParams/);
  assert.match(orderService, /params: cleanQueryParams\(params\)/);
  assert.match(ordersPage, /status: "ALL"/);
  assert.match(ordersPage, /paymentStatus: "ALL"/);
  assert.match(ordersPage, /valueOrAll\(params\.get\("status"\), ORDER_FILTER_STATUSES\)/);
  assert.match(ordersPage, /valueOrAll\(params\.get\("paymentStatus"\), PAYMENT_FILTER_STATUSES\)/);
  assert.match(ordersPage, /window\.history\.replaceState/);
});

test("customer order filters use backend-supported enum values", () => {
  const constants = read("src/utils/constants.js");
  const filters = read("src/components/orders/OrderFilters.js");

  [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "COMPLETED",
    "CANCELLED",
    "FAILED",
    "CREATED",
    "AUTHORIZED",
    "CAPTURED",
    "PAID",
    "REFUNDED",
    "PARTIALLY_REFUNDED",
  ].forEach((status) => assert.match(constants, new RegExp(`"${status}"`)));

  assert.match(filters, /value="ALL">All Orders/);
  assert.match(filters, /value="ALL">All Payments/);
  assert.match(filters, /Reset Filters/);
  assert.doesNotMatch(filters, /value=""/);
});

test("customer pages use customer-specific surfaces", () => {
  const dashboard = read("src/app/dashboard/page.js");
  const orders = read("src/app/orders/page.js");
  const products = read("src/app/products/page.js");
  const cart = read("src/app/cart/page.js");
  const profile = read("src/app/profile/page.js");

  assert.match(dashboard, /CustomerPageHeader/);
  assert.match(dashboard, /CustomerStatCard/);
  assert.match(dashboard, /Browse Products/);
  assert.match(orders, /CustomerOrderCard/);
  assert.match(orders, /OrderFilters/);
  assert.match(products, /CustomerPageHeader/);
  assert.match(cart, /CustomerPageHeader/);
  assert.match(cart, /Continue Shopping/);
  assert.match(profile, /CustomerPageHeader/);
  assert.doesNotMatch([dashboard, orders, products, cart, profile].join("\n"), /AdminLayout|AdminSidebar|Payment Logs|Product Management/);
});

test("order detail links are role-specific", () => {
  const customerOrders = read("src/app/orders/page.js");
  const customerOrderCard = read("src/components/orders/CustomerOrderCard.js");
  const adminOrders = read("src/app/admin/orders/page.js");

  assert.match(customerOrders, /CustomerOrderCard/);
  assert.match(customerOrderCard, /href=\{`\/orders\/\$\{order\.id\}`\}/);
  assert.match(adminOrders, /href=\{`\/admin\/orders\/\$\{order\.id\}`\}/);
});

test("customer missing order message is ownership-safe", () => {
  const customerOrderDetails = read("src/app/orders/[id]/page.js");
  assert.match(customerOrderDetails, /This order does not exist or is not available for your account/);
  assert.match(customerOrderDetails, /Back to My Orders/);
});

test("payment result pages refetch safe backend payment data", () => {
  const successPage = read("src/app/payment-success/page.js");
  const failedPage = read("src/app/payment-failed/page.js");

  assert.match(successPage, /getPayment/);
  assert.match(successPage, /Verified payment reference is required/);
  assert.doesNotMatch(successPage, /razorpay_signature/);
  assert.match(failedPage, /Retry payment/);
  assert.doesNotMatch(failedPage, /JSON\.stringify/);
});
