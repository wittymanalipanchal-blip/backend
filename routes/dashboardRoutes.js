const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const Task = require("../models/Task");
const Client = require("../models/Client");

router.get("/admin-stats", async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();

    const activeTasks = await Task.countDocuments({
      status: { $ne: "Completed" }
    });

    const totalClients = await Client.countDocuments();

    res.json({
      totalProjects,
      activeTasks,
      totalClients,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/monthly-completed", async (req, res) => {
  try {
    const data = await Project.aggregate([
      { $match: { status: "Completed" } },
      {
        $group: {
          _id: { $month: "$updatedAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/projects-overview", async (req, res) => {
  try {
    const projects = await Project.find();

    const data = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({
          project_id: project._id,
        });

        const completedTasks = await Task.countDocuments({
          project_id: project._id,
          status: "Completed",
        });

        const progress =
          totalTasks === 0
            ? 0
            : Math.round((completedTasks / totalTasks) * 100);

        return {
          _id: project._id,
          name: project.name,
          totalTasks,
          completedTasks,
          progress,
          budget: project.budget || 0,
        };
      })
    );

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

