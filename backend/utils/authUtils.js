const generateEmailVerificationToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

const generatePasswordResetToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/', 
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, 
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });
};


const clearAuthCookies = (res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  };

  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};

const commonValidationRules = {
  email: [
    {
      trim: true,
      isEmail: true,
      normalizeEmail: true,
      message: 'Please provide a valid email'
    }
  ],
  password: [
    {
      isLength: { min: 6 },
      message: 'Password must be at least 6 characters',
      matches: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      matchMessage: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  ],
  name: [
    {
      trim: true,
      isLength: { min: 2, max: 50 },
      message: 'Name must be between 2 and 50 characters',
      matches: /^[a-zA-Z\s]+$/,
      matchMessage: 'Name can only contain letters and spaces'
    }
  ]
};

const sendErrorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

const sendSuccessResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message
  };

  if (data) {
    Object.assign(response, data);
  }

  return res.status(statusCode).json(response);
};

const handleOAuthError = (error, res) => {
  console.error('OAuth callback error:', error);
  return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_error`);
};

const getUserResponse = (user) => {
  const baseResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    userType: user.userType,
    isEmailVerified: user.isEmailVerified,
    avatar: user.avatar,
    rating: user.rating,
    totalReviews: user.totalReviews,
    projectsCompleted: user.projectsCompleted,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt
  };

  if (user.userType === 'learner') {
    return {
      ...baseResponse,
      university: user.university,
      course: user.course,
      year: user.year,
      skills: user.skills,
      portfolio: user.portfolio,
      github: user.github,
      linkedin: user.linkedin,
      bio: user.bio
    };
  }

  if (user.userType === 'mentor') {
    return {
      ...baseResponse,
      experience: user.experience,
      expertise: user.expertise,
      bio: user.bio,
      portfolio: user.portfolio,
      github: user.github,
      linkedin: user.linkedin,
      website: user.website
    };
  }

  return baseResponse;
};

const getCompanyResponse = (company) => {
  return {
    id: company._id,
    companyName: company.companyName,
    email: company.email,
    contactPerson: company.contactPerson,
    phone: company.phone,
    website: company.website,
    location: company.location,
    industry: company.industry,
    companySize: company.companySize,
    description: company.description,
    logo: company.logo,
    verified: company.verified,
    rating: company.rating,
    totalReviews: company.totalReviews,
    projectsPosted: company.projectsPosted,
    isEmailVerified: company.isEmailVerified,
    isApproved: company.isApproved,
    lastLogin: company.lastLogin,
    createdAt: company.createdAt
  };
};

module.exports = {
  setAuthCookies,
  clearAuthCookies,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  commonValidationRules,
  sendErrorResponse,
  sendSuccessResponse,
  handleOAuthError,
  getUserResponse,
  getCompanyResponse
};