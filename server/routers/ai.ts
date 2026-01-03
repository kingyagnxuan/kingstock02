import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { createAIConversation, getUserConversations, addAIMessage, getConversationMessages } from "../db";
import { invokeLLM } from "../_core/llm";
import { TRPCError } from "@trpc/server";

export const aiRouter = router({
  // 创建新对话
  createConversation: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        stockCode: z.string().optional(),
        systemPrompt: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const title = input.title || `问票对话 ${new Date().toLocaleString()}`;
      const systemPrompt =
        input.systemPrompt ||
        `你是一位资深的股票投资分析师。你将帮助用户分析股票、提供投资建议、解答投资相关问题。
        
你的职责包括：
1. 基于实时数据分析股票走势和投资机会
2. 提供专业的技术分析和基本面分析
3. 给出具体的买卖建议和风险提示
4. 对比分析不同股票的投资价值
5. 解答用户关于股市、投资策略的各类问题

请始终保持专业、客观、谨慎的态度，强调投资风险。`;

      const conversation = await createAIConversation({
        userId: ctx.user!.id,
        title,
        stockCode: input.stockCode,
        model: "gpt-4",
        systemPrompt,
      });

      return conversation;
    }),

  // 获取用户的所有对话
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const conversations = await getUserConversations(ctx.user!.id);
    return conversations;
  }),

  // 发送消息并获取AI回复
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        message: z.string(),
        stockData: z
          .object({
            code: z.string(),
            name: z.string(),
            price: z.number(),
            change: z.number(),
            changePercent: z.number(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 验证对话所有权
      const conversations = await getUserConversations(ctx.user!.id);
      const conversation = conversations.find((c) => c.id === input.conversationId);
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      // 获取对话历史
      const messages = await getConversationMessages(input.conversationId);

      // 保存用户消息
      await addAIMessage({
        conversationId: input.conversationId,
        role: "user",
        content: input.message,
        metadata: input.stockData ? JSON.stringify(input.stockData) : undefined,
      });

      // 构建消息列表
      const conversationMessages = [
        {
          role: "system" as const,
          content: conversation.systemPrompt || "",
        },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
        {
          role: "user" as const,
          content: input.message,
        },
      ];

      // 调用LLM获取回复
      try {
        const response = await invokeLLM({
          messages: conversationMessages,
        });

        const aiContent = response.choices[0]?.message.content;
        if (!aiContent || typeof aiContent !== "string") {
          throw new Error("Invalid response from LLM");
        }

        // 保存AI回复
        await addAIMessage({
          conversationId: input.conversationId,
          role: "assistant",
          content: aiContent,
        });

        return {
          role: "assistant",
          content: aiContent,
        };
      } catch (error) {
        console.error("Failed to get AI response:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get AI response",
        });
      }
    }),

  // 获取对话历史
  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input, ctx }) => {
      // 验证对话所有权
      const conversations = await getUserConversations(ctx.user!.id);
      const conversation = conversations.find((c) => c.id === input.conversationId);
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      const messages = await getConversationMessages(input.conversationId);
      return messages.map((m) => ({
        ...m,
        metadata: m.metadata ? JSON.parse(m.metadata) : undefined,
      }));
    }),

  // 导出对话为文本
  exportConversation: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input, ctx }) => {
      // 验证对话所有权
      const conversations = await getUserConversations(ctx.user!.id);
      const conversation = conversations.find((c) => c.id === input.conversationId);
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      const messages = await getConversationMessages(input.conversationId);

      // 生成文本格式的对话
      const text = [
        `对话标题: ${conversation.title}`,
        `创建时间: ${conversation.createdAt.toLocaleString()}`,
        `关联股票: ${conversation.stockCode || "无"}`,
        "",
        "对话内容:",
        "---",
        ...messages.map((m) => {
          const role = m.role === "user" ? "用户" : m.role === "assistant" ? "AI分析师" : "系统";
          return `[${role}]: ${m.content}`;
        }),
      ].join("\n");

      return {
        filename: `问票对话_${conversation.title}_${new Date().toISOString().split("T")[0]}.txt`,
        content: text,
      };
    }),

  // 生成投资报告
  generateReport: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // 验证对话所有权
      const conversations = await getUserConversations(ctx.user!.id);
      const conversation = conversations.find((c) => c.id === input.conversationId);
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      const messages = await getConversationMessages(input.conversationId);

      // 使用LLM生成投资报告
      const prompt = `基于以下对话内容，生成一份专业的投资分析报告。报告应包括：
1. 核心观点总结
2. 关键数据分析
3. 投资建议
4. 风险提示
5. 后续关注点

对话内容：
${messages.map((m) => `${m.role === "user" ? "用户" : "AI分析师"}: ${m.content}`).join("\n")}`;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "你是一位专业的投资分析师，请生成一份详细的投资分析报告。",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const reportContent = response.choices[0]?.message.content;
        if (!reportContent || typeof reportContent !== "string") {
          throw new Error("Invalid response from LLM");
        }

        return {
          filename: `投资分析报告_${conversation.title}_${new Date().toISOString().split("T")[0]}.md`,
          content: reportContent,
        };
      } catch (error) {
        console.error("Failed to generate report:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate report",
        });
      }
    }),
});
