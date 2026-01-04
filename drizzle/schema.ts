import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

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
  wechatId: varchar("wechatId", { length: 100 }), // 微信ID
  phoneNumber: varchar("phoneNumber", { length: 20 }), // 手机号
  welcomeGuideCompleted: boolean("welcomeGuideCompleted").default(false).notNull(), // 是否完成欢迎引导
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
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

// 当日涨停潜力股表
export const dailyLimitUpPotentials = mysqlTable("dailyLimitUpPotentials", {
  id: int("id").autoincrement().primaryKey(),
  stockCode: varchar("stockCode", { length: 10 }).notNull(),
  stockName: varchar("stockName", { length: 100 }).notNull(),
  currentPrice: varchar("currentPrice", { length: 20 }).notNull(),
  priceChangePercent: varchar("priceChangePercent", { length: 20 }).notNull(),
  volume: varchar("volume", { length: 50 }).notNull(), // 成交量
  volumeRatio: varchar("volumeRatio", { length: 20 }).notNull(), // 量比
  netMoneyFlow: varchar("netMoneyFlow", { length: 50 }).notNull(), // 资金净流入
  moneyFlowPercent: varchar("moneyFlowPercent", { length: 20 }).notNull(), // 资金流入占比
  riseSpeed: varchar("riseSpeed", { length: 20 }).notNull(), // 涨速
  marketSentiment: varchar("marketSentiment", { length: 50 }).notNull(), // 市场情绪：极度看好、看好、中性、看空
  industryHotness: varchar("industryHotness", { length: 50 }).notNull(), // 行业热度：极热、热、温、冷
  technicalSignal: varchar("technicalSignal", { length: 50 }).notNull(), // 技术信号：强势、中性、弱势
  limitUpProbability: varchar("limitUpProbability", { length: 20 }).notNull(), // 涨停概率 0-100
  analysisReason: text("analysisReason").notNull(), // 分析原因
  updateTime: timestamp("updateTime").defaultNow().onUpdateNow().notNull(),
  tradingDate: varchar("tradingDate", { length: 10 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyLimitUpPotential = typeof dailyLimitUpPotentials.$inferSelect;
export type InsertDailyLimitUpPotential = typeof dailyLimitUpPotentials.$inferInsert;

// 次日涨停潜力股表
export const nextDayLimitUpPotentials = mysqlTable("nextDayLimitUpPotentials", {
  id: int("id").autoincrement().primaryKey(),
  stockCode: varchar("stockCode", { length: 10 }).notNull(),
  stockName: varchar("stockName", { length: 100 }).notNull(),
  closingPrice: varchar("closingPrice", { length: 20 }).notNull(),
  priceChangePercent: varchar("priceChangePercent", { length: 20 }).notNull(),
  dayVolume: varchar("dayVolume", { length: 50 }).notNull(), // 当日成交量
  dayNetMoneyFlow: varchar("dayNetMoneyFlow", { length: 50 }).notNull(), // 当日资金净流入
  technicalTrend: varchar("technicalTrend", { length: 50 }).notNull(), // 技术趋势：上升、横盘、下降
  fundamentalScore: varchar("fundamentalScore", { length: 20 }).notNull(), // 基本面评分 0-100
  sentimentScore: varchar("sentimentScore", { length: 20 }).notNull(), // 情绪评分 0-100
  industryMomentum: varchar("industryMomentum", { length: 50 }).notNull(), // 行业动量：强、中、弱
  nextDayPotential: varchar("nextDayPotential", { length: 20 }).notNull(), // 次日涨停概率 0-100
  keyFactors: text("keyFactors").notNull(), // 关键因素（JSON数组）
  riskFactors: text("riskFactors").notNull(), // 风险因素（JSON数组）
  analysisReport: text("analysisReport").notNull(), // 详细分析报告
  tradingDate: varchar("tradingDate", { length: 10 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NextDayLimitUpPotential = typeof nextDayLimitUpPotentials.$inferSelect;
export type InsertNextDayLimitUpPotential = typeof nextDayLimitUpPotentials.$inferInsert;

// 用户积分表
export const userPoints = mysqlTable("userPoints", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  totalPoints: int("totalPoints").default(0).notNull(), // 总积分
  usedPoints: int("usedPoints").default(0).notNull(), // 已使用积分
  availablePoints: int("availablePoints").default(0).notNull(), // 可用积分
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPoints = typeof userPoints.$inferSelect;
export type InsertUserPoints = typeof userPoints.$inferInsert;

// 邀请记录表
export const invitations = mysqlTable("invitations", {
  id: int("id").autoincrement().primaryKey(),
  inviterId: int("inviterId").notNull(), // 邀请者ID
  inviteeId: int("inviteeId"), // 被邀请者ID（可能还未注册）
  invitationCode: varchar("invitationCode", { length: 50 }).notNull().unique(), // 邀请码
  invitationLink: text("invitationLink").notNull(), // 邀请链接
  status: mysqlEnum("status", ["pending", "completed", "expired"]).default("pending").notNull(), // 邀请状态
  inviterPointsRewarded: int("inviterPointsRewarded").default(0).notNull(), // 邀请者获得的积分
  inviteePointsRewarded: int("inviteePointsRewarded").default(0).notNull(), // 被邀请者获得的积分
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"), // 完成时间
  expiresAt: timestamp("expiresAt"), // 过期时间
});

export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = typeof invitations.$inferInsert;

// 用户订阅表
export const userSubscriptions = mysqlTable("userSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  planType: mysqlEnum("planType", ["free", "monthly", "yearly"]).default("free").notNull(), // 订阅类型
  price: int("price").default(0).notNull(), // 价格（单位：分）
  pointsUsed: int("pointsUsed").default(0).notNull(), // 使用的积分数
  status: mysqlEnum("status", ["active", "inactive", "expired", "cancelled"]).default("active").notNull(), // 订阅状态
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }), // Stripe订阅ID
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"), // 订阅结束日期
  autoRenew: int("autoRenew").default(1).notNull(), // 是否自动续费
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

// 推送消息表
export const pushNotifications = mysqlTable("pushNotifications", {
  id: int("id").autoincrement().primaryKey(),
  stockCode: varchar("stockCode", { length: 10 }).notNull(), // 股票代码
  stockName: varchar("stockName", { length: 100 }).notNull(), // 股票名称
  message: text("message").notNull(), // 推送信息
  buyRange: varchar("buyRange", { length: 100 }).notNull(), // 买入区间
  targetUsers: mysqlEnum("targetUsers", ["all", "premium", "specific"]).default("all").notNull(), // 目标用户
  specificUserIds: text("specificUserIds"), // 特定用户ID列表（JSON）
  pushChannels: varchar("pushChannels", { length: 100 }).default("wechat").notNull(), // 推送渠道
  status: mysqlEnum("status", ["draft", "scheduled", "sent", "cancelled"]).default("draft").notNull(), // 推送状态
  scheduledTime: timestamp("scheduledTime"), // 定时发送时间
  sentTime: timestamp("sentTime"), // 实际发送时间
  createdBy: int("createdBy").notNull(), // 创建者ID（管理员）
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PushNotification = typeof pushNotifications.$inferSelect;
export type InsertPushNotification = typeof pushNotifications.$inferInsert;

// 推送记录表
export const pushLogs = mysqlTable("pushLogs", {
  id: int("id").autoincrement().primaryKey(),
  pushNotificationId: int("pushNotificationId").notNull(), // 关联的推送消息ID
  userId: int("userId").notNull(), // 接收用户ID
  wechatId: varchar("wechatId", { length: 100 }), // 微信ID
  status: mysqlEnum("status", ["pending", "sent", "failed", "read"]).default("pending").notNull(), // 发送状态
  errorMessage: text("errorMessage"), // 错误信息
  sentAt: timestamp("sentAt"), // 发送时间
  readAt: timestamp("readAt"), // 阅读时间
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PushLog = typeof pushLogs.$inferSelect;
export type InsertPushLog = typeof pushLogs.$inferInsert;
