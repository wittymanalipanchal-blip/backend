const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
{
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  senderRole: String,

  message: {
    type: String,
    required: true
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);