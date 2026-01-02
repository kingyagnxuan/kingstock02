export interface Stock {
  code: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number;
  turnoverRate: number;
  marketCap: number;
  pe: number;
  sector: string;
  isLimitUp: boolean;
  limitUpTime?: string;
  reason?: string;
}

export interface MarketIndex {
  name: string;
  code: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface HotSector {
  name: string;
  changePercent: number;
  leadingStock: string;
  netInflow: number;
}

export interface AnalysisReport {
  date: string;
  marketOutlook: string;
  strategy: string;
  coreSectors: {
    name: string;
    logic: string;
    stocks: StockRecommendation[];
  }[];
}

export interface StockRecommendation {
  code: string;
  name: string;
  logic: string;
  buyPoint: string;
  stopLoss: string;
  rating: 'Strong Buy' | 'Buy' | 'Hold';
}
