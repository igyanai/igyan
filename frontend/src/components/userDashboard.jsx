// import React, { useState, useEffect, useRef } from 'react';
// import {
//     User, Settings, Camera, X, Save, Edit3, Mail, Phone, MapPin,
//     Globe, Github, Linkedin, Twitter, Shield, Bell, Eye, EyeOff,
//     Award, Calendar, TrendingUp, BookOpen, Users, Lock, Trash2,
//     Upload, AlertCircle, CheckCircle, Star, Heart, LogOut
// } from 'lucide-react';

// // API configuration
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// // API utility functions
// const api = {
//     // User endpoints
//     getCurrentUser: async () => {
//         const response = await fetch(`${API_BASE_URL}/auth/me`, {
//             credentials: 'include',
//         });
//         return response.json();
//     },
//     updateProfile: async (profileData) => {

//         const response = await fetch(`${API_BASE_URL}/auth/profile`, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json' },
//             credentials: 'include', // important for cookies
//             body: JSON.stringify(profileData),
//         });

//         return response.json();
//     },

//     changePassword: async (currentPassword, newPassword) => {

//         const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             },
//             body: JSON.stringify({ currentPassword, newPassword }),
//         });
//         return response.json();
//     },

//     uploadAvatar: async (file) => {

//         const formData = new FormData();
//         formData.append('avatar', file);
//         const response = await fetch(`${API_BASE_URL}/auth/avatar`, {
//             method: 'POST',
//             credentials: 'include',
//             body: formData,
//         });
//         return response.json();
//     },

//     removeAvatar: async () => {

//         const response = await fetch(`${API_BASE_URL}/auth/avatar`, {
//             method: 'DELETE',
//             credentials: 'include'

//         });
//         return response.json();
//     },

//     updatePreferences: async (preferences) => {

//         const response = await fetch(`${API_BASE_URL}/auth/preferences`, {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             },
//             body: JSON.stringify(preferences),
//         });
//         return response.json();
//     },

//     getUserStats: async () => {

//         const response = await fetch(`${API_BASE_URL}/auth/stats`, {
//             credentials: 'include'

//         });
//         return response.json();
//     },

//     deactivateAccount: async (password, reason) => {

//         const response = await fetch(`${API_BASE_URL}/auth/deactivate`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             },
//             body: JSON.stringify({ password, reason }),
//         });
//         return response.json();
//     },

//     resendVerification: async () => {

//         const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
//             method: 'POST',
//             credentials: 'include'

//         });
//         return response.json();
//     }
// };

// // Main User Dashboard Component
// const UserDashboard = ({
//     isOpen = true,
//     onClose = () => { },
//     user: initialUser = null,
//     onLogout = () => { }
// }) => {
//     const [user, setUser] = useState(initialUser);
//     const [activeTab, setActiveTab] = useState('overview');
//     const [isEditing, setIsEditing] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [message, setMessage] = useState({ type: '', text: '' });
//     const [stats, setStats] = useState(null);
//     const [userLoading, setUserLoading] = useState(!initialUser);

//     // Form states
//     const [profileData, setProfileData] = useState({
//         name: '',
//         bio: '',
//         location: '',
//         website: '',
//         skills: [],
//         interests: [],
//         experience: 'beginner',
//         social: {
//             linkedin: '',
//             twitter: '',
//             github: ''
//         }
//     });

//     const [passwordData, setPasswordData] = useState({
//         currentPassword: '',
//         newPassword: '',
//         confirmPassword: ''
//     });

//     const [preferences, setPreferences] = useState({
//         notifications: {
//             email: true,
//             marketing: false
//         },
//         privacy: {
//             profileVisibility: 'public'
//         }
//     });

//     const [showPasswords, setShowPasswords] = useState({
//         current: false,
//         new: false,
//         confirm: false
//     });

//     const fileInputRef = useRef(null);
//     const [avatarPreview, setAvatarPreview] = useState(null);
//     const [newSkill, setNewSkill] = useState('');
//     const [newInterest, setNewInterest] = useState('');

//     // Fetch user data if not provided
//     useEffect(() => {
//         if (!initialUser && isOpen) {
//             fetchUserData();
//         }
//     }, [initialUser, isOpen]);

