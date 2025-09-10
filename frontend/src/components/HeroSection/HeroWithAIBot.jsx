// HeroWithAIBot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useSpring, animated as a } from '@react-spring/three';
import { motion } from 'framer-motion';
import { FaRobot, FaMicrophoneAlt, FaSpinner } from 'react-icons/fa';
import { IoIosSend } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

// Background image
const bgimg = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2940&auto=format&fit=crop";

// Typing phrases
const phrases = [
  "Real Skills. Real Projects.",
  "Your Career Launchpad.",
  "Personalized AI Mentorship."
];

// 🎙️ Custom hook for speech-to-text
const useAudioRecorder = (onTranscript) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.error("Web Speech API not supported");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => {
      setIsListening(false);
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, [onTranscript]);

  const startRecording = () => {
    if (!isListening) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  return { isRecording, isListening, startRecording };
};

// 🤖 3D Bot Head
const BotHead = () => {
  const { rotation } = useSpring({
    rotation: [0, Math.PI * 2, 0],
    loop: true,
    config: { duration: 8000 },
  });

  return (
    <a.mesh rotation={rotation}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#3b82f6" roughness={0.3} metalness={0.8} />
      {/* Eyes */}
      <mesh position={[-0.35, 0.2, 0.9]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.35, 0.2, 0.9]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Mouth */}
      <mesh position={[0, -0.3, 0.9]}>
        <boxGeometry args={[0.4, 0.1, 0.1]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </a.mesh>
  );
};

// 🌟 Hero Section with AI Bot
const HeroWithAIBot = () => {
  const [chatInput, setChatInput] = useState('');
  const [typingPhrase, setTypingPhrase] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const navigate = useNavigate();

  const { isListening, startRecording } = useAudioRecorder((transcript) => {
    setChatInput(transcript);
    onChatSubmit(null, transcript);
  });

  // Dynamic typing effect
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
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }, 2000);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [phraseIndex]);

  const onChatSubmit = (e, queryOverride) => {
    if (e) e.preventDefault();
    const query = queryOverride || chatInput;
    if (!query.trim()) return;
    navigate('/aiguide', { state: { initialQuery: query } });
  };

  return (
    <motion.section
      className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.8 } }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${bgimg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto text-center z-10">
        {/* Badge */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2 p-2 px-4 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
            <FaRobot className="w-5 h-5 text-blue-300" />
            <span className="text-sm font-medium">Next-Gen Education Platform</span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-white/80 leading-tight mb-4">
          Learn. Build. & Become <br /> Future Ready
        </h1>
        <h2 className="text-3xl md:text-5xl font-bold text-blue-300 mb-6">
          {typingPhrase}
        </h2>

        {/* 3D Bot */}
        <div className="w-full h-[300px] md:h-[400px] mb-8">
          <Canvas camera={{ position: [0, 0, 4] }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[2, 2, 2]} />
            <BotHead />
            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>

        {/* Input with mic */}
        <div className="w-full max-w-[200px] mx-auto p-4 bg-white/20 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30">
          <form onSubmit={onChatSubmit} className="flex items-center gap-3">
            <button
              type="button"
              onClick={startRecording}
              className="p-4 bg-white rounded-full text-gray-700 hover:text-blue-600 transition"
              disabled={isListening}
            >
              {isListening ? <FaSpinner className="animate-spin" size={24} /> : <FaMicrophoneAlt size={24} />}
            </button>
            <button
              type="submit"
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
            >
              <IoIosSend size={24} />
            </button>
          </form>
        </div>
      </div>
    </motion.section>
  );
};

export default HeroWithAIBot;
