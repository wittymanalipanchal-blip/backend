const express = require("express");
const router = express.Router();
const Team = require("../models/Team");

router.get("/", async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("employees", "name email role") 
      .populate("lead", "name email"); 
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔹 CREATE team
router.post("/", async (req, res) => {
  try {
    const team = new Team(req.body);
    await team.save();
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/employees/:managerId", async (req, res) => {
  try {
    const teams = await Team.find({
      lead: req.params.managerId,
    }).populate("employees", "full_name email");

    const employees = teams.flatMap(team => team.employees);
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;