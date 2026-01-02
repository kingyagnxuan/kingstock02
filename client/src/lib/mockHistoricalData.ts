import { HistoricalData, StockStatistics, AIAccuracy } from "./extendedTypes";

export const mockHistoricalData: Record<string, HistoricalData[]> = {
  "300058": [
    { code: "300058", date: "2025-12-25", openPrice: 10.20, closePrice: 10.50, highPrice: 10.80, lowPrice: 10.15, volume: 1200000, changePercent: 2.94 },
    { code: "300058", date: "2025-12-26", openPrice: 10.50, closePrice: 10.95, highPrice: 11.20, lowPrice: 10.48, volume: 1500000, changePercent: 4.29 },
    { code: "300058", date: "2025-12-27", openPrice: 10.95, closePrice: 11.45, highPrice: 11.80, lowPrice: 10.90, volume: 1800000, changePercent: 4.57 },
    { code: "300058", date: "2025-12-28", openPrice: 11.45, closePrice: 11.20, highPrice: 11.60, lowPrice: 11.10, volume: 900000, changePercent: -2.18 },
    { code: "300058", date: "2025-12-29", openPrice: 11.20, closePrice: 11.85, highPrice: 12.10, lowPrice: 11.15, volume: 2100000, changePercent: 5.80 },
    { code: "300058", date: "2025-12-30", openPrice: 11.85, closePrice: 12.45, highPrice: 12.50, lowPrice: 11.80, volume: 2500000, changePercent: 5.06 },
    { code: "300058", date: "2026-01-02", openPrice: 12.45, closePrice: 12.45, highPrice: 12.50, lowPrice: 12.40, volume: 2500000, changePercent: 20.00 },
  ],
  "600363": [
    { code: "600363", date: "2025-12-25", openPrice: 35.20, closePrice: 35.80, highPrice: 36.20, lowPrice: 35.10, volume: 450000, changePercent: 1.70 },
    { code: "600363", date: "2025-12-26", openPrice: 35.80, closePrice: 36.50, highPrice: 37.00, lowPrice: 35.75, volume: 520000, changePercent: 1.96 },
    { code: "600363", date: "2025-12-27", openPrice: 36.50, closePrice: 37.20, highPrice: 37.80, lowPrice: 36.45, volume: 680000, changePercent: 1.92 },
    { code: "600363", date: "2025-12-28", openPrice: 37.20, closePrice: 36.80, highPrice: 37.50, lowPrice: 36.70, volume: 380000, changePercent: -1.08 },
    { code: "600363", date: "2025-12-29", openPrice: 36.80, closePrice: 37.95, highPrice: 38.50, lowPrice: 36.75, volume: 750000, changePercent: 3.12 },
    { code: "600363", date: "2025-12-30", openPrice: 37.95, closePrice: 38.88, highPrice: 39.20, lowPrice: 37.90, volume: 850000, changePercent: 2.45 },
    { code: "600363", date: "2026-01-02", openPrice: 38.88, closePrice: 38.88, highPrice: 39.00, lowPrice: 38.80, volume: 850000, changePercent: 10.00 },
  ],
  "300516": [
    { code: "300516", date: "2025-12-25", openPrice: 32.50, closePrice: 33.20, highPrice: 33.80, lowPrice: 32.45, volume: 280000, changePercent: 2.15 },
    { code: "300516", date: "2025-12-26", openPrice: 33.20, closePrice: 34.10, highPrice: 34.80, lowPrice: 33.15, volume: 320000, changePercent: 2.71 },
    { code: "300516", date: "2025-12-27", openPrice: 34.10, closePrice: 35.00, highPrice: 35.50, lowPrice: 34.05, volume: 380000, changePercent: 2.64 },
    { code: "300516", date: "2025-12-28", openPrice: 35.00, closePrice: 34.50, highPrice: 35.20, lowPrice: 34.40, volume: 220000, changePercent: -1.43 },
    { code: "300516", date: "2025-12-29", openPrice: 34.50, closePrice: 35.80, highPrice: 36.50, lowPrice: 34.45, volume: 420000, changePercent: 3.77 },
    { code: "300516", date: "2025-12-30", openPrice: 35.80, closePrice: 42.60, highPrice: 42.80, lowPrice: 35.75, volume: 320000, changePercent: 19.00 },
    { code: "300516", date: "2026-01-02", openPrice: 42.60, closePrice: 42.60, highPrice: 42.70, lowPrice: 42.50, volume: 320000, changePercent: 20.00 },
  ],
};

export const mockStockStatistics: Record<string, StockStatistics> = {
  "300058": {
    code: "300058",
    name: "蓝色光标",
    limitUpCount: 12,
    limitUpSuccessRate: 75,
    avgGainAfterLimitUp: 3.5,
    maxGainAfterLimitUp: 8.2,
    minGainAfterLimitUp: -2.1,
    lastLimitUpDate: "2026-01-02",
    nextPotentialDate: "2026-01-05",
  },
  "600363": {
    code: "600363",
    name: "联创光电",
    limitUpCount: 8,
    limitUpSuccessRate: 68,
    avgGainAfterLimitUp: 2.8,
    maxGainAfterLimitUp: 6.5,
    minGainAfterLimitUp: -1.8,
    lastLimitUpDate: "2026-01-02",
    nextPotentialDate: "2026-01-06",
  },
  "300516": {
    code: "300516",
    name: "久之洋",
    limitUpCount: 6,
    limitUpSuccessRate: 83,
    avgGainAfterLimitUp: 4.2,
    maxGainAfterLimitUp: 9.8,
    minGainAfterLimitUp: 0.5,
    lastLimitUpDate: "2026-01-02",
    nextPotentialDate: "2026-01-07",
  },
  "002131": {
    code: "002131",
    name: "利欧股份",
    limitUpCount: 10,
    limitUpSuccessRate: 72,
    avgGainAfterLimitUp: 3.1,
    maxGainAfterLimitUp: 7.5,
    minGainAfterLimitUp: -1.5,
    lastLimitUpDate: "2026-01-02",
    nextPotentialDate: "2026-01-08",
  },
};

export const mockAIAccuracy: AIAccuracy = {
  totalPredictions: 245,
  correctPredictions: 189,
  accuracy: 77.1,
  upPredictions: 145,
  upCorrect: 118,
  downPredictions: 100,
  downCorrect: 71,
  lastUpdated: new Date(),
};