//     const fetchUserData = async () => {
//         setUserLoading(true);
//         try {
//             const result = await api.getCurrentUser();
//             if (result.success) {
//                 setUser(result.user);
//             } else {
//                 showMessage('error', 'Failed to load user data');
//             }
//         } catch (error) {
//             showMessage('error', 'Failed to load user data');
//         } finally {
//             setUserLoading(false);
//         }
//     };

//     // Initialize form data when user data loads
//     useEffect(() => {
//         if (user) {
//             setProfileData({
//                 name: user.name || '',
//                 bio: user.bio || '',
//                 location: user.location || '',
//                 website: user.website || '',
//                 skills: user.skills || [],
//                 interests: user.interests || [],
//                 experience: user.experience || 'beginner',
//                 social: {
//                     linkedin: user.social?.linkedin || '',
//                     twitter: user.social?.twitter || '',
//                     github: user.social?.github || ''
//                 }
//             });

//             setPreferences({
//                 notifications: {
//                     email: user.preferences?.notifications?.email ?? true,
//                     marketing: user.preferences?.notifications?.marketing ?? false
//                 },
//                 privacy: {
//                     profileVisibility: user.preferences?.privacy?.profileVisibility || 'public'
//                 }
//             });
//         }
//     }, [user]);

//     // Fetch user stats when dashboard opens
//     useEffect(() => {
//         if (isOpen && activeTab === 'overview' && user) {
//             fetchStats();
//         }
//     }, [isOpen, activeTab, user]);

//     // Handle escape key
//     useEffect(() => {
//         const handleEscape = (e) => {
//             if (e.key === 'Escape' && isOpen) {
//                 handleClose();
//             }
//         };

//         if (isOpen) {
//             document.addEventListener('keydown', handleEscape);
//             document.body.style.overflow = 'hidden';
//         }

//         return () => {
//             document.removeEventListener('keydown', handleEscape);
//             document.body.style.overflow = 'unset';
//         };
//     }, [isOpen]);

//     const fetchStats = async () => {
//         try {
//             const result = await api.getUserStats();
//             if (result.success) {
//                 setStats(result.stats);
//             }
//         } catch (error) {
//             console.error('Error fetching stats:', error);
//         }
//     };

//     const handleClose = () => {
//         setIsEditing(false);
//         setMessage({ type: '', text: '' });
//         setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
//         setAvatarPreview(null);
//         onClose();
//     };

//     const showMessage = (type, text) => {
//         setMessage({ type, text });
//         setTimeout(() => setMessage({ type: '', text: '' }), 5000);
//     };

//     // Profile update functions
//     const handleProfileUpdate = async (e) => {
//         if (e) e.preventDefault();
//         setLoading(true);
//         try {
//             const result = await api.updateProfile(profileData);
//             if (result.success) {
//                 setUser(result.user);
//                 showMessage('success', result.message || 'Profile updated successfully');
//                 setIsEditing(false);
//             } else {
//                 showMessage('error', result.message || 'Failed to update profile');
//             }
//         } catch (error) {
//             showMessage('error', 'Failed to update profile');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handlePasswordChange = async (e) => {
//         e.preventDefault();

//         if (passwordData.newPassword !== passwordData.confirmPassword) {
//             showMessage('error', 'New passwords do not match');
//             return;
//         }

//         if (passwordData.newPassword.length < 6) {
//             showMessage('error', 'New password must be at least 6 characters long');
//             return;
//         }

//         setLoading(true);
//         try {
//             const result = await api.changePassword(passwordData.currentPassword, passwordData.newPassword);
//             if (result.success) {
//                 showMessage('success', result.message || 'Password changed successfully');
//                 setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
//             } else {
//                 showMessage('error', result.message || 'Failed to change password');
//             }
//         } catch (error) {
//             showMessage('error', 'Failed to change password');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Avatar handling
//     const handleAvatarUpload = async (file) => {
//         setLoading(true);
//         try {
//             const result = await api.uploadAvatar(file);
//             if (result.success) {
//                 setUser(prev => ({ ...prev, avatar: result.avatar }));
//                 showMessage('success', result.message || 'Avatar uploaded successfully');
//                 setAvatarPreview(null);
//             } else {
//                 showMessage('error', result.message || 'Failed to upload avatar');
//             }
//         } catch (error) {
//             showMessage('error', 'Failed to upload avatar');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleAvatarRemove = async () => {
//         setLoading(true);
//         try {
//             const result = await api.removeAvatar();
//             if (result.success) {
//                 setUser(prev => ({ ...prev, avatar: null }));
//                 showMessage('success', result.message || 'Avatar removed successfully');
//             } else {
//                 showMessage('error', result.message || 'Failed to remove avatar');
//             }
//         } catch (error) {
//             showMessage('error', 'Failed to remove avatar');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleFileSelect = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             if (file.size > 5 * 1024 * 1024) {
//                 showMessage('error', 'File size must be less than 5MB');
//                 return;
//             }

