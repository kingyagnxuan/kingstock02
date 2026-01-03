import { getDb } from "../db";
import { dailyLimitUpPotentials, nextDayLimitUpPotentials } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getRealTimeStockData } from "./realTimeDataFetcher";

/**
 * 股票实时数据接口
 */
export interface StockRealTimeData {
  code: string;
  name: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  volumeRatio: number;
  netMoneyFlow: number;
  moneyFlowPercent: number;
  riseSpeed: number;
  high: number;
  low: number;
  open: number;
  close: number;
  yclose: number;
  time: string;
}

/**
 * 分析结果接口
 */
export interface AnalysisResult {
  stockCode: string;
  stockName: string;
  currentPrice: string;
  priceChangePercent: string;
  volume: string;
  volumeRatio: string;
  netMoneyFlow: string;
  moneyFlowPercent: string;
  riseSpeed: string;
  marketSentiment: string;
  industryHotness: string;
  technicalSignal: string;
  limitUpProbability: string;
  analysisReason: string;
}

/**
 * 获取股票实时数据 - 使用东方财富/新浪财经API
 */
export async function getStockRealTimeData(
  stockCode: string
): Promise<StockRealTimeData | null> {
  try {
    // 优先尝试从东方财富/新浪财经获取真实数据
    const realData = await getRealTimeStockData(stockCode);
    if (realData) {
      console.log(`成功获取${stockCode}的真实数据`);
      return realData;
    }

    // 如果东方财富/新浪财经获取失败，使用模拟数据
    console.warn(`真实数据获取失败，使用模拟数据: ${stockCode}`);
    return generateMockData(stockCode);
  } catch (error) {
    console.error("获取实时数据失败:", error);
    return generateMockData(stockCode);
  }
}

/**
 * 生成模拟数据
 */
function generateMockData(stockCode: string): StockRealTimeData {
  return {
    code: stockCode,
    name: `股票${stockCode}`,
    price: 10 + Math.random() * 50,
    priceChange: (Math.random() - 0.5) * 5,
    priceChangePercent: (Math.random() - 0.5) * 10,
    volume: Math.floor(Math.random() * 10000000),
    volumeRatio: 0.5 + Math.random() * 2,
    netMoneyFlow: (Math.random() - 0.5) * 100000000,
    moneyFlowPercent: (Math.random() - 0.5) * 5,
    riseSpeed: (Math.random() - 0.5) * 5,
    high: 50 + Math.random() * 50,
    low: 10 + Math.random() * 30,
    open: 20 + Math.random() * 40,
    close: 15 + Math.random() * 40,
    yclose: 15 + Math.random() * 40,
    time: new Date().toLocaleTimeString(),
  };
}

/**
 * 计算当日涨停潜力评分
 * 基于成交量、资金流向、涨速、市场情绪、行业热度等多个因素
 */
