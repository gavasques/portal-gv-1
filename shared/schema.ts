import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  accessLevel: text("access_level").notNull().default("basic"), // basic, aluno, aluno_pro, suporte, admin
  aiCredits: integer("ai_credits").notNull().default(100),
  isActive: boolean("is_active").notNull().default(true),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  website: text("website"),
  email: text("email"),
  phone: text("phone"),
  logo: text("logo"),
  isVerified: boolean("is_verified").notNull().default(false),
  discountInfo: text("discount_info"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  productType: text("product_type").notNull(),
  country: text("country").notNull(),
  website: text("website"),
  logo: text("logo"),
  isVerified: boolean("is_verified").notNull().default(false),
  discountInfo: text("discount_info"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supplierBranches = pgTable("supplier_branches", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  phone: text("phone"),
  email: text("email"),
});

export const supplierContacts = pgTable("supplier_contacts", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  branchId: integer("branch_id").references(() => supplierBranches.id),
  name: text("name").notNull(),
  position: text("position"),
  email: text("email"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
});

export const tools = pgTable("tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  primaryFunction: text("primary_function").notNull(),
  website: text("website"),
  logo: text("logo"),
  pricing: text("pricing"),
  isVerified: boolean("is_verified").notNull().default(false),
  discountInfo: text("discount_info"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mySuppliers = pgTable("my_suppliers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mySupplierBranches = pgTable("my_supplier_branches", {
  id: serial("id").primaryKey(),
  mySupplierId: integer("my_supplier_id").notNull().references(() => mySuppliers.id),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  phone: text("phone"),
  email: text("email"),
});

export const mySupplierContacts = pgTable("my_supplier_contacts", {
  id: serial("id").primaryKey(),
  mySupplierId: integer("my_supplier_id").references(() => mySuppliers.id),
  branchId: integer("branch_id").references(() => mySupplierBranches.id),
  name: text("name").notNull(),
  position: text("position"),
  email: text("email"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  mySupplierId: integer("my_supplier_id").notNull().references(() => mySuppliers.id),
  type: text("type").notNull(), // email, phone, whatsapp, meeting
  subject: text("subject"),
  content: text("content").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supplierFiles = pgTable("supplier_files", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  mySupplierId: integer("my_supplier_id").notNull().references(() => mySuppliers.id),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  asin: text("asin"),
  sku: text("sku"),
  image: text("image"),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
  fbaFee: decimal("fba_fee", { precision: 10, scale: 2 }),
  fbmFee: decimal("fbm_fee", { precision: 10, scale: 2 }),
  dbaFee: decimal("dba_fee", { precision: 10, scale: 2 }),
  commission: decimal("commission", { precision: 10, scale: 2 }),
  taxes: decimal("taxes", { precision: 10, scale: 2 }),
  prepCenterFee: decimal("prep_center_fee", { precision: 10, scale: 2 }),
  customCosts: jsonb("custom_costs"), // Array of {name, value, type: 'percentage' | 'fixed'}
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  language: text("language").notNull().default("pt"),
  subject: text("subject"),
  content: text("content").notNull(),
  tags: text("tags").array(),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiUsageHistory = pgTable("ai_usage_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  agentType: text("agent_type").notNull(), // listing_generator, image_generator, expert_amazon, expert_import, expert_action_plan
  creditsUsed: integer("credits_used").notNull(),
  inputData: jsonb("input_data"),
  outputData: jsonb("output_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  category: text("category").notNull(), // Dúvida sobre Curso, Problema Técnico, Financeiro, Sugestão
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // open, in_progress, responded, closed
  priority: text("priority").notNull().default("normal"), // low, normal, high, urgent
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ticketMessages = pgTable("ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => tickets.id),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  isInternal: boolean("is_internal").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ticketFiles = pgTable("ticket_files", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => tickets.id),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // pdf, text, link, embed
  content: text("content"), // For text content or embed codes
  filePath: text("file_path"), // For PDF files
  url: text("url"), // For external links
  accessLevel: text("access_level").notNull().default("Public"), // Public, Restricted
  category: text("category"),
  tags: text("tags").array(),
  downloadCount: integer("download_count").notNull().default(0),
  viewCount: integer("view_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  isImportant: boolean("is_important").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  itemType: text("item_type").notNull(), // partner, supplier, tool
  itemId: integer("item_id").notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment").notNull(),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  mySuppliers: many(mySuppliers),
  products: many(products),
  tickets: many(tickets),
  conversations: many(conversations),
  aiUsageHistory: many(aiUsageHistory),
  reviews: many(reviews),
}));

export const partnersRelations = relations(partners, ({ many }) => ({
  reviews: many(reviews),
}));

export const suppliersRelations = relations(suppliers, ({ many, one }) => ({
  branches: many(supplierBranches),
  contacts: many(supplierContacts),
  reviews: many(reviews),
}));

export const supplierBranchesRelations = relations(supplierBranches, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [supplierBranches.supplierId],
    references: [suppliers.id],
  }),
  contacts: many(supplierContacts),
}));

export const supplierContactsRelations = relations(supplierContacts, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierContacts.supplierId],
    references: [suppliers.id],
  }),
  branch: one(supplierBranches, {
    fields: [supplierContacts.branchId],
    references: [supplierBranches.id],
  }),
}));

