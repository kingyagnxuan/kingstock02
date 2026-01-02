export interface SelectionFactor {
  id: string;
  name: string;
  type: "checkbox" | "range" | "select" | "text";
  category: "technical" | "fundamental" | "sentiment" | "custom";
  value?: any;
  options?: Array<{ label: string; value: any }>;
  min?: number;
  max?: number;
  unit?: string;
  description?: string;
}

export interface InvestmentStrategy {
  id: string;
  name: string;
  description?: string;
  factors: SelectionFactor[];
  createdAt: Date;
  updatedAt: Date;
  status: "active" | "inactive" | "testing";
  performance?: StrategyPerformance;
  tags?: string[];
}

export interface StrategyPerformance {
  totalReturn: number; // 总收益率 %
  winRate: number; // 胜率 %
  maxDrawdown: number; // 最大回撤 %
  sharpeRatio: number; // 夏普比率
  tradesCount: number; // 交易次数
  winTrades: number; // 获胜交易数
  lossTrades: number; // 亏损交易数
  avgProfit: number; // 平均利润 %
  avgLoss: number; // 平均亏损 %
  bestTrade: number; // 最佳交易 %
  worstTrade: number; // 最差交易 %
  lastUpdated: Date;
}

export interface StrategyBacktest {
  strategyId: string;
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  finalCapital: number;
  trades: BacktestTrade[];
  performance: StrategyPerformance;
}

export interface BacktestTrade {
  id: string;
  stockCode: string;
  stockName: string;
  entryDate: Date;
  entryPrice: number;
  exitDate: Date;
  exitPrice: number;
  quantity: number;
  profit: number;
  profitRate: number;
  reason?: string;
}

export interface PortfolioItem {
  strategyId: string;
  stockCode: string;
  stockName: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  profit: number;
  profitRate: number;
  entryDate: Date;
}

export interface Portfolio {
  id: string;
  name: string;
  strategyId: string;
  description?: string;
  items: PortfolioItem[];
  totalValue: number;
  totalProfit: number;
  totalProfitRate: number;
  createdAt: Date;
  updatedAt: Date;
}

// 预定义的选股因子
export const PREDEFINED_FACTORS: Record<string, SelectionFactor> = {
  // 技术面因子
  "tech-limit-up": {
    id: "tech-limit-up",
    name: "涨停板",
    type: "checkbox",
    category: "technical",
    description: "选择涨停的股票"
  },
  "tech-volume": {
    id: "tech-volume",
    name: "成交量",
    type: "range",
    category: "technical",
    min: 0,
    max: 100,
    unit: "万手",
    description: "选择成交量在指定范围内的股票"
  },
  "tech-rsi": {
    id: "tech-rsi",
    name: "RSI指标",
    type: "range",
    category: "technical",
    min: 0,
    max: 100,
    description: "相对强弱指数，用于判断超买超卖"
  },
  "tech-ma": {
    id: "tech-ma",
    name: "均线方向",
    type: "select",
    category: "technical",
    options: [
      { label: "5日均线上升", value: "ma5-up" },
      { label: "10日均线上升", value: "ma10-up" },
      { label: "20日均线上升", value: "ma20-up" },
      { label: "所有均线上升", value: "all-up" }
    ],
    description: "选择均线方向"
  },

  // 基本面因子
  "fund-pe": {
    id: "fund-pe",
    name: "市盈率(PE)",
    type: "range",
    category: "fundamental",
    min: 0,
    max: 100,
    description: "市盈率越低越便宜"
  },
  "fund-pb": {
    id: "fund-pb",
    name: "市净率(PB)",
    type: "range",
    category: "fundamental",
    min: 0,
    max: 10,
    description: "市净率越低越便宜"
  },
  "fund-roe": {
    id: "fund-roe",
    name: "净资产收益率(ROE)",
    type: "range",
    category: "fundamental",
    min: 0,
    max: 100,
    unit: "%",
    description: "ROE越高越好"
  },
  "fund-growth": {
    id: "fund-growth",
    name: "增长率",
    type: "select",
    category: "fundamental",
    options: [
      { label: "高增长 (>30%)", value: "high" },
      { label: "中等增长 (10%-30%)", value: "medium" },
      { label: "低增长 (<10%)", value: "low" }
    ],
    description: "选择公司增长速度"
  },

  // 情绪面因子
  "sentiment-hot": {
    id: "sentiment-hot",
    name: "热门板块",
    type: "checkbox",
    category: "sentiment",
    description: "选择当前热门的板块"
  },
  "sentiment-discussion": {
    id: "sentiment-discussion",
    name: "讨论热度",
    type: "range",
    category: "sentiment",
    min: 0,
    max: 100,
    description: "社区讨论热度"
  },
  "sentiment-sentiment": {
    id: "sentiment-sentiment",
    name: "市场情绪",
    type: "select",
    category: "sentiment",
    options: [
      { label: "看涨", value: "bullish" },
      { label: "中性", value: "neutral" },
      { label: "看跌", value: "bearish" }
    ],
    description: "选择市场情绪"
  }
};
