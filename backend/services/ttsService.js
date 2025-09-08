const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const googleTTS = require("google-tts-api");
const axios = require("axios");

const AUDIO_DIR = path.join(__dirname, "../audio");
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR);
}

const generateTTS = async (text) => {
  try {
    const url = googleTTS.getAudioUrl(text, {
      lang: "en",
      slow: false,
      host: "https://translate.google.com",
    });

    const filename = `${uuidv4()}.mp3`;
    const filepath = path.join(AUDIO_DIR, filename);

    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer', // Important: tells axios to handle the response as a buffer
      timeout: 10000, // 10 seconds timeout
    });

    fs.writeFileSync(filepath, response.data);

    return filename;
  } catch (err) {
    console.error("TTS Error:", err);
    return null;
  }
};

module.exports = { generateTTS };
