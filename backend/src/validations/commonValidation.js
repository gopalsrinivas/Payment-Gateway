const { param, query } = require("express-validator");

const idParam = (name = "id") => param(name).isInt({ min: 1 }).withMessage(`${name} must be a positive integer`);

const paginationValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
  query("sortOrder").optional().isIn(["asc", "desc", "ASC", "DESC"]).withMessage("sortOrder must be asc or desc"),
  query("sort_order").optional().isIn(["asc", "desc", "ASC", "DESC"]).withMessage("sort_order must be asc or desc"),
  query("search").optional().isLength({ max: 100 }).withMessage("search must be 100 characters or fewer"),
  query("fromDate").optional().isISO8601().withMessage("fromDate must be a valid date"),
  query("toDate").optional().isISO8601().withMessage("toDate must be a valid date"),
  query("from_date").optional().isISO8601().withMessage("from_date must be a valid date"),
  query("to_date").optional().isISO8601().withMessage("to_date must be a valid date"),
];

module.exports = { idParam, paginationValidation };

