import React, { useState } from 'react';
import { X, User, Mail, Lock, Eye, EyeOff, BookOpen, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Enhanced validation rules to match backend
const VALIDATION_RULES = {
  name: {
    required: true,
    pattern: /^[a-zA-Z\s]+$/,
    minLength: 2,
    maxLength: 50,
    messages: {
      required: 'Name is required',
      pattern: 'Name can only contain letters and spaces',
      minLength: 'Name must be at least 2 characters',
      maxLength: 'Name cannot exceed 50 characters'
    }
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    messages: { required: 'Email is required', pattern: 'Please provide a valid email' }
  },
  password: {
    required: true,
    minLength: 6,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    messages: {
      required: 'Password is required',
      minLength: 'Password must be at least 6 characters',
      pattern: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  }
};

// Custom hooks remain the same but with enhanced validation
const useFormValidation = () => {
  const validateField = (name, value, isSignUp) => {
    const rules = VALIDATION_RULES[name];
    if (!rules) return '';

    if (name === 'name' && !isSignUp) return '';

    if (rules.required && !value.trim()) {
      return rules.messages?.required || rules.message;
    }

    if (rules.pattern && value && !rules.pattern.test(value.trim())) {
      return rules.messages?.pattern;
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      return rules.messages?.minLength;
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      return rules.messages?.maxLength;
    }

    return '';
  };

  const validateForm = (formData, isSignUp) => {
    const errors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field], isSignUp);
      if (error) errors[field] = error;
    });
    return errors;
  };

  return { validateForm, validateField };
};

const useFormState = (validateField) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('learner');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear success message when user starts typing
    if (successMessage) setSuccessMessage('');

    // Real-time validation
    if (errors[name]) {
      const error = validateField(name, value, isSignUp);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const toggleMode = () => {
    setIsSignUp(prev => !prev);
    setErrors({});
    setSuccessMessage('');
    setAgreedToTerms(false);
    setIsForgotPassword(false);
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(prev => !prev);
    setErrors({});
    setSuccessMessage('');
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '' });
    setErrors({});
    setIsSignUp(false);
    setIsForgotPassword(false);
    setShowPassword(false);
    setUserType('learner');
    setIsLoading(false);
    setAgreedToTerms(false);
    setSuccessMessage('');
  };

  return {
    isSignUp, setIsSignUp, isForgotPassword, setIsForgotPassword,
    showPassword, setShowPassword, userType, setUserType,
    formData, errors, setErrors, isLoading, setIsLoading, 
    agreedToTerms, setAgreedToTerms, successMessage, setSuccessMessage,
    handleInputChange, toggleMode, toggleForgotPassword, resetForm
  };
};

