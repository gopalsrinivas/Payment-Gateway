const express = require("express");
const authController = require("../controllers/authController");
const authenticate = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const { loginValidation, registerValidation } = require("../validations/authValidation");

const router = express.Router();

router.post("/register", registerValidation, validate, authController.register);
router.post("/login", loginValidation, validate, authController.login);
router.post("/logout", authenticate, authController.logout);
router.get("/profile", authenticate, authController.profile);

module.exports = router;

