import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// 市场观点表
export const marketInsights = mysqlTable("marketInsights", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull(),
  outlook: text("outlook").notNull(),
  strategy: text("strategy").notNull(),
  hotSectors: text("hotSectors").notNull(),
  riskFactors: text("riskFactors").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MarketInsight = typeof marketInsights.$inferSelect;
export type InsertMarketInsight = typeof marketInsights.$inferInsert;

// 股票推荐表
export const stockRecommendations = mysqlTable("stockRecommendations", {
  id: int("id").autoincrement().primaryKey(),
  stockCode: varchar("stockCode", { length: 10 }).notNull(),
  stockName: varchar("stockName", { length: 100 }).notNull(),
  recommendationType: mysqlEnum("recommendationType", ["buy", "hold", "sell"]).notNull(),
  targetPrice: varchar("targetPrice", { length: 20 }),
  stopLoss: varchar("stopLoss", { length: 20 }),
  reason: text("reason").notNull(),
  recommendDate: timestamp("recommendDate").defaultNow().notNull(),
  currentPrice: varchar("currentPrice", { length: 20 }),
  priceChangePercent: varchar("priceChangePercent", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StockRecommendation = typeof stockRecommendations.$inferSelect;
export type InsertStockRecommendation = typeof stockRecommendations.$inferInsert;

// AI对话表
export const aiConversations = mysqlTable("aiConversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }),
  stockCode: varchar("stockCode", { length: 10 }),
  model: varchar("model", { length: 50 }).default("gpt-4"),
  systemPrompt: text("systemPrompt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AIConversation = typeof aiConversations.$inferSelect;
export type InsertAIConversation = typeof aiConversations.$inferInsert;

// AI对话消息表
export const aiMessages = mysqlTable("aiMessages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIMessage = typeof aiMessages.$inferSelect;
export type InsertAIMessage = typeof aiMessages.$inferInsert;

// 文件存储表
export const uploadedFiles = mysqlTable("uploadedFiles", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  messageId: int("messageId"), // 关联的消息ID
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 50 }).notNull(), // image, document, pdf等
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  fileSize: int("fileSize").notNull(), // 字节数
  s3Key: varchar("s3Key", { length: 500 }).notNull(), // S3存储路径
  s3Url: text("s3Url").notNull(), // S3访问URL
  extractedText: text("extractedText"), // 提取的文本内容
  analysisResult: text("analysisResult"), // AI分析结果（JSON）
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type InsertUploadedFile = typeof uploadedFiles.$inferInsert;

// 深度研究报告表
export const researchReports = mysqlTable("researchReports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  reportType: mysqlEnum("reportType", ["stock", "sector", "industry"]).notNull(),
  targetCode: varchar("targetCode", { length: 50 }).notNull(),
  targetName: varchar("targetName", { length: 100 }).notNull(),
  summary: text("summary").notNull(),
  fullContent: text("fullContent").notNull(),
  marketSentiment: varchar("marketSentiment", { length: 50 }),
  sectorHotspots: text("sectorHotspots"),
  capitalFlow: text("capitalFlow"),
  policyBenefits: text("policyBenefits"),
  recommendations: text("recommendations").notNull(),
  riskFactors: text("riskFactors"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ResearchReport = typeof researchReports.$inferSelect;
export type InsertResearchReport = typeof researchReports.$inferInsert;

// 股票推荐详情表
export const reportRecommendations = mysqlTable("reportRecommendations", {
  id: int("id").autoincrement().primaryKey(),
  reportId: int("reportId").notNull(),
  stockCode: varchar("stockCode", { length: 10 }).notNull(),
  stockName: varchar("stockName", { length: 100 }).notNull(),
  currentPrice: varchar("currentPrice", { length: 20 }).notNull(),
  buyRange: varchar("buyRange", { length: 50 }).notNull(),
  targetPrice: varchar("targetPrice", { length: 20 }).notNull(),
  stopLossPrice: varchar("stopLossPrice", { length: 20 }).notNull(),
  reason: text("reason").notNull(),
  technicalAnalysis: text("technicalAnalysis"),
  fundamentalAnalysis: text("fundamentalAnalysis"),
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high"]).default("medium"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReportRecommendation = typeof reportRecommendations.$inferSelect;
export type InsertReportRecommendation = typeof reportRecommendations.$inferInsert;
