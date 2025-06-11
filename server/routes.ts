import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "./auth/passport";
import authRoutes from "./auth/routes";
import { requireAuth, requireRole, requireAdmin, requireSupport, AuthenticatedRequest } from "./auth/middleware";
import { storage } from "./storage";
import { getCachedVideos } from "./youtube";
import { insertUserSchema, insertPartnerSchema, insertSupplierSchema, insertToolSchema, insertMySupplierSchema, insertProductSchema, insertTemplateSchema, insertTicketSchema, insertMaterialSchema, insertNewsSchema, insertReviewSchema, insertMaterialTypeSchema, insertMaterialCategorySchema, insertSoftwareTypeSchema, insertSupplierTypeSchema, insertProductCategorySchema, insertPartnerCategorySchema, insertUserGroupSchema, insertPermissionSchema, insertUserActivityLogSchema, insertTemplateTagSchema, insertAiPromptSchema, insertAiPromptCategorySchema } from "@shared/schema";
import { users, tickets, materials, templates, aiPrompts } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

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

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Authentication routes
  app.use('/api/auth', authRoutes);

  // Users API
  app.get("/api/users", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const allUsers = await storage.getUsers();
      res.json(allUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid user data", errors: result.error.issues });
      }
      const user = await storage.createUser(result.data);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertUserSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid user data", errors: result.error.issues });
      }
      const user = await storage.updateUser(id, result.data);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Partners API
  app.get("/api/partners", async (req, res) => {
    try {
      const partners = await storage.getPartners();
      res.json(partners);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch partners" });
    }
  });

  app.post("/api/partners", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const result = insertPartnerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid partner data", errors: result.error.issues });
      }
      const partner = await storage.createPartner(result.data);
      res.status(201).json(partner);
    } catch (error) {
      res.status(500).json({ message: "Failed to create partner" });
    }
  });

  app.put("/api/partners/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertPartnerSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid partner data", errors: result.error.issues });
      }
      const partner = await storage.updatePartner(id, result.data);
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      res.json(partner);
    } catch (error) {
      res.status(500).json({ message: "Failed to update partner" });
    }
  });

  app.delete("/api/partners/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePartner(id);
      res.json({ message: "Partner deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete partner" });
    }
  });

  // Partner Categories API
  app.get("/api/partner-categories", async (req, res) => {
    try {
      const categories = await storage.getPartnerCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch partner categories" });
    }
  });

  app.post("/api/partner-categories", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const result = insertPartnerCategorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid category data", errors: result.error.issues });
      }
      const category = await storage.createPartnerCategory(result.data);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create partner category" });
    }
  });

  // Partner Comments API
  app.get("/api/partners/:id/comments", async (req, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      const comments = await storage.getPartnerComments(partnerId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch partner comments" });
    }
  });

  app.post("/api/partners/:id/comments", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      const { comment, rating } = req.body;
      
      if (!comment || !rating) {
        return res.status(400).json({ message: "Comment and rating are required" });
      }

      const newComment = await storage.createPartnerComment({
        partnerId,
        userId: req.user!.id,
        comment,
        rating,
        status: 'approved'
      });
      
      res.status(201).json(newComment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Materials API
  app.get("/api/materials", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const materials = await storage.getMaterials();
      res.json(materials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch materials" });
    }
  });

  app.post("/api/materials", requireRole(['SUPORTE', 'ADM']), async (req: AuthenticatedRequest, res) => {
    try {
      const result = insertMaterialSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid material data", errors: result.error.issues });
      }
      const material = await storage.createMaterial(result.data);
      res.status(201).json(material);
    } catch (error) {
      res.status(500).json({ message: "Failed to create material" });
    }
  });

  // Templates API
  app.get("/api/templates", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", requireRole(['SUPORTE', 'ADM']), async (req: AuthenticatedRequest, res) => {
    try {
      const result = insertTemplateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid template data", errors: result.error.issues });
      }
      const template = await storage.createTemplate(result.data);
      res.status(201).json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  // AI Prompts API
  app.get("/api/ai-prompts", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const prompts = await storage.getAiPrompts();
      res.json(prompts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI prompts" });
    }
  });

  app.post("/api/ai-prompts", requireRole(['SUPORTE', 'ADM']), async (req: AuthenticatedRequest, res) => {
    try {
      const result = insertAiPromptSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid AI prompt data", errors: result.error.issues });
      }
      const prompt = await storage.createAiPrompt(result.data);
      res.status(201).json(prompt);
    } catch (error) {
      res.status(500).json({ message: "Failed to create AI prompt" });
    }
  });

  // YouTube Videos API
  app.get("/api/youtube-videos", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const videos = await getCachedVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch YouTube videos" });
    }
  });

  // Tickets API
  app.get("/api/tickets", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const tickets = await storage.getTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.post("/api/tickets", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const result = insertTicketSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid ticket data", errors: result.error.issues });
      }
      const ticket = await storage.createTicket({
        ...result.data,
        userId: req.user!.id
      });
      res.status(201).json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to create ticket" });
    }
  });

  return httpServer;
}