const mongoose = require("mongoose");

const projectReportSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    description: String,

    files: [String], 

    status: {
      type: String,
      enum: ["Assigned", "Reviewed"],
      default: "Assigned"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProjectReport", projectReportSchema);
