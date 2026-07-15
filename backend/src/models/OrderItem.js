const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class OrderItem extends Model {}

  OrderItem.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      order_id: { type: DataTypes.BIGINT, allowNull: false },
      product_id: { type: DataTypes.BIGINT, allowNull: false },
      product_name: { type: DataTypes.STRING(150), allowNull: false, validate: { notEmpty: true } },
      product_sku: { type: DataTypes.STRING(80), allowNull: false, validate: { notEmpty: true } },
      unit_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
      quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
      line_total: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
      created_by: { type: DataTypes.BIGINT },
      updated_by: { type: DataTypes.BIGINT },
      is_deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      deleted_at: { type: DataTypes.DATE },
      deleted_by: { type: DataTypes.BIGINT },
    },
    {
      sequelize,
      modelName: "OrderItem",
      tableName: "order_items",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: false,
      defaultScope: { where: { is_deleted: false } },
    },
  );

  return OrderItem;
};

