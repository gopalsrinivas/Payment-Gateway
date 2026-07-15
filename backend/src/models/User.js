const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class User extends Model {
    toSafeJSON() {
      const values = { ...this.get() };
      delete values.password;
      return values;
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        set(value) {
          this.setDataValue("email", String(value).toLowerCase());
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      last_login_at: {
        type: DataTypes.DATE,
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
      modelName: "User",
      tableName: "users",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: false,
      defaultScope: {
        where: { is_deleted: false },
        attributes: { exclude: ["password"] },
      },
      scopes: {
        withPassword: {
          where: { is_deleted: false },
          attributes: {},
        },
      },
    },
  );

  return User;
};
