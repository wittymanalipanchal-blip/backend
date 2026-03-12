import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const sendNotification = async (userId, message, type = "general") => {
  await Notification.create({
    userId,
    message,
    type,
  });
};

export const sendNotificationToAll = async (message) => {
  const users = await User.find({}, "_id");

  const notifications = users.map((u) => ({
    userId: u._id,
    message,
    type: "announcement",
  }));

  await Notification.insertMany(notifications);
};

export const getNotifications = async (req, res) => {
  const { userId } = req.params;

  const notifications = await Notification.find({
  userId,
  type: "announcement"
}).sort({ createdAt: -1 });

  res.json(notifications);
};

export const markAsRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, {
    status: "Read",
  });
  res.json({ success: true });
};

export const updateNotificationStatus = async (req, res) => {
  const { status } = req.body; 

  await Notification.findByIdAndUpdate(req.params.id, { status });

  res.json({ success: true });
};

router.get("/announcements/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({
      userId,
      type: "announcement",
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
});
