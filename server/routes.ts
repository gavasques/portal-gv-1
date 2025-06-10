import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import * as bcrypt from "bcrypt";
import { storage } from "./storage";
import { getCachedVideos } from "./youtube";
import { insertUserSchema, insertPartnerSchema, insertSupplierSchema, insertToolSchema, insertMySupplierSchema, insertProductSchema, insertTemplateSchema, insertTicketSchema, insertMaterialSchema, insertNewsSchema, insertReviewSchema, insertMaterialTypeSchema, insertSoftwareTypeSchema, insertSupplierTypeSchema, insertProductCategorySchema, insertPartnerCategorySchema, insertUserGroupSchema, insertPermissionSchema, insertUserActivityLogSchema, insertTemplateTagSchema } from "@shared/schema";
import { users, tickets, materials, templates } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import express from 'express';

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

      // Create new user with default group (basic users)
      const newUser = await storage.createUser({
        email: email || '',
        fullName: profile.displayName || '',
        googleId: profile.id,
        groupId: 1 // Basic group
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
  res.setHeader('Content-Type', 'application/json');
  res.status(401).json({ message: 'Not authenticated' });
}

function requireRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = req.user as any;
    // Map group IDs to role names for compatibility
    const groupToRole: Record<number, string> = {
      1: 'Basic',
      2: 'Aluno', 
      3: 'Aluno Pro',
      4: 'Suporte',
      5: 'Administradores'
    };

    const userRole = user.groupId ? groupToRole[user.groupId] : 'Basic';
    if (roles.includes(userRole)) {
      return next();
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(403).json({ message: 'Insufficient permissions' });
  };
}

