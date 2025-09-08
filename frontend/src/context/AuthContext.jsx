import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

axios.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && error.response?.data?.expired && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return axios(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post('/auth/refresh');
        processQueue(null);
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  const isLoggedIn = !!user && !loading;
  const isEmailVerified = user?.isEmailVerified || false;
  const canAccessDashboard = isLoggedIn && isEmailVerified;

  const checkAuthStatus = async () => {
    setLoading(true);
    
    try {
      const response = await axios.get('/auth/me');
      
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('googleAuth') === 'success') {
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(checkAuthStatus, 1000);
    } else {
      checkAuthStatus();
    }
  }, []);

  const login = async (credentials, isSignUp = false) => {
    try {
      const endpoint = isSignUp ? '/auth/register' : '/auth/login';
      const response = await axios.post(endpoint, credentials);

      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setShowLogin(false);
        
        return {
          success: true,
          message: response.data.message,
          user: userData,
          needsEmailVerification: response.data.needsEmailVerification
        };
      } else {
        return {
          success: false,
          message: response.data.message,
          user: userData,
          needsEmailVerification: response.data.needsEmailVerification || false
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorData = error.response?.data;
      return {
        success: false,
        message: errorData?.message || 'Authentication failed',
        errors: errorData?.errors || [],
        needsEmailVerification: errorData?.needsEmailVerification || false
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      setShowLogin(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const loginWithGoogle = () => {
    setShowLogin(false);
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const verifyEmail = async (token) => {
    try {
      const response = await axios.get(`/auth/verify-email/${token}`);
      if (response.data.success) {
        const updatedUser = response.data.user;
        if (updatedUser) {
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          await checkAuthStatus(); 
        }
      }
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Email verification failed'
      };
    }
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    try {
      const response = await axios.post('/auth/resend-verification');
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resend verification email'
      };
    }
  };

  // Password reset functions
  const forgotPassword = async (email) => {
    try {
      const response = await axios.post('/auth/forgot-password', { email });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset email'
      };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await axios.put(`/auth/reset-password/${token}`, { password });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password',
        errors: error.response?.data?.errors || []
      };
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/user/profile', profileData);
      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return {
        success: true,
        message: response.data.message,
        user: response.data.user
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile',
        errors: error.response?.data?.errors || []
      };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password',
        errors: error.response?.data?.errors || []
      };
    }
  };

  // Upload avatar
  const uploadAvatar = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await axios.post('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        // Update user data with new avatar
        const updatedUser = { ...user, avatar: response.data.avatar };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return {
        success: true,
        message: response.data.message,
        avatar: response.data.avatar
      };
    } catch (error) {
      console.error('Upload avatar error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload avatar'
      };
    }
  };

  // Remove avatar
  const removeAvatar = async () => {
    try {
      const response = await axios.delete('/user/avatar');
      
      if (response.data.success) {
        // Update user data to remove avatar
        const updatedUser = { ...user, avatar: null };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Remove avatar error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove avatar'
      };
    }
  };

  // Update preferences
  const updatePreferences = async (preferences) => {
    try {
      const response = await axios.put('/user/preferences', preferences);
      
      if (response.data.success) {
        // Update user data with new preferences
        const updatedUser = { ...user, preferences: response.data.preferences };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return {
        success: true,
        message: response.data.message,
        preferences: response.data.preferences
      };
    } catch (error) {
      console.error('Update preferences error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update preferences',
        errors: error.response?.data?.errors || []
      };
    }
  };

  // Get user statistics
  const getUserStats = async () => {
    try {
      const response = await axios.get('/user/stats');
      return {
        success: true,
        stats: response.data.stats
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user statistics'
      };
    }
  };

  // Deactivate account
  const deactivateAccount = async (password, reason) => {
    try {
      const response = await axios.post('/user/deactivate', { password, reason });
      
      if (response.data.success) {
        // Clear user data after successful deactivation
        setUser(null);
        localStorage.removeItem('user');
        setShowLogin(false);
      }
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Deactivate account error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to deactivate account',
        errors: error.response?.data?.errors || []
      };
    }
  };

  const value = {
    user,
    loading,
    showLogin,
    setShowLogin,
    isLoggedIn,
    isEmailVerified,
    canAccessDashboard,
    login,
    logout,
    updateUser,
    loginWithGoogle,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    checkAuthStatus,
    updateProfile,
    changePassword,
    uploadAvatar,
    removeAvatar,
    updatePreferences,
    getUserStats,
    deactivateAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};