const { Op } = require("sequelize");
const { Product } = require("../models");
const AppError = require("../utils/appError");
const { buildPagination, getPagination } = require("../utils/pagination");
const { getSafeOrder, parseBoolean } = require("../utils/queryHelpers");

const toSlug = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const mapProductPayload = (body) => ({
  name: body.name,
  slug: body.slug ? toSlug(body.slug) : body.name ? toSlug(body.name) : undefined,
  description: body.description,
  sku: body.sku,
  price: body.price,
  currency: body.currency || "INR",
  image_url: body.imageUrl,
  is_active: body.isActive,
});

const serializeProduct = (product) => {
  if (!product) return null;
  const value = product.get ? product.get({ plain: true }) : product;
  return {
    id: value.id,
    name: value.name,
    slug: value.slug,
    description: value.description,
    sku: value.sku,
    price: value.price,
    currency: value.currency,
    imageUrl: value.image_url,
    isActive: value.is_active,
    createdAt: value.created_at,
    updatedAt: value.updated_at,
  };
};

const listProducts = async ({ query, user }) => {
  const { page, limit, offset } = getPagination(query);
  const isAdmin = user?.role === "Admin";
  const where = {};
  const search = query.search?.trim();

  if (!isAdmin || parseBoolean(query.includeDeleted) !== true) {
    where.is_deleted = false;
  }
  if (!isAdmin || parseBoolean(query.includeInactive) !== true) {
    where.is_active = true;
  }
  const requestedActive = parseBoolean(query.isActive ?? query.is_active);
  if (isAdmin && requestedActive !== undefined) {
    where.is_active = requestedActive;
  }
  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price[Op.gte] = query.minPrice;
    if (query.maxPrice) where.price[Op.lte] = query.maxPrice;
  }
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { slug: { [Op.iLike]: `%${search}%` } },
      { sku: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { rows, count } = await Product.unscoped().findAndCountAll({
    where,
    order: getSafeOrder(query, ["name", "price", "created_at", "updated_at"]),
    limit,
    offset,
  });

  return { items: rows.map(serializeProduct), pagination: buildPagination(page, limit, count) };
};

const getProduct = async ({ id, user }) => {
  const product = await Product.unscoped().findByPk(id);
  if (!product || product.is_deleted || (user?.role !== "Admin" && !product.is_active)) {
    throw new AppError("Product not found", 404);
  }
  return serializeProduct(product);
};

const createProduct = async ({ body, userId }) => {
  const payload = mapProductPayload(body);
  const product = await Product.create({ ...payload, is_active: payload.is_active ?? true, created_by: userId, updated_by: userId });
  return serializeProduct(product);
};

const updateProduct = async ({ id, body, userId }) => {
  const product = await Product.findByPk(id);
  if (!product) throw new AppError("Product not found", 404);
  const payload = mapProductPayload(body);
  Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
  await product.update({ ...payload, updated_by: userId });
  return serializeProduct(product);
};

const updateProductStatus = async ({ id, isActive, userId }) => updateProduct({ id, body: { isActive }, userId });

const deleteProduct = async ({ id, userId }) => {
  const product = await Product.findByPk(id);
  if (!product) throw new AppError("Product not found", 404);
  await product.update({ is_deleted: true, deleted_at: new Date(), deleted_by: userId, updated_by: userId });
  return { id: product.id };
};

module.exports = { createProduct, deleteProduct, getProduct, listProducts, updateProduct, updateProductStatus };

