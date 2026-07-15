const express = require("express");
const cartController = require("../controllers/cartController");
const authenticate = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const { addCartItemValidation, cartItemIdValidation, updateCartItemValidation } = require("../validations/cartValidation");

const router = express.Router();

router.use(authenticate);
router.get("/", cartController.view);
router.post("/items", addCartItemValidation, validate, cartController.add);
router.patch("/items/:id", updateCartItemValidation, validate, cartController.update);
router.delete("/items/:id", cartItemIdValidation, validate, cartController.remove);
router.delete("/", cartController.clear);

module.exports = router;

