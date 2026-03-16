const express = require("express");
const router = express.Router();
const Meeting = require("../models/meeting");
const multer = require("multer");

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

        const { zoomLink, meetingTime, createdBy } = req.body;

        if (!zoomLink || !meetingTime) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const meeting = new Meeting({
            zoomLink,
            meetingTime,
            createdBy,
            scrumSheet: req.file ? `/uploads/${req.file.filename}` : ""
        });

        await meeting.save();

        res.json(meeting);

    } catch (err) {

        console.error(err);
        res.status(500).json({ message: "Meeting create failed" });

    }
});


router.get("/", async (req, res) => {
    try {

        const meetings = await Meeting.find()
            .populate("createdBy", "full_name")
            .sort({ createdAt: -1 });

        res.json(meetings);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;