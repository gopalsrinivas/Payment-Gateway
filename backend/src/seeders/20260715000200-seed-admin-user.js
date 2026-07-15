"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface) {
    const [roles] = await queryInterface.sequelize.query("SELECT id FROM roles WHERE name = 'Admin' LIMIT 1");
    if (!roles.length) return;

    const email = "admin@example.com";
    const [existing] = await queryInterface.sequelize.query("SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1");
    if (existing.length) return;

    await queryInterface.bulkInsert("users", [
      {
        name: "Local Demo Admin",
        email,
        password: await bcrypt.hash("Admin@12345", 12),
        role_id: roles[0].id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", { email: "admin@example.com" });
  },
};
