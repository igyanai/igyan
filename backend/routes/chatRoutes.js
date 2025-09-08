const express = require("express");
const { handleChat, getHistory } = require("../controllers/chatController");

const router = express.Router();

router.post("/chat", handleChat);
router.get("/history", getHistory);

module.exports = router;
