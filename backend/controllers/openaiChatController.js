const { getOpenAIResponse } = require("../services/openaiService.js");
const { generateTTS } = require("../services/ttsService.js");
const { v4: uuidv4 } = require("uuid");

const chatHistory = [];
const MAX_HISTORY = 100;

const handleOpenAIChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "Message is required and must be a non-empty string." });
    }

    // Get response from OpenAI
    const aiResponseData = await getOpenAIResponse(message);
    const aiMessage = aiResponseData?.response || aiResponseData?.output;

    if (!aiMessage) {
      return res.status(502).json({ error: "Invalid response from OpenAI." });
    }

    // Generate optional TTS
    let audioFilename = null;
    try {
      audioFilename = await generateTTS(aiMessage);
    } catch (ttsError) {
      console.error("TTS generation failed:", ttsError);
    }
    const audioUrl = audioFilename ? `/audio/${audioFilename}` : null;

    const chatEntry = {
      id: uuidv4(),
      provider: "openai",
      user: message,
      ai: aiMessage,
      audio_url: audioUrl,
      timestamp: new Date().toISOString(),
    };

    chatHistory.unshift(chatEntry);
    if (chatHistory.length > MAX_HISTORY) chatHistory.pop();

    res.json(chatEntry);
  } catch (err) {
    console.error("OpenAI Chat Error:", err.message);
    res.status(500).json({ error: "Server error while processing OpenAI chat request." });
  }
};

const getOpenAIHistory = (req, res) => {
  res.json(chatHistory.slice(0, 20));
};

module.exports = { handleOpenAIChat, getOpenAIHistory };
