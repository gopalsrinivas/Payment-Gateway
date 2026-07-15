const assert = require("node:assert/strict");
const test = require("node:test");
const request = require("supertest");

process.env.RAZORPAY_KEY_ID = "rzp_test_unit";
process.env.RAZORPAY_KEY_SECRET = "unit_secret";
process.env.RAZORPAY_WEBHOOK_SECRET = "webhook_secret";

const app = require("../src/app");
const env = require("../src/config/env");
const { setRazorpayClientForTests } = require("../src/config/razorpay");
const { Order, OrderItem, Payment, Product, Role, User, WebhookEvent, sequelize } = require("../src/models");
const { ORDER_PAYMENT_STATUS, ORDER_STATUS, PAYMENT_STATUS } = require("../src/utils/constants");
const { hmacSha256 } = require("../src/utils/signature");
const { signToken } = require("../src/utils/jwt");
const { hashPassword } = require("../src/utils/password");

const suffix = Date.now();
const auth = (token) => ({ Authorization: `Bearer ${token}` });
let orderCounter = 0;
let razorpayCreateCalls = 0;
let customer;
let otherCustomer;
let customerToken;
let otherToken;
let product;
const createdUserIds = [];
const orderIds = [];

const makeOrder = async ({ userId = customer.id, total = "123.45", paymentStatus = ORDER_PAYMENT_STATUS.PENDING } = {}) => {
  orderCounter += 1;
  const order = await Order.create({
    order_number: `ORD-PART5-${suffix}-${orderCounter}`,
    user_id: userId,
    subtotal_amount: total,
    tax_amount: "0.00",
    discount_amount: "0.00",
    total_amount: total,
    currency: "INR",
    status: ORDER_STATUS.PENDING,
    payment_status: paymentStatus,
    created_by: userId,
    updated_by: userId,
  });
  orderIds.push(order.id);
  await OrderItem.create({
    order_id: order.id,
    product_id: product.id,
    product_name: product.name,
    product_sku: product.sku,
    unit_price: total,
    quantity: 1,
    line_total: total,
    created_by: userId,
    updated_by: userId,
  });
  return order;
};

test.before(async () => {
  await sequelize.authenticate();
  const role = await Role.findOne({ where: { name: "Customer" } });
  customer = await User.create({
    name: "Part 5 Customer",
    email: `part5-customer-${suffix}@example.com`,
    password: await hashPassword("Password123"),
    role_id: role.id,
  });
  otherCustomer = await User.create({
    name: "Part 5 Other",
    email: `part5-other-${suffix}@example.com`,
    password: await hashPassword("Password123"),
    role_id: role.id,
  });
  createdUserIds.push(customer.id, otherCustomer.id);
  customerToken = signToken({ userId: customer.id, email: customer.email, role: "Customer" });
  otherToken = signToken({ userId: otherCustomer.id, email: otherCustomer.email, role: "Customer" });
  product = await Product.create({
    name: "Part 5 Product",
    slug: `part-5-product-${suffix}`,
    sku: `PART5-${suffix}`,
    price: "123.45",
    currency: "INR",
  });

  setRazorpayClientForTests({
    orders: {
      create: async (payload) => {
        razorpayCreateCalls += 1;
        return { id: `order_part5_${suffix}_${razorpayCreateCalls}`, ...payload };
      },
    },
  });
});

test.after(async () => {
  await sequelize.query("DELETE FROM webhook_events WHERE provider_event_id LIKE :pattern", { replacements: { pattern: `evt_part5_${suffix}%` } });
  await sequelize.query("DELETE FROM payment_logs WHERE order_id IN (:ids)", { replacements: { ids: orderIds.length ? orderIds : [0] } });
  await sequelize.query("DELETE FROM payments WHERE order_id IN (:ids)", { replacements: { ids: orderIds.length ? orderIds : [0] } });
  await sequelize.query("DELETE FROM order_items WHERE order_id IN (:ids)", { replacements: { ids: orderIds.length ? orderIds : [0] } });
  await sequelize.query("DELETE FROM orders WHERE id IN (:ids)", { replacements: { ids: orderIds.length ? orderIds : [0] } });
  await sequelize.query("DELETE FROM products WHERE sku = :sku", { replacements: { sku: product?.sku || "" } });
  await sequelize.query("DELETE FROM users WHERE id IN (:ids)", { replacements: { ids: createdUserIds } });
  await sequelize.close();
});

