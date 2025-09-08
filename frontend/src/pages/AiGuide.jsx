import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot, User, Send, Code,
  ArrowLeft, Mic, Rocket, Volume2,
  Moon, Sun, Menu, X, Gamepad2, Video, Brain, Monitor,
  Smartphone, Cloud, UserCog, AlertCircle, RefreshCw
} from 'lucide-react';

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import { sendMessageToAI } from "../components/api/chatApi";

const AIGuide = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('aiGuide-darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  // --- Utility Functions ---

  const saveChatHistory = (history) => {
    localStorage.setItem('aiGuide-chatHistory', JSON.stringify(history));
    setChatHistory(history);
  };

  const loadChatHistory = () => {
    const saved = localStorage.getItem('aiGuide-chatHistory');
    return saved ? JSON.parse(saved) : [];
  };

  const saveCurrentChat = (updatedMessages, newTitle = null) => {
    if (!currentChatId) return;

    const currentHistory = loadChatHistory();
    const updatedHistory = currentHistory.map(chat => {
      if (chat.id === currentChatId) {
        const title = newTitle || (updatedMessages.length > 1
          ? updatedMessages[1].content.slice(0, 50) + (updatedMessages[1].content.length > 50 ? "..." : "")
          : "New Chat");
        return {
          ...chat,
          title,
          messages: updatedMessages,
          lastUpdated: new Date().toISOString(),
        };
      }
      return chat;
    });

    // Add new chat if it doesn't exist (e.g., first message sent)
    if (!currentHistory.find(c => c.id === currentChatId)) {
      const title = updatedMessages[1]?.content.slice(0, 50) || "New Chat";
      const newChat = {
        id: currentChatId,
        title,
        messages: updatedMessages,
        lastUpdated: new Date().toISOString(),
      };
      updatedHistory.unshift(newChat);
    }

    saveChatHistory(updatedHistory);
  };

  const initializeNewChat = () => {
    const newChatId = Date.now().toString();
    const welcomeMessage = {
      id: 1,
      type: 'ai',
      content: "Hi there! 👋 I'm GYAN-AI, your personal learning companion. What would you like to learn today?",
      timestamp: new Date().toISOString(),
    };

    setCurrentChatId(newChatId);
    setMessages([welcomeMessage]);
    localStorage.setItem('aiGuide-currentChatId', newChatId);

    const newChat = {
      id: newChatId,
      title: "New Chat",
      messages: [welcomeMessage],
      lastUpdated: new Date().toISOString(),
    };

    const currentHistory = loadChatHistory();
    const updatedHistory = [newChat, ...currentHistory];
    saveChatHistory(updatedHistory);
  };

  const loadChat = (chatId) => {
    const history = loadChatHistory();
    const chat = history.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages || []);
      localStorage.setItem('aiGuide-currentChatId', chatId);
      setSidebarOpen(false); // Close sidebar on mobile after selecting chat
    } else {
      console.warn('Chat not found:', chatId);
    }
  };

  const deleteChat = (chatId) => {
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
    saveChatHistory(updatedHistory);
    if (currentChatId === chatId) {
      initializeNewChat();
    }
  };

  // --- Handler Functions ---

  const handleSendMessage = useCallback(async (messageText = null) => {
    const message = messageText || inputMessage.trim();
    if (!message || isLoading) return;

    setError(null);
    setIsLoading(true);

    const userMessage = {
      id: Date.now() + Math.random(), // more unique id
      type: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage("");

    try {
      const data = await sendMessageToAI(message);
      const aiMessage = {
        id: Date.now() + Math.random(),
        type: "ai",
        content: data.message,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      saveCurrentChat(finalMessages);

      if (data.audio_url && audioRef.current) {
        audioRef.current.src = data.audio_url;
        audioRef.current.play().then(() => setIsSpeaking(true)).catch(err => {
          console.error("Audio playback error:", err);
          setIsSpeaking(false);
        });
      }

    } catch (err) {
      console.error("API Error:", err);
      setError(err.message || "Something went wrong. Please check your network and API key.");

      const errorMessage = {
        id: Date.now() + Math.random(),
        type: "ai",
        content: "⚠️ I couldn’t reach the AI. Please try again.",
        timestamp: new Date().toISOString(),
        isError: true,
      };

      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveCurrentChat(finalMessages);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading, messages, currentChatId, saveCurrentChat]);


  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const retryLastMessage = () => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.type === 'user');
    if (lastUserMessage) {
      // Remove the last two messages (AI response and possibly an error)
      const messagesWithoutLastTwo = messages.slice(0, messages.length - (messages[messages.length - 1].type === 'ai' ? 1 : 0) - (messages[messages.length - 2]?.type === 'ai' ? 1 : 0));
      setMessages(messagesWithoutLastTwo);
      handleSendMessage(lastUserMessage.content);
    }
  };

  const handleQuickAction = (action) => {
    handleSendMessage(`I want to learn ${action.text}: ${action.description}`);
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  // --- Effects ---

  useEffect(() => {
    const history = loadChatHistory();
    setChatHistory(history);
    const savedChatId = localStorage.getItem('aiGuide-currentChatId');
    if (savedChatId) {
      loadChat(savedChatId);
    } else {
      initializeNewChat();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('aiGuide-darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognitionRef.current = recognition;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setInputMessage(transcript);
          handleSendMessage(transcript);
        }
      };


      recognition.onerror = (event) => {
        console.error('Speech Recognition Error:', event.error);
        setError("Voice recognition failed. Please try again.");
      };
    } else {
      console.warn("Speech recognition not supported in this browser.");
    }
  }, [handleSendMessage]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setIsSpeaking(false);
      };
    }
  }, []);

  // --- Components and Data ---

  const renderMessageContent = (content) => {
    const parts = content.split('```');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <CodeBlock key={index} code={part.trim()} darkMode={darkMode} />;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const CodeBlock = ({ code, darkMode }) => {
    const style = darkMode ? oneDark : prism;
    const language = code.split('\n')[0].toLowerCase().trim() || 'javascript';
    const cleanCode = code.startsWith(language) ? code.replace(language, '').trim() : code.trim();

    return (
      <SyntaxHighlighter
        language={language}
        style={style}
        showLineNumbers
        className="rounded-md overflow-x-auto p-4 my-2 text-sm"
      >
        {cleanCode}
      </SyntaxHighlighter>
    );
  };

  const quickActions = [
    { icon: Brain, text: "AI/ML Learning", description: "Master artificial intelligence", color: "bg-purple-600" },
    { icon: Code, text: "Full-Stack Dev", description: "Frontend to backend mastery", color: "bg-blue-600" },
    { icon: Monitor, text: "Data Science", description: "Analytics and visualization", color: "bg-green-600" },
    { icon: Smartphone, text: "Mobile Dev", description: "iOS/Android applications", color: "bg-orange-600" },
    { icon: Cloud, text: "Cloud Computing", description: "AWS, Azure, GCP expertise", color: "bg-indigo-600" },
    { icon: Gamepad2, text: "Game Development", description: "Unity, Unreal Engine", color: "bg-pink-600" },
    { icon: Video, text: "Content Creation", description: "YouTube, TikTok, Podcasts", color: "bg-yellow-600" },
    { icon: UserCog, text: "Tech Leadership", description: "Management and strategy", color: "bg-gray-600" }
  ];

  const modernSkills = [
    "ChatGPT & AI Tools", "React/Next.js", "Python Data Science", "Cloud Architecture",
    "DevOps & CI/CD", "Blockchain", "Cybersecurity", "UI/UX Design"
  ];

  const themeClasses = {
    light: {
      background: 'bg-slate-100',
      sidebar: 'bg-white border-slate-200',
      sidebarText: 'text-slate-800',
      sidebarSecondary: 'text-slate-600',
      chatHeader: 'bg-white border-slate-200',
      userMessage: 'bg-blue-600 text-white',
      aiMessage: 'bg-white text-slate-800 border border-slate-200',
      inputArea: 'bg-white border-slate-200',
      input: 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500',
      button: 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700',
      suggestionButton: 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700',
    },
    dark: {
      background: 'bg-slate-900',
      sidebar: 'bg-slate-800 border-slate-700',
      sidebarText: 'text-slate-100',
      sidebarSecondary: 'text-slate-300',
      chatHeader: 'bg-slate-800 border-slate-700',
      userMessage: 'bg-blue-600 text-white',
      aiMessage: 'bg-slate-800 text-slate-100 border border-slate-700',
      inputArea: 'bg-slate-800 border-slate-700',
      input: 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400',
      button: 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300',
      suggestionButton: 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300',
    }
  };

  const currentTheme = darkMode ? themeClasses.dark : themeClasses.light;

  return (
    <div className={`min-h-screen transition-all duration-300 ${currentTheme.background} relative overflow-hidden`}>
      <div className="relative z-10 flex h-screen pt-0">
        {/* Sidebar */}
        <div className={`fixed lg:relative inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${currentTheme.sidebar} border-r pt-16 lg:pt-0`}>
          <div className="p-6 h-full overflow-y-auto flex flex-col">
            <button
              onClick={initializeNewChat}
              className="w-full p-3 mb-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm"
            >
              <Brain size={16} />
              <span>New Chat</span>
            </button>
            <div className="mb-6 flex-1">
              <h3 className={`text-sm font-semibold mb-3 ${currentTheme.sidebarText}`}>Recent Chats</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {chatHistory.slice(0, 10).map((chat) => (
                  <div
                    key={chat.id}
                    className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${currentChatId === chat.id ? 'bg-blue-600/20 border border-blue-600/30' : darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                    onClick={() => loadChat(chat.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs truncate ${currentTheme.sidebarText}`}>{chat.title || "Untitled Chat"}</p>
                      <p className={`text-xs ${currentTheme.sidebarSecondary}`}>{new Date(chat.lastUpdated).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className={`opacity-0 group-hover:opacity-100 p-1 rounded ${darkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200'} transition-all`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {chatHistory.length === 0 && (
                  <p className={`text-xs ${currentTheme.sidebarSecondary} text-center py-4`}>No previous chats</p>
                )}
              </div>
            </div>
            <h2 className={`text-xl font-bold mb-6 ${currentTheme.sidebarText}`}>🚀 Learning Paths</h2>
            <div className="space-y-3 mb-8">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action)}
                  className={`w-full p-4 rounded-xl transition-all duration-300 text-left group hover:scale-[1.02] hover:shadow-md ${darkMode ? 'bg-slate-700/50 hover:bg-slate-700 border border-slate-600' : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${action.color} shadow-sm`}>
                      <action.icon className="text-white" size={18} />
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${currentTheme.sidebarText}`}>{action.text}</div>
                      <div className={`text-xs ${currentTheme.sidebarSecondary}`}>{action.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 rounded-xl bg-blue-600 text-white mb-6 shadow-sm">
              <h3 className="font-bold mb-3 flex items-center"><Rocket className="mr-2" size={16} />Trending 2025</h3>
              <div className="flex flex-wrap gap-2">
                {modernSkills.slice(0, 4).map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-white/20 rounded-full text-xs">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className={`p-4 md:p-6 border-b flex-shrink-0 ${currentTheme.chatHeader} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <Menu size={20} />
                </button>
                <div className="relative">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                    {isSpeaking ? (<Volume2 className="text-white animate-pulse" size={24} />) : (<Bot className="text-white" size={24} />)}
                  </div>
                  <div className={`absolute -top-1 -right-1 w-4 h-4 ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'} rounded-full border-2 border-white dark:border-slate-800`}></div>
                </div>
                <div className="flex-1">
                  <h1 className={`text-xl md:text-2xl font-bold ${currentTheme.sidebarText}`}>I-GYAN AI Assistant</h1>
                  <p className={`text-base ${currentTheme.sidebarSecondary} font-semibold`}>{isLoading ? 'Thinking...' : isSpeaking ? 'Speaking...' : 'Specialized in 2025 tech skills & career guidance'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2">
                  <div className={`w-2 h-2 ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'} rounded-full`}></div>
                  <span className={`text-sm font-medium ${isLoading ? 'text-yellow-500' : 'text-green-500'}`}>{isLoading ? 'Processing' : 'Active'}</span>
                </div>
                <button onClick={() => setDarkMode(prev => !prev)} className={`relative p-3 rounded-full transition-all duration-300 ${darkMode ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400' : 'bg-slate-600/20 hover:bg-slate-600/30 text-slate-600'} shadow-sm hover:scale-110`} title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                  {darkMode ? (<Sun size={20} className="animate-spin" style={{ animationDuration: '8s' }} />) : (<Moon size={20} className="animate-pulse" />)}
                </button>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="text-red-500" size={16} />
                  <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={retryLastMessage} className="flex items-center space-x-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors">
                    <RefreshCw size={12} />
                    <span>Retry</span>
                  </button>
                  <button onClick={() => setError(null)} className="text-red-500 hover:text-red-600 transition-colors"><X size={16} /></button>
                </div>
              </div>
            </div>
          )}

          {/* Messages - Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-3xl ${message.type === 'user' ? 'order-2' : ''}`}>
                  <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${message.type === 'user' ? 'bg-blue-600 text-white' : message.isError ? 'bg-red-500 text-white' : 'bg-slate-600 text-white'}`}>
                      {message.type === 'user' ? <User size={16} /> : message.isError ? <AlertCircle size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block p-3 md:p-4 rounded-2xl max-w-full transition-all duration-200 hover:scale-[1.01] ${message.type === 'user' ? currentTheme.userMessage + ' shadow-sm' : message.isError ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 shadow-sm' : currentTheme.aiMessage + ' shadow-sm'}`}>
                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{renderMessageContent(message.content)}</p>
                      </div>
                      <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-right' : ''} ${currentTheme.sidebarSecondary}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* AI Speaking animation */}
            {isSpeaking && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center animate-pulse shadow-sm">
                    <Volume2 size={16} />
                  </div>
                  <div className={`p-3 md:p-4 rounded-2xl ${currentTheme.aiMessage}`}>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-[pulse_1s_infinite]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-[pulse_1s_infinite_0.15s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-[pulse_1s_infinite_0.3s]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && !isSpeaking && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center animate-pulse shadow-sm">
                    <Bot size={16} />
                  </div>
                  <div className={`p-3 md:p-4 rounded-2xl ${currentTheme.aiMessage}`}>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={`p-4 md:p-6 border-t flex-shrink-0 ${currentTheme.inputArea} shadow-sm`}>
            <div className="max-w-4xl mx-auto">
              <div className="flex space-x-2 md:space-x-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about AI, coding, career paths, or any learning topic... 🚀"
                    className={`w-full px-4 md:px-6 py-3 md:py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all shadow-sm ${currentTheme.input}`}
                    disabled={isLoading || isSpeaking}
                  />
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={isLoading || isSpeaking}
                    className={`absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all disabled:opacity-50 ${isListening ? 'bg-red-500 text-white animate-pulse shadow-sm' : `${currentTheme.button} hover:scale-110 shadow-sm`}`}
                  >
                    <Mic size={16} />
                  </button>
                </div>
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading || isSpeaking}
                  className="px-4 md:px-6 py-3 md:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-sm hover:scale-105"
                >
                  {isLoading ? (<RefreshCw size={16} className="animate-spin" />) : (<Send size={16} />)}
                  <span className="hidden sm:block">{isLoading ? 'Sending...' : 'Send'}</span>
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {[
                  "🔥 Latest AI tools for developers",
                  "💻 Best remote job skills 2025",
                  "🎯 Career change to tech",
                  "📱 Build impressive portfolio"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isLoading || isSpeaking}
                    className={`px-3 py-1 rounded-full text-xs transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${currentTheme.suggestionButton} shadow-sm`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <audio ref={audioRef} />
    </div>
  );
};

export default AIGuide;