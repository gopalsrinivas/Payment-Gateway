const cartService = require("../services/cartService");
const { sendSuccess } = require("../utils/responseHandler");

const view = async (req, res, next) => {
  try {
    return sendSuccess(res, "Cart retrieved successfully", await cartService.getCart(req.user.id));
  } catch (error) {
    return next(error);
  }
};

const add = async (req, res, next) => {
  try {
    return sendSuccess(res, "Cart item added successfully", await cartService.addItem({ userId: req.user.id, productId: req.body.productId, quantity: req.body.quantity }), 201);
  } catch (error) {
    return next(error);
  }
};

const update = async (req, res, next) => {
  try {
    return sendSuccess(res, "Cart item updated successfully", await cartService.updateItem({ userId: req.user.id, itemId: req.params.id, quantity: req.body.quantity }));
  } catch (error) {
    return next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    return sendSuccess(res, "Cart item removed successfully", await cartService.removeItem({ userId: req.user.id, itemId: req.params.id }));
  } catch (error) {
    return next(error);
  }
};

const clear = async (req, res, next) => {
  try {
    return sendSuccess(res, "Cart cleared successfully", await cartService.clearCart(req.user.id));
  } catch (error) {
    return next(error);
  }
};

module.exports = { add, clear, remove, update, view };

