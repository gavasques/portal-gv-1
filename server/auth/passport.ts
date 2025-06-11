import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import { storage } from '../storage';

// Local Strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email: string, password: string, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return done(null, false, { message: 'Email não encontrado' });
      }

      if (!user.password) {
        return done(null, false, { message: 'Use login com Google para esta conta' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return done(null, false, { message: 'Senha incorreta' });
      }

      if (!user.isActive) {
        return done(null, false, { message: 'Conta desativada' });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLoginAt: new Date() });

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Google Strategy (only if environment variables are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
    try {
      // Try to find existing user by Google ID
      let user = await storage.getUserByGoogleId(profile.id);
      
      if (user) {
        // Update last login
        await storage.updateUser(user.id, { lastLoginAt: new Date() });
        return done(null, user);
      }

      // Try to find user by email
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await storage.getUserByEmail(email);
        
        if (user) {
          // Link Google account to existing user
          await storage.updateUser(user.id, { 
            googleId: profile.id,
            profileImage: profile.photos?.[0]?.value,
            lastLoginAt: new Date()
          });
          return done(null, user);
        }
      }

      // Create new user
      if (email) {
        const newUser = await storage.createUser({
          email,
          fullName: profile.displayName || 'Usuário Google',
          googleId: profile.id,
          profileImage: profile.photos?.[0]?.value,
          role: 'BASIC',
          status: 'active',
          isActive: true,
          lastLoginAt: new Date()
        });
        
        return done(null, newUser);
      }

      return done(new Error('Email não fornecido pelo Google'));
    } catch (error) {
      return done(error);
    }
  }
  ));
}

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;