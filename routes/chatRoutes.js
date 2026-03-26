const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

router.post("/create", chatController.createGroup);
router.post("/send", chatController.sendMessage);
router.get("/all", chatController.getChat);

module.exports = router;