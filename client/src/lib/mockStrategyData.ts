import { InvestmentStrategy, Portfolio, StrategyPerformance, PortfolioItem } from "./strategyTypes";
import { PREDEFINED_FACTORS } from "./strategyTypes";

export const mockStrategies: InvestmentStrategy[] = [
  {
    id: "strategy-1",
    name: "AI应用龙头追涨",
    description: "追踪AI应用板块的涨停龙头股",
    factors: [
      { ...PREDEFINED_FACTORS["tech-limit-up"], value: true },
      { ...PREDEFINED_FACTORS["sentiment-hot"], value: true },
      { ...PREDEFINED_FACTORS["fund-growth"], value: "high" }
    ],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    status: "active",
    tags: ["AI", "龙头", "短线"],
    performance: {
      totalReturn: 28.5,
      winRate: 68,
      maxDrawdown: -12.3,
      sharpeRatio: 1.85,
      tradesCount: 22,
      winTrades: 15,
      lossTrades: 7,
      avgProfit: 4.2,
      avgLoss: -2.1,
      bestTrade: 18.5,
      worstTrade: -8.3,
      lastUpdated: new Date()
    }
  },
  {
    id: "strategy-2",
    name: "商业航天价值投资",
    description: "基于基本面的商业航天板块投资",
    factors: [
      { ...PREDEFINED_FACTORS["fund-pe"], value: [15, 35] },
      { ...PREDEFINED_FACTORS["fund-roe"], value: [12, 100] },
      { ...PREDEFINED_FACTORS["fund-growth"], value: "high" }
    ],
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-10"),
    status: "active",
    tags: ["商业航天", "价值", "长线"],
    performance: {
      totalReturn: 15.8,
      winRate: 72,
      maxDrawdown: -8.5,
      sharpeRatio: 2.12,
      tradesCount: 18,
      winTrades: 13,
      lossTrades: 5,
      avgProfit: 3.5,
      avgLoss: -1.8,
      bestTrade: 12.3,
      worstTrade: -6.2,
      lastUpdated: new Date()
    }
  },
  {
    id: "strategy-3",
    name: "高成长低估值",
    description: "寻找高增长但低估值的股票",
    factors: [
      { ...PREDEFINED_FACTORS["fund-pe"], value: [10, 25] },
      { ...PREDEFINED_FACTORS["fund-growth"], value: "high" },
      { ...PREDEFINED_FACTORS["tech-rsi"], value: [30, 70] }
    ],
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-18"),
    status: "testing",
    tags: ["价值", "成长", "平衡"],
    performance: {
      totalReturn: 8.2,
      winRate: 58,
      maxDrawdown: -15.2,
      sharpeRatio: 0.95,
      tradesCount: 12,
      winTrades: 7,
      lossTrades: 5,
      avgProfit: 2.8,
      avgLoss: -2.5,
      bestTrade: 9.1,
      worstTrade: -7.8,
      lastUpdated: new Date()
    }
  }
];

export const mockPortfolios: Portfolio[] = [
  {
    id: "portfolio-1",
    name: "AI应用龙头组合",
    strategyId: "strategy-1",
    description: "根据AI应用龙头追涨策略构建的投资组合",
    items: [
      {
        strategyId: "strategy-1",
        stockCode: "300058",
        stockName: "蓝色光标",
        quantity: 100,
        entryPrice: 12.45,
        currentPrice: 14.82,
        profit: 237,
        profitRate: 19.04,
        entryDate: new Date("2024-01-15")
      },
      {
        strategyId: "strategy-1",
        stockCode: "600363",
        stockName: "联创光电",
        quantity: 50,
        entryPrice: 38.88,
        currentPrice: 42.15,
        profit: 164.5,
        profitRate: 8.41,
        entryDate: new Date("2024-01-18")
      },
      {
        strategyId: "strategy-1",
        stockCode: "300516",
        stockName: "久之洋",
        quantity: 80,
        entryPrice: 42.60,
        currentPrice: 45.32,
        profit: 217.6,
        profitRate: 6.38,
        entryDate: new Date("2024-01-20")
      }
    ],
    totalValue: 4287.5,
    totalProfit: 619.1,
    totalProfitRate: 16.8,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date()
  },
  {
    id: "portfolio-2",
    name: "商业航天长期持仓",
    strategyId: "strategy-2",
    description: "根据商业航天价值投资策略构建的长期投资组合",
    items: [
      {
        strategyId: "strategy-2",
        stockCode: "002131",
        stockName: "利欧股份",
        quantity: 200,
        entryPrice: 3.52,
        currentPrice: 3.85,
        profit: 66,
        profitRate: 9.38,
        entryDate: new Date("2024-02-01")
      },
      {
        strategyId: "strategy-2",
        stockCode: "601698",
        stockName: "中国卫通",
        quantity: 150,
        entryPrice: 22.15,
        currentPrice: 23.42,
        profit: 190.5,
        profitRate: 5.73,
        entryDate: new Date("2024-02-05")
      }
    ],
    totalValue: 3968.5,
    totalProfit: 256.5,
    totalProfitRate: 6.9,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date()
  }
];
