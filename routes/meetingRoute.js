const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Meeting = require("../models/meeting");
const multer = require("multer");
const mongoose = require("mongoose");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });


router.post("/add", upload.single("scrumSheet"), async (req, res) => {
  try {

    const { zoomLink, meetingTime, createdBy, teamManagers } = req.body;

    const meeting = new Meeting({
      zoomLink,
      meetingTime,
      createdBy: new mongoose.Types.ObjectId(createdBy),

      // 🔥 IMPORTANT FIX
      teamManagers: teamManagers
        ? Array.isArray(teamManagers)
          ? teamManagers
          : [teamManagers]
        : [],

      scrumSheet: req.file ? `/uploads/${req.file.filename}` : ""
    });

    await meeting.save();

    res.json(meeting);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Meeting create failed" });
  }
});


// router.post("/add", upload.single("scrumSheet"), async (req, res) => {
//     try {

//         const { zoomLink, meetingTime, createdBy, teamManagers } = req.body;

//         if (!zoomLink || !meetingTime) {
//             return res.status(400).json({ message: "Missing fields" });
//         }

//         const meeting = new Meeting({
//             zoomLink,
//             meetingTime,
//             createdBy,
//             teamManagers,
//             scrumSheet: req.file ? `/uploads/${req.file.filename}` : ""
//         });

//         await meeting.save();

//         res.json(meeting);

//     } catch (err) {

//         console.error(err);
//         res.status(500).json({ message: "Meeting create failed" });

//     }
// });

router.get("/", async (req, res) => {
    console.log("HIT: /api/meetings");
    try {
        const meetings = await Meeting.find()
        .populate("teamManagers", "full_name")
        .populate("createdBy", "full_name")
        .sort({ createdAt: -1 });
        
        
        res.json(meetings);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
 
});

// router.get("/", async (req, res) => {
//   try {

//     const Role = require("../models/Role");

//     const adminRole = await Role.findOne({ name: "Admin" });

//     if (!adminRole) return res.json([]);

//     const admins = await User.find({
//       role_id: adminRole._id
//     }).select("_id");

//     const adminIds = admins.map(a => a._id);

//     const meetings = await Meeting.find({
//       createdBy: { $in: adminIds }
//     })
//       .populate("teamManagers", "full_name")
//       .populate("createdBy", "full_name")
//       .sort({ createdAt: -1 });

//     res.json(meetings);

//   } catch (err) {
//     console.error("ERROR:", err);
//     res.status(500).json({ message: err.message });
//   }
// });


// router.get("/:userId", async (req, res) => {
//   try {

//     const userId = new mongoose.Types.ObjectId(req.params.userId);

//     const meetings = await Meeting.find({
//       $or: [
//         { teamManagers: { $in: [userId] } }, 
//         { createdBy: userId }              
//       ]
//     })
//       .populate("teamManagers", "full_name")
//       .populate("createdBy", "full_name")
//       .sort({ createdAt: -1 });

//     res.json(meetings);

//   } catch (err) {
//     console.error("MEETING FETCH ERROR:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

// router.get("/:userId", async (req, res) => {
//     console.log("HIT: /api/meetings/:userId"); 
//   try {

//     const userId = new mongoose.Types.ObjectId(req.params.userId);

//     const meetings = await Meeting.find({
//       createdBy: userId 
//     })
//       .populate("teamManagers", "full_name email")
//       .populate("createdBy", "full_name")
//       .sort({ createdAt: -1 });

//     res.json(meetings);

//   } catch (err) {
//     console.error("FETCH ERROR:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

// router.get("/user/:userId", async (req, res) => {
//   try {

//     const userId = new mongoose.Types.ObjectId(req.params.userId);

//     const meetings = await Meeting.find({
//       createdBy: userId
//     })
//       .populate("teamManagers", "full_name email")
//       .populate("createdBy", "full_name")
//       .sort({ createdAt: -1 });

//     console.log("USER MEETINGS:", meetings);

//     res.json(meetings);

//   } catch (err) {
//     console.error("FETCH ERROR:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

router.get("/user/:userId", async (req, res) => {
  try {

    const userId = new mongoose.Types.ObjectId(req.params.userId);

    const meetings = await Meeting.find({
      $or: [
        { createdBy: userId },
        { teamManagers: { $in: [userId] } }
      ]
    })
      .populate("teamManagers", "full_name email")
      .populate("createdBy", "full_name")
      .sort({ createdAt: -1 });

    console.log("USER MEETINGS:", meetings);

    res.json(meetings);

  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;