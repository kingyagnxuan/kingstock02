/**
 * 涨停潜力股分析引擎
 * 支持当日和次日涨停潜力分析
 */

export interface StockData {
  code: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  volume: number;
  volumeRatio: number;
  netMoneyFlow: number;
  moneyFlowPercent: number;
  riseSpeed: number; // 涨速（%/分钟）
  technicalIndicators: {
    ma5: number;
    ma20: number;
    rsi: number;
    macd: number;
  };
  industryCode: string;
  industryHotness: number; // 0-100
  marketSentiment: number; // 0-100
}

export interface AnalysisResult {
  stockCode: string;
  stockName: string;
  score: number; // 0-100
  probability: number; // 涨停概率 0-100
  factors: {
    volumeFactor: number; // 成交量因子
    moneyFlowFactor: number; // 资金流向因子
    riseSpeedFactor: number; // 涨速因子
    technicalFactor: number; // 技术面因子
    sentimentFactor: number; // 情绪因子
    industryFactor: number; // 行业热度因子
  };
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * 当日涨停潜力分析
 * 基于盘中实时数据进行分析
 */
export class DailyLimitUpAnalyzer {
  /**
   * 分析单只股票的当日涨停潜力
   */
  static analyzeDailyPotential(stock: StockData): AnalysisResult {
    const priceChangePercent = ((stock.currentPrice - stock.previousClose) / stock.previousClose) * 100;
    
    // 各因子权重
    const weights = {
      volumeFactor: 0.20,
      moneyFlowFactor: 0.25,
      riseSpeedFactor: 0.20,
      technicalFactor: 0.15,
      sentimentFactor: 0.15,
      industryFactor: 0.05,
    };

    // 1. 成交量因子 (0-100)
    // 量比 > 3 为异常，量比越高分数越高
    const volumeFactor = Math.min(100, Math.max(0, (stock.volumeRatio - 1) * 20));

    // 2. 资金流向因子 (0-100)
    // 资金净流入占比 > 30% 为强势，越高分数越高
    const moneyFlowFactor = Math.min(100, Math.max(0, stock.moneyFlowPercent * 3));

    // 3. 涨速因子 (0-100)
    // 涨速 > 1%/分钟 为快速上升，越快分数越高
    const riseSpeedFactor = Math.min(100, Math.max(0, stock.riseSpeed * 30));

    // 4. 技术面因子 (0-100)
    let technicalFactor = 0;
    if (stock.currentPrice > stock.technicalIndicators.ma5 && 
        stock.technicalIndicators.ma5 > stock.technicalIndicators.ma20) {
      technicalFactor = 70; // 强势上升
    } else if (stock.currentPrice > stock.technicalIndicators.ma5) {
      technicalFactor = 50; // 中性
    } else {
      technicalFactor = 30; // 弱势
    }
    
    // RSI 指标加权
    if (stock.technicalIndicators.rsi > 70) {
      technicalFactor = Math.min(100, technicalFactor + 20);
    }

    // 5. 市场情绪因子 (0-100)
    // 直接使用市场情绪评分
    const sentimentFactor = stock.marketSentiment;

    // 6. 行业热度因子 (0-100)
    const industryFactor = stock.industryHotness;

    // 计算综合评分
    const totalScore = 
      volumeFactor * weights.volumeFactor +
      moneyFlowFactor * weights.moneyFlowFactor +
      riseSpeedFactor * weights.riseSpeedFactor +
      technicalFactor * weights.technicalFactor +
      sentimentFactor * weights.sentimentFactor +
      industryFactor * weights.industryFactor;

    // 当日涨停概率计算
    // 已涨幅 > 8% 且其他因子都强势，涨停概率很高
    let probability = totalScore;
    if (priceChangePercent > 8) {
      probability = Math.min(100, probability + 20);
    }
    if (priceChangePercent > 5) {
      probability = Math.min(100, probability + 10);
    }

    // 风险评估
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    if (probability > 80) {
      riskLevel = 'high'; // 高概率涨停，风险高
    } else if (probability < 40) {
      riskLevel = 'low';
    }

    return {
      stockCode: stock.code,
      stockName: stock.name,
      score: Math.round(totalScore),
      probability: Math.round(probability),
      factors: {
        volumeFactor: Math.round(volumeFactor),
        moneyFlowFactor: Math.round(moneyFlowFactor),
        riseSpeedFactor: Math.round(riseSpeedFactor),
        technicalFactor: Math.round(technicalFactor),
        sentimentFactor: Math.round(sentimentFactor),
        industryFactor: Math.round(industryFactor),
      },
      recommendation: this.getRecommendation(totalScore, probability),
      riskLevel,
    };
  }

