import { 
  users, partners, suppliers, tools, mySuppliers, products, templates, tickets, ticketFiles, ticketMessages,
  materials, news, reviews, userGroups, permissions, groupPermissions, userActivityLog, authTokens,
  materialTypes, materialCategories, softwareTypes, supplierTypes, productCategories, partnerCategories, templateTags, templateTagRelations
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, sql } from "drizzle-orm";

import type { 
  User, InsertUser, Partner, InsertPartner, Supplier, InsertSupplier, Tool, InsertTool,
  MySupplier, InsertMySupplier, Product, InsertProduct, Template, InsertTemplate,
  Ticket, InsertTicket, Material, InsertMaterial, News, InsertNews, Review, InsertReview,
  UserGroup, InsertUserGroup, Permission, InsertPermission, GroupPermission, InsertGroupPermission,
  UserActivityLog, InsertUserActivityLog, AuthToken, InsertAuthToken,
  MaterialType, InsertMaterialType, MaterialCategory, InsertMaterialCategory, SoftwareType, InsertSoftwareType, SupplierType, InsertSupplierType,
  ProductCategory, InsertProductCategory, PartnerCategory, InsertPartnerCategory,
  TemplateTag, InsertTemplateTag
} from "@shared/schema";
export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  updateProfile(id: number, updates: { fullName?: string; cpf?: string; phone?: string }): Promise<User>;
  updateUserAiCredits(id: number, credits: number): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getUsers(limit?: number, offset?: number, groupId?: number, isActive?: boolean, search?: string): Promise<User[]>;
  getUsersWithGroups(limit?: number, offset?: number, groupId?: number, isActive?: boolean, search?: string): Promise<(User & { group: UserGroup | null })[]>;
  getUserPermissions(userId: number): Promise<Permission[]>;

  // User Groups management
  getUserGroups(): Promise<UserGroup[]>;
  getUserGroup(id: number): Promise<UserGroup | undefined>;
  createUserGroup(group: InsertUserGroup): Promise<UserGroup>;
  updateUserGroup(id: number, updates: Partial<UserGroup>): Promise<UserGroup>;
  deleteUserGroup(id: number): Promise<void>;

  // Permissions management
  getPermissions(): Promise<Permission[]>;
  getPermission(id: number): Promise<Permission | undefined>;
  getPermissionsByModule(module: string): Promise<Permission[]>;
  createPermission(permission: InsertPermission): Promise<Permission>;
  updatePermission(id: number, updates: Partial<Permission>): Promise<Permission>;
  deletePermission(id: number): Promise<void>;

  // Group Permissions management
  getGroupPermissions(groupId: number): Promise<Permission[]>;
  setGroupPermissions(groupId: number, permissionIds: number[]): Promise<void>;
  updateGroupPermissions(groupId: number, permissionIds: number[]): Promise<void>;
  addGroupPermission(groupId: number, permissionId: number): Promise<GroupPermission>;
  removeGroupPermission(groupId: number, permissionId: number): Promise<void>;

  // User Activity Log
  logUserActivity(log: InsertUserActivityLog): Promise<UserActivityLog>;
  getUserActivity(userId: number, limit?: number, offset?: number): Promise<UserActivityLog[]>;
  getAllUserActivity(limit?: number, offset?: number): Promise<UserActivityLog[]>;

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

  // Template Tags
  getTemplateTags(): Promise<TemplateTag[]>;
  getTemplateTag(id: number): Promise<TemplateTag | undefined>;
  createTemplateTag(tag: InsertTemplateTag): Promise<TemplateTag>;
  updateTemplateTag(id: number, updates: Partial<TemplateTag>): Promise<TemplateTag>;
  deleteTemplateTag(id: number): Promise<void>;

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

  // Auth tokens for password reset and magic links
  createAuthToken(token: InsertAuthToken): Promise<AuthToken>;
  getAuthToken(token: string): Promise<AuthToken | undefined>;
  markTokenAsUsed(token: string): Promise<void>;
  cleanupExpiredTokens(): Promise<void>;

  // Cadastros - Lookup table management
  // Material Types
  getMaterialTypes(limit?: number, offset?: number): Promise<MaterialType[]>;
  getMaterialType(id: number): Promise<MaterialType | undefined>;
  createMaterialType(materialType: InsertMaterialType): Promise<MaterialType>;
  updateMaterialType(id: number, updates: Partial<MaterialType>): Promise<MaterialType>;
  deleteMaterialType(id: number): Promise<void>;

  // Software Types
  getSoftwareTypes(limit?: number, offset?: number): Promise<SoftwareType[]>;
  getSoftwareType(id: number): Promise<SoftwareType | undefined>;
  createSoftwareType(softwareType: InsertSoftwareType): Promise<SoftwareType>;
  updateSoftwareType(id: number, updates: Partial<SoftwareType>): Promise<SoftwareType>;
  deleteSoftwareType(id: number): Promise<void>;

  // Supplier Types
  getSupplierTypes(limit?: number, offset?: number): Promise<SupplierType[]>;
  getSupplierTypeById(id: number): Promise<SupplierType | undefined>;
  createSupplierType(supplierType: InsertSupplierType): Promise<SupplierType>;
  updateSupplierType(id: number, updates: Partial<SupplierType>): Promise<SupplierType>;
  deleteSupplierType(id: number): Promise<void>;

  // Product Categories
  getProductCategories(limit?: number, offset?: number): Promise<ProductCategory[]>;
  getProductCategory(id: number): Promise<ProductCategory | undefined>;
  createProductCategory(productCategory: InsertProductCategory): Promise<ProductCategory>;
  updateProductCategory(id: number, updates: Partial<ProductCategory>): Promise<ProductCategory>;
  deleteProductCategory(id: number): Promise<void>;

  // Partner Categories
  getPartnerCategories(limit?: number, offset?: number): Promise<PartnerCategory[]>;
  getPartnerCategoryById(id: number): Promise<PartnerCategory | undefined>;
  createPartnerCategory(partnerCategory: InsertPartnerCategory): Promise<PartnerCategory>;
  updatePartnerCategory(id: number, updates: Partial<PartnerCategory>): Promise<PartnerCategory>;
  deletePartnerCategory(id: number): Promise<void>;
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

  async updateProfile(id: number, updates: { fullName?: string; cpf?: string; phone?: string }): Promise<User> {
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

  async deleteUser(id: number): Promise<void> {
    // Delete related records first
    await db.delete(userActivityLog).where(eq(userActivityLog.userId, id));
    await db.delete(tickets).where(eq(tickets.userId, id));
    await db.delete(mySuppliers).where(eq(mySuppliers.userId, id));
    
    // Finally delete the user
    await db.delete(users).where(eq(users.id, id));
  }

  async getUsers(limit = 50, offset = 0, groupId?: number, isActive?: boolean, search?: string): Promise<User[]> {
    let query = db.select().from(users);

    const conditions = [];
    if (groupId !== undefined) conditions.push(eq(users.groupId, groupId));
    if (isActive !== undefined) conditions.push(eq(users.isActive, isActive));
    if (search) {
      conditions.push(
        or(
          like(users.fullName, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.limit(limit).offset(offset).orderBy(desc(users.createdAt));
  }

  async getUsersWithGroups(limit = 50, offset = 0, groupId?: number, isActive?: boolean, search?: string): Promise<(User & { group: UserGroup | null })[]> {
    const conditions = [];
    if (groupId !== undefined) conditions.push(eq(users.groupId, groupId));
    if (isActive !== undefined) conditions.push(eq(users.isActive, isActive));
    if (search) {
      conditions.push(
        or(
          like(users.fullName, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    const baseQuery = db.select({
      id: users.id,
      email: users.email,
      password: users.password,
      fullName: users.fullName,
      isActive: users.isActive,
      createdAt: users.createdAt,
      groupId: users.groupId,
      aiCredits: users.aiCredits,
      googleId: users.googleId,
      profileImage: users.profileImage,
      stripeCustomerId: users.stripeCustomerId,
      stripeSubscriptionId: users.stripeSubscriptionId,
      lastLoginAt: users.lastLoginAt,
      updatedAt: users.updatedAt,
      group: userGroups
    }).from(users).leftJoin(userGroups, eq(users.groupId, userGroups.id));

    const query = conditions.length > 0 
      ? baseQuery.where(and(...conditions))
      : baseQuery;

    return await query.limit(limit).offset(offset).orderBy(desc(users.createdAt)) as (User & { group: UserGroup | null })[];
  }

  async getUserPermissions(userId: number): Promise<Permission[]> {
    const user = await this.getUser(userId);
    if (!user || !user.groupId) return [];

    return await db.select({
      id: permissions.id,
      key: permissions.key,
      name: permissions.name,
      description: permissions.description,
      module: permissions.module,
      category: permissions.category,
      isActive: permissions.isActive,
      createdAt: permissions.createdAt
    })
    .from(permissions)
    .innerJoin(groupPermissions, eq(permissions.id, groupPermissions.permissionId))
    .where(eq(groupPermissions.groupId, user.groupId));
  }

  // User Groups management
  async getUserGroups(): Promise<UserGroup[]> {
    return await db.select().from(userGroups).orderBy(userGroups.name);
  }

  async getUserGroup(id: number): Promise<UserGroup | undefined> {
    const [group] = await db.select().from(userGroups).where(eq(userGroups.id, id));
    return group || undefined;
  }

  async createUserGroup(group: InsertUserGroup): Promise<UserGroup> {
    const [created] = await db.insert(userGroups).values(group).returning();
    return created;
  }

  async updateUserGroup(id: number, updates: Partial<UserGroup>): Promise<UserGroup> {
    const [group] = await db.update(userGroups).set(updates).where(eq(userGroups.id, id)).returning();
    return group;
  }

  async deleteUserGroup(id: number): Promise<void> {
    await db.delete(userGroups).where(eq(userGroups.id, id));
  }

  // Permissions management
  async getPermissions(): Promise<Permission[]> {
    return await db.select().from(permissions).orderBy(permissions.module, permissions.name);
  }

  async getPermission(id: number): Promise<Permission | undefined> {
    const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
    return permission || undefined;
  }

  async getPermissionsByModule(module: string): Promise<Permission[]> {
    return await db.select().from(permissions).where(eq(permissions.module, module)).orderBy(permissions.name);
  }

  async createPermission(permission: InsertPermission): Promise<Permission> {
    const [created] = await db.insert(permissions).values(permission).returning();
    return created;
  }

  async updatePermission(id: number, updates: Partial<Permission>): Promise<Permission> {
    const [permission] = await db.update(permissions).set(updates).where(eq(permissions.id, id)).returning();
    return permission;
  }

  async deletePermission(id: number): Promise<void> {
    await db.delete(permissions).where(eq(permissions.id, id));
  }

  // Group Permissions management
  async getGroupPermissions(groupId: number): Promise<Permission[]> {
    return await db.select({
      id: permissions.id,
      key: permissions.key,
      name: permissions.name,
      description: permissions.description,
      module: permissions.module,
      category: permissions.category,
      isActive: permissions.isActive,
      createdAt: permissions.createdAt
    })
    .from(permissions)
    .innerJoin(groupPermissions, eq(permissions.id, groupPermissions.permissionId))
    .where(eq(groupPermissions.groupId, groupId))
    .orderBy(permissions.module, permissions.name);
  }

  async setGroupPermissions(groupId: number, permissionIds: number[]): Promise<void> {
    // Remove existing permissions
    await db.delete(groupPermissions).where(eq(groupPermissions.groupId, groupId));

    // Add new permissions
    if (permissionIds.length > 0) {
      const values = permissionIds.map(permissionId => ({
        groupId,
        permissionId
      }));
      await db.insert(groupPermissions).values(values);
    }
  }

  async updateGroupPermissions(groupId: number, permissionIds: number[]): Promise<void> {
    return this.setGroupPermissions(groupId, permissionIds);
  }

  async addGroupPermission(groupId: number, permissionId: number): Promise<GroupPermission> {
    const [created] = await db.insert(groupPermissions).values({
      groupId,
      permissionId
    }).returning();
    return created;
  }

  async removeGroupPermission(groupId: number, permissionId: number): Promise<void> {
    await db.delete(groupPermissions).where(
      and(
        eq(groupPermissions.groupId, groupId),
        eq(groupPermissions.permissionId, permissionId)
      )
    );
  }

  // User Activity Log
  async logUserActivity(log: InsertUserActivityLog): Promise<UserActivityLog> {
    const [created] = await db.insert(userActivityLog).values(log).returning();
    return created;
  }

  async getUserActivity(userId: number, limit = 50, offset = 0): Promise<UserActivityLog[]> {
    return await db.select().from(userActivityLog)
      .where(eq(userActivityLog.userId, userId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(userActivityLog.createdAt));
  }

  async getAllUserActivity(limit = 50, offset = 0): Promise<UserActivityLog[]> {
    return await db.select().from(userActivityLog)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(userActivityLog.createdAt));
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
    if (accessLevel) {
      return await db.select().from(materials)
        .where(and(eq(materials.isActive, true), eq(materials.accessLevel, accessLevel)))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(materials.createdAt));
    }
    return await db.select().from(materials)
      .where(eq(materials.isActive, true))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(materials.createdAt));
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

  async deleteMaterial(id: number): Promise<void> {
    await db.delete(materials).where(eq(materials.id, id));
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

  // Template operations
  async getAllTemplates(): Promise<Template[]> {
    return await db.select().from(templates).where(eq(templates.status, 'published')).orderBy(desc(templates.createdAt));
  }

  async getTemplateById(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template;
  }

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return await db.select().from(templates)
      .where(and(eq(templates.category, category), eq(templates.status, 'published')))
      .orderBy(desc(templates.createdAt));
  }

  async searchTemplates(query: string, category?: string): Promise<Template[]> {
    let whereClause = and(
      or(like(templates.title, `%${query}%`), like(templates.purpose, `%${query}%`)),
      eq(templates.status, 'published')
    );

    if (category) {
      whereClause = and(whereClause, eq(templates.category, category)) as any;
    }

    return await db.select().from(templates).where(whereClause).orderBy(desc(templates.createdAt));
  }

  async incrementTemplateCopyCount(id: number): Promise<void> {
    await db.update(templates)
      .set({ 
        copyCount: sql`COALESCE(${templates.copyCount}, 0) + 1`,
        updatedAt: new Date()
      })
      .where(eq(templates.id, id));
  }

  // Admin template operations
  async getAllTemplatesAdmin(): Promise<Template[]> {
    return await db.select().from(templates).orderBy(desc(templates.createdAt));
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [created] = await db.insert(templates).values(template).returning();
    return created;
  }

  async updateTemplate(id: number, updates: Partial<Template>): Promise<Template> {
    const [updated] = await db.update(templates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(templates.id, id))
      .returning();
    return updated;
  }

  async deleteTemplate(id: number): Promise<void> {
    // First delete template tag relations
    await db.delete(templateTagRelations).where(eq(templateTagRelations.templateId, id));
    // Then delete the template
    await db.delete(templates).where(eq(templates.id, id));
  }

  // Interface compatibility methods
  async getTemplates(limit = 50, offset = 0): Promise<Template[]> {
    return await db.select()
      .from(templates)
      .where(eq(templates.status, 'published'))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(templates.createdAt));
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  // Template Tags implementation
  async getTemplateTags(): Promise<TemplateTag[]> {
    return await db.select().from(templateTags).where(eq(templateTags.isActive, true)).orderBy(templateTags.name);
  }

  async getTemplateTag(id: number): Promise<TemplateTag | undefined> {
    const [tag] = await db.select().from(templateTags).where(eq(templateTags.id, id));
    return tag || undefined;
  }

  async createTemplateTag(tag: InsertTemplateTag): Promise<TemplateTag> {
    const [created] = await db.insert(templateTags).values(tag).returning();
    return created;
  }

  async updateTemplateTag(id: number, updates: Partial<TemplateTag>): Promise<TemplateTag> {
    const [tag] = await db.update(templateTags).set(updates).where(eq(templateTags.id, id)).returning();
    return tag;
  }

  async deleteTemplateTag(id: number): Promise<void> {
    await db.delete(templateTags).where(eq(templateTags.id, id));
  }

  // Template-Tag relations
  async linkTemplateToTags(templateId: number, tagIds: number[]): Promise<void> {
    try {
      // Primeiro remove todas as ligações existentes
      await db.delete(templateTagRelations).where(eq(templateTagRelations.templateId, templateId));
      
      // Depois adiciona as novas ligações
      if (tagIds.length > 0) {
        await db.insert(templateTagRelations).values(
          tagIds.map(tagId => ({ templateId, tagId }))
        );
      }
    } catch (error) {
      console.error('Error linking template to tags:', error);
      throw error;
    }
  }

  async getTemplateWithTags(templateId: number): Promise<any> {
    const template = await db.select().from(templates).where(eq(templates.id, templateId));
    if (!template[0]) return null;

    const tags = await db
      .select({
        id: templateTags.id,
        name: templateTags.name,
        color: templateTags.color,
      })
      .from(templateTagRelations)
      .innerJoin(templateTags, eq(templateTagRelations.tagId, templateTags.id))
      .where(eq(templateTagRelations.templateId, templateId));

    return {
      ...template[0],
      tags,
    };
  }

  async getAllTemplatesWithTags(): Promise<any[]> {
    // Use a single query with LEFT JOIN to get templates and their tags
    const results = await db
      .select({
        id: templates.id,
        title: templates.title,
        category: templates.category,
        purpose: templates.purpose,
        usageInstructions: templates.usageInstructions,
        content: templates.content,
        variableTips: templates.variableTips,
        status: templates.status,
        copyCount: templates.copyCount,
        createdAt: templates.createdAt,
        updatedAt: templates.updatedAt,
        tagId: templateTags.id,
        tagName: templateTags.name,
        tagColor: templateTags.color,
      })
      .from(templates)
      .leftJoin(templateTagRelations, eq(templates.id, templateTagRelations.templateId))
      .leftJoin(templateTags, eq(templateTagRelations.tagId, templateTags.id))
      .orderBy(desc(templates.createdAt));

    // Group results by template
    const templatesMap = new Map();
    
    results.forEach((row) => {
      if (!templatesMap.has(row.id)) {
        templatesMap.set(row.id, {
          id: row.id,
          title: row.title,
          category: row.category,
          purpose: row.purpose,
          usageInstructions: row.usageInstructions,
          content: row.content,
          variableTips: row.variableTips,
          status: row.status,
          copyCount: row.copyCount,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          tags: [],
        });
      }
      
      // Add tag if it exists
      if (row.tagId) {
        templatesMap.get(row.id).tags.push({
          id: row.tagId,
          name: row.tagName,
          color: row.tagColor,
        });
      }
    });

    return Array.from(templatesMap.values());
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

  // Auth tokens implementation
  async createAuthToken(token: InsertAuthToken): Promise<AuthToken> {
    const [authToken] = await db.insert(authTokens).values(token).returning();
    return authToken;
  }

  async getAuthToken(token: string): Promise<AuthToken | undefined> {
    const [authToken] = await db
      .select()
      .from(authTokens)
      .where(and(
        eq(authTokens.token, token),
        eq(authTokens.used, false)
      ));
    
    // Check expiration in JavaScript
    if (authToken && authToken.expiresAt > new Date()) {
      return authToken;
    }
    return undefined;
  }

  async markTokenAsUsed(token: string): Promise<void> {
    await db
      .update(authTokens)
      .set({ used: true })
      .where(eq(authTokens.token, token));
  }

  async cleanupExpiredTokens(): Promise<void> {
    await db
      .delete(authTokens)
      .where(or(
        sql`expires_at < NOW()`,
        eq(authTokens.used, true)
      ));
  }

  // Cadastros - Material Types
  async getMaterialTypes(limit = 50, offset = 0): Promise<MaterialType[]> {
    return await db.select().from(materialTypes)
      .orderBy(desc(materialTypes.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getMaterialType(id: number): Promise<MaterialType | undefined> {
    const [materialType] = await db.select().from(materialTypes).where(eq(materialTypes.id, id));
    return materialType || undefined;
  }

  async createMaterialType(materialType: InsertMaterialType): Promise<MaterialType> {
    const [newMaterialType] = await db.insert(materialTypes).values(materialType).returning();
    return newMaterialType;
  }

  async updateMaterialType(id: number, updates: Partial<MaterialType>): Promise<MaterialType> {
    const [updatedMaterialType] = await db
      .update(materialTypes)
      .set(updates)
      .where(eq(materialTypes.id, id))
      .returning();
    return updatedMaterialType;
  }

  async deleteMaterialType(id: number): Promise<void> {
    await db.delete(materialTypes).where(eq(materialTypes.id, id));
  }

  // Cadastros - Software Types
  async getSoftwareTypes(limit = 50, offset = 0): Promise<SoftwareType[]> {
    return await db.select().from(softwareTypes)
      .orderBy(desc(softwareTypes.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getSoftwareType(id: number): Promise<SoftwareType | undefined> {
    const [softwareType] = await db.select().from(softwareTypes).where(eq(softwareTypes.id, id));
    return softwareType || undefined;
  }

  async createSoftwareType(softwareType: InsertSoftwareType): Promise<SoftwareType> {
    const [newSoftwareType] = await db.insert(softwareTypes).values(softwareType).returning();
    return newSoftwareType;
  }

  async updateSoftwareType(id: number, updates: Partial<SoftwareType>): Promise<SoftwareType> {
    const [updatedSoftwareType] = await db
      .update(softwareTypes)
      .set(updates)
      .where(eq(softwareTypes.id, id))
      .returning();
    return updatedSoftwareType;
  }

  async deleteSoftwareType(id: number): Promise<void> {
    await db.delete(softwareTypes).where(eq(softwareTypes.id, id));
  }

  // Cadastros - Supplier Types
  async getSupplierTypes(limit = 50, offset = 0): Promise<SupplierType[]> {
    return await db.select().from(supplierTypes)
      .orderBy(desc(supplierTypes.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getSupplierTypeById(id: number): Promise<SupplierType | undefined> {
    const [supplierType] = await db.select().from(supplierTypes).where(eq(supplierTypes.id, id));
    return supplierType || undefined;
  }

  async createSupplierType(supplierType: InsertSupplierType): Promise<SupplierType> {
    const [newSupplierType] = await db.insert(supplierTypes).values(supplierType).returning();
    return newSupplierType;
  }

  async updateSupplierType(id: number, updates: Partial<SupplierType>): Promise<SupplierType> {
    const [updatedSupplierType] = await db
      .update(supplierTypes)
      .set(updates)
      .where(eq(supplierTypes.id, id))
      .returning();
    return updatedSupplierType;
  }

  async deleteSupplierType(id: number): Promise<void> {
    await db.delete(supplierTypes).where(eq(supplierTypes.id, id));
  }

  // Cadastros - Product Categories
  async getProductCategories(limit = 50, offset = 0): Promise<ProductCategory[]> {
    return await db.select().from(productCategories)
      .orderBy(desc(productCategories.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getProductCategory(id: number): Promise<ProductCategory | undefined> {
    const [productCategory] = await db.select().from(productCategories).where(eq(productCategories.id, id));
    return productCategory || undefined;
  }

  async createProductCategory(productCategory: InsertProductCategory): Promise<ProductCategory> {
    const [newProductCategory] = await db.insert(productCategories).values(productCategory).returning();
    return newProductCategory;
  }

  async updateProductCategory(id: number, updates: Partial<ProductCategory>): Promise<ProductCategory> {
    const [updatedProductCategory] = await db
      .update(productCategories)
      .set(updates)
      .where(eq(productCategories.id, id))
      .returning();
    return updatedProductCategory;
  }

  async deleteProductCategory(id: number): Promise<void> {
    await db.delete(productCategories).where(eq(productCategories.id, id));
  }

  // Cadastros - Partner Categories
  async getPartnerCategories(limit = 50, offset = 0): Promise<PartnerCategory[]> {
    return await db.select().from(partnerCategories)
      .orderBy(desc(partnerCategories.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getPartnerCategoryById(id: number): Promise<PartnerCategory | undefined> {
    const [partnerCategory] = await db.select().from(partnerCategories).where(eq(partnerCategories.id, id));
    return partnerCategory || undefined;
  }

  async createPartnerCategory(partnerCategory: InsertPartnerCategory): Promise<PartnerCategory> {
    const [newPartnerCategory] = await db.insert(partnerCategories).values(partnerCategory).returning();
    return newPartnerCategory;
  }

  async updatePartnerCategory(id: number, updates: Partial<PartnerCategory>): Promise<PartnerCategory> {
    const [updatedPartnerCategory] = await db
      .update(partnerCategories)
      .set(updates)
      .where(eq(partnerCategories.id, id))
      .returning();
    return updatedPartnerCategory;
  }

  async deletePartnerCategory(id: number): Promise<void> {
    await db.delete(partnerCategories).where(eq(partnerCategories.id, id));
  }
}

export const storage = new DatabaseStorage();