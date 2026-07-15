const orderService = require("../services/orderService");
const { sendSuccess } = require("../utils/responseHandler");

const create = async (req, res, next) => {
  try {
    return sendSuccess(res, "Order created successfully", { order: await orderService.createOrder({ userId: req.user.id, notes: req.body.notes }) }, 201);
  } catch (error) {
    return next(error);
  }
};

const list = async (req, res, next) => {
  try {
    return sendSuccess(res, "Orders retrieved successfully", await orderService.listOrders({ query: req.query, user: req.user }));
  } catch (error) {
    return next(error);
  }
};

const get = async (req, res, next) => {
  try {
    return sendSuccess(res, "Order retrieved successfully", { order: await orderService.getOrder({ id: req.params.id, user: req.user }) });
  } catch (error) {
    return next(error);
  }
};

const items = async (req, res, next) => {
  try {
    return sendSuccess(res, "Order items retrieved successfully", { items: await orderService.getOrderItems({ id: req.params.id, user: req.user }) });
  } catch (error) {
    return next(error);
  }
};

const status = async (req, res, next) => {
  try {
    return sendSuccess(res, "Order status updated successfully", { order: await orderService.updateStatus({ id: req.params.id, status: req.body.status, userId: req.user.id }) });
  } catch (error) {
    return next(error);
  }
};

module.exports = { create, get, items, list, status };

