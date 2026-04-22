const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: String,
  website: String,
  description: String,
}, { timestamps: true });

module.exports = mongoose.model("Workspace", workspaceSchema);