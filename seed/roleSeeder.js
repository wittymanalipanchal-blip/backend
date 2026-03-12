const Role = require("../models/Role");

const seedRoles = async () => {
  try {
    const roles = ["Admin", "Employee", "Team Manager", "Project Manager"];

    for (const roleName of roles) {
      const exists = await Role.findOne({ name: roleName });
      if (!exists) {
        await Role.create({ name: roleName });
        console.log(`Role created: ${roleName}`);
      }
    }

    console.log("Role seeding completed");
  } catch (error) {
    console.error("Role seeding failed:", error.message);
  }
};

module.exports = seedRoles;