export async function registerRoutes(app: Express): Promise<Server> {

  const requireAdmin = requireRole(['Administradores']);

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
        groupId: 1 // Basic group
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

  // Update user profile
  app.put('/api/auth/profile', requireAuth, async (req, res) => {
    try {
      const { fullName, cpf, phone } = req.body;
      const user = req.user as any;
      const updatedUser = await storage.updateProfile(user.id, {
        fullName,
        cpf,
        phone,
      });
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Failed to update profile' });
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
      if (user.groupId === 1) { // Basic group
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
      if (user.groupId === 1) { // Basic group
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
      if (material.accessLevel === 'Restricted' && user.groupId === 1) {
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

  app.put('/api/admin/materials/:id', requireAuth, requireRole(['Administradores']), async (req, res) => {
    try {
      const materialId = parseInt(req.params.id);
      const updates = insertMaterialSchema.partial().parse(req.body);
      const material = await storage.updateMaterial(materialId, updates);
      res.json(material);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update material' });
    }
  });

  app.patch('/api/admin/materials/:id', requireAuth, requireRole(['Administradores']), async (req, res) => {
    try {
      const materialId = parseInt(req.params.id);
      const { isActive } = req.body;
      const material = await storage.updateMaterial(materialId, { isActive });
      res.json(material);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update material status' });
    }
  });

  app.delete('/api/admin/materials/:id', requireAuth, requireRole(['Administradores']), async (req, res) => {
    try {
      const materialId = parseInt(req.params.id);
      await storage.deleteMaterial(materialId);
      res.json({ message: 'Material deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete material' });
    }
  });

  // Templates API routes
  app.get('/api/templates', requireAuth, async (req, res) => {
    try {
      const { search, category, tags } = req.query;
      let templates;

      if (search || category) {
        templates = await storage.searchTemplates(
          search as string || '', 
          category as string
        );
      } else {
        templates = await storage.getAllTemplates();
      }

      // Filter by tags if provided
      if (tags) {
        const tagList = (tags as string).split(',').map(tag => tag.trim());
        templates = templates.filter(template => {
          if (!template.tags) return false;
          return tagList.some(tag => template.tags?.includes(tag));
        });
      }

      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch templates' });
    }
  });

  app.get('/api/templates/:id', requireAuth, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const template = await storage.getTemplateById(templateId);
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch template' });
    }
  });

  app.post('/api/templates/:id/copy', requireAuth, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      await storage.incrementTemplateCopyCount(templateId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to track copy' });
    }
  });

  // Admin Templates routes
  app.get('/api/admin/templates', requireAuth, requireRole(['Administradores']), async (req, res) => {
    try {
      const includeTags = req.query.include_tags === 'true';

      if (includeTags) {
        const templates = await storage.getAllTemplatesWithTags();
        res.json(templates);
      } else {
        const templates = await storage.getAllTemplates();
        res.json(templates);
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch templates' });
    }
  });

  app.post('/api/admin/templates', requireAuth, requireRole(['Administradores']), async (req, res) => {
    try {
      const { selectedTags, ...templateData } = req.body;
      const validatedData = insertTemplateSchema.parse(templateData);
      const template = await storage.createTemplate(validatedData);

      // Vincular tags se fornecidas
      if (selectedTags && Array.isArray(selectedTags) && selectedTags.length > 0) {
        await storage.linkTemplateToTags(template.id, selectedTags);
      }

      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating template:', error);
      res.status(400).json({ message: 'Failed to create template' });
    }
  });

  app.put('/api/admin/templates/:id', requireAuth, requireRole(['Administradores']), async (req, res) => {
    try {
      const { selectedTags, ...templateData } = req.body;
      const validatedData = insertTemplateSchema.partial().parse(templateData);
      const template = await storage.updateTemplate(parseInt(req.params.id), validatedData);

      // Atualizar tags se fornecidas
      if (selectedTags && Array.isArray(selectedTags)) {
        await storage.linkTemplateToTags(template.id, selectedTags);
      }

      res.json(template);
    } catch (error) {
      console.error('Error updating template:', error);
      res.status(400).json({ message: 'Failed to update template' });
    }
  });

  app.delete('/api/admin/templates/:id', requireAuth, requireRole(['Administradores']), async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      await storage.deleteTemplate(templateId);
      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete template' });
    }
  });

  app.get('/api/admin/templates/:id', requireAuth, requireRole(['Administradores']), async (req, res) => {
    try {
      const includeTags = req.query.include_tags === 'true';

      if (includeTags) {
        const template = await storage.getTemplateWithTags(parseInt(req.params.id));
        if (!template) {
          return res.status(404).json({ message: 'Template not found' });
        }
        res.json(template);
      } else {
        const template = await storage.getTemplate(parseInt(req.params.id));
        if (!template) {
          return res.status(404).json({ message: 'Template not found' });
        }
        res.json(template);
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch template' });
    }
  });



  // Admin routes - require auth and admin role
  app.get('/api/admin/stats', requireAuth, requireAdmin, async (req, res) => {
    try {
      const user = req.user as any;
      // Check if user has admin access using group-based permissions
      if (!user.groupId || (user.groupId !== 5 && user.groupId !== 4)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Get admin statistics using group-based system
      const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
      const basicUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.groupId, 1));
      const alunoUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.groupId, 2));
      const alunoProUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.groupId, 3));
      const supportUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.groupId, 4));
      const adminUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.groupId, 5));

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

  // User Management Routes
  app.get('/api/admin/users', requireAuth, async (req, res) => {
    try {
      const { limit, offset, groupId, isActive, search } = req.query;
      const users = await storage.getUsersWithGroups(
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined,
        groupId ? parseInt(groupId as string) : undefined,
        isActive ? isActive === 'true' : undefined,
        search as string
      );
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.get('/api/admin/users/:id', requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  app.get('/api/admin/users/:id/permissions', requireAuth, async (req, res) => {
    try {
      const permissions = await storage.getUserPermissions(parseInt(req.params.id));
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user permissions' });
    }
  });

  app.get('/api/admin/users/:id/activity', requireAuth, async (req, res) => {
    try {
      const activity = await storage.getUserActivity(parseInt(req.params.id));
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user activity' });
    }
  });

  app.put('/api/admin/users/:id/password', requireAuth, async (req, res) => {
    try {
      const { password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      await storage.updateUser(parseInt(req.params.id), { password: hashedPassword });

      // Log activity
      await storage.logUserActivity({
        userId: (req.user as any).id,
        action: 'CHANGE_PASSWORD',
        details: { targetUserId: parseInt(req.params.id) },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update password' });
    }
  });

  app.post('/api/admin/users/:id/magic-link', requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Create auth token for magic link
      const token = await storage.createAuthToken({
        token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        userId: user.id,
        type: 'magic_link',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      // In production, send email with magic link
      // For now, just log the activity
      await storage.logUserActivity({
        userId: (req.user as any).id,
        action: 'SEND_MAGIC_LINK',
        details: { targetUserId: user.id, email: user.email },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'Magic link sent successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to send magic link' });
    }
  });

  app.delete('/api/admin/users/:id', requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      await storage.deleteUser(userId);

      // Log activity
      await storage.logUserActivity({
        userId: (req.user as any).id,
        action: 'DELETE_USER',
        details: { deletedUserId: userId },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  app.post('/api/admin/users', requireAuth, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      // Hash password if provided
      if (validatedData.password) {
        validatedData.password = await bcrypt.hash(validatedData.password, 10);
      }

      const user = await storage.createUser(validatedData);

      // Log activity
      await storage.logUserActivity({
        userId: (req.user as any).id,
        action: 'CREATE_USER',
        details: { createdUserId: user.id, email: user.email },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(400).json({ message: 'Failed to create user' });
    }
  });

  app.put('/api/admin/users/:id', requireAuth, async (req, res) => {
    try {
      const validatedData = insertUserSchema.partial().parse(req.body);

      // Hash password if provided
      if (validatedData.password) {
        validatedData.password = await bcrypt.hash(validatedData.password, 10);
      }

      const user = await storage.updateUser(parseInt(req.params.id), validatedData);

      // Log activity
      await storage.logUserActivity({
        userId: (req.user as any).id,
        action: 'UPDATE_USER',
        details: { updatedUserId: user.id, changes: validatedData },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(400).json({ message: 'Failed to update user' });
    }
  });

  // User Groups Management Routes
  app.get('/api/admin/groups', requireAuth, async (req, res) => {
    try {
      const groups = await storage.getUserGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user groups' });
    }
  });

  app.get('/api/admin/user-groups', requireAuth, async (req, res) => {
    try {
      const groups = await storage.getUserGroups();
      // Ensure we always return an array
      res.json(Array.isArray(groups) ? groups : []);
    } catch (error) {
      console.error('Error fetching user groups:', error);
      res.status(500).json({ message: 'Failed to fetch user groups' });
    }
  });

  app.get('/api/admin/user-groups/:id', requireAuth, async (req, res) => {
    try {
      const group = await storage.getUserGroup(parseInt(req.params.id));
      if (!group) {
        return res.status(404).json({ message: 'User group not found' });
      }
      res.json(group);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user group' });
    }
  });

  app.put('/api/admin/groups/:id/permissions', requireAuth, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const { permissionIds } = req.body;

      await storage.updateGroupPermissions(groupId, permissionIds);

      // Log activity
      await storage.logUserActivity({
        userId: (req.user as any).id,
        action: 'UPDATE_GROUP_PERMISSIONS',
        details: { groupId, permissionIds },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'Group permissions updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update group permissions' });
    }
  });

  app.get('/api/admin/user-groups/:id/permissions', requireAuth, async (req, res) => {
    try {
      const permissions = await storage.getGroupPermissions(parseInt(req.params.id));
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch group permissions' });
    }
  });

  app.post('/api/admin/user-groups', requireAuth, async (req, res) => {
    try {
      const validatedData = insertUserGroupSchema.parse(req.body);
      const group = await storage.createUserGroup(validatedData);

      // Log activity
      await storage.logUserActivity({
        userId: (req.user as any).id,
        action: 'CREATE_USER_GROUP',
        details: { groupId: group.id, name: group.name },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(group);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create user group' });
    }
  });

  app.put('/api/admin/user-groups/:id', requireAuth, async (req, res) => {
    try {
      const validatedData = insertUserGroupSchema.partial().parse(req.body);
      const group = await storage.updateUserGroup(parseInt(req.params.id), validatedData);

      // Log activity
      await storage.logUserActivity({
        userId: (req.user as any).id,
        action: 'UPDATE_USER_GROUP',
        details: { groupId: group.id, changes: validatedData },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(group);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update user group' });
    }
  });

  app.delete('/api/admin/user-groups/:id', requireAuth, async (req, res) => {
    try {
      await storage.deleteUserGroup(parseInt(req.params.id));

      // Log activity
      await storage.logUserActivity({
        userId: (req.user as any).id,
        action: 'DELETE_USER_GROUP',
        details: { groupId: parseInt(req.params.id) },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: 'Failed to delete user group' });
    }
  });

  // Permissions Management Routes
  app.get('/api/admin/permissions', requireAuth, async (req, res) => {
    try {
      const { module } = req.query;
      const permissions = module 
        ? await storage.getPermissionsByModule(module as string)
        : await storage.getPermissions();
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch permissions' });
    }
  });

  app.get('/api/admin/permissions/:id', requireAuth, async (req, res) => {
    try {
      const permission = await storage.getPermission(parseInt(req.params.id));
      if (!permission) {
        return res.status(404).json({ message: 'Permission not found' });
      }
      res.json(permission);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch permission' });
    }
  });

  app.post('/api/admin/permissions', requireAuth, async (req, res) => {
    try {
      const validatedData = insertPermissionSchema.parse(req.body);
      const permission = await storage.createPermission(validatedData);

      // Log activity
      await storage.logUserActivity({
        userId: (req.user as any).id,
        action: 'CREATE_PERMISSION',
        details: { permissionId: permission.id, key: permission.key },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(permission);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create permission' });
    }
  });

  app.put('/api/admin/permissions/:id', requireAuth, async (req, res) => {
    try {
      const validatedData = insertPermissionSchema.partial().parse(req.body);
      const permission = await storage.updatePermission(parseInt(req.params.id), validatedData);

      // Log activity
      await storage.logUserActivity({
        userId: (req.user as any).id,
        action: 'UPDATE_PERMISSION',
        details: { permissionId: permission.id, changes: validatedData },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(permission);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update permission' });
    }
  });

  app.delete('/api/admin/permissions/:id', requireAuth, async (req, res) => {
    try {
      await storage.deletePermission(parseInt(req.params.id));

      // Log activity
      await storage.logUserActivity({
        userId: (req.user as any).id,
        action: 'DELETE_PERMISSION',
        details: { permissionId: parseInt(req.params.id) },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: 'Failed to delete permission' });
    }
  });

  // Group Permissions Management Routes
  app.put('/api/admin/user-groups/:id/permissions', requireAuth, async (req, res) => {
    try {
      const { permissionIds } = req.body;
      const groupId = parseInt(req.params.id);

      if (!Array.isArray(permissionIds)) {
        return res.status(400).json({ message: 'permissionIds must be an array' });
      }

      await storage.setGroupPermissions(groupId, permissionIds);

      // Log activity
      await storage.logUserActivity({
        userId: (req.user as any).id,
        action: 'UPDATE_GROUP_PERMISSIONS',
        details: { groupId, permissionIds },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'Permissions updated successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Failed to update group permissions' });
    }
  });

  app.post('/api/admin/user-groups/:groupId/permissions/:permissionId', requireAuth, async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const permissionId = parseInt(req.params.permissionId);

      const groupPermission = await storage.addGroupPermission(groupId, permissionId);

      // Log activity
      await storage.logUserActivity({
        userId: (req.user as any).id,
        action: 'ADD_GROUP_PERMISSION',
        details: { groupId, permissionId },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(groupPermission);
    } catch (error) {
      res.status(400).json({ message: 'Failed to add group permission' });
    }
  });

  app.delete('/api/admin/user-groups/:groupId/permissions/:permissionId', requireAuth, async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const permissionId = parseInt(req.params.permissionId);

      await storage.removeGroupPermission(groupId, permissionId);

      // Log activity
      await storage.logUserActivity({
        userId: (req.user as any).id,
        action: 'REMOVE_GROUP_PERMISSION',
        details: { groupId, permissionId },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: 'Failed to remove group permission' });
    }
  });

  // User Activity Log Routes
  app.get('/api/admin/activity-log', requireAuth, async (req, res) => {
    try {
      const { limit, offset, userId } = req.query;
      const activities = userId 
        ? await storage.getUserActivity(
            parseInt(userId as string),
            limit ? parseInt(limit as string) : undefined,
            offset ? parseInt(offset as string) : undefined
          )
        : await storage.getAllUserActivity(
            limit ? parseInt(limit as string) : undefined,
            offset ? parseInt(offset as string) : undefined
          );
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch activity log' });
    }
  });

  app.get('/api/admin/users/:id/activity', requireAuth, async (req, res) => {
    try {
      const { limit, offset } = req.query;
      const activities = await storage.getUserActivity(
        parseInt(req.params.id),
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
      );
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user activity' });
    }
  });

  // Template Tags management
  app.get('/api/template-tags', requireAuth, async (req, res) => {
    try {
      const tags = await storage.getTemplateTags();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch template tags' });
    }
  });

  // Template Tags management (Admin only)
  app.get('/api/admin/template-tags', requireAuth, requireRole(['Administradores']), async (req, res) => {
    try {
      const tags = await storage.getTemplateTags();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch template tags' });
    }
  });

  app.post('/api/admin/template-tags', requireAuth, requireRole(['Administradores']), async (req, res) => {
    try {
      const validatedData = insertTemplateTagSchema.parse(req.body);
      const tag = await storage.createTemplateTag(validatedData);
      res.status(201).json(tag);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create template tag' });
    }
  });

  app.put('/api/admin/template-tags/:id', requireAuth, requireRole(['Administradores']), async (req, res) => {
    try {
      const validatedData = insertTemplateTagSchema.partial().parse(req.body);
      const tag = await storage.updateTemplateTag(parseInt(req.params.id), validatedData);
      res.json(tag);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update template tag' });
    }
  });

  app.delete('/api/admin/template-tags/:id', requireAuth, requireRole(['Administradores']), async (req, res) => {
    try {
      await storage.deleteTemplateTag(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: 'Failed to delete template tag' });
    }
  });

  // Middleware to ensure all API routes return JSON and handle errors
  app.use('/api', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Set JSON content type for all API routes
    res.setHeader('Content-Type', 'application/json');

    // Override res.send to ensure JSON responses
    const originalSend = res.send;
    res.send = function(data) {
      if (typeof data === 'string' && !data.startsWith('{') && !data.startsWith('[')) {
        // Convert plain text to JSON
        return originalSend.call(this, JSON.stringify({ message: data }));
      }
      return originalSend.call(this, data);
    };

    next();
  });

  // Error handling middleware specifically for API routes
  app.use('/api/*', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Error:', err);

    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      const statusCode = err.status || err.statusCode || 500;
      const message = err.message || 'Internal server error';

      res.status(statusCode).json({ 
        message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  });

  // Catch-all route for API 404s
  app.use('/api/*', (req: express.Request, res: express.Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({ message: 'API endpoint not found' });
  });

  const httpServer = createServer(app);
  return httpServer;
}