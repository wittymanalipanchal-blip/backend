const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

router.get("/personal/:userName", chatController.getPersonalChats);
router.post("/create", chatController.createGroup);
router.post("/send", chatController.sendMessage);
router.get("/all", chatController.getChat);
router.get("/groups/:userName", chatController.getGroupChats);
router.delete('/delete/:chatId', chatController.deleteChat);


router.get("/:chatId", chatController.getChatById);


module.exports = router;