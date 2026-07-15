const { Sequelize } = require("sequelize");
const dbConfig = require("../config/database")[process.env.NODE_ENV || "development"];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

const Role = require("./Role")(sequelize);
const User = require("./User")(sequelize);

Role.hasMany(User, { foreignKey: "role_id", as: "users" });
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });

module.exports = {
  sequelize,
  Sequelize,
  Role,
  User,
};

