const mongoose = require("mongoose");

const projectUploadSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  description: { type: String },
  type: { type: String, enum: ["zip", "txt", "link"], default: "zip" },
  files: [
    {
      fileName: String,
      fileBase64: String,
      fileBuffer: Buffer,
      fileType: String
    }
  ],
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ProjectUpload", projectUploadSchema);
