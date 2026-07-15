const authService = require("../services/authService");
const { sendSuccess } = require("../utils/responseHandler");

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return sendSuccess(res, "User registered successfully", { user }, 201);
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    return sendSuccess(res, "Login successful", data);
  } catch (error) {
    return next(error);
  }
};

const profile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    return sendSuccess(res, "Profile fetched successfully", { user });
  } catch (error) {
    return next(error);
  }
};

const logout = async (_req, res, next) => {
  try {
    return sendSuccess(res, "Logout successful");
  } catch (error) {
    return next(error);
  }
};

module.exports = { register, login, profile, logout };

