const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "PROJECT_ASSIGNED",
        "TASK_ADDED",
        "TASK_UPLOADED",
        "ANNOUNCEMENT"
      ],
      required: true,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Unread", "Read"],
      default: "Unread",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
