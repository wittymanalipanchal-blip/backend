const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const User = require("../models/User");
const Task = require("../models/Task");
const Project = require("../models/Project");
const createNotification = require("../utils/createNotification");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("project_id", "name")
      .populate("employee_id", "full_name")
      .populate("assigned_by", "full_name")
      .populate("uploads.employee", "full_name")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

router.post("/assign-task", upload.single("file"), async (req, res) => {
  try {
    const { project_id, employee_id, work_type, assigned_by, description, priority } = req.body;

    if (!project_id || !employee_id || !work_type || !assigned_by) {
      return res.status(400).json({ message: "Missing fields" });
    }

    let uploadedFiles = [];

    if (req.file) {
      uploadedFiles.push({
        fileUrl: `/uploads/${req.file.filename}`,
        remarks: "",
        employee: new mongoose.Types.ObjectId(employee_id),
      });
    }

    const task = await Task.create({
      project_id: new mongoose.Types.ObjectId(project_id),
      employee_id: new mongoose.Types.ObjectId(employee_id),
      assigned_by: new mongoose.Types.ObjectId(assigned_by),
      work_type,
      priority: priority || "Medium", 
      description: description || "",
      status: "Assigned",
      uploads: uploadedFiles,
    });
    const project = await Project.findById(project_id);

    await createNotification({
      userId: employee_id,
      type: "TASK_ADDED",
      referenceId: task._id,
      message: `New task assigned in project ${project.name}`
    });

    res.status(201).json(task);

  } catch (err) {
    console.error("ASSIGN TASK ERROR:", err);
    res.status(500).json({ message: "Task assign failed" });
  }
});

router.post(
  "/assign-task-to-admin",
  upload.array("files", 5),
  async (req, res) => {
    try {
      const { project_id, employee_id, assigned_by, description } = req.body;

      if (!project_id || !employee_id || !assigned_by) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      let uploadedFiles = [];

      if (req.files && req.files.length > 0) {
        uploadedFiles = req.files.map((file) => ({
          fileUrl: `/uploads/${file.filename}`,
          remarks: "",
          employee: new mongoose.Types.ObjectId(employee_id),
          uploadedAt: new Date(),
        }));
      }

      const task = await Task.create({
        project_id: new mongoose.Types.ObjectId(project_id),
        employee_id: new mongoose.Types.ObjectId(employee_id),
        assigned_by: new mongoose.Types.ObjectId(assigned_by),
        work_type: "Project Assignment",
        description: description || "",
        status: "Assigned",
        uploads: uploadedFiles,
      });
      const admin = await User.findOne({ role: "Admin" });

      if (admin) {
        await createNotification({
          userId: admin._id,
          type: "TASK_ADDED",
          referenceId: task._id,
          message: `New task assigned to Admin`
        });
      }

      res.status(201).json({
        success: true,
        message: "Task assigned to admin successfully",
        task,
      });

    } catch (err) {
      console.error("ASSIGN TO ADMIN ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

router.post("/assign-task-pm", upload.single("file"), async (req, res) => {
  try {
    const { project_id, employee_id, work_type, assigned_by, description } = req.body;

    if (!project_id || !employee_id || !work_type || !assigned_by) {
      return res.status(400).json({ message: "Missing fields" });
    }

    let uploadedFiles = [];

    if (req.file) {
      uploadedFiles.push({
        fileUrl: `/uploads/${req.file.filename}`,
        remarks: "",
        employee: new mongoose.Types.ObjectId(employee_id),
      });
    }

    const task = await Task.create({
      project_id: new mongoose.Types.ObjectId(project_id),
      employee_id: new mongoose.Types.ObjectId(employee_id),
      assigned_by: new mongoose.Types.ObjectId(assigned_by),
      work_type,
      description: description || "",
      status: "Assigned",
      uploads: uploadedFiles,
    });

    await createNotification({
      userId: employee_id,
      type: "TASK_ADDED",
      referenceId: task._id,
      message: `New task assigned`
    });

    res.status(201).json(task);

  } catch (err) {
    console.error("ASSIGN TASK ERROR:", err);
    res.status(500).json({ message: "Task assign failed" });
  }
});

router.get("/employee-tasks/:id", async (req, res) => {
  try {
    const tasks = await Task.find({ employee_id: req.params.id })
      .populate("project_id", "name")
      .populate("assigned_by", "full_name");

    const formattedTasks = tasks.map((task) => ({
      _id: task._id,
      work_type: task.work_type,
      status: task.status,
      priority: task.priority,
      project_id: task.project_id,
      assigned_by: task.assigned_by,
      description: task.description || "",
      files: task.uploads.map((u) => ({
        name: u.fileUrl.split("/").pop(),
        url: u.fileUrl,
      })),
    }));

    res.json(formattedTasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

router.post("/upload/:taskId", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.uploads.push({
      fileUrl: `/uploads/${req.file.filename}`,
      remarks: req.body.remarks || "",
      employee: task.employee_id,
    });

    task.status = "Completed";
    await task.save();

    await createNotification({
      userId: task.assigned_by,
      type: "TASK_UPLOADED",
      referenceId: task._id,
      message: `Task "${task.work_type}" has been uploaded`
    });

    res.json({ message: "Task uploaded successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
});



router.get("/assigned-by/:managerId", async (req, res) => {
  try {
    const tasks = await Task.find({
      assigned_by: req.params.managerId,
    })
      .populate("project_id", "name")
      .populate("employee_id", "full_name")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/recent", async (req, res) => {
  try {
    const tasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(tasks);
  } catch (err) {
    console.error("RECENT TASK ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = [
      "Assigned",
      "In Progress",
      "Completed",
      "Cancelled"
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);
    res.status(500).json({ message: "Status update failed" });
  }
});

router.post("/:taskId/chat", async (req, res) => {
  try {
    const { message, sender } = req.body;

    if (!message || !sender) {
      return res.status(400).json({ message: "Missing data" });
    }

    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.chats.push({
      message,
      sender,
      createdAt: new Date()
    });

    await task.save();

    const updatedTask = await Task.findById(req.params.taskId)
      .populate("chats.sender", "full_name role");

    const lastMessage =
      updatedTask.chats[updatedTask.chats.length - 1];

    res.json(lastMessage);

  } catch (err) {
    console.error("CHAT SEND ERROR:", err);
    res.status(500).json({ message: "Chat send failed" });
  }
});

router.get("/:taskId/chat", async (req, res) => {
  try {

    const task = await Task.findById(req.params.taskId)
      .populate("chats.sender", "full_name role");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task.chats || []);

  } catch (err) {
    console.error("CHAT FETCH ERROR:", err);
    res.status(500).json({ message: "Chat fetch failed" });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project_id", "name")
      .populate("employee_id", "full_name")
      .populate("assigned_by", "full_name");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/by-manager/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const projects = await Project.find({ team_manager_id: id });

    if (!projects.length) return res.json([]);

    const projectIds = projects.map(p => p._id);

    const tasks = await Task.find({
      project_id: { $in: projectIds }
    });

    res.json(tasks);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});




module.exports = router;
