import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaRobot, FaSearch, FaCheckCircle } from 'react-icons/fa';
import { IoIosSend } from "react-icons/io";

// Mock background image URL for demonstration
const bgimg = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

// A list of phrases for the dynamic typing effect
const phrases = [
  "Real Skills. Real Projects.",
  "Your Career Launchpad.",
  "Personalized AI Mentorship."
];

const HeroSection = () => {
  const [chatInput, setChatInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingPhrase, setTypingPhrase] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Effect for the dynamic typing heading
  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    let charIndex = 0;
    const typingInterval = setInterval(() => {
      if (charIndex <= currentPhrase.length) {
        setTypingPhrase(currentPhrase.substring(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
        }, 2000); // Wait 2 seconds before starting the next phrase
      }
    }, 100); // Typing speed

    return () => clearInterval(typingInterval);
  }, [phraseIndex]);

  const onChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setIsLoading(true);
    setAiResponse('');
    setIsTyping(true);

    try {
      // API call to the Gemini LLM
      const chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: `I need a roadmap based on this query: "${chatInput}"` }] });
      const payload = { contents: chatHistory };
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      let response = null;
      let retryCount = 0;
      const maxRetries = 5;
      const initialDelay = 1000; // 1 second

      while (retryCount < maxRetries) {
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            break;
          } else if (response.status === 429) {
            // Implement exponential backoff
            const delay = initialDelay * Math.pow(2, retryCount);
            console.warn(`Rate limit exceeded. Retrying in ${delay / 1000}s...`);
            await new Promise(res => setTimeout(res, delay));
            retryCount++;
          } else {
            console.error(`API Error: ${response.status} ${response.statusText}`);
            throw new Error('API request failed');
          }
        } catch (error) {
          console.error(`Fetch attempt ${retryCount + 1} failed:`, error);
          if (retryCount === maxRetries - 1) throw error;
          retryCount++;
        }
      }

      if (!response || !response.ok) {
        throw new Error('Failed to fetch from API after multiple retries.');
      }

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setAiResponse(text);
      } else {
        setAiResponse('Sorry, I couldn\'t generate a response. Please try again.');
      }
    } catch (error) {
      console.error("Failed to fetch from Gemini API:", error);
      setAiResponse('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      setChatInput('');
    }
  };

  // Framer Motion variants for animations
  const heroVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.section
    // style={{ fontFamily: "Orbitron" }}
      className="relative orbitron py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={heroVariants}
    >
      {/* Background Image and Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${bgimg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-blue-900/60 dark:bg-gray-950/70 backdrop-blur-sm"></div>
      </div>

      <motion.div
        className="relative max-w-7xl mx-auto text-center z-10"
        variants={staggerVariants}
      >
        {/* Badge */}
        <motion.div
          className="flex items-center justify-center mb-6"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2 p-2 px-4 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
            <FaRobot className="w-5 h-5 text-blue-300" />
            <span className="text-sm font-medium">Next-Gen Education Platform</span>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4"
          variants={itemVariants}
        >
          <span className="block">Learn. Build. Get Hired.</span>
        </motion.h1>

        {/* Dynamic Typing Sub-heading */}
        <motion.h2
          className="text-3xl md:text-5xl font-bold text-blue-300 mb-6"
          variants={itemVariants}
        >
          {typingPhrase}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="text-base md:text-xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed"
          variants={itemVariants}
        >
          Gain real-world skills, solve industry projects, and prove your talent through our AI-powered mentor-led platform — no degree needed.
        </motion.p>

        {/* AI Chat Input */}
        <motion.div
          className="w-full max-w-xl mx-auto p-4 bg-white/20 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30"
          variants={itemVariants}
        >
          <form onSubmit={onChatSubmit} className="flex items-center gap-3">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="What career path are you interested in?"
                className="w-full pl-12 pr-4 py-3 bg-white/90 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <IoIosSend size={24} />
                  <span className="hidden sm:inline">Get AI Roadmap</span>
                </>
              )}
            </button>
          </form>
          {/* AI Response Display */}
          {(isTyping || aiResponse) && (
            <motion.div
              className="mt-4 p-4 text-left bg-gray-900/50 rounded-lg border border-gray-700"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isTyping ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-gray-300">AI is thinking...</span>
                </div>
              ) : (
                <p className="text-gray-200 leading-relaxed text-sm">{aiResponse}</p>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Stats Grid - Enhanced */}
        <motion.div
          className="mt-16 flex flex-wrap justify-center gap-8"
          variants={staggerVariants}
        >
          <motion.div className="flex items-center gap-3" variants={itemVariants}>
            <FaCheckCircle className="text-green-400 w-6 h-6" />
            <span className="text-lg text-gray-200">100% Free & Open-Source</span>
          </motion.div>
          <motion.div className="flex items-center gap-3" variants={itemVariants}>
            <FaCheckCircle className="text-green-400 w-6 h-6" />
            <span className="text-lg text-gray-200">AI-Powered Roadmaps</span>
          </motion.div>
          <motion.div className="flex items-center gap-3" variants={itemVariants}>
            <FaCheckCircle className="text-green-400 w-6 h-6" />
            <span className="text-lg text-gray-200">Skill Validation on Projects</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;
