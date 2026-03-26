const Chat = require("../models/Chat");

exports.createGroup = async (req, res) => {
    try{
        const { chatName, members } = req.body;
        const newChat = new Chat({
            chatName,
            members,
            messages: []
        });
        await newChat.save();
        res.status(201).json(newChat);
    } catch(err){
        res.status(500).json({ message: err.message });
    }
};

exports.sendMessage = async (req, res) => {
    try{
        const { chatId, sender, text } = req.body;
        const chat = await Chat.findById(chatId);
        chat.messages.push({ sender, text });
        await chat.save();
        res.json(chat);
    }catch(err){
        res.status(500).json({ message: err.message });
    }
};

exports.getChat = async (req, res) => {
    try{
        const chat = await Chat.find();
        res.json(chat);
    }catch(err){ 
        res.status(500).json({ error: err.message });
    }
};
