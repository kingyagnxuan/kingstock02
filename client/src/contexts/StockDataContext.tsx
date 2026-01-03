import { AnalysisReport, HotSector, MarketIndex, Stock } from "@/lib/types";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getSinaIndices, getCachedSinaQuote } from "@/lib/sinaFinanceAPI";
import { mockIndices, mockHotSectors, mockLimitUpStocks, mockReport } from "@/lib/mockData";

interface StockDataContextType {
  indices: MarketIndex[];
  hotSectors: HotSector[];
  limitUpStocks: Stock[];
  report: AnalysisReport;
  lastUpdated: Date;
  isLoading: boolean;
  refreshData: () => void;
}

const StockDataContext = createContext<StockDataContextType | undefined>(undefined);

export function StockDataProvider({ children }: { children: React.ReactNode }) {
  const [indices, setIndices] = useState<MarketIndex[]>(mockIndices);
  const [hotSectors, setHotSectors] = useState<HotSector[]>(mockHotSectors);
  const [limitUpStocks, setLimitUpStocks] = useState<Stock[]>(mockLimitUpStocks);
  const [report, setReport] = useState<AnalysisReport>(mockReport);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 使用新浪财经API获取实时数据
  const refreshData = async () => {
    setIsLoading(true);
    try {
      // 获取指数数据
      const sinaIndices = await getSinaIndices();
      if (sinaIndices.length > 0) {
        const updatedIndices = indices.map(idx => {
          const sinaData = sinaIndices.find(s => s.code.includes(idx.code));
          if (sinaData) {
            return {
              ...idx,
              value: sinaData.price,
              change: sinaData.bid,
              percent: sinaData.percent
            };
          }
          return idx;
        });
        setIndices(updatedIndices);
      }
      
      // 获取涨停股票的实时数据
      const updatedStocks = await Promise.all(
        limitUpStocks.map(async (stock) => {
          const sinaQuote = await getCachedSinaQuote(stock.code);
          if (sinaQuote) {
            return {
              ...stock,
              price: sinaQuote.price,
              change: sinaQuote.bid,
              percent: sinaQuote.percent,
              volume: sinaQuote.volume
            };
          }
          return stock;
        })
      );
      setLimitUpStocks(updatedStocks);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error("获取新浪财经数据失败，使用模拟数据:", error);
      // 降级到模拟数据
      const newIndices = indices.map(idx => ({
        ...idx,
        value: idx.value * (1 + (Math.random() * 0.002 - 0.001)),
        change: idx.change + (Math.random() * 2 - 1)
      }));
      setIndices(newIndices);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh every 5 seconds
  useEffect(() => {
    // 首次加载时立即刷新
    refreshData();
    
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <StockDataContext.Provider
      value={{
        indices,
        hotSectors,
        limitUpStocks,
        report,
        lastUpdated,
        isLoading,
        refreshData
      }}
    >
      {children}
    </StockDataContext.Provider>
  );
}

export function useStockData() {
  const context = useContext(StockDataContext);
  if (context === undefined) {
    throw new Error("useStockData must be used within a StockDataProvider");
  }
  return context;
}
