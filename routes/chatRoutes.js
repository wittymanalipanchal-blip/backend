const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

router.get("/personal/:userName", chatController.getPersonalChats);
router.post("/create", chatController.createGroup);
router.post("/send", chatController.sendMessage);
router.get("/all", chatController.getChat);
router.get("/groups/:userName", chatController.getGroupChats);

// 👇 YE WALA ROUTE ADD KAREIN (Taki specific ID handle ho sake)
router.get("/:chatId", chatController.getChatById);

module.exports = router;