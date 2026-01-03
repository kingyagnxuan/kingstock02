import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { dailyLimitUpPotentials, nextDayLimitUpPotentials } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

export const limitUpRouter = router({
  /**
   * 获取当日涨停潜力股列表
   */
  getDailyPotentials: publicProcedure
    .input(z.object({
      limit: z.number().default(20),
      minProbability: z.number().default(40),
    }))
    .query(async ({ input }: any) => {
      try {
        const db = await getDb();
        if (!db) return [];
        
        const today = new Date().toISOString().split('T')[0];
        
        const potentials = await db
          .select()
          .from(dailyLimitUpPotentials)
          .where(eq(dailyLimitUpPotentials.tradingDate, today))
          .orderBy(desc(dailyLimitUpPotentials.limitUpProbability))
          .limit(input.limit);

        return potentials;
      } catch (error) {
        console.error('Error fetching daily potentials:', error);
        return [];
      }
    }),

  /**
   * 获取次日涨停潜力股列表
   */
  getNextDayPotentials: publicProcedure
    .input(z.object({
      limit: z.number().default(20),
      minProbability: z.number().default(40),
    }))
    .query(async ({ input }: any) => {
      try {
        const db = await getDb();
        if (!db) return [];
        
        const today = new Date().toISOString().split('T')[0];
        
        const potentials = await db
          .select()
          .from(nextDayLimitUpPotentials)
          .where(eq(nextDayLimitUpPotentials.tradingDate, today))
          .orderBy(desc(nextDayLimitUpPotentials.nextDayPotential))
          .limit(input.limit);

        return potentials;
      } catch (error) {
        console.error('Error fetching next day potentials:', error);
        return [];
      }
    }),

  /**
   * 获取单只股票的详细分析
   */
  getStockAnalysis: publicProcedure
    .input(z.object({
      stockCode: z.string(),
      type: z.enum(['daily', 'nextDay']),
    }))
    .query(async ({ input }: any) => {
      try {
        const db = await getDb();
        if (!db) return null;
        
        const today = new Date().toISOString().split('T')[0];

        if (input.type === 'daily') {
          const result = await db
            .select()
            .from(dailyLimitUpPotentials)
            .where(and(
              eq(dailyLimitUpPotentials.stockCode, input.stockCode),
              eq(dailyLimitUpPotentials.tradingDate, today)
            ))
            .limit(1);
          return result[0] || null;
        } else {
          const result = await db
            .select()
            .from(nextDayLimitUpPotentials)
            .where(and(
              eq(nextDayLimitUpPotentials.stockCode, input.stockCode),
              eq(nextDayLimitUpPotentials.tradingDate, today)
            ))
            .limit(1);
          return result[0] || null;
        }
      } catch (error) {
        console.error('Error fetching stock analysis:', error);
        return null;
      }
    }),

  /**
   * 保存当日涨停潜力股分析结果
   */
  saveDailyAnalysis: publicProcedure
    .input(z.object({
      stockCode: z.string(),
      stockName: z.string(),
      currentPrice: z.string(),
      priceChangePercent: z.string(),
      volume: z.string(),
      volumeRatio: z.string(),
      netMoneyFlow: z.string(),
      moneyFlowPercent: z.string(),
      riseSpeed: z.string(),
      marketSentiment: z.string(),
      industryHotness: z.string(),
      technicalSignal: z.string(),
      limitUpProbability: z.string(),
      analysisReason: z.string(),
    }))
    .mutation(async ({ input }: any) => {
      try {
        const db = await getDb();
        if (!db) return null;
        
        const today = new Date().toISOString().split('T')[0];

        // 删除今天的旧记录
        await db
          .delete(dailyLimitUpPotentials)
          .where(and(
            eq(dailyLimitUpPotentials.stockCode, input.stockCode),
            eq(dailyLimitUpPotentials.tradingDate, today)
          ));

        // 插入新记录
        const result = await db.insert(dailyLimitUpPotentials).values({
          stockCode: input.stockCode,
          stockName: input.stockName,
          currentPrice: input.currentPrice,
          priceChangePercent: input.priceChangePercent,
          volume: input.volume,
          volumeRatio: input.volumeRatio,
          netMoneyFlow: input.netMoneyFlow,
          moneyFlowPercent: input.moneyFlowPercent,
          riseSpeed: input.riseSpeed,
          marketSentiment: input.marketSentiment,
          industryHotness: input.industryHotness,
          technicalSignal: input.technicalSignal,
          limitUpProbability: input.limitUpProbability,
          analysisReason: input.analysisReason,
          tradingDate: today,
        });

        return result;
      } catch (error) {
        console.error('Error saving daily analysis:', error);
        return null;
      }
    }),

  /**
   * 保存次日涨停潜力股分析结果
   */
  saveNextDayAnalysis: publicProcedure
    .input(z.object({
      stockCode: z.string(),
      stockName: z.string(),
      closingPrice: z.string(),
      priceChangePercent: z.string(),
      dayVolume: z.string(),
      dayNetMoneyFlow: z.string(),
      technicalTrend: z.string(),
      fundamentalScore: z.string(),
      sentimentScore: z.string(),
      industryMomentum: z.string(),
      nextDayPotential: z.string(),
      keyFactors: z.string(),
      riskFactors: z.string(),
      analysisReport: z.string(),
    }))
    .mutation(async ({ input }: any) => {
      try {
        const db = await getDb();
        if (!db) return null;
        
        const today = new Date().toISOString().split('T')[0];

        // 删除今天的旧记录
        await db
          .delete(nextDayLimitUpPotentials)
          .where(and(
            eq(nextDayLimitUpPotentials.stockCode, input.stockCode),
            eq(nextDayLimitUpPotentials.tradingDate, today)
          ));

        // 插入新记录
        const result = await db.insert(nextDayLimitUpPotentials).values({
          stockCode: input.stockCode,
          stockName: input.stockName,
          closingPrice: input.closingPrice,
          priceChangePercent: input.priceChangePercent,
          dayVolume: input.dayVolume,
          dayNetMoneyFlow: input.dayNetMoneyFlow,
          technicalTrend: input.technicalTrend,
          fundamentalScore: input.fundamentalScore,
          sentimentScore: input.sentimentScore,
          industryMomentum: input.industryMomentum,
          nextDayPotential: input.nextDayPotential,
          keyFactors: input.keyFactors,
          riskFactors: input.riskFactors,
          analysisReport: input.analysisReport,
          tradingDate: today,
        });

        return result;
      } catch (error) {
        console.error('Error saving next day analysis:', error);
        return null;
      }
    }),
});
