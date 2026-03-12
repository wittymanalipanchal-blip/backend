const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const SECRET_KEY = "mySecretKey123";

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const user = await User.findOne({ email }).populate("role_id");
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  if (user.status !== "ACTIVE") {
    return res.status(403).json({ message: "Account inactive" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role_id.name
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.json({
    token,
    user: {
      id: user._id,
      name: user.full_name,
      email: user.email,
      role: user.role_id.name
    }
  });
});

router.get("/project-managers", async (req, res) => {
  try {
    const users = await User.find()
      .populate("role_id");

    const projectManagers = users.filter(
      (u) => u.role_id?.name === "Project Manager"
    );

    res.status(200).json(projectManagers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch project managers" });
  }
});


module.exports = router;