//             const reader = new FileReader();
//             reader.onload = (e) => setAvatarPreview(e.target.result);
//             reader.readAsDataURL(file);
//             handleAvatarUpload(file);
//         }
//     };

//     const handleResendVerification = async () => {
//         setLoading(true);
//         try {
//             const result = await api.resendVerification();
//             showMessage(
//                 result.success ? 'success' : 'error',
//                 result.message || (result.success ? 'Verification email sent' : 'Failed to resend verification email')
//             );
//         } catch (error) {
//             showMessage('error', 'Failed to resend verification email');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Skills and interests management
//     const addSkill = () => {
//         if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
//             setProfileData(prev => ({
//                 ...prev,
//                 skills: [...prev.skills, newSkill.trim()]
//             }));
//             setNewSkill('');
//         }
//     };

//     const removeSkill = (skill) => {
//         setProfileData(prev => ({
//             ...prev,
//             skills: prev.skills.filter(s => s !== skill)
//         }));
//     };

//     const addInterest = () => {
//         if (newInterest.trim() && !profileData.interests.includes(newInterest.trim())) {
//             setProfileData(prev => ({
//                 ...prev,
//                 interests: [...prev.interests, newInterest.trim()]
//             }));
//             setNewInterest('');
//         }
//     };

//     const removeInterest = (interest) => {
//         setProfileData(prev => ({
//             ...prev,
//             interests: prev.interests.filter(i => i !== interest)
//         }));
//     };

//     // Preferences update
//     const handlePreferencesUpdate = async () => {
//         setLoading(true);
//         try {
//             const result = await api.updatePreferences(preferences);
//             if (result.success) {
//                 setUser(prev => ({ ...prev, preferences: result.preferences }));
//                 showMessage('success', result.message || 'Preferences updated successfully');
//             } else {
//                 showMessage('error', result.message || 'Failed to update preferences');
//             }
//         } catch (error) {
//             showMessage('error', 'Failed to update preferences');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Handle logout
//     const handleLogout = () => {
//         onLogout();
//         handleClose();
//     };

//     if (!isOpen) return null;

//     if (userLoading) {
//         return (
//             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//                 <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
//                     <div className="text-center">
//                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                         <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     if (!user) {
//         return (
//             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//                 <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
//                     <div className="text-center">
//                         <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
//                         <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load user data</p>
//                         <button
//                             onClick={handleClose}
//                             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                         >
//                             Close
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//             <div className="fixed inset-0" onClick={handleClose} />

//             <div className="relative w-full max-w-4xl h-full max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex">
//                 {/* Sidebar */}
//                 <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
//                     {/* Header */}
//                     <div className="p-6 border-b border-gray-200 dark:border-gray-700">
//                         <div className="flex items-center justify-between">
//                             <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
//                             <button
//                                 onClick={handleClose}
//                                 className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
//                             >
//                                 <X size={20} />
//                             </button>
//                         </div>
//                     </div>

//                     {/* User Info */}
//                     <div className="p-6 border-b border-gray-200 dark:border-gray-700">
//                         <div className="flex items-center space-x-3">
//                             <div className="relative">
//                                 <img
//                                     src={avatarPreview || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=667eea&color=fff`}
//                                     alt="Avatar"
//                                     className="w-12 h-12 rounded-full object-cover"
//                                 />
//                                 {!user.isEmailVerified && (
//                                     <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
//                                         <AlertCircle size={12} className="text-white" />
//                                     </div>
//                                 )}
//                             </div>
//                             <div>
//                                 <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
//                                 <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.userType || 'User'}</p>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Navigation */}
//                     <nav className="flex-1 p-4">
//                         <div className="space-y-2">
//                             {[
//                                 { id: 'overview', icon: TrendingUp, label: 'Overview' },
//                                 { id: 'profile', icon: User, label: 'Profile' },
//                                 { id: 'security', icon: Shield, label: 'Security' },
//                                 { id: 'preferences', icon: Settings, label: 'Preferences' },
//                             ].map(({ id, icon: Icon, label }) => (
//                                 <button
//                                     key={id}
//                                     onClick={() => setActiveTab(id)}
//                                     className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === id
//                                             ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
//                                             : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
//                                         }`}
//                                 >
//                                     <Icon size={18} />
//                                     <span className="font-medium">{label}</span>
//                                 </button>
//                             ))}
//                         </div>
//                     </nav>

