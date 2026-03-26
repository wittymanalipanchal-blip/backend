const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender : String,
    text : String, 
    time: {
        type: Date,
        default: Date.now
    }
});

const chatSchema = new mongoose.Schema({
    chatName: String,
    members: [String],
    messages: [messageSchema]
});

module.exports = mongoose.model("Chat", chatSchema);