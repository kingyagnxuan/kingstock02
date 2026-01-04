import { z } from "zod";
import { adminProcedure, router } from "./trpc";
import { getDb } from "../db";
import { adminLogs } from "../../drizzle/schema";
import { eq, desc, and, gte } from "drizzle-orm";

export const adminLogsRouter = router({
  // 获取操作日志列表
  getLogs: adminProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().default(20),
        action: z.string().optional(),
        resource: z.string().optional(),
        adminId: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const offset = (input.page - 1) * input.pageSize;
      let query = db.select().from(adminLogs);

      // 构建查询条件
      const conditions = [];
      if (input.action) {
        conditions.push(eq(adminLogs.action, input.action));
      }
      if (input.resource) {
        conditions.push(eq(adminLogs.resource, input.resource));
      }
      if (input.adminId) {
        conditions.push(eq(adminLogs.adminId, input.adminId));
      }
      if (input.startDate) {
        conditions.push(gte(adminLogs.timestamp, input.startDate));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const logs = await query
        .orderBy(desc(adminLogs.timestamp))
        .limit(input.pageSize)
        .offset(offset);

      // 获取总数
      const totalResult = await db
        .select({ count: adminLogs.id })
        .from(adminLogs);
      const total = totalResult.length;

      return {
        data: logs.map((log: any) => ({
          id: log.id,
          adminId: log.adminId,
          action: log.action,
          resource: log.resource,
          resourceId: log.resourceId,
          details: (() => {
            try {
              return JSON.parse(log.details || "{}");
            } catch {
              return log.details;
            }
          })(),
          changes: (() => {
            try {
              return JSON.parse(log.changes || "{}");
            } catch {
              return log.changes;
            }
          })(),
          status: log.status,
          errorMessage: log.errorMessage,
          ipAddress: log.ipAddress,
          timestamp: log.timestamp,
        })),
        pagination: {
          page: input.page,
          pageSize: input.pageSize,
          total,
          totalPages: Math.ceil(total / input.pageSize),
        },
      };
    }),

  // 获取日志统计
  getLogStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allLogs = await db.select().from(adminLogs);
    const successLogs = allLogs.filter((log: any) => log.status === "success");
    const failedLogs = allLogs.filter((log: any) => log.status === "failed");

    // 按操作类型统计
    const actionStats: Record<string, number> = {};
    allLogs.forEach((log: any) => {
      actionStats[log.action] = (actionStats[log.action] || 0) + 1;
    });

    // 按资源类型统计
    const resourceStats: Record<string, number> = {};
    allLogs.forEach((log: any) => {
      resourceStats[log.resource] = (resourceStats[log.resource] || 0) + 1;
    });

    return {
      totalLogs: allLogs.length,
      successLogs: successLogs.length,
      failedLogs: failedLogs.length,
      actionStats,
      resourceStats,
    };
  }),

  // 创建操作日志
  createLog: adminProcedure
    .input(
      z.object({
        action: z.string().min(1),
        resource: z.string().min(1),
        resourceId: z.string().optional(),
        details: z.any().optional(),
        changes: z.any().optional(),
        status: z.enum(["success", "failed"]).default("success"),
        errorMessage: z.string().optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      if (!ctx.user?.id) {
        throw new Error("User not authenticated");
      }

      const detailsStr = typeof input.details === "string" ? input.details : JSON.stringify(input.details || {});
      const changesStr = typeof input.changes === "string" ? input.changes : JSON.stringify(input.changes || {});

      await db.insert(adminLogs).values({
        adminId: ctx.user.id,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId,
        details: detailsStr,
        changes: changesStr,
        status: input.status,
        errorMessage: input.errorMessage,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });

      return { success: true };
    }),

  // 删除旧日志
  deleteOldLogs: adminProcedure
    .input(
      z.object({
        daysOld: z.number().int().positive().default(90), // 删除90天前的日志
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - input.daysOld);

      const result = await db
        .delete(adminLogs)
        .where(gte(adminLogs.timestamp, cutoffDate));

      return { success: true, deletedCount: 0 };
    }),

  // 获取特定资源的操作历史
  getResourceHistory: adminProcedure
    .input(
      z.object({
        resource: z.string().min(1),
        resourceId: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const logs = await db
        .select()
        .from(adminLogs)
        .where(
          and(
            eq(adminLogs.resource, input.resource),
            eq(adminLogs.resourceId, input.resourceId)
          )
        )
        .orderBy(desc(adminLogs.timestamp));

      return logs.map((log: any) => ({
        id: log.id,
        adminId: log.adminId,
        action: log.action,
        changes: (() => {
          try {
            return JSON.parse(log.changes || "{}");
          } catch {
            return log.changes;
          }
        })(),
        status: log.status,
        timestamp: log.timestamp,
      }));
    }),
});
