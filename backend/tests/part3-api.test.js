const assert = require("node:assert/strict");
const test = require("node:test");
const request = require("supertest");
const app = require("../src/app");
const {
  Order,
  Payment,
  PaymentLog,
  Product,
  Role,
  User,
  sequelize,
} = require("../src/models");
const { ORDER_PAYMENT_STATUS, ORDER_STATUS, PAYMENT_LOG_SOURCE, PAYMENT_STATUS } = require("../src/utils/constants");
const { signToken } = require("../src/utils/jwt");
const { hashPassword } = require("../src/utils/password");

const suffix = Date.now();
const created = {
  products: [],
  users: [],
  orders: [],
  payments: [],
};
let adminToken;
let customerToken;
let otherCustomerToken;
let customer;
let otherCustomer;
let productId;
let cartItemId;
let orderId;
let paymentId;

const auth = (token) => ({ Authorization: `Bearer ${token}` });

test.before(async () => {
  await sequelize.authenticate();
  const [adminRole] = await Role.findOrCreate({ where: { name: "Admin" }, defaults: { description: "Admin role for tests" } });
  const [customerRole] = await Role.findOrCreate({ where: { name: "Customer" }, defaults: { description: "Customer role for tests" } });
  const admin = await User.create({
    name: "Part 3 Admin",
    email: `part3-admin-${suffix}@example.com`,
    password: await hashPassword("Password123"),
    role_id: adminRole.id,
  });
  customer = await User.create({
    name: "Part 3 Customer",
    email: `part3-customer-${suffix}@example.com`,
    password: await hashPassword("Password123"),
    role_id: customerRole.id,
  });
  otherCustomer = await User.create({
    name: "Part 3 Other Customer",
    email: `part3-other-${suffix}@example.com`,
    password: await hashPassword("Password123"),
    role_id: customerRole.id,
  });
  created.users.push(admin.id, customer.id, otherCustomer.id);
  adminToken = signToken({ userId: admin.id, email: admin.email, role: "Admin" });
  customerToken = signToken({ userId: customer.id, email: customer.email, role: "Customer" });
  otherCustomerToken = signToken({ userId: otherCustomer.id, email: otherCustomer.email, role: "Customer" });
});

test.after(async () => {
  await sequelize.query("DELETE FROM payment_logs WHERE request_id LIKE 'PART3-%'");
  if (created.users.length) {
    await sequelize.query("DELETE FROM payments WHERE user_id IN (:ids)", { replacements: { ids: created.users } });
    await sequelize.query("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE created_by IN (:ids))", { replacements: { ids: created.users } });
    await sequelize.query("DELETE FROM orders WHERE created_by IN (:ids)", { replacements: { ids: created.users } });
  }
  if (created.payments.length) {
    await sequelize.query("DELETE FROM payments WHERE id IN (:ids)", { replacements: { ids: created.payments } });
  }
  if (created.orders.length) {
    await sequelize.query("DELETE FROM order_items WHERE order_id IN (:ids)", { replacements: { ids: created.orders } });
    await sequelize.query("DELETE FROM orders WHERE id IN (:ids)", { replacements: { ids: created.orders } });
  }
  if (created.users.length) {
    await sequelize.query("DELETE FROM cart_items WHERE user_id IN (:ids)", { replacements: { ids: created.users } });
  }
  await sequelize.query("DELETE FROM products WHERE sku LIKE :sku", { replacements: { sku: `PART3-${suffix}%` } });
  if (created.users.length) {
    await sequelize.query("DELETE FROM users WHERE id IN (:ids)", { replacements: { ids: created.users } });
  }
  await sequelize.close();
});

test("product APIs enforce roles, uniqueness, update, and soft delete", async () => {
  const denied = await request(app).post("/api/v1/products").set(auth(customerToken)).send({
    name: "Denied Product",
    sku: `PART3-${suffix}-DENIED`,
    price: 10,
  });
  assert.equal(denied.status, 403);

  const createdProduct = await request(app).post("/api/v1/products").set(auth(adminToken)).send({
    name: `Part 3 Product ${suffix}`,
    sku: `PART3-${suffix}-SKU`,
    price: 125.5,
    currency: "INR",
  });
  assert.equal(createdProduct.status, 201);
  productId = createdProduct.body.data.product.id;
  created.products.push(productId);

  const duplicate = await request(app).post("/api/v1/products").set(auth(adminToken)).send({
    name: `Part 3 Duplicate ${suffix}`,
    sku: `PART3-${suffix}-SKU`,
    price: 125.5,
  });
  assert.equal(duplicate.status, 409);

  const list = await request(app).get("/api/v1/products?search=Part%203");
  assert.equal(list.status, 200);
  assert.ok(list.body.data.items.some((item) => item.id === productId));

  const update = await request(app).patch(`/api/v1/products/${productId}`).set(auth(adminToken)).send({ price: 130 });
  assert.equal(update.status, 200);
  assert.equal(Number(update.body.data.product.price), 130);

  const deleted = await request(app).delete(`/api/v1/products/${productId}`).set(auth(adminToken));
  assert.equal(deleted.status, 200);

  const hidden = await request(app).get(`/api/v1/products/${productId}`);
  assert.equal(hidden.status, 404);

  await Product.unscoped().update({ is_deleted: false, deleted_at: null, deleted_by: null, is_active: true }, { where: { id: productId } });
});

