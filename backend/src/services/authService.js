const { Role, User } = require("../models");
const logger = require("../config/logger");
const AppError = require("../utils/appError");
const { ROLES } = require("../utils/constants");
const { signToken } = require("../utils/jwt");
const { comparePassword, hashPassword } = require("../utils/password");

const sanitizeUser = (user) => {
  const safeUser = typeof user.toSafeJSON === "function" ? user.toSafeJSON() : { ...user };
  delete safeUser.password;
  return safeUser;
};

const register = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.unscoped().findOne({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const customerRole = await Role.findOne({ where: { name: ROLES.CUSTOMER } });
  if (!customerRole) {
    throw new AppError("Customer role is not configured", 500);
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: await hashPassword(password),
    role_id: customerRole.id,
  });

  const createdUser = await User.findByPk(user.id, { include: [{ model: Role, as: "role" }] });
  logger.info("User registered", { userId: user.id, email: normalizedEmail });
  return sanitizeUser(createdUser);
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const user = await User.scope("withPassword").findOne({
    where: { email: normalizedEmail },
    include: [{ model: Role, as: "role" }],
  });

  if (!user) {
    logger.warn("Authentication failed", { email: normalizedEmail, reason: "not_found" });
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.is_active) {
    logger.warn("Authentication failed", { userId: user.id, reason: "inactive" });
    throw new AppError("User account is inactive", 403);
  }

  const passwordMatches = await comparePassword(password, user.password);
  if (!passwordMatches) {
    logger.warn("Authentication failed", { userId: user.id, reason: "bad_password" });
    throw new AppError("Invalid email or password", 401);
  }

  const roleName = user.role?.name;
  const token = signToken({ userId: user.id, email: user.email, role: roleName });
  logger.info("User logged in", { userId: user.id, email: normalizedEmail });
  return { token, user: sanitizeUser(user) };
};

const getProfile = async (userId) => {
  const user = await User.findByPk(userId, { include: [{ model: Role, as: "role" }] });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return sanitizeUser(user);
};

module.exports = { register, login, getProfile };