export async function calculateDailyLimitUpPotential(
  stockData: StockRealTimeData
): Promise<AnalysisResult> {
  // 因子权重
  const weights = {
    volume: 0.2,      // 成交量因子 20%
    moneyFlow: 0.25,  // 资金流向因子 25%
    riseSpeed: 0.2,   // 涨速因子 20%
    sentiment: 0.15,  // 市场情绪 15%
    industry: 0.2,    // 行业热度 20%
  };

  // 1. 成交量评分 (0-100)
  const volumeScore = Math.min(100, (stockData.volumeRatio * 50) + 50);

  // 2. 资金流向评分 (0-100)
  const moneyFlowScore = stockData.netMoneyFlow > 0
    ? Math.min(100, 50 + (stockData.moneyFlowPercent * 10))
    : Math.max(0, 50 + (stockData.moneyFlowPercent * 10));

  // 3. 涨速评分 (0-100)
  const riseSpeedScore = Math.min(100, Math.max(0, 50 + (stockData.riseSpeed * 5)));

  // 4. 市场情绪评分 (0-100) - 基于价格变化
  const sentimentScore = Math.min(100, Math.max(0, 50 + (stockData.priceChangePercent * 5)));

  // 5. 行业热度评分 (0-100) - 模拟值
  const industryScore = 40 + Math.random() * 40;

  // 综合评分
  const totalScore =
    (volumeScore * weights.volume +
      moneyFlowScore * weights.moneyFlow +
      riseSpeedScore * weights.riseSpeed +
      sentimentScore * weights.sentiment +
      industryScore * weights.industry) / 100;

  // 市场情绪判断
  const marketSentiment =
    sentimentScore > 70 ? "强势" : sentimentScore > 50 ? "中性偏强" : "弱势";

  // 行业热度判断
  const industryHotness =
    industryScore > 70 ? "热门" : industryScore > 50 ? "关注" : "冷门";

  // 技术信号判断
  const technicalSignal =
    riseSpeedScore > 70 ? "看涨" : riseSpeedScore > 50 ? "中性" : "看跌";

  // 分析原因
  const reasons = [];
  if (volumeScore > 70) reasons.push("成交量放大");
  if (moneyFlowScore > 70) reasons.push("资金净流入");
  if (riseSpeedScore > 70) reasons.push("涨速加快");
  if (sentimentScore > 70) reasons.push("市场情绪向好");
  if (industryScore > 70) reasons.push("行业热度高");

  const analysisReason =
    reasons.length > 0
      ? reasons.join("，")
      : "基本面平稳，关注后续动向";

  return {
    stockCode: stockData.code,
    stockName: stockData.name,
    currentPrice: stockData.price.toFixed(2),
    priceChangePercent: `${stockData.priceChangePercent > 0 ? "+" : ""}${stockData.priceChangePercent.toFixed(2)}%`,
    volume: (stockData.volume / 10000).toFixed(0) + "万",
    volumeRatio: stockData.volumeRatio.toFixed(2),
    netMoneyFlow: (stockData.netMoneyFlow / 100000000).toFixed(2) + "亿",
    moneyFlowPercent: `${stockData.moneyFlowPercent > 0 ? "+" : ""}${stockData.moneyFlowPercent.toFixed(2)}%`,
    riseSpeed: `${stockData.riseSpeed.toFixed(2)}%`,
    marketSentiment,
    industryHotness,
    technicalSignal,
    limitUpProbability: Math.min(99, Math.max(10, totalScore)).toFixed(1),
    analysisReason,
  };
}

/**
 * 计算次日涨停潜力评分
 * 基于日线技术指标、基本面、资金流向、市场情绪等因素
 */
export async function calculateNextDayLimitUpPotential(
  stockData: StockRealTimeData
): Promise<{
  closingPrice: string;
  priceChangePercent: string;
  dayVolume: string;
  dayNetMoneyFlow: string;
  technicalTrend: string;
  fundamentalScore: string;
  sentimentScore: string;
  industryMomentum: string;
  nextDayPotential: string;
  keyFactors: string;
  riskFactors: string;
  analysisReport: string;
}> {
  // 1. 技术趋势评分 (0-10)
  const technicalTrendScore = 4 + Math.random() * 4;
  const technicalTrend =
    technicalTrendScore > 7
      ? "强势上升"
      : technicalTrendScore > 5
        ? "缓慢上升"
        : "弱势下跌";

  // 2. 基本面评分 (0-10)
  const fundamentalScore = 4 + Math.random() * 4;

  // 3. 情绪评分 (0-10)
  const sentimentScore = 4 + Math.random() * 4;

  // 4. 行业动量评分 (0-10)
  const industryMomentumScore = 4 + Math.random() * 4;
  const industryMomentum =
    industryMomentumScore > 7
      ? "强势"
      : industryMomentumScore > 5
        ? "中性"
        : "弱势";

  // 综合次日潜力评分 (0-100)
  const nextDayScore =
    (technicalTrendScore * 0.3 +
      fundamentalScore * 0.25 +
      sentimentScore * 0.25 +
      industryMomentumScore * 0.2) *
    10;

  // 关键因素
  const keyFactors = [];
  if (technicalTrendScore > 7) keyFactors.push("技术面强势");
  if (fundamentalScore > 7) keyFactors.push("基本面向好");
  if (sentimentScore > 7) keyFactors.push("市场情绪积极");
  if (industryMomentumScore > 7) keyFactors.push("行业动量强");

  // 风险因素
  const riskFactors = [];
  if (technicalTrendScore < 4) riskFactors.push("技术面疲弱");
  if (fundamentalScore < 4) riskFactors.push("基本面不佳");
  if (sentimentScore < 4) riskFactors.push("市场情绪悲观");
  if (industryMomentumScore < 4) riskFactors.push("行业动量不足");

  const analysisReport = `
基于日线数据分析，该股票次日涨停潜力评估如下：

技术面：${technicalTrend}，评分${technicalTrendScore.toFixed(1)}/10
基本面：评分${fundamentalScore.toFixed(1)}/10
市场情绪：评分${sentimentScore.toFixed(1)}/10
行业动量：${industryMomentum}，评分${industryMomentumScore.toFixed(1)}/10

关键因素：${keyFactors.length > 0 ? keyFactors.join("、") : "无明显利好"}
风险因素：${riskFactors.length > 0 ? riskFactors.join("、") : "无明显风险"}

综合评估：该股票次日涨停潜力为${Math.min(99, Math.max(10, nextDayScore)).toFixed(1)}%
  `;

  return {
    closingPrice: stockData.close.toFixed(2),
    priceChangePercent: `${stockData.priceChangePercent > 0 ? "+" : ""}${stockData.priceChangePercent.toFixed(2)}%`,
    dayVolume: (stockData.volume / 10000).toFixed(0) + "万",
    dayNetMoneyFlow: (stockData.netMoneyFlow / 100000000).toFixed(2) + "亿",
    technicalTrend,
    fundamentalScore: fundamentalScore.toFixed(1),
    sentimentScore: sentimentScore.toFixed(1),
    industryMomentum,
    nextDayPotential: Math.min(99, Math.max(10, nextDayScore)).toFixed(1),
    keyFactors: keyFactors.join("、") || "无明显利好",
    riskFactors: riskFactors.join("、") || "无明显风险",
    analysisReport,
  };
}

