const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class Role extends Model {}

  Role.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING(255),
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_by: {
        type: DataTypes.BIGINT,
      },
      updated_by: {
        type: DataTypes.BIGINT,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
      deleted_by: {
        type: DataTypes.BIGINT,
      },
    },
    {
      sequelize,
      modelName: "Role",
      tableName: "roles",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: false,
      defaultScope: {
        where: { is_active: true, is_deleted: false },
      },
    },
  );

  return Role;
};
