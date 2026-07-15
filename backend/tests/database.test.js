const assert = require("node:assert/strict");
const test = require("node:test");
const { UniqueConstraintError } = require("sequelize");
const {
  CartItem,
  Order,
  OrderItem,
  Payment,
  Product,
  Role,
  User,
  WebhookEvent,
  sequelize,
} = require("../src/models");
const { hashPassword } = require("../src/utils/password");

const suffix = Date.now();
const email = `db-test-${suffix}@example.com`;
let customer;
let product;
let order;

test.before(async () => {
  await sequelize.authenticate();
  const [role] = await Role.findOrCreate({ where: { name: "Customer" }, defaults: { description: "Customer role for tests" } });
  customer = await User.create({
    name: "Database Test User",
    email,
    password: await hashPassword("Password123"),
    role_id: role.id,
  });
});

test.after(async () => {
  await sequelize.query("DELETE FROM webhook_events WHERE provider_event_id LIKE 'evt_db_test_%'");
  await sequelize.query("DELETE FROM payment_logs WHERE request_id LIKE 'REQ-DB-TEST-%'");
  await sequelize.query("DELETE FROM payments WHERE razorpay_order_id LIKE 'order_db_test_%' OR razorpay_payment_id LIKE 'pay_db_test_%'");
  await sequelize.query("DELETE FROM order_items WHERE product_sku LIKE 'DBTEST-%'");
  await sequelize.query("DELETE FROM orders WHERE order_number LIKE 'ORD-DB-TEST-%'");
  await sequelize.query("DELETE FROM cart_items WHERE user_id = :userId", { replacements: { userId: customer?.id || 0 } });
  await sequelize.query("DELETE FROM products WHERE sku LIKE 'DBTEST-%'");
  await sequelize.query("DELETE FROM users WHERE email = :email", { replacements: { email } });
  await sequelize.close();
});

test("models load and associations are configured", () => {
  assert.equal(Role.associations.users.target, User);
  assert.equal(User.associations.cartItems.target, CartItem);
  assert.equal(Product.associations.cartItems.target, CartItem);
  assert.equal(Order.associations.items.target, OrderItem);
  assert.equal(Order.associations.payments.target, Payment);
});

test("product validation and partial unique indexes work", async () => {
  await assert.rejects(() => Product.create({ slug: "bad-product", sku: "DBTEST-BAD", price: -1, currency: "INR" }));

  product = await Product.create({
    name: "Database Test Product",
    slug: `db-test-product-${suffix}`,
    sku: `DBTEST-${suffix}`,
    price: "10.00",
    currency: "INR",
  });

  await assert.rejects(
    () =>
      Product.create({
        name: "Duplicate Slug",
        slug: `DB-TEST-PRODUCT-${suffix}`,
        sku: `DBTEST-DUP-SLUG-${suffix}`,
        price: "10.00",
        currency: "INR",
      }),
    UniqueConstraintError,
  );

  await assert.rejects(
    () =>
      Product.create({
        name: "Duplicate SKU",
        slug: `db-test-duplicate-sku-${suffix}`,
        sku: `dbtest-${suffix}`,
        price: "10.00",
        currency: "INR",
      }),
    UniqueConstraintError,
  );
});

test("cart quantity and active cart uniqueness constraints work", async () => {
  await assert.rejects(() => CartItem.create({ user_id: customer.id, product_id: product.id, quantity: 0 }));

  await CartItem.create({ user_id: customer.id, product_id: product.id, quantity: 1 });
  await assert.rejects(() => CartItem.create({ user_id: customer.id, product_id: product.id, quantity: 2 }), UniqueConstraintError);
});

test("order and order item check constraints work", async () => {
  await assert.rejects(() =>
    Order.create({
      order_number: `ORD-DB-TEST-BAD-${suffix}`,
      user_id: customer.id,
      subtotal_amount: "10.00",
      tax_amount: "1.00",
      discount_amount: "0.00",
      total_amount: "9.00",
      currency: "INR",
    }),
  );

  order = await Order.create({
    order_number: `ORD-DB-TEST-${suffix}`,
    user_id: customer.id,
    subtotal_amount: "10.00",
    tax_amount: "1.00",
    discount_amount: "0.00",
    total_amount: "11.00",
    currency: "INR",
  });

  await assert.rejects(() =>
    OrderItem.create({
      order_id: order.id,
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      unit_price: "10.00",
      quantity: 2,
      line_total: "10.00",
    }),
  );
});

test("payment external identifier uniqueness and webhook idempotency work", async () => {
  await Payment.create({
    order_id: order.id,
    user_id: customer.id,
    razorpay_order_id: `order_db_test_${suffix}`,
    razorpay_payment_id: `pay_db_test_${suffix}`,
    amount: "11.00",
    amount_paise: 1100,
    currency: "INR",
  });

  await assert.rejects(
    () =>
      Payment.create({
        order_id: order.id,
        user_id: customer.id,
        razorpay_payment_id: `pay_db_test_${suffix}`,
        amount: "11.00",
        amount_paise: 1100,
        currency: "INR",
      }),
    UniqueConstraintError,
  );

  await WebhookEvent.create({
    provider: "RAZORPAY",
    provider_event_id: `evt_db_test_${suffix}`,
    event_type: "payment.captured",
    payload: { event: "payment.captured" },
  });

  await assert.rejects(
    () =>
      WebhookEvent.create({
        provider: "RAZORPAY",
        provider_event_id: `evt_db_test_${suffix}`,
        event_type: "payment.captured",
        payload: { event: "payment.captured" },
      }),
    UniqueConstraintError,
  );
});

test("soft-deleted products are excluded by default scope", async () => {
  await product.update({ is_deleted: true, deleted_at: new Date() });
  const hidden = await Product.findByPk(product.id);
  const visibleUnscoped = await Product.unscoped().findByPk(product.id);

  assert.equal(hidden, null);
  assert.equal(visibleUnscoped.id, product.id);
});
