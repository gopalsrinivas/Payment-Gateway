const assert = require("node:assert/strict");
const test = require("node:test");
const request = require("supertest");

process.env.JWT_SECRET = "test_secret_for_part_1";
process.env.RAZORPAY_KEY_ID = "rzp_test_example";
process.env.RAZORPAY_KEY_SECRET = "secret";
process.env.RAZORPAY_WEBHOOK_SECRET = "webhook";

const app = require("../src/app");
const authService = require("../src/services/authService");
const models = require("../src/models");
const authorizeRoles = require("../src/middlewares/roleMiddleware");
const { signToken } = require("../src/utils/jwt");

test.after(() => models.sequelize.close());

test("successful user registration", async () => {
  const original = authService.register;
  authService.register = async () => ({ id: 10, name: "Test User", email: "test@example.com", role: { name: "Customer" } });

  const res = await request(app).post("/api/v1/auth/register").send({ name: "Test User", email: "test@example.com", password: "Password123" });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.user.email, "test@example.com");
  assert.equal(res.body.data.user.password, undefined);
  authService.register = original;
});

test("duplicate registration rejection", async () => {
  const original = authService.register;
  authService.register = async () => {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  };

  const res = await request(app).post("/api/v1/auth/register").send({ name: "Test User", email: "test@example.com", password: "Password123" });

  assert.equal(res.status, 409);
  assert.equal(res.body.success, false);
  authService.register = original;
});

test("successful login", async () => {
  const original = authService.login;
  authService.login = async () => ({ token: "jwt-token", user: { id: 1, email: "test@example.com", role: { name: "Customer" } } });

  const res = await request(app).post("/api/v1/auth/login").send({ email: "test@example.com", password: "Password123" });

  assert.equal(res.status, 200);
  assert.equal(res.body.data.token, "jwt-token");
  authService.login = original;
});

test("invalid login rejection", async () => {
  const original = authService.login;
  authService.login = async () => {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  };

  const res = await request(app).post("/api/v1/auth/login").send({ email: "test@example.com", password: "wrong" });

  assert.equal(res.status, 401);
  authService.login = original;
});

test("inactive user login rejection", async () => {
  const original = authService.login;
  authService.login = async () => {
    const error = new Error("User account is inactive");
    error.statusCode = 403;
    throw error;
  };

  const res = await request(app).post("/api/v1/auth/login").send({ email: "inactive@example.com", password: "Password123" });

  assert.equal(res.status, 403);
  authService.login = original;
});

test("profile API rejects missing token", async () => {
  const res = await request(app).get("/api/v1/auth/profile");
  assert.equal(res.status, 401);
});

test("profile API works with a valid token", async () => {
  const originalFindByPk = models.User.findByPk;
  const originalProfile = authService.getProfile;
  models.User.findByPk = async () => ({ id: 1, email: "test@example.com", is_active: true, role: { name: "Customer" } });
  authService.getProfile = async () => ({ id: 1, email: "test@example.com", role: { name: "Customer" } });

  const token = signToken({ userId: 1, email: "test@example.com", role: "Customer" });
  const res = await request(app).get("/api/v1/auth/profile").set("Authorization", `Bearer ${token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.data.user.email, "test@example.com");
  models.User.findByPk = originalFindByPk;
  authService.getProfile = originalProfile;
});

test("health endpoint returns 200", async () => {
  const original = models.sequelize.authenticate;
  models.sequelize.authenticate = async () => true;
  const res = await request(app).get("/api/v1/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.data.status, "ok");
  models.sequelize.authenticate = original;
});

test("role middleware foundation allows matching role and rejects others", async () => {
  let nextCalled = false;
  authorizeRoles("Admin")({ user: { id: 1, role: "Admin" } }, {}, () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);

  let error;
  authorizeRoles("Admin")({ user: { id: 2, role: "Customer" } }, {}, (err) => {
    error = err;
  });
  assert.equal(error.statusCode, 403);
});

test("webhook placeholder endpoint preserves raw-body route", async () => {
  const res = await request(app).post("/api/v1/webhooks/razorpay").set("Content-Type", "application/json").send({ event: "payment.captured" });
  assert.equal(res.status, 400);
  assert.equal(res.body.message, "Missing Razorpay webhook signature");
});
