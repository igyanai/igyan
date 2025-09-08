import React, { useState } from 'react'
import {  FaRobot } from "react-icons/fa";
import { IoIosSend } from "react-icons/io"; 
import bgimg from "../assets/hero-ai-learning-ByJUC3BB.jpg"
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, Upload, Users, Cpu, Brain, Sun, Moon } from "lucide-react";
import { FeatureCards,JourneySection,  HowItWorks, CTASection, TestimonialSection, StatsGrid, ActionButtons, HeroSection } from './HeroSection/index';

const features = [
    {
        icon: <Calendar className="w-6 h-6 text-pink-400" />,
        title: "AI Study Planner",
        description: "Personalized learning schedules that adapt to your pace and goals",
        bgFrom: "from-pink-500/10",
        bgTo: "to-rose-600/10",
        iconBg: "bg-pink-500/20",
        hoverBg: "group-hover:bg-pink-400/30",
        glowColor: "shadow-pink-500/25"
    },
    {
        icon: <FileText className="w-6 h-6 text-indigo-400" />,
        title: "Resume + Interview Bot",
        description: "AI-powered resume optimization and mock interview practice",
        bgFrom: "from-indigo-500/10",
        bgTo: "to-red-600/10",
        iconBg: "bg-indigo-500/20",
        hoverBg: "group-hover:bg-indigo-400/30",
        glowColor: "shadow-indigo-500/25"
    },
    {
        icon: <Upload className="w-6 h-6 text-blue-400" />,
        title: "Upload Your Projects",
        description: "Showcase your work with automatic skill analysis and feedback",
        bgFrom: "from-indigo-600/10",
        bgTo: "to-cyan-600/10",
        iconBg: "bg-indigo-600/20",
        hoverBg: "group-hover:bg-blue-400/30",
        glowColor: "shadow-indigo-600/25"
    },
    {
        icon: <Users className="w-6 h-6 text-purple-400" />,
        title: "Join Mentor Sessions",
        description: "Connect with industry experts for personalized guidance",
        bgFrom: "from-purple-500/10",
        bgTo: "to-indigo-600/10",
        iconBg: "bg-purple-500/20",
        hoverBg: "group-hover:bg-purple-400/30",
        glowColor: "shadow-purple-500/25"
    }
];

const Hero = ({ isLoggedIn, isDarkMode=false }) => {
    const [isDark, setIsDark] = useState(isDarkMode);

const toggleTheme = () => {
  setIsDark((prev) => !prev);
};
    const navigate = useNavigate();
    const handleCoursesClick = () => {
        navigate('/courses');
    }

    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onChatSubmit = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        setIsLoading(true);

        setIsTyping(true);
        setAiResponse('');

        setTimeout(() => {
            const responses = [
                "🎯 Perfect! I'll create a personalized learning roadmap for you. Based on your interests, I recommend starting with Python fundamentals, then moving to data analysis and machine learning. Expected timeline: 3-4 months with daily practice!",
                "🚀 Exciting choice! Here's your web development journey: HTML/CSS → JavaScript → React → Node.js → Full-stack projects. I'll connect you with mentor projects and real companies looking for these skills!",
                "💡 Great question! For digital marketing, you'll master: SEO, social media strategy, content creation, and analytics. I've found 3 live projects from startups where you can apply these skills immediately!"
            ];

            setAiResponse(responses[Math.floor(Math.random() * responses.length)]);
            setIsTyping(false);
            setIsLoading(false);
        }, 2000);
    };

    return (
        <section className="relative bg-blue-50 overflow-hidden">
            {/* Hero Section */}
            <section
                className="relative py-6 sm:py-8 md:py-12 lg:py-14 xl:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
                style={{
                    backgroundImage: `url(${bgimg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: window.innerWidth > 768 ? 'fixed' : 'scroll'
                }}
                >
                {/* Overlay for low opacity background */}
                <div className="absolute inset-0 bg-white/70 dark:bg-black/60" style={{ zIndex: 1 }}></div>

                <div className="relative max-w-7xl mx-auto text-center" style={{ zIndex: 2 }}>
                <HeroSection/>
                    
                    {/* <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                        <FaRobot className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-indigo-700 sm:mr-2" />
                        <span className="text-sm sm:text-base lg:text-lg text-indigo-700 font-medium text-center">
                            Next-Gen Education Platform
                        </span>
                    </div> */}

                    {/* Main Heading */}
                    {/* <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 leading-tight px-2 sm:px-0">
                        <span className="block mb-2 sm:mb-0 sm:inline">Learn. Build. Get Hired.</span>
                    </h1>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-2 sm:px-0">

                        <span className="text-indigo-700 dark:text-blue-400 block  typing-text"
                        >
                            Real Skills. Real Projects. Real Mentors.
                        </span>
                    </h1> */}

                    {/* Subtitle */}
                    {/* <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-10 lg:mb-12 max-w-4xl mx-auto leading-relaxed px-2 sm:px-4">
                        Gain real-world skills, solve industry projects, and prove your talent through our AI-powered mentor-led platform — no degree needed
                    </p> */}

                    {/* Search Input */}
                    {/* AI Response */}
                    {/* {(isTyping || aiResponse) && (
                        <div className=" w-full my-4 mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-l-4 border-indigo-600">
                            {isTyping ? (
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                                    <span className="text-gray-600">AI is thinking...</span>
                                </div>
                            ) : (
                                <p className="text-gray-700 leading-relaxed">{aiResponse}</p>
                            )}
                        </div>
                    )}
                    <div className="bg-white/50 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto mb-8 sm:mb-10 lg:mb-12 p-10 sm:px-0 rounded shadow-md">
                        <form onSubmit={onChatSubmit} className="flex w-full items-center space-x-4">
                            <div className="  relative w-[95%] mx-auto">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Hi there! What do you want to learn today?"
                                    className="w-full mx-2 px-4 sm:px-5 lg:px-6 py-3 sm:py-4 text-sm sm:text-base lg:text-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl focus:outline-none focus:border-indigo-600 dark:focus:border-blue-400 transition-colors shadow-lg pr-12 sm:pr-14"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 sm:p-2.5 bg-indigo-600 hover:bg-blue-700 text-white rounded-md sm:rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                                >
                                    <IoIosSend className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span>{isLoading ? 'Generating...' : 'Get AI Roadmap'}</span>
                                </button>
                            </div>
                        </form>

                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 px-2 sm:px-0">
                            Try: "I want to learn finance" or "Help me become a freelancer"
                        </p>
                    </div> */}

                <ActionButtons handleCoursesClick={handleCoursesClick}/>
                    <StatsGrid/>
                </div>
            </section>



            {/* Additional Sections */}
            <div className="relative z-10">
                <HowItWorks/>
                <FeatureCards />
                <CTASection />
                <JourneySection />
                <TestimonialSection />
            </div>
        </section>
    );
};

export default Hero