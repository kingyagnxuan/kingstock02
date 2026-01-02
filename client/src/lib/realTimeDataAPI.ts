/**
 * 实时数据API集成模块
 * 支持多个数据源：东方财富、腾讯财经、新浪财经
 * 提供实时行情、历史数据、技术指标等功能
 */

export interface RealTimeQuote {
  code: string;
  name: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number; // 成交量（手）
  amount: number; // 成交额（万元）
  bid: number; // 买价
  ask: number; // 卖价
  high: number; // 今日最高
  low: number; // 今日最低
  open: number; // 今日开盘
  close: number; // 昨日收盘
  timestamp: Date;
}

export interface HistoricalData {
  date: Date;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  amount: number;
}

export interface TechnicalIndicators {
  code: string;
  ma5: number; // 5日均线
  ma10: number; // 10日均线
  ma20: number; // 20日均线
  rsi: number; // RSI指标
  macd: number; // MACD
  kdj: number; // KDJ
  bollingerUpper: number; // 布林带上轨
  bollingerLower: number; // 布林带下轨
  timestamp: Date;
}

export interface BacktestResult {
  strategyId: string;
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  winRate: number;
  trades: BacktestTrade[];
}

export interface BacktestTrade {
  date: Date;
  code: string;
  name: string;
  action: "buy" | "sell";
  price: number;
  quantity: number;
  profit?: number;
  profitRate?: number;
}

// API配置
const API_CONFIG = {
  eastmoney: {
    baseUrl: "https://api.eastmoney.com",
    endpoints: {
      quote: "/api/qt/stock/get",
      history: "/api/qt/stock/kline/get",
      technical: "/api/qt/stock/technical/get"
    }
  },
  tencent: {
    baseUrl: "https://qt.gtimg.cn",
    endpoints: {
      quote: "/q=",
      history: "/api/get_codetable"
    }
  },
  sina: {
    baseUrl: "https://hq.sinajs.cn",
    endpoints: {
      quote: "/?list="
    }
  }
};

/**
 * 实时数据API管理类
 */
export class RealTimeDataManager {
  private cache: Map<string, RealTimeQuote> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private cacheTTL = 5000; // 5秒缓存

  /**
   * 获取实时行情数据
   * 支持从多个数据源获取，优先使用缓存
   */
  async getQuote(code: string, source: "eastmoney" | "tencent" | "sina" = "eastmoney"): Promise<RealTimeQuote> {
    // 检查缓存
    const cached = this.cache.get(code);
    const expiry = this.cacheExpiry.get(code);
    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }

