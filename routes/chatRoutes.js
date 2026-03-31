const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

router.post("/create", chatController.createGroup);
router.post("/send", chatController.sendMessage);
router.get("/all", chatController.getChat);
router.get("/personal/:userName", chatController.getPersonalChats);

module.exports = router;