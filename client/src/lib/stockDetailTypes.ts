/**
 * 股票详情数据类型
 */

export interface KLineData {
  time: string; // YYYY-MM-DD HH:mm
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  amount: number;
}

export interface StockDetail {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  amount: number;
  pe: number;
  pb: number;
  marketCap: number;
  circulation: number;
  totalShares: number;
  eps: number;
  bvps: number;
  roe: number;
  industry: string;
  description: string;
  timestamp: Date;
}

export interface CashFlowData {
  date: string;
  inflow: number;
  outflow: number;
  netInflow: number;
}

export interface FundFlow {
  superLarge: number; // 超大单
  large: number; // 大单
  medium: number; // 中单
  small: number; // 小单
  timestamp: Date;
}

export interface TechnicalIndicators {
  ma5: number;
  ma10: number;
  ma20: number;
  ma60: number;
  rsi: number;
  macd: {
    dif: number;
    dea: number;
    histogram: number;
  };
  kdj: {
    k: number;
    d: number;
    j: number;
  };
}

export interface StockNews {
  id: string;
  title: string;
  content: string;
  source: string;
  timestamp: Date;
  importance: "high" | "medium" | "low";
}

export interface StockAnalysis {
  code: string;
  name: string;
  rating: "strong-buy" | "buy" | "hold" | "sell" | "strong-sell";
  targetPrice: number;
  upside: number;
  downside: number;
  consensus: string;
  analystCount: number;
}

export type KLinePeriod = "1m" | "5m" | "15m" | "30m" | "1h" | "1d" | "1w" | "1M";

export interface KLineResponse {
  code: string;
  period: KLinePeriod;
  data: KLineData[];
  timestamp: Date;
}
