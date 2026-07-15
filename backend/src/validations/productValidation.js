const { body, query } = require("express-validator");
const { idParam, paginationValidation } = require("./commonValidation");

const listProductsValidation = [
  ...paginationValidation,
  query("isActive").optional().isBoolean().withMessage("isActive must be boolean"),
  query("is_active").optional().isBoolean().withMessage("is_active must be boolean"),
  query("includeInactive").optional().isBoolean().withMessage("includeInactive must be boolean"),
  query("includeDeleted").optional().isBoolean().withMessage("includeDeleted must be boolean"),
  query("minPrice").optional().isFloat({ min: 0 }).withMessage("minPrice must be non-negative"),
  query("maxPrice").optional().isFloat({ min: 0 }).withMessage("maxPrice must be non-negative"),
  query("sortBy").optional().isIn(["name", "price", "created_at", "updated_at"]).withMessage("Invalid sortBy"),
];

const productBodyValidation = [
  body("name").optional().trim().isLength({ min: 1, max: 150 }).withMessage("Name must be 1-150 characters"),
  body("slug").optional().trim().isLength({ min: 1, max: 180 }).withMessage("Slug must be 1-180 characters"),
  body("description").optional({ nullable: true }).isLength({ max: 5000 }).withMessage("Description is too long"),
  body("sku").optional().trim().isLength({ min: 1, max: 80 }).withMessage("SKU must be 1-80 characters"),
  body("price").optional().isFloat({ min: 0 }).withMessage("Price must be non-negative"),
  body("currency").optional().equals("INR").withMessage("Currency must be INR"),
  body("imageUrl").optional({ nullable: true }).isURL().withMessage("imageUrl must be a URL"),
  body("isActive").optional().isBoolean().withMessage("isActive must be boolean"),
  body(["id", "created_by", "updated_by", "deleted_by", "is_deleted", "deleted_at"]).not().exists().withMessage("Audit fields are not allowed"),
];

const createProductValidation = [
  body("name").exists().withMessage("Name is required"),
  body("sku").exists().withMessage("SKU is required"),
  body("price").exists().withMessage("Price is required"),
  ...productBodyValidation,
];

module.exports = {
  listProductsValidation,
  productIdValidation: [idParam("id")],
  createProductValidation,
  updateProductValidation: [idParam("id"), ...productBodyValidation],
  productStatusValidation: [idParam("id"), body("isActive").isBoolean().withMessage("isActive must be boolean")],
};

