const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getOpenAIResponse(message) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [{ role: "user", content: message }],
      temperature: 0.7,
      max_tokens: 256,
    });

    return {
      response: response.choices[0].message.content,
      output: response.choices[0].message.content,
    };
  } catch (err) {
    console.error("OpenAI API Error:", err.message);
    throw new Error("Failed to get response from OpenAI.");
  }
}

module.exports = { getOpenAIResponse };