test("cart APIs enforce ownership and trusted totals", async () => {
  const add = await request(app).post("/api/v1/cart/items").set(auth(customerToken)).send({ productId, quantity: 2 });
  assert.equal(add.status, 201);
  assert.equal(add.body.data.subtotal, "260.00");
  cartItemId = add.body.data.items[0].id;

  const duplicate = await request(app).post("/api/v1/cart/items").set(auth(customerToken)).send({ productId, quantity: 1 });
  assert.equal(duplicate.status, 201);
  assert.equal(duplicate.body.data.items[0].quantity, 3);

  const invalid = await request(app).post("/api/v1/cart/items").set(auth(customerToken)).send({ productId, quantity: 0 });
  assert.equal(invalid.status, 400);

  const otherUpdate = await request(app).patch(`/api/v1/cart/items/${cartItemId}`).set(auth(otherCustomerToken)).send({ quantity: 1 });
  assert.equal(otherUpdate.status, 404);

  const update = await request(app).patch(`/api/v1/cart/items/${cartItemId}`).set(auth(customerToken)).send({ quantity: 2 });
  assert.equal(update.status, 200);
  assert.equal(update.body.data.subtotal, "260.00");
});

test("order APIs create trusted snapshot orders and enforce access", async () => {
  const empty = await request(app).post("/api/v1/orders").set(auth(otherCustomerToken)).send({});
  assert.equal(empty.status, 409);

  const amountRejected = await request(app).post("/api/v1/orders").set(auth(customerToken)).send({ notes: "Part 3 test order", total: 1 });
  assert.equal(amountRejected.status, 400);

  const create = await request(app).post("/api/v1/orders").set(auth(customerToken)).send({ notes: "Part 3 test order" });
  assert.equal(create.status, 201);
  orderId = create.body.data.order.id;
  created.orders.push(orderId);
  assert.equal(create.body.data.order.total_amount, "260.00");
  assert.equal(create.body.data.order.items[0].product_sku, `PART3-${suffix}-SKU`);

  const cart = await request(app).get("/api/v1/cart").set(auth(customerToken));
  assert.equal(cart.status, 200);
  assert.equal(cart.body.data.itemCount, 0);

  const ownOrders = await request(app).get("/api/v1/orders").set(auth(customerToken));
  assert.equal(ownOrders.status, 200);
  assert.ok(ownOrders.body.data.items.every((order) => String(order.user_id) === String(customer.id)));

  const adminOrders = await request(app).get("/api/v1/orders").set(auth(adminToken));
  assert.equal(adminOrders.status, 200);
  assert.ok(adminOrders.body.data.items.some((order) => String(order.id) === String(orderId)));

  const blocked = await request(app).get(`/api/v1/orders/${orderId}`).set(auth(otherCustomerToken));
  assert.equal(blocked.status, 404);
});

test("payment history and payment logs enforce safe access", async () => {
  const payment = await Payment.create({
    order_id: orderId,
    user_id: customer.id,
    amount: "260.00",
    amount_paise: 26000,
    currency: "INR",
    status: PAYMENT_STATUS.CAPTURED,
    razorpay_order_id: `order_part3_${suffix}`,
    razorpay_payment_id: `pay_part3_${suffix}`,
    razorpay_signature: "sensitive-signature",
    paid_at: new Date(),
  });
  paymentId = payment.id;
  created.payments.push(paymentId);
  await Order.update({ payment_status: ORDER_PAYMENT_STATUS.CAPTURED, status: ORDER_STATUS.COMPLETED }, { where: { id: orderId } });
  await PaymentLog.create({
    payment_id: paymentId,
    order_id: orderId,
    user_id: customer.id,
    event_type: "PART3_PAYMENT_CAPTURED",
    source: PAYMENT_LOG_SOURCE.APPLICATION,
    status: PAYMENT_STATUS.CAPTURED,
    request_id: `PART3-${suffix}`,
  });

  const customerList = await request(app).get("/api/v1/payments").set(auth(customerToken));
  assert.equal(customerList.status, 200);
  assert.ok(customerList.body.data.items.every((item) => String(item.user_id) === String(customer.id)));
  assert.equal(customerList.text.includes("sensitive-signature"), false);

  const otherDetails = await request(app).get(`/api/v1/payments/${paymentId}`).set(auth(otherCustomerToken));
  assert.equal(otherDetails.status, 404);

  const history = await request(app).get("/api/v1/payments/history").set(auth(customerToken));
  assert.equal(history.status, 200);
  assert.ok(history.body.data.items.some((item) => String(item.id) === String(paymentId)));

  const logsDenied = await request(app).get("/api/v1/payment-logs").set(auth(customerToken));
  assert.equal(logsDenied.status, 403);

  const logs = await request(app).get("/api/v1/payment-logs").set(auth(adminToken));
  assert.equal(logs.status, 200);
});

test("dashboard APIs enforce role restrictions", async () => {
  const customerDashboard = await request(app).get("/api/v1/dashboard/customer").set(auth(customerToken));
  assert.equal(customerDashboard.status, 200);
  assert.ok(customerDashboard.body.data.totalOrders >= 1);

  const adminDenied = await request(app).get("/api/v1/dashboard/admin").set(auth(customerToken));
  assert.equal(adminDenied.status, 403);

  const adminDashboard = await request(app).get("/api/v1/dashboard/admin").set(auth(adminToken));
  assert.equal(adminDashboard.status, 200);
  assert.ok(adminDashboard.body.data.totalCollectedAmount !== undefined);
});
