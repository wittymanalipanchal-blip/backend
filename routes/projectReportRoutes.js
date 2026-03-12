const express = require("express");
const router = express.Router();
const ProjectReport = require("../models/ProjectReport");
const ProjectAssignment = require("../models/ProjectAssignment");
const Task = require("../models/Task");
const User = require("../models/User");
const Role = require("../models/Role");
const multer = require("multer");
const mongoose = require("mongoose");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

router.get("/admins", async (req, res) => {
  try {
    console.log("➡️ Admin fetch API hit");

    const adminRole = await Role.findOne({ name: "Admin" });

    if (!adminRole) {
      return res.json([]);
    }
    const admins = await User.find(
      { role_id: adminRole._id },
      "_id full_name email"
    );

    console.log("ADMINS FOUND:", admins);

    res.json(admins);
  } catch (err) {
    console.error(" ADMIN FETCH ERROR FULL:", err);
    res.status(500).json({ message: "Failed to fetch admins" });
  }
});

router.get("/assigned-admins", async (req, res) => {
  try {
    const reports = await ProjectAssignment.find()
      .populate("project", "name")
      .populate("manager", "full_name email")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/assign-admin", async (req, res) => {
  try {
    const { project_id, employee_id, assigned_by } = req.body;

    const assignment = await ProjectAssignment.create({
      project: project_id,
      manager: employee_id,
      assignedBy: assigned_by || "Admin",
    });

    res.json({
      message: "Project assigned to admin",
      data: assignment
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/assign", upload.array("files"), async (req, res) => {
  try {
    const { projectId, adminId, description, assignedBy } = req.body;

    if (!projectId || !adminId || !assignedBy) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const fileNames = req.files
      ? req.files.map(file => file.filename)
      : [];

    const report = await ProjectReport.create({
      project: projectId,
      assignedBy,
      assignedTo: adminId,
      description,
      files: fileNames
    });
    await createNotification({
      userId: adminId,
      type: "REPORT_ASSIGNED",
      referenceId: report._id,
      message: `New project report assigned`
    });
    res.json({ message: "Assigned OK with files", report });

  } catch (err) {
    console.error("ASSIGN ERROR:", err);
    res.status(500).json({ message: "Assign failed" });
  }
});


router.get("/admin/:adminId", async (req, res) => {
  const reports = await ProjectReport.find({
    assignedTo: req.params.adminId
  }).populate("project assignedBy");

  res.json(reports);
});


router.get("/admin-reports/:adminId", async (req, res) => {
  try {

    const adminId = req.params.adminId;

    const assignments = await ProjectAssignment.find({
      manager: adminId
    })
    .populate("project", "name")
    .populate("manager", "full_name")
    .populate("assignedBy", "full_name");

    res.json(assignments);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;