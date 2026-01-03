import { describe, it, expect, vi, beforeEach } from "vitest";
import * as db from "../../db";

// Mock数据库函数
vi.mock("../../db", () => ({
  getLatestMarketInsight: vi.fn(),
  createMarketInsight: vi.fn(),
  getRecentStockRecommendations: vi.fn(),
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

describe("Market Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getLatestMarketInsight", () => {
    it("should get latest market insight", async () => {
      const mockInsight = {
        id: 1,
        date: "2026-01-02",
        outlook: "市场总体看涨",
        strategy: "建议关注科技板块",
        hotSectors: JSON.stringify([
          { name: "科技", change: 2.5 },
          { name: "医药", change: 1.8 },
        ]),
        riskFactors: JSON.stringify(["政策风险", "汇率风险"]),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getLatestMarketInsight).mockResolvedValue(mockInsight as any);

      const result = await db.getLatestMarketInsight();

      expect(result).toBeDefined();
      expect(result?.date).toBe("2026-01-02");
      expect(result?.outlook).toBe("市场总体看涨");
    });

    it("should return undefined if no insight exists", async () => {
      vi.mocked(db.getLatestMarketInsight).mockResolvedValue(undefined);

      const result = await db.getLatestMarketInsight();

      expect(result).toBeUndefined();
    });
  });

  describe("createMarketInsight", () => {
    it("should create market insight", async () => {
      vi.mocked(db.createMarketInsight).mockResolvedValue(undefined);

      await db.createMarketInsight({
        date: "2026-01-02",
        outlook: "市场总体看涨",
        strategy: "建议关注科技板块",
        hotSectors: JSON.stringify([{ name: "科技", change: 2.5 }]),
        riskFactors: JSON.stringify(["政策风险"]),
      });

      expect(db.createMarketInsight).toHaveBeenCalledWith(
        expect.objectContaining({
          date: "2026-01-02",
          outlook: "市场总体看涨",
        })
      );
    });
  });

  describe("getRecentStockRecommendations", () => {
    it("should get recent stock recommendations", async () => {
      const mockRecommendations = [
        {
          id: 1,
          stockCode: "000001",
          stockName: "平安银行",
          recommendationType: "buy",
          targetPrice: "15.00",
          stopLoss: "13.00",
          reason: "基本面良好，技术面看涨",
          recommendDate: new Date(),
          currentPrice: "14.50",
          priceChangePercent: "3.45",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getRecentStockRecommendations).mockResolvedValue(mockRecommendations as any);

      const result = await db.getRecentStockRecommendations(10);

      expect(result).toHaveLength(1);
      expect(result[0].stockCode).toBe("000001");
      expect(result[0].recommendationType).toBe("buy");
    });

    it("should return empty array if no recommendations", async () => {
      vi.mocked(db.getRecentStockRecommendations).mockResolvedValue([]);

      const result = await db.getRecentStockRecommendations(10);

      expect(result).toHaveLength(0);
    });
  });
});
