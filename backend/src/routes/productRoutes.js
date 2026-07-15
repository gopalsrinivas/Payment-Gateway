const express = require("express");
const productController = require("../controllers/productController");
const authenticate = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validationMiddleware");
const {
  createProductValidation,
  listProductsValidation,
  productIdValidation,
  productStatusValidation,
  updateProductValidation,
} = require("../validations/productValidation");
const { ROLES } = require("../utils/constants");

const router = express.Router();

router.get("/", listProductsValidation, validate, productController.list);
router.get("/:id", productIdValidation, validate, productController.get);
router.post("/", authenticate, authorizeRoles(ROLES.ADMIN), createProductValidation, validate, productController.create);
router.put("/:id", authenticate, authorizeRoles(ROLES.ADMIN), updateProductValidation, validate, productController.update);
router.patch("/:id", authenticate, authorizeRoles(ROLES.ADMIN), updateProductValidation, validate, productController.update);
router.patch("/:id/status", authenticate, authorizeRoles(ROLES.ADMIN), productStatusValidation, validate, productController.updateStatus);
router.delete("/:id", authenticate, authorizeRoles(ROLES.ADMIN), productIdValidation, validate, productController.remove);

module.exports = router;

