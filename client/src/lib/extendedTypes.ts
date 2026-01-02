export interface PriceAlert {
  id: string;
  code: string;
  name: string;
  targetPrice: number;
  alertType: 'above' | 'below'; // 价格高于或低于目标价时触发
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

export interface HistoricalData {
  code: string;
  date: string;
  openPrice: number;
  closePrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  changePercent: number;
}

export interface StockStatistics {
  code: string;
  name: string;
  limitUpCount: number; // 涨停次数
  limitUpSuccessRate: number; // 涨停成功率（%）
  avgGainAfterLimitUp: number; // 涨停后平均收益（%）
  maxGainAfterLimitUp: number; // 涨停后最大收益（%）
  minGainAfterLimitUp: number; // 涨停后最小收益（%）
  lastLimitUpDate?: string;
  nextPotentialDate?: string;
}

export interface AIAccuracy {
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number; // 准确率（%）
  upPredictions: number;
  upCorrect: number;
  downPredictions: number;
  downCorrect: number;
  lastUpdated: Date;
}

export interface ExportData {
  watchlist: Array<{
    code: string;
    name: string;
    currentPrice: number;
    changePercent: number;
    sector: string;
    aiPrediction: string;
    addedDate: string;
  }>;
  statistics: StockStatistics[];
  alerts: PriceAlert[];
  generatedAt: string;
}
