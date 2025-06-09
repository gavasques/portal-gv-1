import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { insertUserSchema, insertPartnerSchema, insertSupplierSchema, insertToolSchema, insertMySupplierSchema, insertProductSchema, insertTemplateSchema, insertTicketSchema, insertMaterialSchema, insertNewsSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

// Configure passport
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 24 hours
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Authentication required' });
  };

  const requireRole = (roles: string[]) => (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.accessLevel)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    if (req.user) {
      const { password: _, ...userWithoutPassword } = req.user as any;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ message: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', (req, res) => {
    if (req.user) {
      const { password: _, ...userWithoutPassword } = req.user as any;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/metrics', requireAuth, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics((req.user as any).id);
      res.json(metrics);
    } catch (error) {
      console.error('Dashboard metrics error:', error);
      res.status(500).json({ message: 'Failed to load dashboard metrics' });
    }
  });

  app.get('/api/news/latest', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const news = await storage.getLatestNews(limit);
      res.json(news);
    } catch (error) {
      console.error('Latest news error:', error);
      res.status(500).json({ message: 'Failed to load latest news' });
    }
  });

  // Partners routes
  app.get('/api/partners', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const partners = await storage.getPartners(limit, offset);
      res.json(partners);
    } catch (error) {
      res.status(500).json({ message: 'Failed to load partners' });
    }
  });

  app.get('/api/partners/search', async (req, res) => {
    try {
      const { q: query, category } = req.query;
      if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
      }
      const partners = await storage.searchPartners(query as string, category as string);
      res.json(partners);
    } catch (error) {
      res.status(500).json({ message: 'Search failed' });
    }
  });

  app.get('/api/partners/:id', async (req, res) => {
    try {
      const partner = await storage.getPartner(parseInt(req.params.id));
      if (!partner) {
        return res.status(404).json({ message: 'Partner not found' });
      }
      res.json(partner);
    } catch (error) {
      res.status(500).json({ message: 'Failed to load partner' });
    }
  });

  app.post('/api/partners', requireAuth, requireRole(['Administradores']), async (req, res) => {
    try {
      const partnerData = insertPartnerSchema.parse(req.body);
      const partner = await storage.createPartner(partnerData);
      res.json(partner);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create partner' });
    }
  });

  // Suppliers routes
  app.get('/api/suppliers', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const suppliers = await storage.getSuppliers(limit, offset);
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to load suppliers' });
    }
  });

  app.get('/api/suppliers/search', async (req, res) => {
    try {
      const { q: query, productType, country } = req.query;
      if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
      }
      const suppliers = await storage.searchSuppliers(query as string, productType as string, country as string);
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: 'Search failed' });
    }
  });

  app.get('/api/suppliers/:id', async (req, res) => {
    try {
      const supplier = await storage.getSupplier(parseInt(req.params.id));
      if (!supplier) {
        return res.status(404).json({ message: 'Supplier not found' });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: 'Failed to load supplier' });
    }
  });

  app.post('/api/suppliers', requireAuth, requireRole(['Administradores']), async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create supplier' });
    }
  });

  // Tools routes
  app.get('/api/tools', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const tools = await storage.getTools(limit, offset);
      res.json(tools);
    } catch (error) {
      res.status(500).json({ message: 'Failed to load tools' });
    }
  });

  app.get('/api/tools/search', async (req, res) => {
    try {
      const { q: query, primaryFunction } = req.query;
      if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
      }
      const tools = await storage.searchTools(query as string, primaryFunction as string);
      res.json(tools);
    } catch (error) {
      res.status(500).json({ message: 'Search failed' });
    }
  });

  app.get('/api/tools/:id', async (req, res) => {
    try {
      const tool = await storage.getTool(parseInt(req.params.id));
      if (!tool) {
        return res.status(404).json({ message: 'Tool not found' });
      }
      res.json(tool);
    } catch (error) {
      res.status(500).json({ message: 'Failed to load tool' });
    }
  });

  app.post('/api/tools', requireAuth, requireRole(['Administradores']), async (req, res) => {
    try {
      const toolData = insertToolSchema.parse(req.body);
      const tool = await storage.createTool(toolData);
      res.json(tool);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create tool' });
    }
  });

  // My Suppliers (CRM) routes
  app.get('/api/my-suppliers', requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const suppliers = await storage.getMySuppliers((req.user as any).id, limit, offset);
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to load suppliers' });
    }
  });

  app.get('/api/my-suppliers/:id', requireAuth, async (req, res) => {
    try {
      const supplier = await storage.getMySupplier(parseInt(req.params.id), (req.user as any).id);
      if (!supplier) {
        return res.status(404).json({ message: 'Supplier not found' });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: 'Failed to load supplier' });
    }
  });

  app.post('/api/my-suppliers', requireAuth, async (req, res) => {
    try {
      const supplierData = insertMySupplierSchema.parse({
        ...req.body,
        userId: (req.user as any).id,
      });
      const supplier = await storage.createMySupplier(supplierData);
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create supplier' });
    }
  });

  app.put('/api/my-suppliers/:id', requireAuth, async (req, res) => {
    try {
      const updates = insertMySupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateMySupplier(parseInt(req.params.id), (req.user as any).id, updates);
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update supplier' });
    }
  });

  app.delete('/api/my-suppliers/:id', requireAuth, async (req, res) => {
    try {
      await storage.deleteMySupplier(parseInt(req.params.id), (req.user as any).id);
      res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete supplier' });
    }
  });

  // Products routes
  app.get('/api/products', requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const products = await storage.getProducts((req.user as any).id, limit, offset);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Failed to load products' });
    }
  });

  app.get('/api/products/:id', requireAuth, async (req, res) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id), (req.user as any).id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Failed to load product' });
    }
  });

  app.post('/api/products', requireAuth, async (req, res) => {
    try {
      const productData = insertProductSchema.parse({
        ...req.body,
        userId: (req.user as any).id,
      });
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create product' });
    }
  });

  app.put('/api/products/:id', requireAuth, async (req, res) => {
    try {
      const updates = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(parseInt(req.params.id), (req.user as any).id, updates);
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update product' });
    }
  });

  app.delete('/api/products/:id', requireAuth, async (req, res) => {
    try {
      await storage.deleteProduct(parseInt(req.params.id), (req.user as any).id);
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete product' });
    }
  });

  // Templates routes
  app.get('/api/templates', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const templates = await storage.getTemplates(limit, offset);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: 'Failed to load templates' });
    }
  });

  app.get('/api/templates/search', async (req, res) => {
    try {
      const { q: query, category, language } = req.query;
      if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
      }
      const templates = await storage.searchTemplates(query as string, category as string, language as string);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: 'Search failed' });
    }
  });

  app.get('/api/templates/:id', async (req, res) => {
    try {
      const template = await storage.getTemplate(parseInt(req.params.id));
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: 'Failed to load template' });
    }
  });

  app.post('/api/templates', requireAuth, requireRole(['Administradores']), async (req, res) => {
    try {
      const templateData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(templateData);
      res.json(template);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create template' });
    }
  });

  // Tickets routes
  app.get('/api/tickets', requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const user = req.user as any;
      
      let tickets;
      if (user.accessLevel === 'Administradores' || user.accessLevel === 'Suporte') {
        tickets = await storage.getTickets(undefined, limit, offset);
      } else {
        tickets = await storage.getUserTickets(user.id, limit, offset);
      }
      
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: 'Failed to load tickets' });
    }
  });

  app.get('/api/tickets/:id', requireAuth, async (req, res) => {
    try {
      const ticket = await storage.getTicket(parseInt(req.params.id));
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      
      const user = req.user as any;
      // Users can only see their own tickets unless they're admin/support
      if (ticket.userId !== user.id && !['Administradores', 'Suporte'].includes(user.accessLevel)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: 'Failed to load ticket' });
    }
  });

  app.post('/api/tickets', requireAuth, async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse({
        ...req.body,
        userId: (req.user as any).id,
      });
      const ticket = await storage.createTicket(ticketData);
      res.json(ticket);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create ticket' });
    }
  });

  app.put('/api/tickets/:id', requireAuth, async (req, res) => {
    try {
      const updates = insertTicketSchema.partial().parse(req.body);
      const ticket = await storage.updateTicket(parseInt(req.params.id), updates);
      res.json(ticket);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update ticket' });
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
      } else {
        // Aluno, Aluno Pro, Suporte, Administradores can see both Public and Restricted
        accessLevel = undefined;
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

  app.post('/api/materials', requireAuth, requireRole(['Administradores']), async (req, res) => {
    try {
      const materialData = insertMaterialSchema.parse(req.body);
      const material = await storage.createMaterial(materialData);
      res.json(material);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create material' });
    }
  });

  // Reviews routes
  app.get('/api/reviews/:itemType/:itemId', async (req, res) => {
    try {
      const { itemType, itemId } = req.params;
      const reviews = await storage.getReviews(itemType, parseInt(itemId));
      const averageRating = await storage.getAverageRating(itemType, parseInt(itemId));
      res.json({ reviews, averageRating });
    } catch (error) {
      res.status(500).json({ message: 'Failed to load reviews' });
    }
  });

  app.post('/api/reviews', requireAuth, async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: (req.user as any).id,
      });
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create review' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
