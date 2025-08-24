// components/Navbar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
// Using more AI/tech-themed icons from lucide-react
import { Menu, X, User, LogOut, BrainCircuit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Home', path:'/'},
  { name: 'Explore Skills', path: '/courses' },
  { name: 'Projects', path: '/projects' },
  { name: 'Mentors', path: '/mentors' },
  { name: 'AIGuide', path: '/aiguide' },
  { name: 'Companies', path: '/companies' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, setShowLogin, user, logout } = useAuth();

  const closeMenu = () => setIsOpen(false);
  const handleAuth = () => {
    closeMenu();
    isLoggedIn ? logout() : setShowLogin(true);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/50  backdrop-blur-xl border-b border-gray-800 shadow-lg font-mono">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 p-2 bg-indigo-700 rounded-lg flex items-center justify-center animate-pulse">
              <BrainCircuit className="text-white w-6 h-6" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-indigo-700 bg-clip-text text-transparent transition-all duration-300">
              I-GYAN.AI
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navItems.map(({ name, path }) => (
              <NavLink
                key={name}
                to={path}
                className="group relative text-gray-600 font-medium font-semibold text-md tracking-wide uppercase transition-all duration-300 hover:text-blue-400"
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? 'text-blue-400' : ''}>
                      {name}
                    </span>
                    <span className={`absolute -bottom-2 left-0 h-0.5 bg-blue-400 transition-all duration-300
                      ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Desktop Auth */}
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-2">
                <NavLink
                to="/dashboard/me" 
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <User className="text-white w-3 h-3" />
                  </div>
                  <span className="text-sm font-medium text-gray-300 max-w-24 truncate">
                    {user?.name || 'User'}
                  </span>
                </NavLink>
                <button
                  onClick={handleAuth}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-red-400 bg-red-900/20 hover:bg-red-900/30 rounded-full border border-red-900/50 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleAuth}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-700 rounded-full transition-all duration-300 hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 hover:ring-offset-gray-950"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-gray-800 py-4">
            <div className="space-y-2">
              {navItems.map(({ name, path }) => (
                <NavLink
                  key={name}
                  to={path}
                  onClick={closeMenu}
                  className={({ isActive }) => 
                    `block px-4 py-2 text-sm uppercase tracking-wide transition-colors
                    ${isActive ? 'text-blue-400 border-l-2 border-blue-400' : 'text-gray-400 hover:text-blue-400'}`
                  }
                >
                  {name}
                </NavLink>
              ))}
            </div>

            {/* Mobile Auth */}
            <div className="pt-4 mt-4 border-t border-gray-800">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-700">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="text-white w-4 h-4" />
                    </div>
                    <span className="font-medium text-gray-300">
                      {user?.name || 'User'}
                    </span>
                  </div>
                  <button
                    onClick={handleAuth}
                    className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-red-400 bg-red-900/20 hover:bg-red-900/30 rounded-lg border border-red-900/50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAuth}
                  className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg transition-all duration-300 hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 hover:ring-offset-gray-950"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;