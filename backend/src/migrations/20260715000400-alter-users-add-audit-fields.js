"use strict";

const addColumnIfMissing = async (queryInterface, tableName, columnName, definition) => {
  const table = await queryInterface.describeTable(tableName);
  if (!table[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition);
  }
};

const removeColumnIfExists = async (queryInterface, tableName, columnName) => {
  const table = await queryInterface.describeTable(tableName);
  if (table[columnName]) {
    await queryInterface.removeColumn(tableName, columnName);
  }
};

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await addColumnIfMissing(queryInterface, "users", "last_login_at", {
        type: Sequelize.DATE,
        allowNull: true,
      });
      await addColumnIfMissing(queryInterface, "users", "created_by", {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
      await addColumnIfMissing(queryInterface, "users", "updated_by", {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
      await addColumnIfMissing(queryInterface, "users", "is_deleted", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
      await addColumnIfMissing(queryInterface, "users", "deleted_by", {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });

      await queryInterface.sequelize.query('UPDATE "users" SET "is_deleted" = FALSE WHERE "is_deleted" IS NULL', { transaction });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async () => {
      await removeColumnIfExists(queryInterface, "users", "deleted_by");
      await removeColumnIfExists(queryInterface, "users", "is_deleted");
      await removeColumnIfExists(queryInterface, "users", "updated_by");
      await removeColumnIfExists(queryInterface, "users", "created_by");
      await removeColumnIfExists(queryInterface, "users", "last_login_at");
    });
  },
};

