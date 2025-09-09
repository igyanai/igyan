const { getAIResponse } = require("../services/aiService.js");
const { generateTTS } = require("../services/ttsService.js");
const { v4: uuidv4 } = require("uuid");

const chatHistory = [];
const MAX_HISTORY = 100; 

const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "Message is required and must be a non-empty string." });
    }

    // Get response from AI service
    let aiResponseData;
    try {
      aiResponseData = await getAIResponse(message);
    } catch (err) {
      // Detect Blackbox quota error
      if (err.message?.includes("quota") || err.message?.includes("budget_exceeded")) {
        return res.status(429).json({ error: "AI quota exceeded. Please upgrade your plan." });
      }
      throw err; // rethrow other errors
    }

    const aiMessage = aiResponseData?.response || aiResponseData?.output;
    if (!aiMessage || typeof aiMessage !== "string" || aiMessage.trim() === "") {
      console.error("AI service returned an empty or invalid response.");
      return res.status(502).json({ error: "AI service returned an invalid response." });
    }

    // Generate TTS audio (optional)
    let audioFilename = null;
    try {
      audioFilename = await generateTTS(aiMessage);
    } catch (ttsError) {
      console.error("TTS generation failed:", ttsError);
    }
    const audioUrl = audioFilename ? `/audio/${audioFilename}` : null;

    const chatEntry = {
      id: uuidv4(),
      user: message,
      ai: aiMessage,
      audio_url: audioUrl,
      timestamp: new Date().toISOString(),
    };

    // Store history, limit to MAX_HISTORY
    chatHistory.unshift(chatEntry);
    if (chatHistory.length > MAX_HISTORY) {
      chatHistory.pop();
    }

    res.json(chatEntry); // return full entry so frontend has ID + timestamp
  } catch (err) {
    console.error("Chat Error:", err.stack || err.message || err);
    if (err.response) {
      console.error("Error response data:", err.response.data);
    }
    res.status(500).json({ error: "Server error while processing chat request." });
  }
};

const getHistory = (req, res) => {
  res.json(chatHistory.slice(0, 20)); // latest 20 chats
};

module.exports = { handleChat, getHistory };
