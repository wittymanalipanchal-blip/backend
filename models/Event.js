const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
{
  title: { type: String, required: true },
  type: { type: String, default: "task" },
  date: { type: String, required: true },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);