const mongoose = require("mongoose");
const Project = require("../models/Project");

exports.getProjectsByTeamManager = async (req, res) => {
  try {
    const { managerId } = req.params;

    if (!managerId) {
      return res.status(400).json({ message: "Manager ID required" });
    }

    const projects = await Project.find({
      team_manager_id: req.params.id
    })
      .populate("manager_id", "full_name email")
      .populate("manager_id", "full_name email");

    res.json(projects);
  } catch (error) {
    console.error("GET PROJECTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }

};

exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.find({
      "role.role": "Admin"
    }).select("_id full_name email");

    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch admins" });
  }
};

