const express = require("express");
const { handleChat, getHistory } = require("../controllers/chatController.js"); // blackbox
const { handleOpenAIChat, getOpenAIHistory } = require("../controllers/openaiChatController.js"); // openai

const router = express.Router();

// Blackbox routes
router.post("/chat/blackbox", handleChat);
router.get("/history/blackbox", getHistory);

// OpenAI routes
router.post("/chat/openai", handleOpenAIChat);
router.get("/history/openai", getOpenAIHistory);

module.exports = router;
