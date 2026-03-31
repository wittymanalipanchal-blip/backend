const Chat = require("../models/Chat");

exports.createGroup = async (req, res) => {
    try {
        const { chatName, members } = req.body;
        const newChat = new Chat({
            chatName,
            members,
            messages: []
        });
        await newChat.save();
        res.status(201).json(newChat);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { chatId, sender, text } = req.body;
        const chat = await Chat.findById(chatId);
        chat.messages.push({ sender, text });
        await chat.save();
        res.json(chat);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getChat = async (req, res) => {
    try {
        const chat = await Chat.find();
        res.json(chat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ ADD THIS: Isse specific user ki personal chats fetch hongi
exports.getPersonalChats = async (req, res) => {
    try {
        const { userName } = req.params;

        const chats = await Chat.find({
            // isGroup ya toh false ho, ya fir exists hi na karta ho (purane documents ke liye)
            $or: [
                { isGroup: false },
                { isGroup: { $exists: false } } 
            ],
            members: { $in: [userName] }
        });

        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Is naye function ko file mein niche add kar dijiye
exports.getChatById = async (req, res) => {
    try {
        const { chatId } = req.params;
        const chat = await Chat.findById(chatId);
        
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        
        res.json(chat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};