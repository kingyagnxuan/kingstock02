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