import { z } from "zod";
import { adminProcedure, router } from "./trpc";
import { getDb } from "../db";
import { users, systemConfig, adminLogs } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// 辅助函数：记录操作日志
async function logAdminAction(
  db: any,
  adminId: number,
  action: string,
  resource: string,
  resourceId?: string,
  details?: any,
  changes?: any,
  status: "success" | "failed" = "success",
  errorMessage?: string
) {
  try {
    await db.insert(adminLogs).values({
      adminId,
      action,
      resource,
      resourceId,
      details: typeof details === "string" ? details : JSON.stringify(details || {}),
      changes: typeof changes === "string" ? changes : JSON.stringify(changes || {}),
      status,
      errorMessage,
    });
  } catch (err) {
    console.error("Failed to log admin action:", err);
  }
}

export const adminRouter = router({
  // 用户管理
  getUsers: adminProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().default(20),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const offset = (input.page - 1) * input.pageSize;

      // 构建查询条件
      let query = db.select().from(users);

      // 执行查询
      const userList = await query
        .orderBy(desc(users.createdAt))
        .limit(input.pageSize)
        .offset(offset);

      // 获取总数
      const totalResult = await db
        .select({ count: users.id })
        .from(users);
      const total = totalResult.length;

      return {
        data: userList.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          openId: u.openId,
          role: u.role,
          createdAt: u.createdAt,
          lastSignedIn: u.lastSignedIn,
        })),
        pagination: {
          page: input.page,
          pageSize: input.pageSize,
          total,
          totalPages: Math.ceil(total / input.pageSize),
        },
      };
    }),

  getUserStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const totalUsers = await db.select({ count: users.id }).from(users);
    const adminUsers = await db
      .select({ count: users.id })
      .from(users)
      .where(eq(users.role, "admin"));

    return {
      totalUsers: totalUsers.length,
      adminUsers: adminUsers.length,
      regularUsers: totalUsers.length - adminUsers.length,
    };
  }),

  // 系统配置管理
  getAllConfigs: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const configs = await db.select().from(systemConfig);
    const result = configs.map((config: any) => ({
      id: config.id,
      key: config.key,
      value: (() => {
        try {
          return JSON.parse(config.value);
        } catch {
          return config.value;
        }
      })(),
      description: config.description,
      updatedAt: config.updatedAt,
    }));

    return result;
  }),

  updateConfig: adminProcedure
    .input(
      z.object({
        key: z.string().min(1, "key is required"),
        value: z.any(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const existingConfig = await db
        .select()
        .from(systemConfig)
        .where(eq(systemConfig.key, input.key))
        .limit(1);

      const valueStr = typeof input.value === "string" ? input.value : JSON.stringify(input.value);
      const isUpdate = existingConfig.length > 0;
      const oldValue = isUpdate ? existingConfig[0].value : null;

      try {
        if (isUpdate) {
          await db
            .update(systemConfig)
            .set({
              value: valueStr,
              description: input.description,
              updatedAt: new Date(),
              updatedBy: ctx.user?.id,
            })
            .where(eq(systemConfig.key, input.key));
        } else {
          await db.insert(systemConfig).values({
            key: input.key,
            value: valueStr,
            description: input.description,
            updatedBy: ctx.user?.id,
          });
        }

        // 记录操作日志
        await logAdminAction(
          db,
          ctx.user?.id || 0,
          isUpdate ? "updateConfig" : "createConfig",
          "config",
          input.key,
          { key: input.key, description: input.description },
          { oldValue, newValue: valueStr },
          "success"
        );

        return { success: true };
      } catch (error) {
        // 记录失败日志
        await logAdminAction(
          db,
          ctx.user?.id || 0,
          isUpdate ? "updateConfig" : "createConfig",
          "config",
          input.key,
          { key: input.key },
          undefined,
          "failed",
          error instanceof Error ? error.message : "Unknown error"
        );
        throw error;
      }
    }),

  deleteConfig: adminProcedure
    .input(z.object({ key: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // 防止删除关键配置
      const protectedKeys = ["paymentEnabled"];
      if (protectedKeys.includes(input.key)) {
        throw new Error("Cannot delete protected configuration");
      }

      try {
        await db.delete(systemConfig).where(eq(systemConfig.key, input.key));

        // 记录操作日志
        await logAdminAction(
          db,
          ctx.user?.id || 0,
          "deleteConfig",
          "config",
          input.key,
          { key: input.key },
          undefined,
          "success"
        );

        return { success: true };
      } catch (error) {
        // 记录失败日志
        await logAdminAction(
          db,
          ctx.user?.id || 0,
          "deleteConfig",
          "config",
          input.key,
          { key: input.key },
          undefined,
          "failed",
          error instanceof Error ? error.message : "Unknown error"
        );
        throw error;
      }
    }),

  // 设置用户角色
  setUserRole: adminProcedure
    .input(
      z.object({
        userId: z.number().int().positive(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // 防止管理员自己降级
        if (input.userId === ctx.user?.id && input.role === "user") {
          throw new Error("Cannot downgrade yourself from admin");
        }

        // 获取用户的旧角色
        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.id, input.userId))
          .limit(1);

        if (userResult.length === 0) {
          throw new Error("User not found");
        }

        const oldRole = userResult[0].role;

        // 更新用户角色
        await db
          .update(users)
          .set({ role: input.role, updatedAt: new Date() })
          .where(eq(users.id, input.userId));

        // 记录操作日志
        await logAdminAction(
          db,
          ctx.user?.id || 0,
          "setUserRole",
          "user",
          input.userId.toString(),
          { userId: input.userId, newRole: input.role },
          { oldRole, newRole: input.role },
          "success"
        );

        return { success: true };
      } catch (error) {
        // 记录失败日志
        await logAdminAction(
          db,
          ctx.user?.id || 0,
          "setUserRole",
          "user",
          input.userId.toString(),
          { userId: input.userId, role: input.role },
          undefined,
          "failed",
          error instanceof Error ? error.message : "Unknown error"
        );
        throw error;
      }
    }),

  // 系统统计
  getSystemStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const totalUsers = await db.select({ count: users.id }).from(users);

    // 获取今天新增用户
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newUsersToday = await db
      .select({ count: users.id })
      .from(users)
      .where(eq(users.createdAt, today));

    return {
      totalUsers: totalUsers.length,
      newUsersToday: newUsersToday.length,
      timestamp: new Date(),
    };
  }),
});
