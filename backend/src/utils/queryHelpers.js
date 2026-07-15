const { Op } = require("sequelize");

const parseBoolean = (value) => {
  if (value === undefined) return undefined;
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  return undefined;
};

const buildDateRange = (fromDate, toDate) => {
  if (!fromDate && !toDate) return undefined;
  const range = {};
  if (fromDate) range[Op.gte] = new Date(fromDate);
  if (toDate) range[Op.lte] = new Date(toDate);
  return range;
};

const getSafeOrder = (query, allowed, fallback = "created_at") => {
  const sortBy = allowed.includes(query.sortBy || query.sort_by) ? query.sortBy || query.sort_by : fallback;
  const sortOrder = String(query.sortOrder || query.sort_order || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  return [[sortBy, sortOrder]];
};

module.exports = { buildDateRange, getSafeOrder, parseBoolean };

