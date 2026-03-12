import { sendNotificationToAll } from "./notificationController.js";
const Announcement = require("../models/Announcement");

const getAnnouncements = async (req, res) => {
  const data = await Announcement.find().sort({ createdAt: -1 });
  res.json(data);
};

// const addAnnouncement = async (req, res) => {
//   const { title, message } = req.body;

//   const announcement = await Announcement.create({
//     title,
//     message,
//   });

//   res.status(201).json(announcement);
// };
export const addAnnouncement = async (req, res) => {
  const { title, description } = req.body;

  // announcement DB me save karo (agar alag model hai)

  await sendNotificationToAll(
    `📢 New Announcement: ${title}`
  );

  res.json({ success: true, message: "Announcement sent to all users" });
};

module.exports = { getAnnouncements, addAnnouncement };
