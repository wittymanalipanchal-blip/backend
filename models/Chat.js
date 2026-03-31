const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: String,
    text: String,
    file: String,
    fileName: String,
    image: String,
    emoji: String,
    time: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
    chatName: String,
    members: [String],
    createdBy: String,
    isGroup: { type: Boolean, default: true },
    messages: [messageSchema],
    role: String,
});

module.exports = mongoose.model("Chat", chatSchema);