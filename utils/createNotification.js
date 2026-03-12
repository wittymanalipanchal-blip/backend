const Notification = require("../models/Notification");

const createNotification = async ({
  userId,
  type,
  referenceId,
  message
}) => {
  try {
    await Notification.create({
      userId,
      type,
      referenceId,
      message
    });
  } catch (err) {
    console.log("Notification Error:", err);
  }
};

module.exports = createNotification;
