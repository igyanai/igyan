const axios = require('axios');

const getAIResponse = async (message) => {
  try {
    const response = await axios.post(
      "https://api.blackbox.ai/chat/completions",
      {
        model: "blackboxai/openai/gpt-4",
        messages: [{ role: "user", content: message }],
        temperature: 0.7,
        max_tokens: 256,
        stream: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BLACKBOX_API_KEY}`,
        },
        timeout: 15000, // 15 seconds
      }
    );

    const aiMessage = response.data?.choices?.[0]?.message?.content;
    if (!aiMessage) throw new Error("Invalid response format from AI service");

    return {
      response: aiMessage,
      output: aiMessage,
    };
  } catch (err) {
    // API responded with an error
    if (err.response) {
      const errorData = err.response.data?.error || {};
      console.error("Blackbox API Error:", errorData);

      // Handle quota exceeded specifically
      if (errorData.type === "budget_exceeded") {
        throw new Error("Blackbox API quota exceeded. Please upgrade or add credits.");
      }

      throw new Error(`Blackbox API error: ${errorData.message || "Unknown error"}`);
    }

    // No response received
    if (err.request) {
      console.error("No response received from Blackbox API");
      throw new Error("No response from Blackbox API.");
    }

    // Timeout error
    if (err.code === "ECONNABORTED") {
      console.error("Blackbox API request timed out");
      throw new Error("Request to AI service timed out.");
    }

    // Other errors
    console.error("Blackbox Service Error:", err.message);
    throw new Error(err.message);
  }
};

module.exports = { getAIResponse };
