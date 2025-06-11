import { Request, Response, NextFunction } from 'express';
import { User } from '@shared/schema';

export type UserRole = 'BASIC' | 'ALUNO' | 'ALUNO_PRO' | 'SUPORTE' | 'ADM';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Middleware to require authentication
export function requireAuth(req: any, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (!req.user.isActive) {
    return res.status(403).json({ message: 'Account disabled' });
  }

  next();
}

// Middleware to require specific roles
export function requireRole(allowedRoles: UserRole[]) {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!req.user.isActive) {
      return res.status(403).json({ message: 'Account disabled' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied', 
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
}

// Middleware to require admin role
export function requireAdmin(req: any, res: Response, next: NextFunction) {
  return requireRole(['ADM'])(req, res, next);
}

// Middleware to require support or admin role
export function requireSupport(req: any, res: Response, next: NextFunction) {
  return requireRole(['SUPORTE', 'ADM'])(req, res, next);
}

// Middleware to require student roles or higher
export function requireStudent(req: any, res: Response, next: NextFunction) {
  return requireRole(['ALUNO', 'ALUNO_PRO', 'SUPORTE', 'ADM'])(req, res, next);
}

// Middleware to require premium student or higher
export function requirePremium(req: any, res: Response, next: NextFunction) {
  return requireRole(['ALUNO_PRO', 'SUPORTE', 'ADM'])(req, res, next);
}