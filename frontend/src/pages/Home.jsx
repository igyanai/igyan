import React, { useState } from 'react';
import Hero from '../components/Hero';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Homepage = () => {
  const { isDarkMode, isLoggedIn } = { ...useTheme(), ...useAuth() };
  const [chatInput, setChatInput] = useState("");

  const handleChatSubmit = () => {
    if (!isLoggedIn) {
      // Optionally show login modal via context
    } else {
      // Handle chat submission for logged-in users
      console.log('Chat submitted:', chatInput);
    }
  };

  return (
    <div className={`min-h-screen orbitron transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <Hero
          chatInput={chatInput}
          setChatInput={setChatInput}
          onChatSubmit={handleChatSubmit}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </div>
  );
};

export default Homepage;