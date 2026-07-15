const productService = require("../services/productService");
const { sendSuccess } = require("../utils/responseHandler");

const list = async (req, res, next) => {
  try {
    return sendSuccess(res, "Products retrieved successfully", await productService.listProducts({ query: req.query, user: req.user }));
  } catch (error) {
    return next(error);
  }
};

const get = async (req, res, next) => {
  try {
    return sendSuccess(res, "Product retrieved successfully", { product: await productService.getProduct({ id: req.params.id, user: req.user }) });
  } catch (error) {
    return next(error);
  }
};

const create = async (req, res, next) => {
  try {
    return sendSuccess(res, "Product created successfully", { product: await productService.createProduct({ body: req.body, userId: req.user.id }) }, 201);
  } catch (error) {
    return next(error);
  }
};

const update = async (req, res, next) => {
  try {
    return sendSuccess(res, "Product updated successfully", { product: await productService.updateProduct({ id: req.params.id, body: req.body, userId: req.user.id }) });
  } catch (error) {
    return next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    return sendSuccess(res, "Product status updated successfully", {
      product: await productService.updateProductStatus({ id: req.params.id, isActive: req.body.isActive, userId: req.user.id }),
    });
  } catch (error) {
    return next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    return sendSuccess(res, "Product deleted successfully", await productService.deleteProduct({ id: req.params.id, userId: req.user.id }));
  } catch (error) {
    return next(error);
  }
};

module.exports = { create, get, list, remove, update, updateStatus };

