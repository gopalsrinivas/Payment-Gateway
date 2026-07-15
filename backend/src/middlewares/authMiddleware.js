const { Role, User } = require("../models");
const AppError = require("../utils/appError");
const { verifyToken } = require("../utils/jwt");

const authenticate = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new AppError("Authentication token is required", 401);
    }

    const decoded = verifyToken(header.slice(7));
    const user = await User.findByPk(decoded.userId, { include: [{ model: Role, as: "role" }] });
    if (!user || !user.is_active) {
      throw new AppError("Invalid or inactive user", 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role?.name,
    };
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new AppError("Invalid or expired token", 401));
    }
    return next(error);
  }
};

module.exports = authenticate;

