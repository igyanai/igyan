const { getAIResponse } = require("../services/aiService.js");
const { generateTTS } = require("../services/ttsService.js");
const { v4: uuidv4 } = require("uuid");

const chatHistory = [];

const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "Message is required and must be a non-empty string." });
    }

    // Get response from AI service
    const aiResponseData = await getAIResponse(message);
    const aiMessage = aiResponseData?.response || aiResponseData?.output;

    if (!aiMessage || typeof aiMessage !== "string" || aiMessage.trim() === "") {
      console.error("AI service returned an empty or invalid response.");
      return res.status(500).json({ error: "Could not get a valid response from the AI service." });
    }

    // generate TTS audio
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

    chatHistory.unshift(chatEntry);

    res.json({
      message: aiMessage,
      audio_url: audioUrl,
    });
  } catch (err) {
    console.error("Chat Error:", err.stack || err.message || err);
    res.status(500).json({ error: "An unexpected error occurred on the server." });
  }
};

const getHistory = (req, res) => {
  res.json(chatHistory.slice(0, 20));
};

module.exports = { handleChat, getHistory };
