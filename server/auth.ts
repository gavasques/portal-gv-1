import type { RequestHandler } from "express";

// Simple authentication middleware for current system
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

// Admin-only middleware
export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  const user = req.user as any;
  if (user?.accessLevel !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  next();
};