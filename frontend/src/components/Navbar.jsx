import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, User, LogOut, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCompanyAuth } from '../context/CompanyAuthContext';

const navItems = [
  { name: 'Home', path: '/' },
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
  const { isLoggedIn, setShowLogin, user, logout, loading } = useAuth();
  const {
    isLoggedIn: isCompanyLoggedIn,
    setShowLogin: setShowCompanyLogin,
    company,
    logout: companyLogout
  } = useCompanyAuth();

  const closeMenu = () => setIsOpen(false);

  const handleAuth = () => {
    closeMenu();
    isLoggedIn ? logout() : setShowLogin(true);
  };

  const handleCompanyAuth = () => {
    closeMenu();
    isCompanyLoggedIn ? companyLogout() : setShowCompanyLogin(true);
  };

  if (loading) {
    return (
      <nav className="sticky top-0 z-50 bg-white/50 backdrop-blur-xl border-b border-gray-800 shadow-lg font-mono">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <img src='src/assets/logo.png' style={{ width: 100, height: 70 }} />
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-800 shadow-lg font-mono">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <img src='src/assets/logo.png' style={{ width: 180, height: 60 }} />
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-5">
            {navItems.map(({ name, path }) => (
              <NavLink
                key={name}
                to={path}
                className="group relative text-gray-600 font-medium transition-all duration-300 hover:text-blue-600"
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? 'text-blue-600' : ''}>
                      {name}
                    </span>
                    <span className={`absolute -bottom-2 left-0 h-0.5 bg-blue-600 transition-all duration-300
                      ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Desktop Auth */}
            {isCompanyLoggedIn ? (
              <div className="hidden sm:flex items-center gap-3">
                <NavLink
                  to="/company/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <Building className="w-4 h-4" />
                  <span className="font-medium">Dashboard</span>
                </NavLink>
                <button
                  onClick={handleCompanyAuth}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            ) : isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-2">
                <NavLink
                  to={user?.userType === 'mentor' ? "/dashboard/mentor" : "/dashboard/me"}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="text-white w-3 h-3" />
                    )}
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
              <div className="hidden sm:flex items-center gap-3">
                <button
                  onClick={handleAuth}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-700 rounded-full transition-all duration-300 hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 hover:ring-offset-gray-950"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </button>
                <button
                  onClick={handleCompanyAuth}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-700 rounded-full transition-all duration-300 hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 hover:ring-offset-gray-950"
                >
                  <Building className="w-4 h-4" />
                  <span>Company Login</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-gray-800 py-4 bg-white">
            <div className="space-y-2">
              {navItems.map(({ name, path }) => (
                <NavLink
                  key={name}
                  to={path}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block px-4 py-3 text-sm uppercase font-medium transition-colors
                    ${isActive ? 'text-blue-600 bg-blue-50 border-l-2 border-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`
                  }
                >
                  {name}
                </NavLink>
              ))}
            </div>

            {/* Mobile Auth */}
            <div className="px-4 py-4 border-t border-gray-200 space-y-3">
              {isCompanyLoggedIn ? (
                <>
                  <NavLink
                    to="/company/dashboard"
                    onClick={closeMenu}
                    className="flex items-center gap-3 p-3 rounded-lg bg-blue-600 text-white"
                  >
                    <Building className="w-5 h-5" />
                    <span className="font-medium">{company?.companyName || 'Company Dashboard'}</span>
                  </NavLink>
                  <button
                    onClick={handleCompanyAuth}
                    className="w-full flex items-center justify-center gap-2 p-3 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : isLoggedIn ? (
                <>
                  <NavLink
                    to={user?.userType === 'mentor' ? "/dashboard/mentor" : "/dashboard/me"}
                    onClick={closeMenu}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="text-white w-4 h-4" />
                      )}
                    </div>
                    <span className="font-medium text-gray-300">
                      {user?.name || 'User'}
                    </span>
                  </NavLink>
                  <button
                    onClick={handleAuth}
                    className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-red-400 bg-red-900/20 hover:bg-red-900/30 rounded-lg border border-red-900/50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAuth}
                    className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg transition-all duration-300 hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 hover:ring-offset-gray-950"
                  >
                    <User className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                  <button
                    onClick={handleCompanyAuth}
                    className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg transition-all duration-300 hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 hover:ring-offset-gray-950"
                  >
                    <Building className="w-4 h-4" />
                    <span>Company Login</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;