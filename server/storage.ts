import { 
  users, partners, suppliers, tools, mySuppliers, products, templates, 
  tickets, materials, news, reviews, type User, type InsertUser,
  type Partner, type InsertPartner, type Supplier, type InsertSupplier,
  type Tool, type InsertTool, type MySupplier, type InsertMySupplier,
  type Product, type InsertProduct, type Template, type InsertTemplate,
  type Ticket, type InsertTicket, type Material, type InsertMaterial,
  type News, type InsertNews, type Review, type InsertReview
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, sql } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  updateUserAiCredits(id: number, credits: number): Promise<User>;

  // Partners
  getPartners(limit?: number, offset?: number): Promise<Partner[]>;
  getPartner(id: number): Promise<Partner | undefined>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: number, updates: Partial<Partner>): Promise<Partner>;
  searchPartners(query: string, category?: string): Promise<Partner[]>;

  // Suppliers
  getSuppliers(limit?: number, offset?: number): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, updates: Partial<Supplier>): Promise<Supplier>;
  searchSuppliers(query: string, productType?: string, country?: string): Promise<Supplier[]>;

  // Tools
  getTools(limit?: number, offset?: number): Promise<Tool[]>;
  getTool(id: number): Promise<Tool | undefined>;
  createTool(tool: InsertTool): Promise<Tool>;
  updateTool(id: number, updates: Partial<Tool>): Promise<Tool>;
  searchTools(query: string, primaryFunction?: string): Promise<Tool[]>;

  // My Suppliers (CRM)
  getMySuppliers(userId: number, limit?: number, offset?: number): Promise<MySupplier[]>;
  getMySupplier(id: number, userId: number): Promise<MySupplier | undefined>;
  createMySupplier(mySupplier: InsertMySupplier): Promise<MySupplier>;
  updateMySupplier(id: number, userId: number, updates: Partial<MySupplier>): Promise<MySupplier>;
  deleteMySupplier(id: number, userId: number): Promise<void>;

  // Products
  getProducts(userId: number, limit?: number, offset?: number): Promise<Product[]>;
  getProduct(id: number, userId: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, userId: number, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: number, userId: number): Promise<void>;

  // Templates
  getTemplates(limit?: number, offset?: number): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, updates: Partial<Template>): Promise<Template>;
  searchTemplates(query: string, category?: string, language?: string): Promise<Template[]>;

  // Tickets
  getTickets(userId?: number, limit?: number, offset?: number): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket>;
  getUserTickets(userId: number, limit?: number, offset?: number): Promise<Ticket[]>;

  // Materials
  getMaterials(accessLevel?: string, limit?: number, offset?: number): Promise<Material[]>;
  getMaterial(id: number): Promise<Material | undefined>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterial(id: number, updates: Partial<Material>): Promise<Material>;
  searchMaterials(query: string, category?: string, accessLevel?: string): Promise<Material[]>;

  // News
  getNews(limit?: number, offset?: number): Promise<News[]>;
  getNewsItem(id: number): Promise<News | undefined>;
  createNews(news: InsertNews): Promise<News>;
  updateNews(id: number, updates: Partial<News>): Promise<News>;
  getLatestNews(limit?: number): Promise<News[]>;

  // Reviews
  getReviews(itemType: string, itemId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  getAverageRating(itemType: string, itemId: number): Promise<number>;

  // Dashboard metrics
  getDashboardMetrics(userId: number): Promise<{
    suppliersCount: number;
    productsCount: number;
    aiCredits: number;
    openTickets: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserAiCredits(id: number, credits: number): Promise<User> {
    const [user] = await db.update(users)
      .set({ aiCredits: sql`${users.aiCredits} + ${credits}` })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getPartners(limit = 50, offset = 0): Promise<Partner[]> {
    return await db.select().from(partners).limit(limit).offset(offset).orderBy(desc(partners.createdAt));
  }

  async getPartner(id: number): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id));
    return partner || undefined;
  }

  async createPartner(partner: InsertPartner): Promise<Partner> {
    const [created] = await db.insert(partners).values(partner).returning();
    return created;
  }

  async updatePartner(id: number, updates: Partial<Partner>): Promise<Partner> {
    const [partner] = await db.update(partners).set(updates).where(eq(partners.id, id)).returning();
    return partner;
  }

  async searchPartners(query: string, category?: string): Promise<Partner[]> {
    let whereClause = like(partners.name, `%${query}%`);
    if (category) {
      whereClause = and(whereClause, eq(partners.category, category)) as any;
    }
    return await db.select().from(partners).where(whereClause);
  }

  async getSuppliers(limit = 50, offset = 0): Promise<Supplier[]> {
    return await db.select().from(suppliers).limit(limit).offset(offset).orderBy(desc(suppliers.createdAt));
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier || undefined;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [created] = await db.insert(suppliers).values(supplier).returning();
    return created;
  }

  async updateSupplier(id: number, updates: Partial<Supplier>): Promise<Supplier> {
    const [supplier] = await db.update(suppliers).set(updates).where(eq(suppliers.id, id)).returning();
    return supplier;
  }

  async searchSuppliers(query: string, productType?: string, country?: string): Promise<Supplier[]> {
    let whereClause = like(suppliers.name, `%${query}%`);
    if (productType) {
      whereClause = and(whereClause, eq(suppliers.productType, productType)) as any;
    }
    if (country) {
      whereClause = and(whereClause, eq(suppliers.country, country)) as any;
    }
    return await db.select().from(suppliers).where(whereClause);
  }

  async getTools(limit = 50, offset = 0): Promise<Tool[]> {
    return await db.select().from(tools).limit(limit).offset(offset).orderBy(desc(tools.createdAt));
  }

  async getTool(id: number): Promise<Tool | undefined> {
    const [tool] = await db.select().from(tools).where(eq(tools.id, id));
    return tool || undefined;
  }

  async createTool(tool: InsertTool): Promise<Tool> {
    const [created] = await db.insert(tools).values(tool).returning();
    return created;
  }

  async updateTool(id: number, updates: Partial<Tool>): Promise<Tool> {
    const [tool] = await db.update(tools).set(updates).where(eq(tools.id, id)).returning();
    return tool;
  }

  async searchTools(query: string, primaryFunction?: string): Promise<Tool[]> {
    let whereClause = like(tools.name, `%${query}%`);
    if (primaryFunction) {
      whereClause = and(whereClause, eq(tools.primaryFunction, primaryFunction)) as any;
    }
    return await db.select().from(tools).where(whereClause);
  }

  async getMySuppliers(userId: number, limit = 50, offset = 0): Promise<MySupplier[]> {
    return await db.select()
      .from(mySuppliers)
      .where(eq(mySuppliers.userId, userId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(mySuppliers.createdAt));
  }

  async getMySupplier(id: number, userId: number): Promise<MySupplier | undefined> {
    const [supplier] = await db.select()
      .from(mySuppliers)
      .where(and(eq(mySuppliers.id, id), eq(mySuppliers.userId, userId)));
    return supplier || undefined;
  }

  async createMySupplier(mySupplier: InsertMySupplier): Promise<MySupplier> {
    const [created] = await db.insert(mySuppliers).values(mySupplier).returning();
    return created;
  }

  async updateMySupplier(id: number, userId: number, updates: Partial<MySupplier>): Promise<MySupplier> {
    const [supplier] = await db.update(mySuppliers)
      .set(updates)
      .where(and(eq(mySuppliers.id, id), eq(mySuppliers.userId, userId)))
      .returning();
    return supplier;
  }

  async deleteMySupplier(id: number, userId: number): Promise<void> {
    await db.delete(mySuppliers)
      .where(and(eq(mySuppliers.id, id), eq(mySuppliers.userId, userId)));
  }

  async getProducts(userId: number, limit = 50, offset = 0): Promise<Product[]> {
    return await db.select()
      .from(products)
      .where(eq(products.userId, userId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(products.createdAt));
  }

  async getProduct(id: number, userId: number): Promise<Product | undefined> {
    const [product] = await db.select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.userId, userId)));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: number, userId: number, updates: Partial<Product>): Promise<Product> {
    const [product] = await db.update(products)
      .set(updates)
      .where(and(eq(products.id, id), eq(products.userId, userId)))
      .returning();
    return product;
  }

  async deleteProduct(id: number, userId: number): Promise<void> {
    await db.delete(products)
      .where(and(eq(products.id, id), eq(products.userId, userId)));
  }

  async getTemplates(limit = 50, offset = 0): Promise<Template[]> {
    return await db.select()
      .from(templates)
      .where(eq(templates.isPublic, true))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(templates.createdAt));
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [created] = await db.insert(templates).values(template).returning();
    return created;
  }

  async updateTemplate(id: number, updates: Partial<Template>): Promise<Template> {
    const [template] = await db.update(templates).set(updates).where(eq(templates.id, id)).returning();
    return template;
  }

  async searchTemplates(query: string, category?: string, language?: string): Promise<Template[]> {
    let whereClause = and(
      or(like(templates.title, `%${query}%`), like(templates.content, `%${query}%`)),
      eq(templates.isPublic, true)
    );
    if (category) {
      whereClause = and(whereClause, eq(templates.category, category)) as any;
    }
    if (language) {
      whereClause = and(whereClause, eq(templates.language, language)) as any;
    }
    return await db.select().from(templates).where(whereClause);
  }

  async getTickets(userId?: number, limit = 50, offset = 0): Promise<Ticket[]> {
    if (userId) {
      return await db.select().from(tickets)
        .where(eq(tickets.userId, userId))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(tickets.createdAt));
    }
    return await db.select().from(tickets)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tickets.createdAt));
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket || undefined;
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const [created] = await db.insert(tickets).values(ticket).returning();
    return created;
  }

  async updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket> {
    const [ticket] = await db.update(tickets).set(updates).where(eq(tickets.id, id)).returning();
    return ticket;
  }

  async getUserTickets(userId: number, limit = 50, offset = 0): Promise<Ticket[]> {
    return await db.select()
      .from(tickets)
      .where(eq(tickets.userId, userId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tickets.createdAt));
  }

  async getMaterials(accessLevel?: string, limit = 50, offset = 0): Promise<Material[]> {
    let query = db.select().from(materials).where(eq(materials.isActive, true));
    if (accessLevel) {
      query = query.where(and(eq(materials.isActive, true), eq(materials.accessLevel, accessLevel)));
    }
    return await query.limit(limit).offset(offset).orderBy(desc(materials.createdAt));
  }

  async getMaterial(id: number): Promise<Material | undefined> {
    const [material] = await db.select().from(materials).where(eq(materials.id, id));
    return material || undefined;
  }

  async createMaterial(material: InsertMaterial): Promise<Material> {
    const [created] = await db.insert(materials).values(material).returning();
    return created;
  }

  async updateMaterial(id: number, updates: Partial<Material>): Promise<Material> {
    const [material] = await db.update(materials).set(updates).where(eq(materials.id, id)).returning();
    return material;
  }

  async searchMaterials(query: string, category?: string, accessLevel?: string): Promise<Material[]> {
    let whereClause = and(
      or(like(materials.title, `%${query}%`), like(materials.description, `%${query}%`)),
      eq(materials.isActive, true)
    );
    if (category) {
      whereClause = and(whereClause, eq(materials.category, category)) as any;
    }
    if (accessLevel) {
      whereClause = and(whereClause, eq(materials.accessLevel, accessLevel)) as any;
    }
    return await db.select().from(materials).where(whereClause);
  }

  async getNews(limit = 50, offset = 0): Promise<News[]> {
    return await db.select()
      .from(news)
      .where(eq(news.isActive, true))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(news.createdAt));
  }

  async getNewsItem(id: number): Promise<News | undefined> {
    const [newsItem] = await db.select().from(news).where(eq(news.id, id));
    return newsItem || undefined;
  }

  async createNews(newsItem: InsertNews): Promise<News> {
    const [created] = await db.insert(news).values(newsItem).returning();
    return created;
  }

  async updateNews(id: number, updates: Partial<News>): Promise<News> {
    const [newsItem] = await db.update(news).set(updates).where(eq(news.id, id)).returning();
    return newsItem;
  }

  async getLatestNews(limit = 10): Promise<News[]> {
    return await db.select()
      .from(news)
      .where(eq(news.isActive, true))
      .limit(limit)
      .orderBy(desc(news.createdAt));
  }

  async getReviews(itemType: string, itemId: number): Promise<Review[]> {
    return await db.select()
      .from(reviews)
      .where(and(eq(reviews.itemType, itemType), eq(reviews.itemId, itemId), eq(reviews.isApproved, true)))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();
    return created;
  }

  async getAverageRating(itemType: string, itemId: number): Promise<number> {
    const result = await db.select({
      avg: sql<number>`AVG(${reviews.rating})`,
    })
    .from(reviews)
    .where(and(eq(reviews.itemType, itemType), eq(reviews.itemId, itemId), eq(reviews.isApproved, true)));
    
    return result[0]?.avg || 0;
  }

  async getDashboardMetrics(userId: number): Promise<{
    suppliersCount: number;
    productsCount: number;
    aiCredits: number;
    openTickets: number;
  }> {
    const [suppliersResult] = await db.select({
      count: sql<number>`COUNT(*)`,
    }).from(mySuppliers).where(eq(mySuppliers.userId, userId));

    const [productsResult] = await db.select({
      count: sql<number>`COUNT(*)`,
    }).from(products).where(eq(products.userId, userId));

    const [user] = await db.select({
      aiCredits: users.aiCredits,
    }).from(users).where(eq(users.id, userId));

    const [ticketsResult] = await db.select({
      count: sql<number>`COUNT(*)`,
    }).from(tickets).where(and(eq(tickets.userId, userId), eq(tickets.status, 'open')));

    return {
      suppliersCount: suppliersResult?.count || 0,
      productsCount: productsResult?.count || 0,
      aiCredits: user?.aiCredits || 0,
      openTickets: ticketsResult?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