  /**
   * 获取推荐意见
   */
  private static getRecommendation(score: number, probability: number): string {
    if (probability > 80) {
      return '极度看好，涨停概率极高，建议重点关注';
    } else if (probability > 60) {
      return '看好，涨停概率较高，建议密切关注';
    } else if (probability > 40) {
      return '中性，涨停概率中等，建议继续观察';
    } else {
      return '看空，涨停概率较低，建议谨慎参与';
    }
  }
}

/**
 * 次日涨停潜力分析
 * 基于当日收盘数据进行分析
 */
export class NextDayLimitUpAnalyzer {
  /**
   * 分析单只股票的次日涨停潜力
   */
  static analyzeNextDayPotential(stock: StockData, dayData: {
    dayVolume: number;
    dayNetMoneyFlow: number;
    dayHighPrice: number;
    dayLowPrice: number;
  }): AnalysisResult {
    const priceChangePercent = ((stock.currentPrice - stock.previousClose) / stock.previousClose) * 100;
    
    // 各因子权重
    const weights = {
      volumeFactor: 0.15,
      moneyFlowFactor: 0.25,
      riseSpeedFactor: 0.10,
      technicalFactor: 0.20,
      sentimentFactor: 0.15,
      industryFactor: 0.15,
    };

    // 1. 成交量因子 (0-100)
    // 当日成交量大，说明参与度高，次日可能继续
    const volumeFactor = Math.min(100, Math.max(0, (dayData.dayVolume / 1000000) * 10));

    // 2. 资金流向因子 (0-100)
    // 当日资金净流入大，说明主力参与，次日可能继续
    const moneyFlowFactor = Math.min(100, Math.max(0, (dayData.dayNetMoneyFlow / 100000000) * 50));

    // 3. 涨速因子 (0-100)
    // 当日涨幅越大，次日继续涨停的概率越高
    const riseSpeedFactor = Math.min(100, Math.max(0, priceChangePercent * 10));

    // 4. 技术面因子 (0-100)
    // 收盘价接近当日高点，说明强势
    let technicalFactor = 0;
    const closeToHigh = (stock.currentPrice - dayData.dayLowPrice) / (dayData.dayHighPrice - dayData.dayLowPrice);
    if (closeToHigh > 0.8) {
      technicalFactor = 80; // 强势收盘
    } else if (closeToHigh > 0.5) {
      technicalFactor = 50; // 中性
    } else {
      technicalFactor = 30; // 弱势
    }

    // 5. 市场情绪因子 (0-100)
    const sentimentFactor = stock.marketSentiment;

    // 6. 行业热度因子 (0-100)
    const industryFactor = stock.industryHotness;

    // 计算综合评分
    const totalScore = 
      volumeFactor * weights.volumeFactor +
      moneyFlowFactor * weights.moneyFlowFactor +
      riseSpeedFactor * weights.riseSpeedFactor +
      technicalFactor * weights.technicalFactor +
      sentimentFactor * weights.sentimentFactor +
      industryFactor * weights.industryFactor;

    // 次日涨停概率
    let probability = totalScore;
    if (priceChangePercent > 7) {
      probability = Math.min(100, probability + 15);
    }

    // 风险评估
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    if (probability > 75) {
      riskLevel = 'high';
    } else if (probability < 35) {
      riskLevel = 'low';
    }

    return {
      stockCode: stock.code,
      stockName: stock.name,
      score: Math.round(totalScore),
      probability: Math.round(probability),
      factors: {
        volumeFactor: Math.round(volumeFactor),
        moneyFlowFactor: Math.round(moneyFlowFactor),
        riseSpeedFactor: Math.round(riseSpeedFactor),
        technicalFactor: Math.round(technicalFactor),
        sentimentFactor: Math.round(sentimentFactor),
        industryFactor: Math.round(industryFactor),
      },
      recommendation: this.getRecommendation(totalScore, probability),
      riskLevel,
    };
  }

  /**
   * 获取推荐意见
   */
  private static getRecommendation(score: number, probability: number): string {
    if (probability > 75) {
      return '次日极度看好，涨停概率极高，建议重点关注';
    } else if (probability > 55) {
      return '次日看好，涨停概率较高，建议密切关注';
    } else if (probability > 35) {
      return '次日中性，涨停概率中等，建议继续观察';
    } else {
      return '次日看空，涨停概率较低，建议谨慎参与';
    }
  }
}
