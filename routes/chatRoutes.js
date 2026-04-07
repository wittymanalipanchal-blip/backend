const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

router.get("/personal/:userName", chatController.getPersonalChats);
router.post("/create", chatController.createGroup);
router.post("/send", chatController.sendMessage);
router.get("/all", chatController.getChat);
router.get("/groups/:userName", chatController.getGroupChats);
router.delete('/delete/:chatId', chatController.deleteChat);
router.delete("/chat/:id", async (req, res) => {
  try {
    const chatId = req.params.id;

    const deletedChat = await Chat.findByIdAndDelete(chatId);

    if (!deletedChat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json({ message: "Chat deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:chatId", chatController.getChatById);


module.exports = router;