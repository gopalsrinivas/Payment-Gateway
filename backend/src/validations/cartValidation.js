const { body } = require("express-validator");
const { idParam } = require("./commonValidation");

const quantity = body("quantity").isInt({ min: 1, max: 99 }).withMessage("Quantity must be between 1 and 99");

module.exports = {
  addCartItemValidation: [
    body("productId").isInt({ min: 1 }).withMessage("productId must be a positive integer"),
    quantity,
  ],
  updateCartItemValidation: [idParam("id"), quantity],
  cartItemIdValidation: [idParam("id")],
};

