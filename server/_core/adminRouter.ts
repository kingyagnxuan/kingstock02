import { z } from "zod";
import { adminProcedure, router } from "./trpc";
import { getDb } from "../db";
import { users, systemConfig } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

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

      if (existingConfig.length > 0) {
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

      return { success: true };
    }),

  deleteConfig: adminProcedure
    .input(z.object({ key: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // 防止删除关键配置
      const protectedKeys = ["paymentEnabled"];
      if (protectedKeys.includes(input.key)) {
        throw new Error("Cannot delete protected configuration");
      }

      await db.delete(systemConfig).where(eq(systemConfig.key, input.key));

      return { success: true };
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
