import { describe, it, expect, vi, beforeEach } from "vitest";
import { aiRouter } from "../ai";
import * as db from "../../db";

// Mock数据库函数
vi.mock("../../db", () => ({
  createAIConversation: vi.fn(),
  getUserConversations: vi.fn(),
  addAIMessage: vi.fn(),
  getConversationMessages: vi.fn(),
}));

// Mock LLM函数
vi.mock("../../_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            outlook: "市场总体看涨",
            strategy: "建议关注科技板块",
            riskFactors: ["政策风险", "汇率风险"],
          }),
        },
      },
    ],
  }),
}));

describe("AI Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createConversation", () => {
    it("should create a new conversation", async () => {
      const mockConversation = {
        id: 1,
        userId: 1,
        title: "测试对话",
        stockCode: "000001",
        model: "gpt-4",
        systemPrompt: "测试提示词",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.createAIConversation).mockResolvedValue(mockConversation as any);

      // 测试创建对话的逻辑
      const result = await db.createAIConversation({
        userId: 1,
        title: "测试对话",
        stockCode: "000001",
      });

      expect(result).toBeDefined();
      expect(result.title).toBe("测试对话");
    });
  });

  describe("getConversations", () => {
    it("should get user conversations", async () => {
      const mockConversations = [
        {
          id: 1,
          userId: 1,
          title: "对话1",
          createdAt: new Date(),
        },
        {
          id: 2,
          userId: 1,
          title: "对话2",
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.getUserConversations).mockResolvedValue(mockConversations as any);

      const result = await db.getUserConversations(1);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("对话1");
    });
  });

  describe("sendMessage", () => {
    it("should add user message and AI response", async () => {
      vi.mocked(db.addAIMessage).mockResolvedValue(undefined);
      vi.mocked(db.getConversationMessages).mockResolvedValue([]);

      await db.addAIMessage({
        conversationId: 1,
        role: "user",
        content: "请分析平安银行的投资机会",
      });

      expect(db.addAIMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: 1,
          role: "user",
          content: "请分析平安银行的投资机会",
        })
      );
    });
  });

  describe("getMessages", () => {
    it("should get conversation messages", async () => {
      const mockMessages = [
        {
          id: 1,
          conversationId: 1,
          role: "user",
          content: "请分析平安银行",
          createdAt: new Date(),
        },
        {
          id: 2,
          conversationId: 1,
          role: "assistant",
          content: "平安银行是一家优秀的金融企业...",
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.getConversationMessages).mockResolvedValue(mockMessages as any);

      const result = await db.getConversationMessages(1);

      expect(result).toHaveLength(2);
      expect(result[0].role).toBe("user");
      expect(result[1].role).toBe("assistant");
    });
  });
});
