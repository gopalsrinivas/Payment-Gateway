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

test("checkout remains Part 4 preparation only", () => {
  const checkout = read("src/app/checkout/page.js");
  assert.match(checkout, /createOrder/);
  assert.doesNotMatch(checkout, /new window\.Razorpay/);
  assert.doesNotMatch(checkout, /payments\/verify|payments\/create-order|razorpay_signature/);
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
  assert.match(customerNavbar, /Customer Dashboard/);
  assert.match(customerNavbar, /My Cart/);
  assert.doesNotMatch(customerNavbar, /Payment Logs/);
  assert.match(adminSidebar, /Admin Panel/);
  assert.match(adminSidebar, /Product Management/);
  assert.match(adminSidebar, /Payment Logs/);
  assert.doesNotMatch(adminSidebar, /My Cart|Buy Now/);
});

test("order detail links are role-specific", () => {
  const customerOrders = read("src/app/orders/page.js");
  const adminOrders = read("src/app/admin/orders/page.js");

  assert.match(customerOrders, /href=\{`\/orders\/\$\{order\.id\}`\}/);
  assert.match(adminOrders, /href=\{`\/admin\/orders\/\$\{order\.id\}`\}/);
});

test("customer missing order message is ownership-safe", () => {
  const customerOrderDetails = read("src/app/orders/[id]/page.js");
  assert.match(customerOrderDetails, /This order does not exist or is not available for your account/);
  assert.match(customerOrderDetails, /Back to My Orders/);
});
