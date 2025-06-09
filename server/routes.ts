import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import * as bcrypt from "bcrypt";
import { storage } from "./storage";
import { getCachedVideos } from "./youtube";
import { insertUserSchema, insertPartnerSchema, insertSupplierSchema, insertToolSchema, insertMySupplierSchema, insertProductSchema, insertTemplateSchema, insertTicketSchema, insertMaterialSchema, insertNewsSchema, insertReviewSchema, insertMaterialTypeSchema, insertSoftwareTypeSchema, insertSupplierTypeSchema, insertProductCategorySchema, insertPartnerCategorySchema } from "@shared/schema";
import { users, tickets, materials, templates } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

// Configure passport
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Configure Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await storage.getUserByGoogleId(profile.id);
      
      if (user) {
        return done(null, user);
      }

      // Check if user exists with this email
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await storage.getUserByEmail(email);
        if (user) {
          // Link Google account to existing user
          const updatedUser = await storage.updateUser(user.id, {
            googleId: profile.id
          });
          return done(null, updatedUser);
        }
      }

      // Create new user
      const newUser = await storage.createUser({
        email: email || '',
        fullName: profile.displayName || '',
        googleId: profile.id,
        accessLevel: 'Basic'
      });

      return done(null, newUser);
    } catch (error) {
      return done(error);
    }
  }));
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
}

function requireRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = req.user as any;
    if (roles.includes(user.accessLevel)) {
      return next();
    }
    
    res.status(403).json({ message: 'Insufficient permissions' });
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, fullName } = req.body;
      
      if (!email || !password || !fullName) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        fullName,
        accessLevel: 'Basic'
      });

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login failed after registration' });
        }
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (error) {
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    const { password: _, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/dashboard');
    }
  );

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', (req, res) => {
    if (req.isAuthenticated()) {
      const { password: _, ...userWithoutPassword } = req.user as any;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  // Dashboard route
  app.get('/api/dashboard/metrics', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const metrics = await storage.getDashboardMetrics(user.id);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to load dashboard metrics' });
    }
  });

  // Materials routes
  app.get('/api/materials', requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const user = req.user as any;
      
      let accessLevel;
      if (user.accessLevel === 'Basic') {
        accessLevel = 'Public';
      }
      
      const materials = await storage.getMaterials(accessLevel, limit, offset);
      res.json(materials);
    } catch (error) {
      res.status(500).json({ message: 'Failed to load materials' });
    }
  });

  app.get('/api/materials/search', requireAuth, async (req, res) => {
    try {
      const { q: query, category } = req.query;
      if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
      }
      
      const user = req.user as any;
      let accessLevel;
      if (user.accessLevel === 'Basic') {
        accessLevel = 'Public';
      }
      
      const materials = await storage.searchMaterials(query as string, category as string, accessLevel);
      res.json(materials);
    } catch (error) {
      res.status(500).json({ message: 'Search failed' });
    }
  });

  app.get('/api/materials/:id', requireAuth, async (req, res) => {
    try {
      const material = await storage.getMaterial(parseInt(req.params.id));
      if (!material) {
        return res.status(404).json({ message: 'Material not found' });
      }
      
      const user = req.user as any;
      // Check access level
      if (material.accessLevel === 'Restricted' && user.accessLevel === 'Basic') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(material);
    } catch (error) {
      res.status(500).json({ message: 'Failed to load material' });
    }
  });

  // Material view tracking
  app.post('/api/materials/:id/view', requireAuth, async (req, res) => {
    try {
      const materialId = parseInt(req.params.id);
      const material = await storage.getMaterial(materialId);
      
      if (material) {
        await storage.updateMaterial(materialId, { 
          viewCount: material.viewCount + 1 
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to track view' });
    }
  });

  // Admin materials routes
  app.get('/api/admin/materials', requireAuth, requireRole(['Administradores', 'Suporte']), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;
      
      let materials;
      if (search) {
        materials = await storage.searchMaterials(search);
      } else {
        materials = await storage.getMaterials(undefined, limit, offset);
      }
      
      res.json(materials);
    } catch (error) {
      res.status(500).json({ message: 'Failed to load materials' });
    }
  });

  app.post('/api/admin/materials', requireAuth, requireRole(['Administradores']), async (req, res) => {
    try {
      const materialData = insertMaterialSchema.parse(req.body);
      const material = await storage.createMaterial(materialData);
      res.json(material);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create material' });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.accessLevel !== 'Administradores' && user.accessLevel !== 'Suporte') {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Get admin statistics
      const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
      const basicUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.accessLevel, 'Basic'));
      const alunoUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.accessLevel, 'Aluno'));
      const alunoProUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.accessLevel, 'Aluno Pro'));
      const supportUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.accessLevel, 'Suporte'));
      const adminUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.accessLevel, 'Administradores'));

      const totalTickets = await db.select({ count: sql<number>`count(*)` }).from(tickets);
      const openTickets = await db.select({ count: sql<number>`count(*)` }).from(tickets).where(eq(tickets.status, 'open'));
      const totalMaterials = await db.select({ count: sql<number>`count(*)` }).from(materials);
      const totalTemplates = await db.select({ count: sql<number>`count(*)` }).from(templates);

      res.json({
        users: {
          total: totalUsers[0].count,
          basic: basicUsers[0].count,
          aluno: alunoUsers[0].count,
          alunoPro: alunoProUsers[0].count,
          support: supportUsers[0].count,
          admin: adminUsers[0].count
        },
        tickets: {
          total: totalTickets[0].count,
          open: openTickets[0].count
        },
        content: {
          materials: totalMaterials[0].count,
          templates: totalTemplates[0].count
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to load admin stats' });
    }
  });

  // Cadastros - Material Types routes
  app.get("/api/material-types", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const materialTypes = await storage.getMaterialTypes(limit, offset);
      res.json(materialTypes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch material types' });
    }
  });

  app.post("/api/material-types", requireAuth, requireRole(["Administradores"]), async (req, res) => {
    try {
      const validatedData = insertMaterialTypeSchema.parse(req.body);
      const materialType = await storage.createMaterialType(validatedData);
      res.status(201).json(materialType);
    } catch (error) {
      res.status(400).json({ message: 'Invalid material type data' });
    }
  });

  app.put("/api/material-types/:id", requireAuth, requireRole(["Administradores"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMaterialTypeSchema.partial().parse(req.body);
      const materialType = await storage.updateMaterialType(id, validatedData);
      res.json(materialType);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update material type' });
    }
  });

  app.delete("/api/material-types/:id", requireAuth, requireRole(["Administradores"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMaterialType(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: 'Failed to delete material type' });
    }
  });

  // Cadastros - Software Types routes
  app.get("/api/software-types", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const softwareTypes = await storage.getSoftwareTypes(limit, offset);
      res.json(softwareTypes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch software types' });
    }
  });

  app.post("/api/software-types", requireAuth, requireRole(["Administradores"]), async (req, res) => {
    try {
      const validatedData = insertSoftwareTypeSchema.parse(req.body);
      const softwareType = await storage.createSoftwareType(validatedData);
      res.status(201).json(softwareType);
    } catch (error) {
      res.status(400).json({ message: 'Invalid software type data' });
    }
  });

  app.put("/api/software-types/:id", requireAuth, requireRole(["Administradores"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSoftwareTypeSchema.partial().parse(req.body);
      const softwareType = await storage.updateSoftwareType(id, validatedData);
      res.json(softwareType);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update software type' });
    }
  });

  app.delete("/api/software-types/:id", requireAuth, requireRole(["Administradores"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSoftwareType(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: 'Failed to delete software type' });
    }
  });

  // Cadastros - Supplier Types routes
  app.get("/api/supplier-types", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const supplierTypes = await storage.getSupplierTypes(limit, offset);
      res.json(supplierTypes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch supplier types' });
    }
  });

  app.post("/api/supplier-types", requireAuth, requireRole(["Administradores"]), async (req, res) => {
    try {
      const validatedData = insertSupplierTypeSchema.parse(req.body);
      const supplierType = await storage.createSupplierType(validatedData);
      res.status(201).json(supplierType);
    } catch (error) {
      res.status(400).json({ message: 'Invalid supplier type data' });
    }
  });

  app.put("/api/supplier-types/:id", requireAuth, requireRole(["Administradores"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSupplierTypeSchema.partial().parse(req.body);
      const supplierType = await storage.updateSupplierType(id, validatedData);
      res.json(supplierType);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update supplier type' });
    }
  });

  app.delete("/api/supplier-types/:id", requireAuth, requireRole(["Administradores"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSupplierType(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: 'Failed to delete supplier type' });
    }
  });

  // Cadastros - Product Categories routes
  app.get("/api/product-categories", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const productCategories = await storage.getProductCategories(limit, offset);
      res.json(productCategories);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch product categories' });
    }
  });

  app.post("/api/product-categories", requireAuth, requireRole(["Administradores"]), async (req, res) => {
    try {
      const validatedData = insertProductCategorySchema.parse(req.body);
      const productCategory = await storage.createProductCategory(validatedData);
      res.status(201).json(productCategory);
    } catch (error) {
      res.status(400).json({ message: 'Invalid product category data' });
    }
  });

  app.put("/api/product-categories/:id", requireAuth, requireRole(["Administradores"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductCategorySchema.partial().parse(req.body);
      const productCategory = await storage.updateProductCategory(id, validatedData);
      res.json(productCategory);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update product category' });
    }
  });

  app.delete("/api/product-categories/:id", requireAuth, requireRole(["Administradores"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProductCategory(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: 'Failed to delete product category' });
    }
  });

  // Cadastros - Partner Categories routes
  app.get("/api/partner-categories", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const partnerCategories = await storage.getPartnerCategories(limit, offset);
      res.json(partnerCategories);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch partner categories' });
    }
  });

  app.post("/api/partner-categories", requireAuth, requireRole(["Administradores"]), async (req, res) => {
    try {
      const validatedData = insertPartnerCategorySchema.parse(req.body);
      const partnerCategory = await storage.createPartnerCategory(validatedData);
      res.status(201).json(partnerCategory);
    } catch (error) {
      res.status(400).json({ message: 'Invalid partner category data' });
    }
  });

  app.put("/api/partner-categories/:id", requireAuth, requireRole(["Administradores"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPartnerCategorySchema.partial().parse(req.body);
      const partnerCategory = await storage.updatePartnerCategory(id, validatedData);
      res.json(partnerCategory);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update partner category' });
    }
  });

  app.delete("/api/partner-categories/:id", requireAuth, requireRole(["Administradores"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePartnerCategory(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: 'Failed to delete partner category' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}