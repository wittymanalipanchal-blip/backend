const express = require("express");
const router = express.Router();
const ProjectUpload = require("../models/ProjectUpload");
const createNotification = require("../utils/createNotification");
const User = require("../models/User");
const path = require("path");
const mongoose = require("mongoose");

router.post("/upload", async (req, res) => {
  try {
    const { project, assignedTo, uploadedBy, description, files } = req.body;

    if (!project || !assignedTo || !uploadedBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const filesArray = files || [];

    const upload = await ProjectUpload.create({
      project,
      assignedTo,
      uploadedBy,
      description,
      files: filesArray,
      status: "Pending",
    });
      await createNotification({
      userId: assignedTo,
      type: "WORK_UPLOADED",
      referenceId: upload._id,
      message: `New work uploaded for project`
    });

    res.json({ message: "Upload success", upload });
  } catch (err) {
    console.error("UPLOAD ERROR 👉", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

router.get("/my-uploads/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const uploads = await ProjectUpload.find({ uploadedBy: id })
      .populate("project", "name")
      .populate("assignedTo", "full_name");

    await createNotification({
      userId: id,
      type: "UPLOADS_VIEWED",
      referenceId: null,
      message: "You viewed your uploads"
    });

    res.json(uploads);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch uploads" });
  }
});

router.get("/assigned/:pmId", async (req, res) => {
  const uploads = await ProjectUpload.find({
    assignedTo: req.params.pmId
  }).populate("project", "name");
  res.json(uploads);
});

router.get("/admin", async (req, res) => {
  const uploads = await ProjectUpload.find()
    .populate("project", "name")
    .populate("uploadedBy", "name role");
  res.json(uploads);
});

router.patch("/status/:id", async (req, res) => {
  try {
    const upload = await ProjectUpload.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!upload) {
      return res.status(404).json({ message: "Upload not found" });
    }

    await createNotification({
      userId: upload.uploadedBy,
      type: "STATUS_UPDATED",
      referenceId: upload._id,
      message: `Your upload status changed to ${upload.status}`
    });

    res.json(upload);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Status update failed" });
  }
});

router.post("/forward-to-admin/:id", async (req, res) => {
  try {
    const pmUpload = await ProjectUpload.findById(req.params.id);

    if (!pmUpload) {
      return res.status(404).json({ message: "Upload not found" });
    }

    const adminUpload = await ProjectUpload.create({
      project: pmUpload.project,
      uploadedBy: pmUpload.assignedTo,
      assignedTo: null,
      description: pmUpload.description,
      files: pmUpload.files,
      status: "Pending"
    });

    const admin = await User.findOne({ role: "Admin" });

    if (admin) {
      await createNotification({
        userId: admin._id,
        type: "FORWARDED_TO_ADMIN",
        referenceId: adminUpload._id,
        message: `New work forwarded to Admin`
      });
    }

    res.json(adminUpload);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Forward failed" });
  }
});


router.get("/my-uploads/:id", async (req, res) => {
  try {
    const uploads = await ProjectUpload.find({
      uploadedBy: req.params.id,
    })
      .populate("project", "name")
      .populate("assignedTo", "full_name");

    res.json(uploads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch uploads" });
  }
});

module.exports = router;

