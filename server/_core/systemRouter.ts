import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { getDb } from "../db";
import { systemConfig } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  getConfig: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // 获取所有配置
    const configs = await db.select().from(systemConfig);
    const result: Record<string, any> = {};

    for (const config of configs) {
      try {
        result[config.key] = JSON.parse(config.value);
      } catch {
        result[config.key] = config.value;
      }
    }

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
        // 更新现有配置
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
        // 创建新配置
        await db.insert(systemConfig).values({
          key: input.key,
          value: valueStr,
          description: input.description,
          updatedBy: ctx.user?.id,
        });
      }

      return { success: true };
    }),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});