//                     {/* Logout Button */}
//                     <div className="p-4 border-t border-gray-200 dark:border-gray-700">
//                         <button
//                             onClick={handleLogout}
//                             className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
//                         >
//                             <LogOut size={18} />
//                             <span>Logout</span>
//                         </button>
//                     </div>
//                 </div>

//                 {/* Main Content */}
//                 <div className="flex-1 flex flex-col overflow-hidden">
//                     {/* Message Banner */}
//                     {message.text && (
//                         <div className={`px-6 py-3 ${message.type === 'success'
//                                 ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
//                                 : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
//                             }`}>
//                             <div className="flex items-center space-x-2">
//                                 {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
//                                 <span>{message.text}</span>
//                             </div>
//                         </div>
//                     )}

//                     {/* Content Area */}
//                     <div className="flex-1 overflow-y-auto p-6">
//                         {activeTab === 'overview' && (
//                             <div className="space-y-6">
//                                 <div>
//                                     <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
//                                         Welcome back, {user.name}! 👋
//                                     </h3>
//                                     <p className="text-gray-600 dark:text-gray-400">
//                                         Here's an overview of your account and activity.
//                                     </p>
//                                 </div>

//                                 {/* Email Verification Notice */}
//                                 {!user.isEmailVerified && (
//                                     <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
//                                         <div className="flex items-start space-x-3">
//                                             <AlertCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5" size={20} />
//                                             <div className="flex-1">
//                                                 <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
//                                                     Email Verification Required
//                                                 </h4>
//                                                 <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
//                                                     Please verify your email to access all features. Check your inbox for the verification link.
//                                                 </p>
//                                                 <button
//                                                     onClick={handleResendVerification}
//                                                     disabled={loading}
//                                                     className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
//                                                 >
//                                                     {loading ? 'Sending...' : 'Resend Verification'}
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* Stats Grid */}
//                                 {stats && (
//                                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                                         <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
//                                             <div className="flex items-center space-x-3">
//                                                 <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
//                                                 <div>
//                                                     <p className="text-sm text-blue-600 dark:text-blue-400">Account Age</p>
//                                                     <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
//                                                         {stats.accountAge} days
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
//                                             <div className="flex items-center space-x-3">
//                                                 <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
//                                                 <div>
//                                                     <p className="text-sm text-green-600 dark:text-green-400">Profile Complete</p>
//                                                     <p className="text-lg font-semibold text-green-800 dark:text-green-200">
//                                                         {stats.profileCompletion}%
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
//                                             <div className="flex items-center space-x-3">
//                                                 <BookOpen className="text-purple-600 dark:text-purple-400" size={24} />
//                                                 <div>
//                                                     <p className="text-sm text-purple-600 dark:text-purple-400">Skills</p>
//                                                     <p className="text-lg font-semibold text-purple-800 dark:text-purple-200">
//                                                         {stats.totalSkills}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
//                                             <div className="flex items-center space-x-3">
//                                                 <Heart className="text-orange-600 dark:text-orange-400" size={24} />
//                                                 <div>
//                                                     <p className="text-sm text-orange-600 dark:text-orange-400">Interests</p>
//                                                     <p className="text-lg font-semibold text-orange-800 dark:text-orange-200">
//                                                         {stats.totalInterests}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* Quick Actions */}
//                                 <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
//                                     <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//                                         Quick Actions
//                                     </h4>
//                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                         <button
//                                             onClick={() => setActiveTab('profile')}
//                                             className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
//                                         >
//                                             <Edit3 size={20} className="text-blue-600 dark:text-blue-400" />
//                                             <span className="font-medium text-gray-900 dark:text-white">Edit Profile</span>
//                                         </button>
//                                         <button
//                                             onClick={() => setActiveTab('security')}
//                                             className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
//                                         >
//                                             <Lock size={20} className="text-green-600 dark:text-green-400" />
//                                             <span className="font-medium text-gray-900 dark:text-white">Security Settings</span>
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Profile Tab */}
//                         {activeTab === 'profile' && (
//                             <div className="space-y-6">
//                                 <div className="flex items-center justify-between">
//                                     <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h3>
//                                     <div className="flex items-center space-x-3">
//                                         {isEditing ? (
//                                             <>
//                                                 <button
//                                                     onClick={() => setIsEditing(false)}
//                                                     className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
//                                                 >
//                                                     Cancel
//                                                 </button>
//                                                 <button
//                                                     type='button'
//                                                     onClick={handleProfileUpdate}
//                                                     disabled={loading}
//                                                     className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                                                 >
//                                                     <Save size={16} />
//                                                     <span>{loading ? 'Saving...' : 'Save Changes'}</span>
//                                                 </button>
//                                             </>
//                                         ) : (
//                                             <button
//                                                 onClick={() => setIsEditing(true)}
//                                                 className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                                             >
//                                                 <Edit3 size={16} />
//                                                 <span>Edit Profile</span>
//                                             </button>
//                                         )}
//                                     </div>
//                                 </div>

