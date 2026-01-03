import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, marketInsights, stockRecommendations, aiConversations, aiMessages, uploadedFiles, researchReports, reportRecommendations, InsertMarketInsight, InsertStockRecommendation, InsertAIConversation, InsertAIMessage, InsertUploadedFile, InsertResearchReport, InsertReportRecommendation } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// 市场观点相关查询
export async function getLatestMarketInsight() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(marketInsights).orderBy(desc(marketInsights.createdAt)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createMarketInsight(data: InsertMarketInsight) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(marketInsights).values(data);
}

// 股票推荐相关查询
export async function getRecentStockRecommendations(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(stockRecommendations).orderBy(desc(stockRecommendations.createdAt)).limit(limit);
}

export async function createStockRecommendation(data: InsertStockRecommendation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(stockRecommendations).values(data);
}

// AI对话相关查询
export async function createAIConversation(data: InsertAIConversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aiConversations).values(data);
  return result;
}

export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(aiConversations).where(eq(aiConversations.userId, userId)).orderBy(desc(aiConversations.createdAt));
}

export async function addAIMessage(data: InsertAIMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(aiMessages).values(data);
}

export async function getConversationMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(aiMessages).where(eq(aiMessages.conversationId, conversationId)).orderBy(aiMessages.createdAt);
}

// 文件相关查询
export async function uploadFile(data: InsertUploadedFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(uploadedFiles).values(data);
}

export async function getConversationFiles(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(uploadedFiles).where(eq(uploadedFiles.conversationId, conversationId)).orderBy(desc(uploadedFiles.createdAt));
}

export async function getFileById(fileId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(uploadedFiles).where(eq(uploadedFiles.id, fileId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateFileAnalysis(fileId: number, extractedText: string, analysisResult: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(uploadedFiles).set({ extractedText, analysisResult }).where(eq(uploadedFiles.id, fileId));
}
