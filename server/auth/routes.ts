import express from 'express';
import passport from './passport';
import { storage } from '../storage';
import * as bcrypt from 'bcrypt';

const router = express.Router();

// Local login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ message: 'Authentication error' });
    }
    
    if (!user) {
      return res.status(401).json({ 
        message: info?.message || 'Login failed',
        success: false 
      });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Login error' });
      }
      
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      });
    });
  })(req, res, next);
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ 
        message: 'Email, password and full name are required' 
      });
    }

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await storage.createUser({
      email,
      password: hashedPassword,
      fullName,
      role: 'BASIC',
      status: 'active',
      isActive: true
    });

    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/dashboard');
    }
  );
}

// Get current user
router.get('/me', (req: any, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  res.json({
    id: req.user.id,
    email: req.user.email,
    fullName: req.user.fullName,
    role: req.user.role,
    isActive: req.user.isActive
  });
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Role-based middleware for auth routes
function requireRole(allowedRoles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }
    
    res.status(403).json({ 
      message: 'Access denied',
      requiredRoles: allowedRoles 
    });
  };
}

// Protected routes for testing role-based access
router.get('/admin-only', requireRole(['ADM']), (req: any, res) => {
  res.json({ message: 'Admin access granted', user: req.user?.role });
});

router.get('/support-or-admin', requireRole(['SUPORTE', 'ADM']), (req: any, res) => {
  res.json({ message: 'Support/Admin access granted', user: req.user?.role });
});

router.get('/students-only', requireRole(['ALUNO', 'ALUNO_PRO', 'SUPORTE', 'ADM']), (req: any, res) => {
  res.json({ message: 'Student access granted', user: req.user?.role });
});

export default router;