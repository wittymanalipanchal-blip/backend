const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

const mongoose = require("mongoose");

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const notifications = await Notification.find({
      userId: userId,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error("Notification fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/read", async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, {
    status: "Read"
  });

  res.json({ message: "Marked as read" });
});

module.exports = router;
