import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { createAIConversation, getUserConversations, addAIMessage, getConversationMessages } from "../db";
import { invokeLLM } from "../_core/llm";
import { TRPCError } from "@trpc/server";
import { getAvailableLLMModels } from "../_core/llmModels";

export const aiRouter = router({
  // 获取可用的LLM模型列表
  getAvailableModels: protectedProcedure.query(async () => {
    return getAvailableLLMModels();
  }),

  // 创建新对话
  createConversation: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        stockCode: z.string().optional(),
        systemPrompt: z.string().optional(),
        model: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const title = input.title || `问票对话 ${new Date().toLocaleString()}`;
      const model = input.model || "gemini-2.5-flash";
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
        model,
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
        model: z.string().optional(),
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
      const conversation = conversations.find((c: any) => c.id === input.conversationId);
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
        ...messages.map((m: any) => ({
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
          model: input.model || conversation.model || "gemini-2.5-flash",
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
      const conversation = conversations.find((c: any) => c.id === input.conversationId);
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      const messages = await getConversationMessages(input.conversationId);
      return messages.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      }));
    }),

  // 生成报告
  generateReport: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // 验证对话所有权
      const conversations = await getUserConversations(ctx.user!.id);
      const conversation = conversations.find((c: any) => c.id === input.conversationId);
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      const messages = await getConversationMessages(input.conversationId);

      // 构建报告内容
      const reportContent = [
        `# 问票分析报告`,
        `\n## 对话信息`,
        `- **标题**: ${conversation.title}`,
        `- **创建时间**: ${new Date(conversation.createdAt).toLocaleString()}`,
        `- **使用模型**: ${conversation.model}`,
        `\n## 对话内容`,
        `\n${messages
          .map((m: any) => {
            const role = m.role === "user" ? "### 用户提问" : "### AI分析";
            return `${role}\n\n${m.content}`;
          })
          .join("\n\n---\n\n")}`,
      ].join("\n");

      return {
        content: reportContent,
        filename: `问票报告_${new Date().toISOString().split("T")[0]}.md`,
      };
    }),
});
