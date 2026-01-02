import { mockHotSectors, mockIndices, mockLimitUpStocks, mockReport } from "@/lib/mockData";
import { AnalysisReport, HotSector, MarketIndex, Stock } from "@/lib/types";
import React, { createContext, useContext, useEffect, useState } from "react";

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

  // Simulate real-time data updates
  const refreshData = () => {
    setIsLoading(true);
    
    // Simulate API latency
    setTimeout(() => {
      // Randomize data slightly to simulate market fluctuations
      const newIndices = indices.map(idx => ({
        ...idx,
        value: idx.value * (1 + (Math.random() * 0.002 - 0.001)),
        change: idx.change + (Math.random() * 2 - 1)
      }));

      const newStocks = limitUpStocks.map(stock => ({
        ...stock,
        price: stock.isLimitUp ? stock.price : stock.price * (1 + (Math.random() * 0.01 - 0.005)),
        volume: stock.volume + Math.floor(Math.random() * 10000)
      }));

      setIndices(newIndices);
      setLimitUpStocks(newStocks);
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 800);
  };

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [indices, limitUpStocks]);

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
