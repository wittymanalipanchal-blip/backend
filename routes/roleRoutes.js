const express = require("express");
const Role = require("../models/Role");
const User = require("../models/User"); 
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const roles = await Role.find();
    console.log("✅ Roles fetched:", roles);

    const rolesWithUserCount = await Promise.all(
      roles.map(async (role) => {
        const userCount = await User.countDocuments({ role_id: role._id });
        return {
          _id: role._id,
          name: role.name,
          status: role.status || "Active",
          createdAt: role.createdAt,
          userCount,
        };
      })
    );

    res.json(rolesWithUserCount);
  } catch (err) {
    console.error("❌ FULL ERROR:", err);
    res.status(500).json({ message: "Failed to fetch roles", error: err.message });
  }
});

router.get("/seed", async (req, res) => {
  const roles = [
    { name: "Admin" },
    { name: "Project Manager" },
    { name: "Team Manager" },
    { name: "Employee" }
  ];

  await Role.deleteMany({});
  await Role.insertMany(roles);

  res.json({ message: "Roles seeded", roles });
});

module.exports = router;
