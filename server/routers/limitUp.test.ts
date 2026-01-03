import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { limitUpRouter } from "./limitUp";

// Mock getDb
vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

describe("limitUpRouter", () => {
  describe("getDailyPotentials", () => {
    it("should return empty array when database is not available", async () => {
      const { getDb } = await import("../db");
      vi.mocked(getDb).mockResolvedValue(null);

      const caller = limitUpRouter.createCaller({} as any);
      const result = await caller.getDailyPotentials({ limit: 20, minProbability: 40 });

      expect(result).toEqual([]);
    });

    it("should return daily potentials with default parameters", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            stockCode: "000001",
            stockName: "平安银行",
            limitUpProbability: "85.5",
            tradingDate: "2026-01-03",
          },
        ]),
      };

      const { getDb } = await import("../db");
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = limitUpRouter.createCaller({} as any);
      const result = await caller.getDailyPotentials({ limit: 20, minProbability: 40 });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getNextDayPotentials", () => {
    it("should return empty array when database is not available", async () => {
      const { getDb } = await import("../db");
      vi.mocked(getDb).mockResolvedValue(null);

      const caller = limitUpRouter.createCaller({} as any);
      const result = await caller.getNextDayPotentials({ limit: 20, minProbability: 40 });

      expect(result).toEqual([]);
    });

    it("should return next day potentials with default parameters", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            stockCode: "000002",
            stockName: "万科A",
            nextDayPotential: "72.3",
            tradingDate: "2026-01-03",
          },
        ]),
      };

      const { getDb } = await import("../db");
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = limitUpRouter.createCaller({} as any);
      const result = await caller.getNextDayPotentials({ limit: 20, minProbability: 40 });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getStockAnalysis", () => {
    it("should return null when database is not available", async () => {
      const { getDb } = await import("../db");
      vi.mocked(getDb).mockResolvedValue(null);

      const caller = limitUpRouter.createCaller({} as any);
      const result = await caller.getStockAnalysis({
        stockCode: "000001",
        type: "daily",
      });

      expect(result).toBeNull();
    });

    it("should return daily analysis for a stock", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            stockCode: "000001",
            stockName: "平安银行",
            currentPrice: "12.50",
            limitUpProbability: "85.5",
          },
        ]),
      };

      const { getDb } = await import("../db");
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = limitUpRouter.createCaller({} as any);
      const result = await caller.getStockAnalysis({
        stockCode: "000001",
        type: "daily",
      });

      expect(result).not.toBeNull();
    });

    it("should return next day analysis for a stock", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            stockCode: "000002",
            stockName: "万科A",
            closingPrice: "15.30",
            nextDayPotential: "72.3",
          },
        ]),
      };

      const { getDb } = await import("../db");
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = limitUpRouter.createCaller({} as any);
      const result = await caller.getStockAnalysis({
        stockCode: "000002",
        type: "nextDay",
      });

      expect(result).not.toBeNull();
    });
  });

  describe("saveDailyAnalysis", () => {
    it("should return null when database is not available", async () => {
      const { getDb } = await import("../db");
      vi.mocked(getDb).mockResolvedValue(null);

      const caller = limitUpRouter.createCaller({} as any);
      const result = await caller.saveDailyAnalysis({
        stockCode: "000001",
        stockName: "平安银行",
        currentPrice: "12.50",
        priceChangePercent: "+5.2%",
        volume: "1000000",
        volumeRatio: "1.5",
        netMoneyFlow: "5000000",
        moneyFlowPercent: "+2.1%",
        riseSpeed: "5.2%",
        marketSentiment: "强势",
        industryHotness: "热门",
        technicalSignal: "看涨",
        limitUpProbability: "85.5",
        analysisReason: "资金面强劲，技术面看涨",
      });

      expect(result).toBeNull();
    });

    it("should save daily analysis successfully", async () => {
      const mockDb = {
        delete: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue({ id: 1 }),
      };

      const { getDb } = await import("../db");
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = limitUpRouter.createCaller({} as any);
      const result = await caller.saveDailyAnalysis({
        stockCode: "000001",
        stockName: "平安银行",
        currentPrice: "12.50",
        priceChangePercent: "+5.2%",
        volume: "1000000",
        volumeRatio: "1.5",
        netMoneyFlow: "5000000",
        moneyFlowPercent: "+2.1%",
        riseSpeed: "5.2%",
        marketSentiment: "强势",
        industryHotness: "热门",
        technicalSignal: "看涨",
        limitUpProbability: "85.5",
        analysisReason: "资金面强劲，技术面看涨",
      });

      expect(result).not.toBeNull();
    });
  });

  describe("saveNextDayAnalysis", () => {
    it("should return null when database is not available", async () => {
      const { getDb } = await import("../db");
      vi.mocked(getDb).mockResolvedValue(null);

      const caller = limitUpRouter.createCaller({} as any);
      const result = await caller.saveNextDayAnalysis({
        stockCode: "000002",
        stockName: "万科A",
        closingPrice: "15.30",
        priceChangePercent: "+3.1%",
        dayVolume: "2000000",
        dayNetMoneyFlow: "8000000",
        technicalTrend: "上升趋势",
        fundamentalScore: "7.5",
        sentimentScore: "8.2",
        industryMomentum: "强势",
        nextDayPotential: "72.3",
        keyFactors: "资金流入，技术突破",
        riskFactors: "市场波动风险",
        analysisReport: "综合分析报告",
      });

      expect(result).toBeNull();
    });

    it("should save next day analysis successfully", async () => {
      const mockDb = {
        delete: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue({ id: 1 }),
      };

      const { getDb } = await import("../db");
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = limitUpRouter.createCaller({} as any);
      const result = await caller.saveNextDayAnalysis({
        stockCode: "000002",
        stockName: "万科A",
        closingPrice: "15.30",
        priceChangePercent: "+3.1%",
        dayVolume: "2000000",
        dayNetMoneyFlow: "8000000",
        technicalTrend: "上升趋势",
        fundamentalScore: "7.5",
        sentimentScore: "8.2",
        industryMomentum: "强势",
        nextDayPotential: "72.3",
        keyFactors: "资金流入，技术突破",
        riskFactors: "市场波动风险",
        analysisReport: "综合分析报告",
      });

      expect(result).not.toBeNull();
    });
  });
});
