const express = require("express");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const ProjectAssignment = require("../models/ProjectAssignment");
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

// router.post("/assign", async (req, res) => {
//   try {
//     const { projectId, managerId } = req.body;

//     if (!projectId || !managerId) {
//       return res.status(400).json({ message: "Missing fields" });
//     }

//     const project = await Project.findByIdAndUpdate(
//       projectId,
//       {
//         manager_id: managerId, // ✅ FIXED FIELD NAME
//       },
//       { new: true }
//     );

//     // ✅ IMPORTANT
//     await ProjectAssignment.create({
//       project: projectId,
//       manager: managerId,
//       assignedBy: req.user?.id || null
//     });

//     res.json({
//       message: "Project assigned successfully",
//       project,
//     });

//   } catch (err) {
//     console.error("ASSIGN ERROR 👉", err);
//     res.status(500).json({ message: err.message });
//   }
// });

router.post("/assign", async (req, res) => {
  try {
    const { projectId, managerId } = req.body;

    if (!projectId || !managerId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // duplicate check
    const existing = await ProjectAssignment.findOne({
      project: projectId,
      manager: managerId
    });

    if (existing) {
      return res.status(400).json({ message: "Already assigned" });
    }

    const assignment = await ProjectAssignment.create({
      project: projectId,
      manager: managerId,
      assignedBy: req.user?.id || null
    });

    res.json({
      message: "Assigned successfully",
      assignment
    });

  } catch (err) {
    console.error("ASSIGN ERROR 👉", err);
    res.status(500).json({ message: err.message });
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

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const assignments = await ProjectAssignment.find({
      manager: userId,
    })
      .populate("project")
      .populate("assignedBy", "full_name email");

    console.log("ASSIGNMENTS 👉", assignments);

    const result = assignments
      .filter(a => a.project)
      .map((a) => ({
        ...a.project.toObject(),
        assignedBy: a.assignedBy,
      }));

    res.json(result);

  } catch (err) {
    console.error("ASSIGN FETCH ERROR 👉", err);
    res.status(500).json({ message: err.message });
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
    const assignments = await ProjectAssignment.find()
      .populate("project")
      .populate("manager", "full_name email");

    const result = assignments
      .filter(a => a.project && a.manager)
      .map(a => ({
        assignmentId: a._id,
        projectId: a.project._id,
        name: a.project.name,
        client: a.project.client,
        budget: a.project.budget,
        progress: a.project.progress,
        status: a.project.status,
        manager: a.manager
      }));

    res.json(result);

  } catch (err) {
    console.error("FETCH ERROR 👉", err);
    res.status(500).json({ message: err.message });
  }
});

router.delete("/assignment/:id", async (req, res) => {
  try {
    const assignment = await ProjectAssignment.findByIdAndDelete(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ message: "Assignment removed" });

  } catch (err) {
    console.error("DELETE ERROR 👉", err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