// Enhanced InputField component
const InputField = ({
  icon: Icon,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  showPasswordToggle,
  onTogglePassword,
  showPassword,
  disabled = false
}) => {
  const fieldLabels = {
    name: 'Full Name',
    email: 'Email Address',
    password: 'Password'
  };

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {fieldLabels[name]}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          id={name}
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full pl-11 ${showPasswordToggle ? 'pr-11' : 'pr-4'} py-3 rounded border transition-colors ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-blue-500'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed`}
          placeholder={placeholder}
          autoComplete={name === 'password' ? 'current-password' : name}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            disabled={disabled}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-sm flex items-center space-x-1">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

// UserTypeSelector component
const UserTypeSelector = ({ userType, setUserType, disabled = false }) => {
  const types = [
    { value: 'learner', label: 'Learner', icon: BookOpen, description: 'Learn new skills' },
    { value: 'mentor', label: 'Mentor', icon: User, description: 'Share knowledge' }
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">I am a:</label>
      <div className="grid grid-cols-2 gap-3">
        {types.map(({ value, label, icon: Icon, description }) => (
          <button
            key={value}
            type="button"
            onClick={() => setUserType(value)}
            disabled={disabled}
            className={`p-3 rounded border transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${userType === value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <Icon size={16} />
              <span className="font-medium">{label}</span>
            </div>
            <p className="text-xs opacity-70">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

// Terms and Conditions component
const TermsCheckbox = ({ checked, onChange, disabled }) => (
  <div className="flex items-start space-x-3">
    <input
      id="terms"
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
    />
    <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
      I agree to the{' '}
      <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
        Terms and Conditions
      </a>{' '}
      and{' '}
      <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
        Privacy Policy
      </a>
    </label>
  </div>
);

// Google Login Button
const GoogleLoginButton = ({ onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
    <span>Continue with Google</span>
  </button>
);

const SubmitButton = ({ isLoading, isSignUp, isForgotPassword }) => (
  <button
    type="submit"
    disabled={isLoading}
    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
  >
    {isLoading ? (
      <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <span>
          {isForgotPassword ? 'Sending...' : isSignUp ? 'Creating Account...' : 'Signing In...'}
        </span>
      </div>
    ) : (
      <span>
        {isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'}
      </span>
    )}
  </button>
);

// Success Message Component
const SuccessMessage = ({ message }) => (
  <div className="p-3 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
    <p className="text-green-600 dark:text-green-400 text-sm flex items-center space-x-2">
      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
      <span>{message}</span>
    </p>
  </div>
);

const LoginModal = () => {
  const { showLogin, setShowLogin, login, loginWithGoogle, forgotPassword } = useAuth();
  const { validateForm, validateField } = useFormValidation();
  const {
    isSignUp, isForgotPassword, showPassword, setShowPassword, userType, setUserType,
    formData, errors, setErrors, isLoading, setIsLoading, agreedToTerms, setAgreedToTerms,
    successMessage, setSuccessMessage, handleInputChange, toggleMode, toggleForgotPassword, resetForm
  } = useFormState(validateField);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isForgotPassword) {
      // Handle forgot password
      const emailError = validateField('email', formData.email, false);
      if (emailError) {
        setErrors({ email: emailError });
        return;
      }

      setIsLoading(true);
      setErrors({});

      try {
        const result = await forgotPassword(formData.email);
        if (result.success) {
          setSuccessMessage(result.message);
          setFormData({ ...formData, email: '' });
        } else {
          setErrors({ submit: result.message });
        }
      } catch (error) {
        setErrors({ submit: 'An unexpected error occurred. Please try again.' });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Regular login/signup logic
    const validationErrors = validateForm(formData, isSignUp);

    if (isSignUp && !agreedToTerms) {
      validationErrors.terms = 'You must agree to the terms and conditions';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const credentials = {
        ...formData,
        userType,
        agreedToTerms: isSignUp ? agreedToTerms : undefined
      };

      const result = await login(credentials, isSignUp);

      if (!result.success) {
        if (result.errors && Array.isArray(result.errors)) {
          const backendErrors = {};
          result.errors.forEach(error => {
            if (error.param) {
              backendErrors[error.param] = error.msg;
            }
          });
          setErrors(backendErrors);
        } else {
          setErrors({ submit: result.message });
        }
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!isLoading) {
      console.log('[LOGIN MODAL] Google login clicked');
      loginWithGoogle();
    }
  };

  const handleClose = () => {
    setShowLogin(false);
    setTimeout(resetForm, 300);
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showLogin && !isLoading) {
        handleClose();
      }
    };

    if (showLogin) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showLogin, isLoading]);

  if (!showLogin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={handleClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Back button for forgot password */}
          {isForgotPassword && (
            <button
              onClick={toggleForgotPassword}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">I-GYAN.AI</h2>
              <p className="text-blue-100 text-sm">Premium Learning Platform</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold">
            {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
          </h3>
          <p className="text-blue-100 text-sm">
            {isForgotPassword 
              ? 'Enter your email to receive a reset link'
              : isSignUp 
                ? 'Join thousands of learners today' 
                : 'Sign in to continue your learning journey'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isForgotPassword && (
            <UserTypeSelector
              userType={userType}
              setUserType={setUserType}
              disabled={isLoading}
            />
          )}

          {!isForgotPassword && isSignUp && (
            <InputField
              icon={User}
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              error={errors.name}
              disabled={isLoading}
            />
          )}

          <InputField
            icon={Mail}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            error={errors.email}
            disabled={isLoading}
          />

          {!isForgotPassword && (
            <InputField
              icon={Lock}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              error={errors.password}
              showPasswordToggle
              onTogglePassword={() => setShowPassword(!showPassword)}
              showPassword={showPassword}
              disabled={isLoading}
            />
          )}

          {!isForgotPassword && isSignUp && (
            <div className="space-y-2">
              <TermsCheckbox
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={isLoading}
              />
              {errors.terms && (
                <p className="text-red-500 text-sm flex items-center space-x-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  <span>{errors.terms}</span>
                </p>
              )}
            </div>
          )}

          {/* Success Message */}
          {successMessage && <SuccessMessage message={successMessage} />}

          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 text-sm flex items-center space-x-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>{errors.submit}</span>
              </p>
            </div>
          )}

          <SubmitButton 
            isLoading={isLoading} 
            isSignUp={isSignUp} 
            isForgotPassword={isForgotPassword} 
          />

          {!isForgotPassword && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">or</span>
                </div>
              </div>

              <GoogleLoginButton onClick={handleGoogleLogin} disabled={isLoading} />
            </>
          )}

          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            {!isForgotPassword ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  <button
                    type="button"
                    onClick={toggleMode}
                    disabled={isLoading}
                    className="ml-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
                
                {!isSignUp && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Forgot your password?
                    <button
                      type="button"
                      onClick={toggleForgotPassword}
                      disabled={isLoading}
                      className="ml-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reset here
                    </button>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remember your password?
                <button
                  type="button"
                  onClick={toggleForgotPassword}
                  disabled={isLoading}
                  className="ml-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;