const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Role = require("../models/Role");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { full_name, email, password, role_id, status } = req.body;

    const roleData = await Role.findById(role_id);
    if (!roleData) {
      return res.status(400).json({ message: "Role not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      full_name,
      email,
      password: hashedPassword,
      role_id: roleData._id,
      status,
    });

    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { role } = req.query;
    let filter = {};
console.log("hii")
    if (role) {
      const roleData = await Role.findOne({ name: role });
      if (!roleData) return res.json([]);
      filter.role_id = roleData._id;
    }

    const users = await User.find(filter)
      .select("_id full_name email role_id" ,"profilePic")
      .populate("role_id", "name");

      console.log("temp", users);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed" });
  }
});

router.get("/employees", async (req, res) => {
  try {
    const employeeRole = await Role.findOne({ name: "Employee" });

    if (!employeeRole) return res.json([]);

    const employees = await User.find({
      role_id: employeeRole._id,
      status: { $regex: "^ACTIVE", $options: "i" }  
    }).select("_id full_name email");

    res.json(employees);

  } catch (err) {
    console.error("EMPLOYEE FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("role_id", "name");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: "Profile fetch failed" });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const { full_name, email, password, role_id, status } = req.body;

    const updateData = { full_name, email, status };
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    if (role_id) {
      const roleData = await Role.findById(role_id);
      if (!roleData) {
        return res.status(400).json({ message: "Role not found" });
      }
      updateData.role_id = role_id;
    }
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.params.id },
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });

  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// router.post("/login", async (req, res) => {
//   const { email, password, role } = req.body;

//   try {
//     const user = await User.findOne({ email })
//       .select("+password")
//       .populate("role_id");

//     if (!user) return res.status(404).json({ message: "User not found" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "Invalid password" });

//     if (user.role_id.name !== role) {
//       return res.status(403).json({ message: "Role mismatch" });
//     }

//     res.json({
//       message: "Login successful",
//       user: {
//         id: user._id,
//         name: user.full_name,
//         email: user.email,
//         role: user.role_id.name,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
// router.get("/employees", async (req, res) => {
//   const employees = await User.find({ role: "employee" })
//     .select("_id full_name email");

//   res.json(employees);
// });



// router.get("/team-managers", async (req, res) => {
//   try {
//     const users = await User.find()
//       .populate("role_id");

//     const teamManagers = users.filter(
//       (u) => u.role_id?.name === "Team Manager"
//     );

//     res.json(teamManagers);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch team managers" });
//   }
// });

// router.get("/team-managers", async (req, res) => {
//   try {
//     const managerRole = await Role.findOne({ name: "Team Manager" });

//     if (!managerRole) return res.json([]);

//     const managers = await User.find({
//       role_id: managerRole._id,
//       status: "ACTIVE",
//     }).select("_id full_name email");

//     res.json(managers);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

router.get("/team-managers", async (req, res) => {
  try {

    const managerRole = await Role.findOne({ name: "Team Manager" });

    if (!managerRole) {
      return res.json([]);
    }

    const managers = await User.find({
      role_id: managerRole._id,
      status: "ACTIVE"
    }).select("_id full_name email");

    res.json(managers);

  } catch (err) {
    console.error("TEAM MANAGER FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/project-managers", async (req, res) => {
  try {
    const role = await Role.findOne({ name: "Project Manager" });
    if (!role) return res.json([]);

    const users = await User.find({ role_id: role._id })
      .select("_id full_name email");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch PMs" });
  }
});




module.exports = router;