export const toolsRelations = relations(tools, ({ many }) => ({
  reviews: many(reviews),
}));

export const mySuppliersRelations = relations(mySuppliers, ({ one, many }) => ({
  user: one(users, {
    fields: [mySuppliers.userId],
    references: [users.id],
  }),
  branches: many(mySupplierBranches),
  contacts: many(mySupplierContacts),
  conversations: many(conversations),
  files: many(supplierFiles),
}));

export const mySupplierBranchesRelations = relations(mySupplierBranches, ({ one, many }) => ({
  mySupplier: one(mySuppliers, {
    fields: [mySupplierBranches.mySupplierId],
    references: [mySuppliers.id],
  }),
  contacts: many(mySupplierContacts),
}));

export const mySupplierContactsRelations = relations(mySupplierContacts, ({ one }) => ({
  mySupplier: one(mySuppliers, {
    fields: [mySupplierContacts.mySupplierId],
    references: [mySuppliers.id],
  }),
  branch: one(mySupplierBranches, {
    fields: [mySupplierContacts.branchId],
    references: [mySupplierBranches.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  mySupplier: one(mySuppliers, {
    fields: [conversations.mySupplierId],
    references: [mySuppliers.id],
  }),
}));

export const supplierFilesRelations = relations(supplierFiles, ({ one }) => ({
  user: one(users, {
    fields: [supplierFiles.userId],
    references: [users.id],
  }),
  mySupplier: one(mySuppliers, {
    fields: [supplierFiles.mySupplierId],
    references: [mySuppliers.id],
  }),
}));

export const productsRelations = relations(products, ({ one }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
}));

export const aiUsageHistoryRelations = relations(aiUsageHistory, ({ one }) => ({
  user: one(users, {
    fields: [aiUsageHistory.userId],
    references: [users.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  user: one(users, {
    fields: [tickets.userId],
    references: [users.id],
  }),
  assignedUser: one(users, {
    fields: [tickets.assignedTo],
    references: [users.id],
  }),
  messages: many(ticketMessages),
  files: many(ticketFiles),
}));

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketMessages.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [ticketMessages.userId],
    references: [users.id],
  }),
}));

export const ticketFilesRelations = relations(ticketFiles, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketFiles.ticketId],
    references: [tickets.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

export const insertToolSchema = createInsertSchema(tools).omit({
  id: true,
  createdAt: true,
});

export const insertMySupplierSchema = createInsertSchema(mySuppliers).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
  createdAt: true,
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Tool = typeof tools.$inferSelect;
export type InsertTool = z.infer<typeof insertToolSchema>;
export type MySupplier = typeof mySuppliers.$inferSelect;
export type InsertMySupplier = z.infer<typeof insertMySupplierSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
