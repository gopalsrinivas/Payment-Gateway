const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class Product extends Model {}

  Product.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(150), allowNull: false, validate: { notEmpty: true } },
      slug: {
        type: DataTypes.STRING(180),
        allowNull: false,
        validate: { notEmpty: true },
        set(value) {
          this.setDataValue("slug", String(value).toLowerCase());
        },
      },
      description: { type: DataTypes.TEXT },
      sku: {
        type: DataTypes.STRING(80),
        allowNull: false,
        validate: { notEmpty: true },
        set(value) {
          this.setDataValue("sku", String(value).toUpperCase());
        },
      },
      price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: "INR", validate: { isIn: [["INR"]] } },
      image_url: { type: DataTypes.TEXT },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      created_by: { type: DataTypes.BIGINT },
      updated_by: { type: DataTypes.BIGINT },
      is_deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      deleted_at: { type: DataTypes.DATE },
      deleted_by: { type: DataTypes.BIGINT },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "products",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: false,
      defaultScope: { where: { is_deleted: false } },
    },
  );

  return Product;
};

