import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { invitations, userPoints, userSubscriptions, pushNotifications, pushLogs } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

// 生成邀请码
function generateInvitationCode(): string {
  return crypto.randomBytes(8).toString("hex").toUpperCase();
}

// 生成邀请链接
function generateInvitationLink(code: string): string {
  const baseUrl = process.env.VITE_APP_URL || "http://localhost:3000";
  return `${baseUrl}/register?invitationCode=${code}`;
}

export const invitationsRouter = router({
  // 创建邀请码
  createInvitation: publicProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const invitationCode = generateInvitationCode();
      const invitationLink = generateInvitationLink(invitationCode);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const result = await db.insert(invitations).values({
        inviterId: input.userId,
        invitationCode,
        invitationLink,
        status: "pending",
        expiresAt,
      });

      return {
        success: true,
        invitationCode,
        invitationLink,
        expiresAt,
      };
    }),

  // 获取用户的邀请记录
  getMyInvitations: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userInvitations = await db
        .select()
        .from(invitations)
        .where(eq(invitations.inviterId, input.userId));

      return userInvitations;
    }),

  // 通过邀请码注册
  registerWithCode: publicProcedure
    .input(z.object({ invitationCode: z.string(), newUserId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // 查找邀请记录
      const invitation = await db
        .select()
        .from(invitations)
        .where(eq(invitations.invitationCode, input.invitationCode))
        .limit(1);

      if (!invitation || invitation.length === 0) {
        throw new Error("Invalid invitation code");
      }

      const inv = invitation[0];
      if (inv.status !== "pending") {
        throw new Error("Invitation already used or expired");
      }

      if (inv.expiresAt && new Date() > inv.expiresAt) {
        throw new Error("Invitation has expired");
      }

      // 更新邀请状态
      await db
        .update(invitations)
        .set({
          inviteeId: input.newUserId,
          status: "completed",
          completedAt: new Date(),
          inviterPointsRewarded: 500,
          inviteePointsRewarded: 500,
        })
        .where(eq(invitations.id, inv.id));

      // 为邀请者添加积分
      const inviterPoints = await db
        .select()
        .from(userPoints)
        .where(eq(userPoints.userId, inv.inviterId))
        .limit(1);

      if (inviterPoints.length > 0) {
        const points = inviterPoints[0];
        await db
          .update(userPoints)
          .set({
            totalPoints: points.totalPoints + 500,
            availablePoints: points.availablePoints + 500,
          })
          .where(eq(userPoints.userId, inv.inviterId));
      } else {
        await db.insert(userPoints).values({
          userId: inv.inviterId,
          totalPoints: 500,
          availablePoints: 500,
        });
      }

      // 为被邀请者添加积分
      const inviteePoints = await db
        .select()
        .from(userPoints)
        .where(eq(userPoints.userId, input.newUserId))
        .limit(1);

      if (inviteePoints.length > 0) {
        const points = inviteePoints[0];
        await db
          .update(userPoints)
          .set({
            totalPoints: points.totalPoints + 500,
            availablePoints: points.availablePoints + 500,
          })
          .where(eq(userPoints.userId, input.newUserId));
      } else {
        await db.insert(userPoints).values({
          userId: input.newUserId,
          totalPoints: 500,
          availablePoints: 500,
        });
      }

      return {
        success: true,
        message: "Registration completed successfully",
        pointsAwarded: 500,
      };
    }),

  // 获取用户积分信息
  getPoints: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let userPointsRecord = await db
        .select()
        .from(userPoints)
        .where(eq(userPoints.userId, input.userId))
        .limit(1);

      if (userPointsRecord.length === 0) {
        // 创建新的积分记录
        await db.insert(userPoints).values({
          userId: input.userId,
          totalPoints: 0,
          availablePoints: 0,
        });

        userPointsRecord = [
          {
            id: 0,
            userId: input.userId,
            totalPoints: 0,
            usedPoints: 0,
            availablePoints: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
      }

      return userPointsRecord[0];
    }),

  // 获取用户订阅信息
  getSubscription: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, input.userId))
        .limit(1);

      if (subscription.length === 0) {
        // 创建免费订阅记录
        await db.insert(userSubscriptions).values({
          userId: input.userId,
          planType: "free",
          status: "active",
        });

        subscription = [
          {
            id: 0,
            userId: input.userId,
            planType: "free" as const,
            price: 0,
            pointsUsed: 0,
            status: "active" as const,
            stripeSubscriptionId: null,
            startDate: new Date(),
            endDate: null,
            autoRenew: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
      }

      return subscription[0];
    }),

  // 使用积分升级订阅
  upgradeWithPoints: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        planType: z.enum(["monthly", "yearly"]),
        pointsToUse: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // 检查用户积分
      const userPointsRecord = await db
        .select()
        .from(userPoints)
        .where(eq(userPoints.userId, input.userId))
        .limit(1);

      if (userPointsRecord.length === 0) {
        throw new Error("User points not found");
      }

      const points = userPointsRecord[0];
      if (points.availablePoints < input.pointsToUse) {
        throw new Error("Insufficient points");
      }

      // 计算价格
      const planPrices: Record<string, number> = {
        monthly: 99900, // ¥999 = 99900分
        yearly: 880000, // ¥8800 = 880000分
      };

      const price = planPrices[input.planType];
      const pointValue = 5000; // 100积分 = ¥50 = 5000分
      const pointsValue = input.pointsToUse * pointValue;

      if (pointsValue < price) {
        throw new Error("Points value is less than plan price");
      }

      // 更新积分
      await db
        .update(userPoints)
        .set({
          usedPoints: points.usedPoints + input.pointsToUse,
          availablePoints: points.availablePoints - input.pointsToUse,
        })
        .where(eq(userPoints.userId, input.userId));

      // 更新订阅
      const endDate = new Date();
      if (input.planType === "monthly") {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, input.userId))
        .limit(1);

      if (subscription.length > 0) {
        await db
          .update(userSubscriptions)
          .set({
            planType: input.planType,
            price,
            pointsUsed: input.pointsToUse,
            status: "active",
            endDate,
          })
          .where(eq(userSubscriptions.userId, input.userId));
      } else {
        await db.insert(userSubscriptions).values({
          userId: input.userId,
          planType: input.planType,
          price,
          pointsUsed: input.pointsToUse,
          status: "active",
          endDate,
        });
      }

      return {
        success: true,
        message: `Upgraded to ${input.planType} plan`,
        endDate,
      };
    }),

  // 创建推送消息（管理员）
  createPushNotification: publicProcedure
    .input(
      z.object({
        stockCode: z.string(),
        stockName: z.string(),
        message: z.string(),
        buyRange: z.string(),
        targetUsers: z.enum(["all", "premium", "specific"]),
        specificUserIds: z.array(z.number()).optional(),
        createdBy: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(pushNotifications).values({
        stockCode: input.stockCode,
        stockName: input.stockName,
        message: input.message,
        buyRange: input.buyRange,
        targetUsers: input.targetUsers,
        specificUserIds:
          input.specificUserIds && input.specificUserIds.length > 0
            ? JSON.stringify(input.specificUserIds)
            : null,
        status: "draft",
        createdBy: input.createdBy,
      });

      return {
        success: true,
        message: "Push notification created",
      };
    }),

  // 发送推送消息
  sendPushNotification: publicProcedure
    .input(z.object({ pushNotificationId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // 获取推送消息
      const pushNotif = await db
        .select()
        .from(pushNotifications)
        .where(eq(pushNotifications.id, input.pushNotificationId))
        .limit(1);

      if (pushNotif.length === 0) {
        throw new Error("Push notification not found");
      }

      const notif = pushNotif[0];

      // 确定目标用户
      let targetUserIds: number[] = [];

      if (notif.targetUsers === "all") {
        // 获取所有用户
        // TODO: 实现获取所有用户的逻辑
        targetUserIds = [];
      } else if (notif.targetUsers === "premium") {
        // 获取所有付费用户
        // TODO: 实现获取所有付费用户的逻辑
        targetUserIds = [];
      } else if (notif.targetUsers === "specific" && notif.specificUserIds) {
        targetUserIds = JSON.parse(notif.specificUserIds);
      }

      // 为每个用户创建推送日志
      for (const userId of targetUserIds) {
        await db.insert(pushLogs).values({
          pushNotificationId: input.pushNotificationId,
          userId,
          status: "sent",
          sentAt: new Date(),
        });
      }

      // 更新推送消息状态
      await db
        .update(pushNotifications)
        .set({
          status: "sent",
          sentTime: new Date(),
        })
        .where(eq(pushNotifications.id, input.pushNotificationId));

      return {
        success: true,
        message: "Push notification sent",
        sentCount: targetUserIds.length,
      };
    }),

  // 获取推送消息列表
  getPushNotifications: publicProcedure
    .input(
      z.object({
        status: z.enum(["draft", "scheduled", "sent", "cancelled"]).optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select().from(pushNotifications);

      if (input.status) {
        query = query.where(eq(pushNotifications.status, input.status));
      }

      const result = await query.limit(input.limit);

      return result;
    }),
});
