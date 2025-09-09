const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Send message to backend AI and get response
 * @param {string} message - User input message
 * @returns {Promise<{message: string, audio_url?: string}>}
 */
export const sendMessageToAI = async (message) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Handle Blackbox-specific errors gracefully
      
      if (errorData.error?.type === "budget_exceeded") {
        throw new Error("Your AI quota has been exceeded. Please upgrade your plan.");
      }
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return await response.json(); // { message, audio_url }
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === "AbortError") {
      console.error("Chat API Error: Request timed out");
      throw new Error("Request timed out. Please try again.");
    }

    console.error("Chat API Error:", err);
    throw err;
  }
};

// /**
//  * (Optional) Get chat history from backend
//  */
// export const fetchChatHistory = async () => {
//   const controller = new AbortController();
//   const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

//   try {
//     const response = await fetch(`${API_BASE_URL}/api/history`, { signal: controller.signal });
//     clearTimeout(timeoutId);
//     if (!response.ok) throw new Error("Failed to fetch chat history");
//     return await response.json();
//   } catch (err) {
//     if (err.name === 'AbortError') {
//       console.error("History API Error: Request timed out");
//       throw new Error("Request timed out. Please try again.");
//     }
//     console.error("History API Error:", err);
//     throw err;
//   }
// };


// const BLACKBOX_API_URL = "https://api.blackboxai.dev/chat/completions";
// const BLACKBOX_API_KEY = import.meta.env.VITE_BLACKBOX_KEY; // ⚠️ Keep secret for production

// console.log("Using Blackbox API Key:", BLACKBOX_API_KEY);

// /**
//  * Send message to Blackbox AI directly from frontend (for testing)
//  * @param {string} message - User input message
//  * @returns {Promise<{message: string}>}
//  */
// export const sendMessageToAI = async (message) => {
//   const controller = new AbortController();
//   const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

//   try {
//     const response = await fetch("https://api.blackbox.ai/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${BLACKBOX_API_KEY}`,
//       },
//       body: JSON.stringify({
//         model: "blackboxai/openai/gpt-4",
//         messages: [{ role: "user", content: message }],
//         max_tokens: 256,
//         temperature: 0.7,
//       }),
//       signal: controller.signal,
//     });

//     clearTimeout(timeoutId);

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.message || `Blackbox API error: ${response.status}`);
//     }

//     const data = await response.json();
//     // Extract reply depending on Blackbox response structure
//     return { message: data.choices?.[0]?.message?.content || "" };

//   } catch (err) {
//     clearTimeout(timeoutId);

//     if (err.name === "AbortError") {
//       console.error("Chat API Error: Request timed out");
//       throw new Error("Request timed out. Please try again.");
//     }

//     console.error("Chat API Error:", err);
//     throw err;
//   }
// };

/**
 * Optional: Fetch chat history from your backend (if you store it)
 */
export const fetchChatHistory = async () => {
  // Implement if you have a backend history API; otherwise skip
  return [];
};
