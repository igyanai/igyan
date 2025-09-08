const axios = require('axios');

const getAIResponse = async (message) => {
  try {
    const response = await axios.post(
      "https://api.blackbox.ai/api/chat",
      {
        model: "blackboxai/openai/gpt-4",
        messages: [{ role: "user", content: message }],
        temperature: 0.7,
        max_tokens: 256,
        stream: false,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 seconds timeout
      }
    );
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return {
        response: response.data.choices[0].message.content,
        output: response.data.choices[0].message.content
      };
    } else {
      throw new Error("Invalid response format from AI service");
    }
  } catch (err) {
    if (err.response) {
      console.error("Blackbox API Error:", err.response.data);
      throw new Error(`Blackbox API error: ${JSON.stringify(err.response.data)}`);
    } else if (err.request) {
      console.error("No response received from Blackbox API:", err.request);
      throw new Error("No response from Blackbox API.");
    } else if (err.code === 'ECONNABORTED') {
      console.error("Blackbox API request timed out");
      throw new Error("Request to AI service timed out.");
    } else {
      console.error("Blackbox Service Error:", err.message);
      throw err;
    }
  }
};

module.exports = { getAIResponse };