//                                 {/* Avatar Section */}
//                                 <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
//                                     <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//                                         Profile Picture
//                                     </h4>
//                                     <div className="flex items-center space-x-6">
//                                         <div className="relative">
//                                             <img
//                                                 src={avatarPreview || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=667eea&color=fff`}
//                                                 alt="Avatar"
//                                                 className="w-20 h-20 rounded-full object-cover"
//                                             />
//                                         </div>
//                                         <div className="space-x-3">
//                                             <input
//                                                 ref={fileInputRef}
//                                                 type="file"
//                                                 accept="image/*"
//                                                 onChange={handleFileSelect}
//                                                 className="hidden"
//                                             />
//                                             <button
//                                                 onClick={() => fileInputRef.current?.click()}
//                                                 disabled={loading}
//                                                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                                             >
//                                                 {loading ? 'Uploading...' : 'Upload New'}
//                                             </button>
//                                             {user.avatar && (
//                                                 <button
//                                                     onClick={handleAvatarRemove}
//                                                     disabled={loading}
//                                                     className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
//                                                 >
//                                                     Remove
//                                                 </button>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Basic Profile Form */}
//                                 <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
//                                     <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//                                         Basic Information
//                                     </h4>
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                                 Full Name
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 value={profileData.name}
//                                                 onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
//                                                 disabled={!isEditing}
//                                                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                                 Email
//                                             </label>
//                                             <input
//                                                 type="email"
//                                                 value={user.email}
//                                                 disabled
//                                                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-900 dark:text-white"
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                                 Location
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 value={profileData.location}
//                                                 onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
//                                                 disabled={!isEditing}
//                                                 placeholder="City, Country"
//                                                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                                 Website
//                                             </label>
//                                             <input
//                                                 type="url"
//                                                 value={profileData.website}
//                                                 onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
//                                                 disabled={!isEditing}
//                                                 placeholder="https://example.com"
//                                                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                             />
//                                         </div>
//                                         <div className="md:col-span-2">
//                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                                 Bio
//                                             </label>
//                                             <textarea
//                                                 value={profileData.bio}
//                                                 onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
//                                                 disabled={!isEditing}
//                                                 rows={4}
//                                                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                                 placeholder="Tell us about yourself..."
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Skills Section */}
//                                 <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
//                                     <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills</h4>

//                                     {isEditing && (
//                                         <div className="flex gap-2 mb-4">
//                                             <input
//                                                 type="text"
//                                                 value={newSkill}
//                                                 onChange={(e) => setNewSkill(e.target.value)}
//                                                 onKeyPress={(e) => e.key === 'Enter' && addSkill()}
//                                                 placeholder="Add a skill"
//                                                 className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                             />
//                                             <button
//                                                 onClick={addSkill}
//                                                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                                             >
//                                                 Add
//                                             </button>
//                                         </div>
//                                     )}

