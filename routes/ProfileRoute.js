const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Profile fetch failed" });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    const updateData = { full_name, email };

    // password optional
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await User.findByIdAndUpdate(req.params.id, updateData);

    res.json({ message: "Profile updated successfully" });

  } catch (err) {
    res.status(500).json({ message: "Profile update failed" });
  }
});

// ✅ Upload profile
router.post("/upload-profile", async (req, res) => {
  try {
    const { userName, profilePic } = req.body;

    const user = await User.findOneAndUpdate(
      { full_name: userName },
      { profilePic },
      { new: true }
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get profile
router.get("/:userName", async (req, res) => {
  try {
    const user = await User.findOne({ full_name: req.params.userName });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;