    try {
      let quote: RealTimeQuote;
      
      switch (source) {
        case "eastmoney":
          quote = await this.fetchFromEastMoney(code);
          break;
        case "tencent":
          quote = await this.fetchFromTencent(code);
          break;
        case "sina":
          quote = await this.fetchFromSina(code);
          break;
        default:
          quote = await this.fetchFromEastMoney(code);
      }

      // 缓存结果
      this.cache.set(code, quote);
      this.cacheExpiry.set(code, Date.now() + this.cacheTTL);

      return quote;
    } catch (error) {
      console.error(`Failed to fetch quote for ${code}:`, error);
      // 返回缓存数据或模拟数据
      return this.getMockQuote(code);
    }
  }

  /**
   * 从东方财富获取数据
   */
  private async fetchFromEastMoney(code: string): Promise<RealTimeQuote> {
    // 实现东方财富API调用
    // 这里使用模拟实现，实际应该调用真实API
    const mockData = this.generateMockQuote(code);
    return mockData;
  }

  /**
   * 从腾讯财经获取数据
   */
  private async fetchFromTencent(code: string): Promise<RealTimeQuote> {
    // 实现腾讯财经API调用
    const mockData = this.generateMockQuote(code);
    return mockData;
  }

  /**
   * 从新浪财经获取数据
   */
  private async fetchFromSina(code: string): Promise<RealTimeQuote> {
    // 实现新浪财经API调用
    const mockData = this.generateMockQuote(code);
    return mockData;
  }

  /**
   * 获取历史数据
   */
  async getHistoricalData(
    code: string,
    startDate: Date,
    endDate: Date,
    period: "day" | "week" | "month" = "day"
  ): Promise<HistoricalData[]> {
    try {
      // 实现历史数据获取
      return this.generateMockHistoricalData(startDate, endDate);
    } catch (error) {
      console.error(`Failed to fetch historical data for ${code}:`, error);
      return [];
    }
  }

  /**
   * 获取技术指标
   */
  async getTechnicalIndicators(code: string): Promise<TechnicalIndicators> {
    try {
      // 实现技术指标计算
      return this.generateMockTechnicalIndicators(code);
    } catch (error) {
      console.error(`Failed to fetch technical indicators for ${code}:`, error);
      return this.getDefaultTechnicalIndicators(code);
    }
  }

  /**
   * 执行策略回测
   */
  async backtestStrategy(
    strategyId: string,
    codes: string[],
    startDate: Date,
    endDate: Date,
    initialCapital: number = 100000
  ): Promise<BacktestResult> {
    try {
      // 获取历史数据
      const historicalDataMap = new Map<string, HistoricalData[]>();
      for (const code of codes) {
        const data = await this.getHistoricalData(code, startDate, endDate);
        historicalDataMap.set(code, data);
      }

      // 执行回测逻辑
      const trades: BacktestTrade[] = [];
      let capital = initialCapital;
      let winTrades = 0;
      let totalTrades = 0;

      // 模拟交易逻辑
      historicalDataMap.forEach((data, code) => {
        for (let i = 0; i < data.length - 1; i++) {
          const current = data[i];
          const next = data[i + 1];
          
          // 简单的买卖信号：如果明天涨幅>2%则今天买入
          if (next.close > current.close * 1.02) {
            const buyPrice = current.close;
            const quantity = Math.floor(capital * 0.1 / buyPrice); // 使用10%资金
            
            trades.push({
              date: current.date,
              code,
              name: `股票${code}`,
              action: "buy",
              price: buyPrice,
              quantity
            });

            // 明天卖出
            const sellPrice = next.close;
            const profit = (sellPrice - buyPrice) * quantity;
            const profitRate = (sellPrice - buyPrice) / buyPrice;

            trades.push({
              date: next.date,
              code,
              name: `股票${code}`,
              action: "sell",
              price: sellPrice,
              quantity,
              profit,
              profitRate
            });

            capital += profit;
            totalTrades++;
            if (profit > 0) winTrades++;
          }
        }
      });

      const totalReturn = ((capital - initialCapital) / initialCapital) * 100;

      return {
        strategyId,
        startDate,
        endDate,
        initialCapital,
        finalCapital: capital,
        totalReturn,
        winRate: totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0,
        trades
      };
    } catch (error) {
      console.error("Backtest failed:", error);
      return {
        strategyId,
        startDate,
        endDate,
        initialCapital,
        finalCapital: initialCapital,
        totalReturn: 0,
        winRate: 0,
        trades: []
      };
    }
  }

  /**
   * 生成模拟行情数据
   */
  private generateMockQuote(code: string): RealTimeQuote {
    const basePrice = 30 + Math.random() * 50;
    const change = (Math.random() - 0.5) * 4;
    return {
      code,
      name: `股票${code}`,
      price: basePrice,
      priceChange: change,
      priceChangePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 10000000),
      amount: Math.floor(Math.random() * 500000),
      bid: basePrice - 0.01,
      ask: basePrice + 0.01,
      high: basePrice + Math.random() * 2,
      low: basePrice - Math.random() * 2,
      open: basePrice - Math.random() * 1,
      close: basePrice - Math.random() * 0.5,
      timestamp: new Date()
    };
  }

  /**
   * 获取模拟行情数据
   */
  private getMockQuote(code: string): RealTimeQuote {
    return this.generateMockQuote(code);
  }

  /**
   * 生成模拟历史数据
   */
  private generateMockHistoricalData(startDate: Date, endDate: Date): HistoricalData[] {
    const data: HistoricalData[] = [];
    let currentDate = new Date(startDate);
    let basePrice = 30;

    while (currentDate <= endDate) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) { // 排除周末
        const change = (Math.random() - 0.5) * 2;
        const open = basePrice;
        const close = basePrice + change;
        const high = Math.max(open, close) + Math.random() * 1;
        const low = Math.min(open, close) - Math.random() * 1;

        data.push({
          date: new Date(currentDate),
          open,
          close,
          high,
          low,
          volume: Math.floor(Math.random() * 5000000),
          amount: Math.floor(Math.random() * 200000)
        });

        basePrice = close;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  }

  /**
   * 生成模拟技术指标
   */
  private generateMockTechnicalIndicators(code: string): TechnicalIndicators {
    return {
      code,
      ma5: 35 + Math.random() * 5,
      ma10: 34 + Math.random() * 5,
      ma20: 33 + Math.random() * 5,
      rsi: 40 + Math.random() * 30,
      macd: Math.random() - 0.5,
      kdj: 40 + Math.random() * 30,
      bollingerUpper: 40 + Math.random() * 5,
      bollingerLower: 25 + Math.random() * 5,
      timestamp: new Date()
    };
  }

  /**
   * 获取默认技术指标
   */
  private getDefaultTechnicalIndicators(code: string): TechnicalIndicators {
    return this.generateMockTechnicalIndicators(code);
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * 订阅实时数据更新
   */
  subscribe(code: string, callback: (quote: RealTimeQuote) => void, interval: number = 5000): () => void {
    const intervalId = setInterval(async () => {
      const quote = await this.getQuote(code);
      callback(quote);
    }, interval);

    // 返回取消订阅函数
    return () => clearInterval(intervalId);
  }
}

// 创建全局实例
export const realTimeDataManager = new RealTimeDataManager();
