const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema(
  {
    fileUrl: { type: String, required: true },
    description: String,
    remarks: String,
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assigned_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    work_type: String,
    description: String,
    status: {
      type: String,
      default: "Assigned"
    },
    due_date: {
      type: Date
    },
    uploads: [uploadSchema],
    chats: [
      {
        message: String,
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
