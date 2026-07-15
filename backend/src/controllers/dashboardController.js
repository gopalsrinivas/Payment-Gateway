const dashboardService = require("../services/dashboardService");
const { sendSuccess } = require("../utils/responseHandler");

const customer = async (req, res, next) => {
  try {
    return sendSuccess(res, "Customer dashboard retrieved successfully", await dashboardService.customerDashboard(req.user.id));
  } catch (error) {
    return next(error);
  }
};

const admin = async (_req, res, next) => {
  try {
    return sendSuccess(res, "Admin dashboard retrieved successfully", await dashboardService.adminDashboard());
  } catch (error) {
    return next(error);
  }
};

const recentPayments = async (req, res, next) => {
  try {
    return sendSuccess(res, "Recent payments retrieved successfully", { items: await dashboardService.recentPayments(req.query.limit) });
  } catch (error) {
    return next(error);
  }
};

module.exports = { admin, customer, recentPayments };

