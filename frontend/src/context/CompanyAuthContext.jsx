import React, { createContext, useContext, useState, useEffect } from 'react';

const CompanyAuthContext = createContext();

export const useCompanyAuth = () => {
  const context = useContext(CompanyAuthContext);
  if (!context) {
    throw new Error('useCompanyAuth must be used within a CompanyAuthProvider');
  }
  return context;
};

export const CompanyAuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // Check for existing company session
    const checkCompanyAuth = () => {
      const companyData = localStorage.getItem('companyAuth');
      if (companyData) {
        try {
          const parsed = JSON.parse(companyData);
          setCompany(parsed);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Error parsing company auth data:', error);
          localStorage.removeItem('companyAuth');
        }
      }
      setLoading(false);
    };

    checkCompanyAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      // Simulate API call
      const response = await fetch('/api/company/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const companyData = await response.json();
        setCompany(companyData);
        setIsLoggedIn(true);
        localStorage.setItem('companyAuth', JSON.stringify(companyData));
        setShowLogin(false);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (companyData) => {
    try {
      setLoading(true);
      const response = await fetch('/api/company/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      });

      if (response.ok) {
        const newCompany = await response.json();
        setCompany(newCompany);
        setIsLoggedIn(true);
        localStorage.setItem('companyAuth', JSON.stringify(newCompany));
        setShowLogin(false);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCompany(null);
    setIsLoggedIn(false);
    localStorage.removeItem('companyAuth');
  };

  const value = {
    isLoggedIn,
    company,
    loading,
    showLogin,
    setShowLogin,
    login,
    register,
    logout,
  };

  return (
    <CompanyAuthContext.Provider value={value}>
      {children}
    </CompanyAuthContext.Provider>
  );
};