import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FaRobot, FaMicrophone, FaSpinner, FaMicrophoneAlt } from 'react-icons/fa';
import { IoIosSend } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

// Mock background image URL for demonstration
const bgimg = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

// A list of phrases for the dynamic typing effect
const phrases = [
  "Real Skills. Real Projects.",
  "Your Career Launchpad.",
  "Personalized AI Mentorship."
];

// Custom hook for speech-to-text functionality
const useAudioRecorder = (onTranscript) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = React.useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.error("Web Speech API is not supported by this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false; // Stop after a single utterance
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      console.log("Listening for speech...");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsRecording(false);
      console.log("Listening stopped.");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [onTranscript]);

  const startRecording = () => {
    if (isListening) return;
    setIsRecording(true);
    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (!isListening) return;
    recognitionRef.current.stop();
  };

  return { isRecording, isListening, startRecording, stopRecording };
};

const HeroSection = () => {
  const [chatInput, setChatInput] = useState('');
  const [typingPhrase, setTypingPhrase] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const navigate = useNavigate();

  const { isRecording, isListening, startRecording } = useAudioRecorder(
    (transcript) => {
      if (transcript) {
        setChatInput(transcript);
        onChatSubmit(null, transcript);
      }
    }
  );

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

  const onChatSubmit = (e, queryOverride) => {
    if (e) e.preventDefault();
    const query = queryOverride || chatInput;
    if (!query.trim()) return;

    // Redirect to the main chat page, passing the query as state
    navigate('/aiguide', { state: { initialQuery: query } });
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
          className="text-4xl md:text-6xl font-extrabold text-white/80 leading-tight mb-4"
          variants={itemVariants}
        >
          <span className="block">Learn. Build. & Become <br /> Future Ready</span>
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
          className="w-full max-w-[160px] mx-auto p-4 bg-white/20 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30"
          variants={itemVariants}
        >
          <form onSubmit={onChatSubmit} className="flex items-center gap-3">
            <div className="relative flex-grow">
              {/* <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="What career path are you interested in?"
                className=" w-2/3 pl-4 pr-12 py-3 bg-white/90 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              /> */}
              <button
                type="button"
                onClick={startRecording}
                className="absolute bg-white p-4 rounded-full right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                disabled={isListening}
              >
                {isListening ? (
                  <FaSpinner className="animate-spin" size={24} />
                ) : (
                  <FaMicrophoneAlt size={24} />
                )}
              </button>
            </div>
            <button
              type="submit"
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors shadow-lg flex items-center justify-center gap-2 font-semibold"
            >
              <IoIosSend  size={24} />
              {/* <NavLink to="/aiguide" >
              <span className="hidden sm:inline">Go to Chat</span>
              </NavLink> */}
            </button>
          </form>
        </motion.div>

        {/* Stats Grid - Enhanced */}
        <motion.div
          className="mt-16 flex flex-wrap justify-center gap-8"
          variants={staggerVariants}
        >
          <motion.div className="flex items-center gap-3" variants={itemVariants}>
            <div className="text-xl font-bold text-green-400">100%</div>
            <span className="text-lg text-gray-200">Trusted & Open-Source</span>
          </motion.div>
          <motion.div className="flex items-center gap-3" variants={itemVariants}>
            <div className="text-xl font-bold text-green-400">AI</div>
            <span className="text-lg text-gray-200">Powered Roadmaps</span>
          </motion.div>
          <motion.div className="flex items-center gap-3" variants={itemVariants}>
            <div className="text-xl font-bold text-green-400">Pro</div>
            <span className="text-lg text-gray-200">Skill Validation</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;