//                                     <div className="flex flex-wrap gap-2">
//                                         {profileData.skills.map((skill, index) => (
//                                             <div
//                                                 key={index}
//                                                 className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-sm"
//                                             >
//                                                 <span>{skill}</span>
//                                                 {isEditing && (
//                                                     <button
//                                                         onClick={() => removeSkill(skill)}
//                                                         className="ml-2 hover:text-blue-600 dark:hover:text-blue-400"
//                                                     >
//                                                         <X size={14} />
//                                                     </button>
//                                                 )}
//                                             </div>
//                                         ))}
//                                         {profileData.skills.length === 0 && (
//                                             <p className="text-gray-500 dark:text-gray-400 text-sm">No skills added yet</p>
//                                         )}
//                                     </div>
//                                 </div>

//                                 {/* Interests Section */}
//                                 <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
//                                     <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Interests</h4>

//                                     {isEditing && (
//                                         <div className="flex gap-2 mb-4">
//                                             <input
//                                                 type="text"
//                                                 value={newInterest}
//                                                 onChange={(e) => setNewInterest(e.target.value)}
//                                                 onKeyPress={(e) => e.key === 'Enter' && addInterest()}
//                                                 placeholder="Add an interest"
//                                                 className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                             />
//                                             <button
//                                                 onClick={addInterest}
//                                                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                                             >
//                                                 Add
//                                             </button>
//                                         </div>
//                                     )}

//                                     <div className="flex flex-wrap gap-2">
//                                         {profileData.interests.map((interest, index) => (
//                                             <div
//                                                 key={index}
//                                                 className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full text-sm"
//                                             >
//                                                 <span>{interest}</span>
//                                                 {isEditing && (
//                                                     <button
//                                                         onClick={() => removeInterest(interest)}
//                                                         className="ml-2 hover:text-green-600 dark:hover:text-green-400"
//                                                     >
//                                                         <X size={14} />
//                                                     </button>
//                                                 )}
//                                             </div>
//                                         ))}
//                                         {profileData.interests.length === 0 && (
//                                             <p className="text-gray-500 dark:text-gray-400 text-sm">No interests added yet</p>
//                                         )}
//                                     </div>
//                                 </div>

//                                 {/* Social Links */}
//                                 <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
//                                     <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Social Links</h4>
//                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                                 <div className="flex items-center space-x-2">
//                                                     <Github size={16} />
//                                                     <span>GitHub</span>
//                                                 </div>
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 value={profileData.social.github}
//                                                 onChange={(e) => setProfileData(prev => ({
//                                                     ...prev,
//                                                     social: { ...prev.social, github: e.target.value }
//                                                 }))}
//                                                 disabled={!isEditing}
//                                                 placeholder="github.com/username"
//                                                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                                 <div className="flex items-center space-x-2">
//                                                     <Linkedin size={16} />
//                                                     <span>LinkedIn</span>
//                                                 </div>
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 value={profileData.social.linkedin}
//                                                 onChange={(e) => setProfileData(prev => ({
//                                                     ...prev,
//                                                     social: { ...prev.social, linkedin: e.target.value }
//                                                 }))}
//                                                 disabled={!isEditing}
//                                                 placeholder="linkedin.com/in/username"
//                                                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                                 <div className="flex items-center space-x-2">
//                                                     <Twitter size={16} />
//                                                     <span>Twitter</span>
//                                                 </div>
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 value={profileData.social.twitter}
//                                                 onChange={(e) => setProfileData(prev => ({
//                                                     ...prev,
//                                                     social: { ...prev.social, twitter: e.target.value }
//                                                 }))}
//                                                 disabled={!isEditing}
//                                                 placeholder="twitter.com/username"
//                                                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Security Tab */}
//                         {activeTab === 'security' && (
//                             <div className="space-y-6">
//                                 <div>
//                                     <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Security</h3>
//                                     <p className="text-gray-600 dark:text-gray-400">
//                                         Manage your account security settings.
//                                     </p>
//                                 </div>

