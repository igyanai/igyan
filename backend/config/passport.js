const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

module.exports = function(passport) {
  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        // User exists with Google ID, update last login and return
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }

      // Check if user exists with this email (from regular registration)
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // User exists with this email but not Google ID
        // Link Google account to existing user
        user.googleId = profile.id;
        user.isEmailVerified = true; // Google emails are verified
        user.lastLogin = new Date();
        
        // Update avatar if user doesn't have one
        if (!user.avatar && profile.photos && profile.photos.length > 0) {
          user.avatar = profile.photos[0].value;
        }
        
        await user.save();
        return done(null, user);
      }

      // Create new user
      const newUser = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
        isEmailVerified: true, // Google emails are verified
        userType: 'learner', // Default user type
        agreedToTerms: true, // Assume terms agreed for OAuth users
        lastLogin: new Date()
      });

      await newUser.save();
      return done(null, newUser);

    } catch (error) {
      console.error('Google OAuth Strategy Error:', error);
      return done(error, null);
    }
  }));

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};