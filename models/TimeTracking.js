const mongoose = require("mongoose");

const timeTrackingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    description: String,
    startTime: Date,
    endTime: Date,
    totalSeconds: Number,
    status: {
      type: String,
      enum: ["running", "completed"],
      default: "running",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TimeTracking", timeTrackingSchema);