test("customer initializes Razorpay order with trusted paise amount and duplicate reuse", async () => {
  const order = await makeOrder();
  const first = await request(app).post("/api/v1/payments/initialize").set(auth(customerToken)).send({ orderId: order.id, amount: 1 });
  assert.equal(first.status, 400);

  const created = await request(app).post("/api/v1/payments/initialize").set(auth(customerToken)).send({ orderId: order.id });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.amount, 12345);
  assert.equal(created.body.data.razorpayOrderId, `order_part5_${suffix}_1`);
  assert.equal(created.text.includes(env.razorpay.keySecret), false);

  const reused = await request(app).post("/api/v1/payments/create-order").set(auth(customerToken)).send({ orderId: order.id });
  assert.equal(reused.status, 201);
  assert.equal(reused.body.data.razorpayOrderId, created.body.data.razorpayOrderId);
  assert.equal(razorpayCreateCalls, 1);
});

test("customer cannot initialize another customer's order and already-paid orders are rejected", async () => {
  const order = await makeOrder();
  const denied = await request(app).post("/api/v1/payments/initialize").set(auth(otherToken)).send({ orderId: order.id });
  assert.equal(denied.status, 404);

  const paid = await makeOrder({ paymentStatus: ORDER_PAYMENT_STATUS.CAPTURED });
  const paidResult = await request(app).post("/api/v1/payments/initialize").set(auth(customerToken)).send({ orderId: paid.id });
  assert.equal(paidResult.status, 409);
});

test("valid signature verifies payment and repeated verification is idempotent", async () => {
  const order = await makeOrder();
  const init = await request(app).post("/api/v1/payments/initialize").set(auth(customerToken)).send({ orderId: order.id });
  const data = init.body.data;
  const razorpayPaymentId = `pay_part5_${suffix}_valid`;
  const signature = hmacSha256(`${data.razorpayOrderId}|${razorpayPaymentId}`, env.razorpay.keySecret);

  const verified = await request(app).post("/api/v1/payments/verify").set(auth(customerToken)).send({
    paymentId: data.paymentId,
    applicationOrderId: order.id,
    razorpayOrderId: data.razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature: signature,
  });
  assert.equal(verified.status, 200);
  assert.equal(verified.body.data.paymentStatus, PAYMENT_STATUS.CAPTURED);

  const again = await request(app).post("/api/v1/payments/verify").set(auth(customerToken)).send({
    paymentId: data.paymentId,
    applicationOrderId: order.id,
    razorpayOrderId: data.razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature: signature,
  });
  assert.equal(again.status, 200);
  assert.equal(again.body.data.idempotent, true);
});

test("invalid signature and mismatched Razorpay order are rejected", async () => {
  const order = await makeOrder();
  const init = await request(app).post("/api/v1/payments/initialize").set(auth(customerToken)).send({ orderId: order.id });
  const data = init.body.data;

  const invalid = await request(app).post("/api/v1/payments/verify").set(auth(customerToken)).send({
    paymentId: data.paymentId,
    applicationOrderId: order.id,
    razorpayOrderId: data.razorpayOrderId,
    razorpayPaymentId: `pay_part5_${suffix}_bad`,
    razorpaySignature: "a".repeat(64),
  });
  assert.equal(invalid.status, 400);

  const mismatch = await request(app).post("/api/v1/payments/verify").set(auth(customerToken)).send({
    paymentId: data.paymentId,
    applicationOrderId: order.id,
    razorpayOrderId: "order_wrong",
    razorpayPaymentId: `pay_part5_${suffix}_wrong`,
    razorpaySignature: "a".repeat(64),
  });
  assert.equal(mismatch.status, 409);
});

