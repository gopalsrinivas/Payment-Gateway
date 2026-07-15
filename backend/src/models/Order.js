const { DataTypes, Model } = require("sequelize");
const { ORDER_PAYMENT_STATUS, ORDER_STATUS } = require("../utils/constants");

module.exports = (sequelize) => {
  class Order extends Model {}

  Order.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      order_number: { type: DataTypes.STRING(40), allowNull: false, validate: { notEmpty: true } },
      user_id: { type: DataTypes.BIGINT, allowNull: false },
      subtotal_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
      tax_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, validate: { min: 0 } },
      discount_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, validate: { min: 0 } },
      total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: "INR", validate: { isIn: [["INR"]] } },
      status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: ORDER_STATUS.PENDING, validate: { isIn: [Object.values(ORDER_STATUS)] } },
      payment_status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: ORDER_PAYMENT_STATUS.PENDING,
        validate: { isIn: [Object.values(ORDER_PAYMENT_STATUS)] },
      },
      notes: { type: DataTypes.TEXT },
      placed_at: { type: DataTypes.DATE },
      paid_at: { type: DataTypes.DATE },
      cancelled_at: { type: DataTypes.DATE },
      created_by: { type: DataTypes.BIGINT },
      updated_by: { type: DataTypes.BIGINT },
      is_deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      deleted_at: { type: DataTypes.DATE },
      deleted_by: { type: DataTypes.BIGINT },
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "orders",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: false,
      defaultScope: { where: { is_deleted: false } },
    },
  );

  return Order;
};

