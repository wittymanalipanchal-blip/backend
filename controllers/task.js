const Task = require("../models/Task");


exports.createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    console.error("TASK CREATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
