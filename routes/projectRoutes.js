const express = require("express");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const createNotification = require("../utils/createNotification");
const router = express.Router();

// router.post("/", async (req, res) => {
//   try {
//     const { adminId, ...data } = req.body;
//     const project = new Project({
//       ...req.body,
//       created_by_admin: req.body.adminId
//     });
//     await project.save();
//     if (project.manager_id) {
//       await createNotification({
//         userId: project.manager_id,
//         type: "PROJECT_CREATED",
//         referenceId: project._id,
//         message: `New project ${project.name} has been created`
//       });
//     }
//     res.status(201).json(project);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

router.post("/", async (req, res) => {
  try {

    const { adminId, ...data } = req.body;

    const project = new Project({
      ...data,
      created_by_admin: adminId
    });

    await project.save();

    if (project.manager_id) {
      await createNotification({
        userId: project.manager_id,
        type: "PROJECT_CREATED",
        referenceId: project._id,
        message: `New project ${project.name} has been created`
      });
    }

    res.status(201).json(project);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("manager_id", "full_name email")
      .populate("team_manager_id", "full_name email")
      .populate("created_by_admin", "full_name email")
      .populate("client", "name company")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (project?.manager_id) {
      await createNotification({
        userId: project.manager_id,
        type: "PROJECT_DELETED",
        referenceId: project._id,
        message: `Project ${project.name} has been deleted`
      });
    }

    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (updated?.manager_id) {
      await createNotification({
        userId: updated.manager_id,
        type: "PROJECT_UPDATED",
        referenceId: updated._id,
        message: `Project ${updated.name} has been updated`
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

router.post("/assign", async (req, res) => {
  try {
    const { projectId, managerId } = req.body;

    if (!projectId || !managerId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const project = await Project.findByIdAndUpdate(
      projectId,
      { manager_id: managerId },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await createNotification({
      userId: managerId,
      type: "PROJECT_ASSIGNED",
      referenceId: project._id,
      message: `You have been assigned to project ${project.name}`
    });

    res.json({
      message: "Project assigned successfully",
      project,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Project assign failed" });
  }
});

router.get("/assigned-by-role/:userId/:role", async (req, res) => {
  try {
    const { userId, role } = req.params;
    let projects;

    if (role === "Project Manager") {
      projects = await Project.find({ manager_id: userId });
    } else if (role === "Team Manager") {
      projects = await Project.find({ team_manager_id: userId });
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});


router.post("/assign-team-manager", async (req, res) => {
  try {
    const { projectId, teamManagerId, assignedBy } = req.body;

    if (!projectId || !teamManagerId) {
      return res.status(400).json({ message: "Missing data" });
    }

    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        team_manager_id: teamManagerId,
        assigned_by_pm: assignedBy
      },
      { new: true }
    );

    await createNotification({
      userId: teamManagerId,
      type: "PROJECT_ASSIGNED",
      referenceId: project._id,
      message: `You have been assigned as Team Manager for ${project.name}`
    });


    res.json({
      message: "Project assigned successfully",
      project
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Assignment failed" });
  }
});
router.get("/team-manager-assignments", async (req, res) => {
  try {
    const projects = await Project.find({
      team_manager_id: { $ne: null }
    })
      .populate("team_manager_id", "full_name email")
      .select("name team_manager_id");

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch assignments" });
  }
});


router.get("/assign/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const projects = await Project.find({ manager_id: userId })
      .populate("manager_id", "full_name email")
      .populate("created_by_admin", "full_name");

    res.json(projects);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch assigned projects" });
  }
});

router.get("/assigned-team-manager/:id", async (req, res) => {
  try {
    const projects = await Project.find({
      team_manager_id: req.params.id
    })
      .populate("manager_id", "full_name");

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});


router.get("/assigned-team-manager/:teamManagerId", async (req, res) => {
  try {
    const { teamManagerId } = req.params;

    const projects = await Project.find({
      team_manager_id: new mongoose.Types.ObjectId(teamManagerId)
    });

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch assigned projects" });
  }
});
router.get("/assigned-manager/:managerId", async (req, res) => {
  try {
    const { managerId } = req.params;
    if (!managerId) return res.status(400).json({ message: "Manager ID is required" });

    const projects = await Project.find({ team_manager_id: managerId })
      .select("_id name status priority dueDate");

    res.json(projects || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

router.get("/employes-list", async (req, res) => {
  try {
    const employees = await User.find({ role: "Employee" })
      .select("_id full_name email");

    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
});

router.get("/assigned/:id", async (req, res) => {
  const uploads = await ProjectUpload.find({
    assignedTo: req.params.id
  }).populate("project uploadedBy");

  res.json(uploads);
});

router.put("/status/:id", async (req, res) => {
  const updated = await ProjectUpload.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (updated?.uploadedBy) {
    await createNotification({
      userId: updated.uploadedBy,
      type: "STATUS_UPDATED",
      referenceId: updated._id,
      message: `Your upload status changed to ${updated.status}`
    });
  }
  res.json(updated);
});

router.get("/assigned-project-manager/:id", async (req, res) => {
  try {
    const managerId = req.params.id;

    const projects = await Project.find({
      manager_id: managerId,
    });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/assigned-projects", async (req, res) => {
  try {
    const projects = await Project.find({
      manager_id: { $ne: null }
    })
      .populate("manager_id", "full_name email")
      .select("name client budget progress status manager_id");

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch assigned projects" });
  }
});


module.exports = router;
