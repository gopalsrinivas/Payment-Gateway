const { sequelize, CartItem, Product } = require("../models");
const AppError = require("../utils/appError");

const serializeCart = (items) => {
  const serializedItems = items.map((item) => {
    const product = item.product;
    const unitPrice = Number(product.price);
    const quantity = Number(item.quantity);
    const lineTotal = unitPrice * quantity;
    return {
      id: item.id,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      unitPrice: product.price,
      quantity,
      lineTotal: lineTotal.toFixed(2),
      currency: product.currency,
    };
  });
  const subtotal = serializedItems.reduce((sum, item) => sum + Number(item.lineTotal), 0);
  return { items: serializedItems, itemCount: serializedItems.length, subtotal: subtotal.toFixed(2), currency: serializedItems[0]?.currency || "INR" };
};

const getCart = async (userId) => {
  const items = await CartItem.findAll({
    where: { user_id: userId },
    include: [{ model: Product, as: "product" }],
    order: [["created_at", "ASC"]],
  });
  return serializeCart(items);
};

const addItem = async ({ userId, productId, quantity }) => {
  await sequelize.transaction(async (transaction) => {
    const product = await Product.findOne({ where: { id: productId, is_active: true }, transaction });
    if (!product) throw new AppError("Product is not available", 404);

    const existing = await CartItem.unscoped().findOne({ where: { user_id: userId, product_id: productId, is_deleted: false }, transaction });
    if (existing) {
      const nextQuantity = Math.min(Number(existing.quantity) + Number(quantity), 99);
      await existing.update({ quantity: nextQuantity, updated_by: userId }, { transaction });
      return;
    }

    const deleted = await CartItem.unscoped().findOne({ where: { user_id: userId, product_id: productId, is_deleted: true }, transaction });
    if (deleted) {
      await deleted.update({ quantity, is_deleted: false, deleted_at: null, deleted_by: null, updated_by: userId }, { transaction });
      return;
    }

    await CartItem.create({ user_id: userId, product_id: productId, quantity, created_by: userId, updated_by: userId }, { transaction });
  });
  return getCart(userId);
};

const updateItem = async ({ userId, itemId, quantity }) => {
  const item = await CartItem.findOne({ where: { id: itemId, user_id: userId }, include: [{ model: Product, as: "product" }] });
  if (!item || !item.product?.is_active) throw new AppError("Cart item not found", 404);
  await item.update({ quantity, updated_by: userId });
  return getCart(userId);
};

const removeItem = async ({ userId, itemId }) => {
  const item = await CartItem.findOne({ where: { id: itemId, user_id: userId } });
  if (!item) throw new AppError("Cart item not found", 404);
  await item.update({ is_deleted: true, deleted_at: new Date(), deleted_by: userId, updated_by: userId });
  return { removed: 1 };
};

const clearCart = async (userId) =>
  sequelize.transaction(async (transaction) => {
    const [count] = await CartItem.update(
      { is_deleted: true, deleted_at: new Date(), deleted_by: userId, updated_by: userId },
      { where: { user_id: userId, is_deleted: false }, transaction },
    );
    return { clearedItems: count };
  });

module.exports = { addItem, clearCart, getCart, removeItem, updateItem };
