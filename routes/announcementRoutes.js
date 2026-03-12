const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcement");
const createNotification = require("../utils/createNotification");
const User = require("../models/User");

router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message required" });
    }

    const announcement = new Announcement({ title, message });
    await announcement.save();

    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
