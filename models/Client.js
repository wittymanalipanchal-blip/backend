const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    company: String,
    address: String,
    website: String,
    status: { type: String, default: "Active" },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