//                                 {/* Change Password */}
//                                 <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
//                                     <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//                                         Change Password
//                                     </h4>
//                                     <form onSubmit={handlePasswordChange} className="space-y-4">
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                                 Current Password
//                                             </label>
//                                             <div className="relative">
//                                                 <input
//                                                     type={showPasswords.current ? "text" : "password"}
//                                                     value={passwordData.currentPassword}
//                                                     onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
//                                                     className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                                     required
//                                                 />
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
//                                                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//                                                 >
//                                                     {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
//                                                 </button>
//                                             </div>
//                                         </div>
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                                 New Password
//                                             </label>
//                                             <div className="relative">
//                                                 <input
//                                                     type={showPasswords.new ? "text" : "password"}
//                                                     value={passwordData.newPassword}
//                                                     onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
//                                                     className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                                     required
//                                                     minLength={6}
//                                                 />
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
//                                                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//                                                 >
//                                                     {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
//                                                 </button>
//                                             </div>
//                                         </div>
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                                 Confirm New Password
//                                             </label>
//                                             <div className="relative">
//                                                 <input
//                                                     type={showPasswords.confirm ? "text" : "password"}
//                                                     value={passwordData.confirmPassword}
//                                                     onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
//                                                     className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                                     required
//                                                     minLength={6}
//                                                 />
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
//                                                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//                                                 >
//                                                     {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
//                                                 </button>
//                                             </div>
//                                         </div>
//                                         <button
//                                             type="submit"
//                                             disabled={loading}
//                                             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                                         >
//                                             {loading ? 'Changing Password...' : 'Change Password'}
//                                         </button>
//                                     </form>
//                                 </div>

//                                 {/* Account Actions */}
//                                 <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
//                                     <h4 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">
//                                         Danger Zone
//                                     </h4>
//                                     <p className="text-red-600 dark:text-red-300 text-sm mb-4">
//                                         These actions are irreversible. Please be certain before proceeding.
//                                     </p>
//                                     <button
//                                         onClick={() => {
//                                             if (confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) {
//                                                 // Handle account deactivation
//                                             }
//                                         }}
//                                         className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//                                     >
//                                         Deactivate Account
//                                     </button>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Preferences Tab */}
//                         {activeTab === 'preferences' && (
//                             <div className="space-y-6">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Preferences</h3>
//                                         <p className="text-gray-600 dark:text-gray-400">
//                                             Customize your account preferences.
//                                         </p>
//                                     </div>
//                                     <button
//                                         onClick={handlePreferencesUpdate}
//                                         disabled={loading}
//                                         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                                     >
//                                         {loading ? 'Saving...' : 'Save Preferences'}
//                                     </button>
//                                 </div>

//                                 {/* Notifications */}
//                                 <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
//                                     <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//                                         Notifications
//                                     </h4>
//                                     <div className="space-y-4">
//                                         <div className="flex items-center justify-between">
//                                             <div>
//                                                 <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
//                                                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                                                     Receive important updates via email
//                                                 </p>
//                                             </div>
//                                             <label className="relative inline-flex items-center cursor-pointer">
//                                                 <input
//                                                     type="checkbox"
//                                                     checked={preferences.notifications.email}
//                                                     onChange={(e) => setPreferences(prev => ({
//                                                         ...prev,
//                                                         notifications: { ...prev.notifications, email: e.target.checked }
//                                                     }))}
//                                                     className="sr-only peer"
//                                                 />
//                                                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
//                                             </label>
//                                         </div>
//                                         <div className="flex items-center justify-between">
//                                             <div>
//                                                 <p className="font-medium text-gray-900 dark:text-white">Marketing Emails</p>
//                                                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                                                     Receive promotional content and updates
//                                                 </p>
//                                             </div>
//                                             <label className="relative inline-flex items-center cursor-pointer">
//                                                 <input
//                                                     type="checkbox"
//                                                     checked={preferences.notifications.marketing}
//                                                     onChange={(e) => setPreferences(prev => ({
//                                                         ...prev,
//                                                         notifications: { ...prev.notifications, marketing: e.target.checked }
//                                                     }))}
//                                                     className="sr-only peer"
//                                                 />
//                                                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
//                                             </label>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Privacy */}
//                                 <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
//                                     <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//                                         Privacy
//                                     </h4>
//                                     <div className="space-y-4">
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                                 Profile Visibility
//                                             </label>
//                                             <select
//                                                 value={preferences.privacy.profileVisibility}
//                                                 onChange={(e) => setPreferences(prev => ({
//                                                     ...prev,
//                                                     privacy: { ...prev.privacy, profileVisibility: e.target.value }
//                                                 }))}
//                                                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                             >
//                                                 <option value="public">Public - Anyone can see your profile</option>
//                                                 <option value="private">Private - Only you can see your profile</option>
//                                                 <option value="friends">Friends Only - Only approved friends can see</option>
//                                             </select>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default UserDashboard;