test("frontend failure records safe failure without marking order paid", async () => {
  const order = await makeOrder();
  const init = await request(app).post("/api/v1/payments/initialize").set(auth(customerToken)).send({ orderId: order.id });
  const data = init.body.data;

  const failure = await request(app).post("/api/v1/payments/failure").set(auth(customerToken)).send({
    paymentId: data.paymentId,
    applicationOrderId: order.id,
    razorpayOrderId: data.razorpayOrderId,
    errorCode: "BAD_REQUEST_ERROR",
    errorDescription: "<script>failed</script>",
    errorReason: "payment_failed",
  });
  assert.equal(failure.status, 200);
  assert.equal(failure.body.data.paymentStatus, PAYMENT_STATUS.FAILED);
  const updated = await Order.findByPk(order.id);
  assert.notEqual(updated.payment_status, ORDER_PAYMENT_STATUS.CAPTURED);
});

test("webhook validates raw body signature, processes capture, and ignores duplicates", async () => {
  const order = await makeOrder();
  const init = await request(app).post("/api/v1/payments/initialize").set(auth(customerToken)).send({ orderId: order.id });
  const data = init.body.data;
  const raw = JSON.stringify({
    id: `evt_part5_${suffix}_captured`,
    event: "payment.captured",
    payload: { payment: { entity: { id: `pay_part5_${suffix}_webhook`, order_id: data.razorpayOrderId, amount: 12345, method: "card" } } },
  });
  const signature = hmacSha256(raw, env.razorpay.webhookSecret);

  const captured = await request(app).post("/api/v1/webhooks/razorpay").set("Content-Type", "application/json").set("X-Razorpay-Signature", signature).send(raw);
  assert.equal(captured.status, 200);
  assert.equal(captured.body.data.processed, true);

  const duplicate = await request(app).post("/api/v1/webhooks/razorpay").set("Content-Type", "application/json").set("X-Razorpay-Signature", signature).send(raw);
  assert.equal(duplicate.status, 200);
  assert.equal(duplicate.body.data.duplicate, true);

  const payment = await Payment.findByPk(data.paymentId);
  assert.equal(payment.status, PAYMENT_STATUS.CAPTURED);
  assert.equal(payment.webhook_confirmed, true);
});

test("invalid webhook signature is rejected and unknown valid event is ignored", async () => {
  const raw = JSON.stringify({ id: `evt_part5_${suffix}_unknown`, event: "payment.dispute.created", payload: {} });
  const invalid = await request(app).post("/api/v1/webhooks/razorpay").set("Content-Type", "application/json").set("X-Razorpay-Signature", "bad").send(raw);
  assert.equal(invalid.status, 400);

  const signature = hmacSha256(raw, env.razorpay.webhookSecret);
  const ignored = await request(app).post("/api/v1/webhooks/razorpay").set("Content-Type", "application/json").set("X-Razorpay-Signature", signature).send(raw);
  assert.equal(ignored.status, 200);
  assert.equal(ignored.body.data.ignored, true);
  const event = await WebhookEvent.findOne({ where: { provider_event_id: `evt_part5_${suffix}_unknown` } });
  assert.equal(event.processing_status, "IGNORED");
});

test("captured payment is not downgraded by delayed failed webhook", async () => {
  const order = await makeOrder();
  const init = await request(app).post("/api/v1/payments/initialize").set(auth(customerToken)).send({ orderId: order.id });
  const data = init.body.data;
  const capturedRaw = JSON.stringify({
    id: `evt_part5_${suffix}_final_capture`,
    event: "payment.captured",
    payload: { payment: { entity: { id: `pay_part5_${suffix}_final`, order_id: data.razorpayOrderId, amount: 12345 } } },
  });
  await request(app)
    .post("/api/v1/webhooks/razorpay")
    .set("Content-Type", "application/json")
    .set("X-Razorpay-Signature", hmacSha256(capturedRaw, env.razorpay.webhookSecret))
    .send(capturedRaw);

  const failedRaw = JSON.stringify({
    id: `evt_part5_${suffix}_late_failed`,
    event: "payment.failed",
    payload: { payment: { entity: { id: `pay_part5_${suffix}_final`, order_id: data.razorpayOrderId, amount: 12345, error_reason: "late_failure" } } },
  });
  await request(app)
    .post("/api/v1/webhooks/razorpay")
    .set("Content-Type", "application/json")
    .set("X-Razorpay-Signature", hmacSha256(failedRaw, env.razorpay.webhookSecret))
    .send(failedRaw);

  const payment = await Payment.findByPk(data.paymentId);
  assert.equal(payment.status, PAYMENT_STATUS.CAPTURED);
});
