import { 
  users, partners, suppliers, tools, mySuppliers, products, templates, tickets, ticketFiles, ticketMessages,
  materials, news, reviews, userGroups, permissions, groupPermissions, userActivityLog, authTokens,
  materialTypes, materialCategories, softwareTypes, supplierTypes, productCategories, partnerCategories, templateTags, templateTagRelations, aiPromptCategories,
  partnerComments, partnerReviews, partnerContacts, partnerFiles
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, sql, isNull } from "drizzle-orm";

import type { 
  User, InsertUser, Partner, InsertPartner, Supplier, InsertSupplier, Tool, InsertTool,
  MySupplier, InsertMySupplier, Product, InsertProduct, Template, InsertTemplate,
  Ticket, InsertTicket, Material, InsertMaterial, News, InsertNews, Review, InsertReview,
  UserGroup, InsertUserGroup, Permission, InsertPermission, GroupPermission, InsertGroupPermission,
  UserActivityLog, InsertUserActivityLog, AuthToken, InsertAuthToken,
  MaterialType, InsertMaterialType, MaterialCategory, InsertMaterialCategory, SoftwareType, InsertSoftwareType, SupplierType, InsertSupplierType,
  ProductCategory, InsertProductCategory, PartnerCategory, InsertPartnerCategory,
  TemplateTag, InsertTemplateTag, AiPromptCategory, InsertAiPromptCategory
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
  deletePartner(id: number): Promise<void>;
  searchPartners(query: string, category?: string): Promise<Partner[]>;
  
  // Partner contacts
  getPartnerContacts(partnerId: number): Promise<any[]>;
  
  // Partner reviews
  getPartnerReviews(partnerId: number): Promise<any[]>;
  createPartnerReview(review: { partnerId: number; userId: number; rating: number; comment: string }): Promise<any>;
  
  // Partner comments
  getPartnerComments(partnerId: number): Promise<any[]>;
  createPartnerComment(comment: { partnerId: number; userId: number; content: string; parentId?: number | null }): Promise<any>;
  toggleCommentLike(commentId: number, userId: number): Promise<any>;
  
  // Partner files
  getPartnerFiles(partnerId: number): Promise<any[]>;

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

  // Template Categories
  getTemplateCategories(): Promise<string[]>;

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

  // Material Categories
  getMaterialCategories(limit?: number, offset?: number): Promise<MaterialCategory[]>;
  getMaterialCategory(id: number): Promise<MaterialCategory | undefined>;
  createMaterialCategory(materialCategory: InsertMaterialCategory): Promise<MaterialCategory>;
  updateMaterialCategory(id: number, updates: Partial<MaterialCategory>): Promise<MaterialCategory>;
  deleteMaterialCategory(id: number): Promise<void>;

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

  // AI Prompt Categories
  getAiPromptCategories(limit?: number, offset?: number): Promise<AiPromptCategory[]>;
  getAiPromptCategoryById(id: number): Promise<AiPromptCategory | undefined>;
  createAiPromptCategory(category: InsertAiPromptCategory): Promise<AiPromptCategory>;
  updateAiPromptCategory(id: number, updates: Partial<AiPromptCategory>): Promise<AiPromptCategory>;
  deleteAiPromptCategory(id: number): Promise<void>;

   // Check if user has specific permission
   userHasPermission(userId: number, permissionKey: string): Promise<boolean>;

   // Get user permissions by module
   getUserPermissionsByModule(userId: number, module?: string): Promise<any>;
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

  async getPartners(limit = 50, offset = 0): Promise<(Partner & { category: { name: string } })[]> {
    return await db.select({
      id: partners.id,
      name: partners.name,
      description: partners.description,
      categoryId: partners.categoryId,
      website: partners.website,
      email: partners.email,
      phone: partners.phone,
      logo: partners.logo,
      isVerified: partners.isVerified,
      discountInfo: partners.discountInfo,
      averageRating: partners.averageRating,
      reviewCount: partners.reviewCount,
      status: partners.status,
      createdAt: partners.createdAt,
      category: {
        name: partnerCategories.name
      }
    })
    .from(partners)
    .leftJoin(partnerCategories, eq(partners.categoryId, partnerCategories.id))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(partners.createdAt));
  }

  async getPartner(id: number): Promise<(Partner & { category: { name: string } }) | undefined> {
    const [partner] = await db.select({
      id: partners.id,
      name: partners.name,
      description: partners.description,
      categoryId: partners.categoryId,
      website: partners.website,
      email: partners.email,
      phone: partners.phone,
      logo: partners.logo,
      isVerified: partners.isVerified,
      discountInfo: partners.discountInfo,
      averageRating: partners.averageRating,
      reviewCount: partners.reviewCount,
      status: partners.status,
      createdAt: partners.createdAt,
      category: {
        name: partnerCategories.name
      }
    })
    .from(partners)
    .leftJoin(partnerCategories, eq(partners.categoryId, partnerCategories.id))
    .where(eq(partners.id, id));
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

  async deletePartner(id: number): Promise<void> {
    await db.delete(partners).where(eq(partners.id, id));
  }

  async searchPartners(query: string, categoryName?: string): Promise<(Partner & { category: { name: string } })[]> {
    let whereClause = like(partners.name, `%${query}%`);
    if (categoryName) {
      whereClause = and(whereClause, eq(partnerCategories.name, categoryName)) as any;
    }
    return await db.select({
      id: partners.id,
      name: partners.name,
      description: partners.description,
      categoryId: partners.categoryId,
      website: partners.website,
      email: partners.email,
      phone: partners.phone,
      logo: partners.logo,
      isVerified: partners.isVerified,
      discountInfo: partners.discountInfo,
      averageRating: partners.averageRating,
      reviewCount: partners.reviewCount,
      status: partners.status,
      createdAt: partners.createdAt,
      category: {
        name: partnerCategories.name
      }
    })
    .from(partners)
    .leftJoin(partnerCategories, eq(partners.categoryId, partnerCategories.id))
    .where(whereClause);
  }



  // Partner contacts - placeholder implementations for now
  async getPartnerContacts(partnerId: number): Promise<any[]> {
    // Return empty array for now since contacts are not in database schema yet
    return [];
  }

  // Partner reviews - placeholder implementations for now
  async getPartnerReviews(partnerId: number): Promise<any[]> {
    // Return empty array for now since reviews are not in database schema yet
    return [];
  }

  async createPartnerReview(review: { partnerId: number; userId: number; rating: number; comment: string }): Promise<any> {
    // Return a mock review for now since reviews are not in database schema yet
    return {
      id: Date.now(),
      partnerId: review.partnerId,
      userId: review.userId,
      userName: 'Usuário',
      rating: review.rating,
      comment: review.comment,
      createdAt: new Date().toISOString()
    };
  }

  // Partner comments
  async getPartnerComments(partnerId: number): Promise<any[]> {
    const results = await db.execute(
      sql`
        WITH RECURSIVE comment_tree AS (
          -- Base case: top-level comments
          SELECT 
            pc.id,
            pc.partner_id,
            pc.user_id,
            pc.content,
            pc.parent_id,
            pc.likes,
            pc.created_at,
            u.full_name as user_name,
            0 as level
          FROM partner_comments pc
          LEFT JOIN users u ON pc.user_id = u.id
          WHERE pc.partner_id = ${partnerId} AND pc.parent_id IS NULL
          
          UNION ALL
          
          -- Recursive case: replies
          SELECT 
            pc.id,
            pc.partner_id,
            pc.user_id,
            pc.content,
            pc.parent_id,
            pc.likes,
            pc.created_at,
            u.full_name as user_name,
            ct.level + 1
          FROM partner_comments pc
          LEFT JOIN users u ON pc.user_id = u.id
          INNER JOIN comment_tree ct ON pc.parent_id = ct.id
        )
        SELECT * FROM comment_tree
        ORDER BY created_at DESC
      `
    );

    // Organize comments into nested structure
    const commentsMap = new Map();
    const topLevelComments: any[] = [];

    results.rows.forEach((row: any) => {
      const comment = {
        id: row.id,
        partnerId: row.partner_id,
        userId: row.user_id,
        userName: row.user_name || 'Usuário',
        content: row.content,
        parentId: row.parent_id,
        likes: row.likes,
        createdAt: row.created_at,
        hasLiked: false,
        replies: []
      };

      commentsMap.set(comment.id, comment);

      if (!comment.parentId) {
        topLevelComments.push(comment);
      } else {
        const parent = commentsMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(comment);
        }
      }
    });

    return topLevelComments;
  }

  async createPartnerComment(comment: { partnerId: number; userId: number; content: string; parentId?: number | null }): Promise<any> {
    const result = await db.execute(
      sql`
        INSERT INTO partner_comments (partner_id, user_id, content, parent_id)
        VALUES (${comment.partnerId}, ${comment.userId}, ${comment.content}, ${comment.parentId || null})
        RETURNING *
      `
    );

    const newComment = result.rows[0];

    // Get user name
    const userResult = await db.execute(
      sql`SELECT full_name FROM users WHERE id = ${comment.userId}`
    );

    return {
      id: newComment.id,
      partnerId: newComment.partner_id,
      userId: newComment.user_id,
      userName: userResult.rows[0]?.full_name || 'Usuário',
      content: newComment.content,
      parentId: newComment.parent_id,
      likes: newComment.likes,
      createdAt: newComment.created_at,
      hasLiked: false,
      replies: []
    };
  }

  async toggleCommentLike(commentId: number, userId: number): Promise<any> {
    // Return mock like toggle for now since comments are not in database schema yet
    return { liked: true, likes: 1 };
  }

  // Partner files - placeholder implementations for now
  async getPartnerFiles(partnerId: number): Promise<any[]> {
    // Return empty array for now since files are not in database schema yet
    return [];
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

  // Get unique categories from existing templates
  async getTemplateCategories(): Promise<string[]> {
    const result = await db
      .selectDistinct({ category: templates.category })
      .from(templates)
      .where(eq(templates.status, 'published'))
      .orderBy(templates.category);

    return result.map(row => row.category).filter(Boolean);
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

  // Cadastros - Material Categories
  async getMaterialCategories(limit = 50, offset = 0): Promise<MaterialCategory[]> {
    return await db.select().from(materialCategories)
      .orderBy(desc(materialCategories.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getMaterialCategory(id: number): Promise<MaterialCategory | undefined> {
    const [materialCategory] = await db.select().from(materialCategories).where(eq(materialCategories.id, id));
    return materialCategory || undefined;
  }

  async createMaterialCategory(materialCategory: InsertMaterialCategory): Promise<MaterialCategory> {
    const [newMaterialCategory] = await db.insert(materialCategories).values(materialCategory).returning();
    return newMaterialCategory;
  }

  async updateMaterialCategory(id: number, updates: Partial<MaterialCategory>): Promise<MaterialCategory> {
    const [updatedMaterialCategory] = await db
      .update(materialCategories)
      .set(updates)
      .where(eq(materialCategories.id, id))
      .returning();
    return updatedMaterialCategory;
  }

  async deleteMaterialCategory(id: number): Promise<void> {
    await db.delete(materialCategories).where(eq(materialCategories.id, id));
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

  // AI Prompt Categories implementation
  async getAiPromptCategories(limit: number = 50, offset: number = 0): Promise<AiPromptCategory[]> {
    const categories = await db.select().from(aiPromptCategories)
      .orderBy(aiPromptCategories.name)
      .limit(limit)
      .offset(offset);
    return categories;
  }

  async getAiPromptCategoryById(id: number): Promise<AiPromptCategory | undefined> {
    const [category] = await db.select().from(aiPromptCategories).where(eq(aiPromptCategories.id, id));
    return category || undefined;
  }

  async createAiPromptCategory(category: InsertAiPromptCategory): Promise<AiPromptCategory> {
    const [newCategory] = await db.insert(aiPromptCategories).values(category).returning();
    return newCategory;
  }

  async updateAiPromptCategory(id: number, updates: Partial<AiPromptCategory>): Promise<AiPromptCategory> {
    const [updatedCategory] = await db
      .update(aiPromptCategories)
      .set(updates)
      .where(eq(aiPromptCategories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteAiPromptCategory(id: number): Promise<void> {
    await db.delete(aiPromptCategories).where(eq(aiPromptCategories.id, id));
  }

  // Initialize default user groups if they don't exist
  async initializeDefaultGroups() {
    const groups = await this.getUserGroups();
    if (groups.length === 0) {
      // Create default groups
      await this.createUserGroup({
        name: 'basic',
        displayName: 'Basic',
        description: 'Usuários básicos com acesso limitado',
        color: '#6b7280',
        isActive: true
      });

      await this.createUserGroup({
        name: 'aluno',
        displayName: 'Aluno',
        description: 'Alunos com acesso a conteúdo educacional',
        color: '#3b82f6',
        isActive: true
      });

      await this.createUserGroup({
        name: 'aluno_pro',
        displayName: 'Aluno Pro',
        description: 'Alunos com acesso premium',
        color: '#f59e0b',
        isActive: true
      });

      await this.createUserGroup({
        name: 'suporte',
        displayName: 'Suporte',
        description: 'Equipe de suporte com acesso a tickets',
        color: '#10b981',
        isActive: true
      });

      await this.createUserGroup({
        name: 'admin',
        displayName: 'Administradores',
        description: 'Administradores com acesso total',
        color: '#ef4444',
        isActive: true
      });
    }
  }

  // Initialize modular permissions system
  async initializeModularPermissions() {
    const existingPermissions = await this.getPermissions();
    if (existingPermissions.length > 0) return;

    const modulePermissions = [
      // PRINCIPAL
      {
        module: 'dashboard',
        category: 'principal',
        permissions: [
          { key: 'dashboard.access', name: 'Acessar Dashboard', description: 'Acesso ao painel principal do sistema' },
          { key: 'dashboard.view_metrics', name: 'Ver Métricas', description: 'Visualizar métricas e estatísticas pessoais' },
          { key: 'dashboard.view_summary', name: 'Ver Resumo', description: 'Visualizar resumo de atividades' }
        ]
      },

      // EDUCACIONAL
      {
        module: 'courses',
        category: 'educacional',
        permissions: [
          { key: 'courses.access', name: 'Acessar Cursos', description: 'Acesso à área de cursos' },
          { key: 'courses.view', name: 'Ver Cursos', description: 'Visualizar lista de cursos disponíveis' },
          { key: 'courses.enroll', name: 'Inscrever-se', description: 'Inscrever-se em cursos' },
          { key: 'courses.view_content', name: 'Ver Conteúdo', description: 'Acessar conteúdo dos cursos' },
          { key: 'courses.track_progress', name: 'Acompanhar Progresso', description: 'Visualizar progresso nos cursos' }
        ]
      },
      {
        module: 'materials',
        category: 'educacional',
        permissions: [
          { key: 'materials.access', name: 'Acessar Materiais', description: 'Acesso à área de materiais educacionais' },
          { key: 'materials.view', name: 'Ver Materiais', description: 'Visualizar lista de materiais' },
          { key: 'materials.view_content', name: 'Ver Conteúdo', description: 'Acessar conteúdo dos materiais' },
          { key: 'materials.download', name: 'Baixar Materiais', description: 'Download de arquivos e recursos' },
          { key: 'materials.bookmark', name: 'Favoritar', description: 'Marcar materiais como favoritos' },
          { key: 'materials.create', name: 'Criar Materiais', description: 'Criar novos materiais (admin)' },
          { key: 'materials.edit', name: 'Editar Materiais', description: 'Editar materiais existentes (admin)' },
          { key: 'materials.delete', name: 'Excluir Materiais', description: 'Excluir materiais (admin)' }
        ]
      },
      {
        module: 'templates',
        category: 'educacional',
        permissions: [
          { key: 'templates.access', name: 'Acessar Templates', description: 'Acesso à área de templates' },
          { key: 'templates.view', name: 'Ver Templates', description: 'Visualizar lista de templates' },
          { key: 'templates.view_content', name: 'Ver Conteúdo', description: 'Visualizar conteúdo dos templates' },
          { key: 'templates.copy', name: 'Copiar Templates', description: 'Copiar templates para uso pessoal' },
          { key: 'templates.export', name: 'Exportar Templates', description: 'Exportar templates em diferentes formatos' },
          { key: 'templates.create', name: 'Criar Templates', description: 'Criar novos templates (admin)' },
          { key: 'templates.edit', name: 'Editar Templates', description: 'Editar templates existentes (admin)' },
          { key: 'templates.delete', name: 'Excluir Templates', description: 'Excluir templates (admin)' }
        ]
      },

      // FORNECEDORES & PRODUTOS
      {
        module: 'partners',
        category: 'fornecedores_produtos',
        permissions: [
          { key: 'partners.access', name: 'Acessar Parceiros', description: 'Acesso à área de parceiros' },
          { key: 'partners.view', name: 'Ver Parceiros', description: 'Visualizar lista de parceiros' },
          { key: 'partners.view_details', name: 'Ver Detalhes', description: 'Visualizar informações detalhadas dos parceiros' },
          { key: 'partners.contact', name: 'Contatar Parceiros', description: 'Entrar em contato com parceiros' },
          { key: 'partners.favorite', name: 'Favoritar Parceiros', description: 'Marcar parceiros como favoritos' }
        ]
      },
      {
        module: 'suppliers',
        category: 'fornecedores_produtos',
        permissions: [
          { key: 'suppliers.access', name: 'Acessar Fornecedores', description: 'Acesso à área de fornecedores' },
          { key: 'suppliers.view', name: 'Ver Fornecedores', description: 'Visualizar lista de fornecedores' },
          { key: 'suppliers.view_details', name: 'Ver Detalhes', description: 'Visualizar informações detalhadas' },
          { key: 'suppliers.contact', name: 'Contatar Fornecedores', description: 'Entrar em contato com fornecedores' },
          { key: 'suppliers.compare', name: 'Comparar Fornecedores', description: 'Comparar diferentes fornecedores' }
        ]
      },
      {
        module: 'my_suppliers',
        category: 'fornecedores_produtos',
        permissions: [
          { key: 'my_suppliers.access', name: 'Acessar Meus Fornecedores', description: 'Acesso aos fornecedores pessoais' },
          { key: 'my_suppliers.view', name: 'Ver Meus Fornecedores', description: 'Visualizar fornecedores salvos' },
          { key: 'my_suppliers.add', name: 'Adicionar Fornecedores', description: 'Adicionar fornecedores à lista pessoal' },
          { key: 'my_suppliers.edit', name: 'Editar Informações', description: 'Editar informações dos fornecedores' },
          { key: 'my_suppliers.remove', name: 'Remover Fornecedores', description: 'Remover fornecedores da lista' },
          { key: 'my_suppliers.notes', name: 'Gerenciar Notas', description: 'Adicionar e editar notas pessoais' }
        ]
      },
      {
        module: 'my_products',
        category: 'fornecedores_produtos',
        permissions: [
          { key: 'my_products.access', name: 'Acessar Meus Produtos', description: 'Acesso aos produtos pessoais' },
          { key: 'my_products.view', name: 'Ver Meus Produtos', description: 'Visualizar lista de produtos' },
          { key: 'my_products.add', name: 'Adicionar Produtos', description: 'Adicionar novos produtos' },
          { key: 'my_products.edit', name: 'Editar Produtos', description: 'Editar informações dos produtos' },
          { key: 'my_products.remove', name: 'Remover Produtos', description: 'Remover produtos da lista' },
          { key: 'my_products.track', name: 'Rastrear Produtos', description: 'Acompanhar status e performance' },
          { key: 'my_products.analyze', name: 'Analisar Performance', description: 'Análise de performance e vendas' }
        ]
      },

      // FERRAMENTAS
      {
        module: 'tools',
        category: 'ferramentas',
        permissions: [
          { key: 'tools.access', name: 'Acessar Ferramentas', description: 'Acesso à área de ferramentas' },
          { key: 'tools.view', name: 'Ver Ferramentas', description: 'Visualizar ferramentas disponíveis' },
          { key: 'tools.use_basic', name: 'Usar Ferramentas Básicas', description: 'Utilizar ferramentas básicas' },
          { key: 'tools.use_advanced', name: 'Usar Ferramentas Avançadas', description: 'Utilizar ferramentas avançadas' },
          { key: 'tools.save_results', name: 'Salvar Resultados', description: 'Salvar resultados das ferramentas' }
        ]
      },
      {
        module: 'simulators',
        category: 'ferramentas',
        permissions: [
          { key: 'simulators.access', name: 'Acessar Simuladores', description: 'Acesso à área de simuladores' },
          { key: 'simulators.view', name: 'Ver Simuladores', description: 'Visualizar simuladores disponíveis' },
          { key: 'simulators.use_cost', name: 'Simulador de Custos', description: 'Utilizar simulador de custos' },
          { key: 'simulators.use_profit', name: 'Simulador de Lucro', description: 'Utilizar simulador de lucro' },
          { key: 'simulators.use_import', name: 'Simulador de Importação', description: 'Utilizar simulador de importação' },
          { key: 'simulators.save_scenarios', name: 'Salvar Cenários', description: 'Salvar cenários de simulação' },
          { key: 'simulators.export_reports', name: 'Exportar Relatórios', description: 'Exportar relatórios de simulação' }
        ]
      },
      {
        module: 'ai_agents',
        category: 'ferramentas',
        permissions: [
          { key: 'ai_agents.access', name: 'Acessar Agentes de IA', description: 'Acesso aos agentes de IA' },
          { key: 'ai_agents.view', name: 'Ver Agentes', description: 'Visualizar agentes disponíveis' },
          { key: 'ai_agents.use_basic', name: 'Usar Agentes Básicos', description: 'Utilizar agentes básicos (limitado)' },
          { key: 'ai_agents.use_advanced', name: 'Usar Agentes Avançados', description: 'Utilizar agentes avançados' },
          { key: 'ai_agents.unlimited_usage', name: 'Uso Ilimitado', description: 'Uso ilimitado de agentes IA' },
          { key: 'ai_agents.view_credits', name: 'Ver Créditos', description: 'Visualizar saldo de créditos' },
          { key: 'ai_agents.buy_credits', name: 'Comprar Créditos', description: 'Adquirir novos créditos' }
        ]
      },
      {
        module: 'ai_prompts',
        category: 'ferramentas',
        permissions: [
          { key: 'ai_prompts.access', name: 'Acessar Prompts de IA', description: 'Acesso à biblioteca de prompts' },
          { key: 'ai_prompts.view', name: 'Ver Prompts', description: 'Visualizar prompts disponíveis' },
          { key: 'ai_prompts.use', name: 'Usar Prompts', description: 'Utilizar prompts existentes' },
          { key: 'ai_prompts.copy', name: 'Copiar Prompts', description: 'Copiar prompts para uso pessoal' },
          { key: 'ai_prompts.favorite', name: 'Favoritar Prompts', description: 'Marcar prompts como favoritos' },
          { key: 'ai_prompts.create_personal', name: 'Criar Prompts Pessoais', description: 'Criar prompts pessoais' },
          { key: 'ai_prompts.share', name: 'Compartilhar Prompts', description: 'Compartilhar prompts com outros usuários' }
        ]
      },

      // SUPORTE
      {
        module: 'tickets',
        category: 'suporte',
        permissions: [
          { key: 'tickets.access', name: 'Acessar Suporte', description: 'Acesso à área de suporte' },
          { key: 'tickets.view_own', name: 'Ver Meus Chamados', description: 'Visualizar próprios chamados' },
          { key: 'tickets.create', name: 'Criar Chamados', description: 'Abrir novos chamados' },
          { key: 'tickets.reply', name: 'Responder Chamados', description: 'Responder em chamados próprios' },
          { key: 'tickets.attach_files', name: 'Anexar Arquivos', description: 'Anexar arquivos aos chamados' },
          { key: 'tickets.view_all', name: 'Ver Todos Chamados', description: 'Visualizar todos os chamados (suporte)' },
          { key: 'tickets.assign', name: 'Atribuir Chamados', description: 'Atribuir chamados a outros usuários' },
          { key: 'tickets.close', name: 'Fechar Chamados', description: 'Resolver e fechar chamados' },
          { key: 'tickets.reopen', name: 'Reabrir Chamados', description: 'Reabrir chamados fechados' }
        ]
      },

      // ADMIN - Gestão de Usuários
      {
        module: 'admin_users',
        category: 'admin',
        permissions: [
          { key: 'admin.access_panel', name: 'Acessar Painel Admin', description: 'Acesso ao painel administrativo' },
          { key: 'admin.dashboard', name: 'Dashboard Admin', description: 'Visualizar dashboard administrativo' },
          { key: 'admin.users.view', name: 'Ver Usuários', description: 'Visualizar lista de usuários' },
          { key: 'admin.users.create', name: 'Criar Usuários', description: 'Criar novos usuários' },
          { key: 'admin.users.edit', name: 'Editar Usuários', description: 'Editar informações de usuários' },
          { key: 'admin.users.delete', name: 'Excluir Usuários', description: 'Excluir usuários do sistema' },
          { key: 'admin.users.impersonate', name: 'Personificar Usuários', description: 'Acessar como outro usuário' },
          { key: 'admin.users.reset_password', name: 'Resetar Senhas', description: 'Resetar senhas de usuários' },
          { key: 'admin.users.manage_credits', name: 'Gerenciar Créditos', description: 'Gerenciar créditos de IA dos usuários' }
        ]
      },

      // ADMIN - Controle de Acesso
      {
        module: 'admin_access',
        category: 'admin',
        permissions: [
          { key: 'admin.access.view_groups', name: 'Ver Grupos', description: 'Visualizar grupos de usuários' },
          { key: 'admin.access.create_groups', name: 'Criar Grupos', description: 'Criar novos grupos' },
          { key: 'admin.access.edit_groups', name: 'Editar Grupos', description: 'Editar grupos existentes' },
          { key: 'admin.access.delete_groups', name: 'Excluir Grupos', description: 'Excluir grupos de usuários' },
          { key: 'admin.access.view_permissions', name: 'Ver Permissões', description: 'Visualizar permissões do sistema' },
          { key: 'admin.access.assign_permissions', name: 'Atribuir Permissões', description: 'Atribuir permissões a grupos' },
          { key: 'admin.access.create_permissions', name: 'Criar Permissões', description: 'Criar novas permissões' },
          { key: 'admin.access.edit_permissions', name: 'Editar Permissões', description: 'Editar permissões existentes' }
        ]
      },

      // ADMIN - Gestão de Conteúdo
      {
        module: 'admin_content',
        category: 'admin',
        permissions: [
          { key: 'admin.materials.manage', name: 'Gerenciar Materiais', description: 'Gerenciamento completo de materiais' },
          { key: 'admin.templates.manage', name: 'Gerenciar Templates', description: 'Gerenciamento completo de templates' },
          { key: 'admin.ai_prompts.manage', name: 'Gerenciar Prompts IA', description: 'Gerenciamento completo de prompts IA' },
          { key: 'admin.courses.manage', name: 'Gerenciar Cursos', description: 'Gerenciamento completo de cursos' },
          { key: 'admin.news.manage', name: 'Gerenciar Notícias', description: 'Gerenciar notícias e atualizações' },
          { key: 'admin.content.moderate', name: 'Moderar Conteúdo', description: 'Moderar conteúdo enviado por usuários' },
          { key: 'admin.content.publish', name: 'Publicar Conteúdo', description: 'Publicar e despublicar conteúdo' }
        ]
      },

      // ADMIN - Cadastros Base
      {
        module: 'admin_cadastros',
        category: 'admin',
        permissions: [
          { key: 'admin.cadastros.view', name: 'Ver Cadastros', description: 'Visualizar cadastros base do sistema' },
          { key: 'admin.cadastros.material_types', name: 'Tipos de Material', description: 'Gerenciar tipos de material' },
          { key: 'admin.cadastros.material_categories', name: 'Categorias de Material', description: 'Gerenciar categorias de material' },
          { key: 'admin.cadastros.supplier_types', name: 'Tipos de Fornecedor', description: 'Gerenciar tipos de fornecedor' },
          { key: 'admin.cadastros.partner_categories', name: 'Categorias de Parceiro', description: 'Gerenciar categorias de parceiro' },
          { key: 'admin.cadastros.ai_prompt_categories', name: 'Categorias de Prompt IA', description: 'Gerenciar categorias de prompt IA' },
          { key: 'admin.cadastros.software_types', name: 'Tipos de Software', description: 'Gerenciar tipos de software' },
          { key: 'admin.cadastros.template_tags', name: 'Tags de Template', description: 'Gerenciar tags de template' }
        ]
      },

      // ADMIN - Sistema
      {
        module: 'admin_system',
        category: 'admin',
        permissions: [
          { key: 'admin.system.settings', name: 'Configurações Sistema', description: 'Configurações gerais do sistema' },
          { key: 'admin.system.logs', name: 'Ver Logs Sistema', description: 'Visualizar logs do sistema' },
          { key: 'admin.system.backup', name: 'Backup Sistema', description: 'Realizar backup do sistema' },
          { key: 'admin.system.maintenance', name: 'Manutenção Sistema', description: 'Ativar modo de manutenção' },
          { key: 'admin.system.analytics', name: 'Analytics Sistema', description: 'Visualizar analytics detalhados' },
          { key: 'admin.system.monitoring', name: 'Monitoramento Sistema', description: 'Monitorar saúde do sistema' }
        ]
      }
    ];

    // Create all permissions
    for (const moduleData of modulePermissions) {
      for (const permission of moduleData.permissions) {
        await this.createPermission({
          key: permission.key,
          name: permission.name,
          description: permission.description,
          module: moduleData.module,
          category: moduleData.category,
          isActive: true
        });
      }
    }
  }

  // Check if user has specific permission
  async userHasPermission(userId: number, permissionKey: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || !user.groupId) return false;

    // Admin group has all permissions
    if (user.groupId === 5) return true;

    const result = await db.select()
      .from(groupPermissions)
      .innerJoin(permissions, eq(groupPermissions.permissionId, permissions.id))
      .where(
        and(
          eq(groupPermissions.groupId, user.groupId),
          eq(permissions.key, permissionKey),
          eq(permissions.isActive, true)
        )
      )
      .limit(1);

    return result.length > 0;
  }

  // Get user permissions by module
  async getUserPermissionsByModule(userId: number, module?: string) {
    const user = await this.getUser(userId);
    if (!user || !user.groupId) return [];

    const whereConditions = [
      eq(groupPermissions.groupId, user.groupId),
      eq(permissions.isActive, true)
    ];

    if (module) {
      whereConditions.push(eq(permissions.module, module));
    }

    return await db.select({
      id: permissions.id,
      key: permissions.key,
      name: permissions.name,
      description: permissions.description,
      module: permissions.module,
      category: permissions.category
    })
    .from(groupPermissions)
    .innerJoin(permissions, eq(groupPermissions.permissionId, permissions.id))
    .where(and(...whereConditions));
  }
}

export const storage = new DatabaseStorage();