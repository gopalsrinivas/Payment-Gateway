const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class CartItem extends Model {}

  CartItem.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      user_id: { type: DataTypes.BIGINT, allowNull: false },
      product_id: { type: DataTypes.BIGINT, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, validate: { min: 1, max: 100 } },
      created_by: { type: DataTypes.BIGINT },
      updated_by: { type: DataTypes.BIGINT },
      is_deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      deleted_at: { type: DataTypes.DATE },
      deleted_by: { type: DataTypes.BIGINT },
    },
    {
      sequelize,
      modelName: "CartItem",
      tableName: "cart_items",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: false,
      defaultScope: { where: { is_deleted: false } },
    },
  );

  return CartItem;
};

