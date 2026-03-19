const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    client: { type: String, required: true },
    description: String,

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Active", "Completed", "On Hold"],
      default: "Active",
    },

    manager_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    team_manager_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    assigned_by_pm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    created_by_admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    budget: Number,
    progress: { type: Number, default: 0 },
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
