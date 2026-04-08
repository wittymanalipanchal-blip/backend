const express = require("express");
const router = express.Router();
const TimeTracking = require("../models/TimeTracking");

router.post("/start", async (req, res) => {
  try {
    const { user_id, project_id, task_id, description } = req.body;

    const entry = await TimeTracking.create({
      user: user_id,
      project: project_id,
      task: task_id,
      description,
      startTime: new Date(),
      status: "running",
    });

    res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to start tracking" });
  }
});

router.post("/stop/:id", async (req, res) => {
  try {
    const entry = await TimeTracking.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    entry.endTime = new Date();
    entry.totalSeconds = Math.floor((entry.endTime - entry.startTime) / 1000);
    entry.status = "completed";

    await entry.save();
    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to stop tracking" });
  }
});

router.get("/timesheet/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const entries = await TimeTracking.find({ user: userId })
      .populate("project", "name")
      .populate("task", "work_type")
      .sort({ startTime: -1 });

    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch timesheet" });
  }
});
router.get("/admin-timesheet", async (req, res) => {
  try {
    const entries = await TimeTracking.find()
      .populate("user", "full_name email")
      .populate("project", "name")
      .populate("task", "work_type")
      .sort({ startTime: -1 });

    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch admin timesheet" });
  }
});

module.exports = router;