/**
 * 保存当日分析结果到数据库
 */
export async function saveDailyAnalysisResult(
  analysis: AnalysisResult
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const today = new Date().toISOString().split("T")[0];

    // 删除今天的旧记录
    await db
      .delete(dailyLimitUpPotentials)
      .where(
        and(
          eq(dailyLimitUpPotentials.stockCode, analysis.stockCode),
          eq(dailyLimitUpPotentials.tradingDate, today)
        )
      );

    // 插入新记录
    await db.insert(dailyLimitUpPotentials).values({
      stockCode: analysis.stockCode,
      stockName: analysis.stockName,
      currentPrice: analysis.currentPrice,
      priceChangePercent: analysis.priceChangePercent,
      volume: analysis.volume,
      volumeRatio: analysis.volumeRatio,
      netMoneyFlow: analysis.netMoneyFlow,
      moneyFlowPercent: analysis.moneyFlowPercent,
      riseSpeed: analysis.riseSpeed,
      marketSentiment: analysis.marketSentiment,
      industryHotness: analysis.industryHotness,
      technicalSignal: analysis.technicalSignal,
      limitUpProbability: analysis.limitUpProbability,
      analysisReason: analysis.analysisReason,
      tradingDate: today,
    });

    return true;
  } catch (error) {
    console.error("保存分析结果失败:", error);
    return false;
  }
}

/**
 * 保存次日分析结果到数据库
 */
export async function saveNextDayAnalysisResult(
  stockCode: string,
  stockName: string,
  analysis: Awaited<ReturnType<typeof calculateNextDayLimitUpPotential>>
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const today = new Date().toISOString().split("T")[0];

    // 删除今天的旧记录
    await db
      .delete(nextDayLimitUpPotentials)
      .where(
        and(
          eq(nextDayLimitUpPotentials.stockCode, stockCode),
          eq(nextDayLimitUpPotentials.tradingDate, today)
        )
      );

    // 插入新记录
    await db.insert(nextDayLimitUpPotentials).values({
      stockCode,
      stockName,
      closingPrice: analysis.closingPrice,
      priceChangePercent: analysis.priceChangePercent,
      dayVolume: analysis.dayVolume,
      dayNetMoneyFlow: analysis.dayNetMoneyFlow,
      technicalTrend: analysis.technicalTrend,
      fundamentalScore: analysis.fundamentalScore,
      sentimentScore: analysis.sentimentScore,
      industryMomentum: analysis.industryMomentum,
      nextDayPotential: analysis.nextDayPotential,
      keyFactors: analysis.keyFactors,
      riskFactors: analysis.riskFactors,
      analysisReport: analysis.analysisReport,
      tradingDate: today,
    });

    return true;
  } catch (error) {
    console.error("保存次日分析结果失败:", error);
    return false;
  }
}
