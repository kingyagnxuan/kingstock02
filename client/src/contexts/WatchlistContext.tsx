import { AIAnalysis, FilterConfig, SortConfig, WatchlistStock } from "@/lib/types";
import { mockAIAnalyses } from "@/lib/mockAIData";
import { PriceAlert, StockStatistics, AIAccuracy } from "@/lib/extendedTypes";
import { mockStockStatistics, mockAIAccuracy } from "@/lib/mockHistoricalData";
import React, { createContext, useContext, useState } from "react";

interface WatchlistContextType {
  watchlist: WatchlistStock[];
  addToWatchlist: (stock: WatchlistStock) => void;
  removeFromWatchlist: (code: string) => void;
  isInWatchlist: (code: string) => boolean;
  getAIAnalysis: (code: string) => AIAnalysis | undefined;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
  filterConfig: FilterConfig;
  setFilterConfig: (config: FilterConfig) => void;
  alerts: PriceAlert[];
  addAlert: (alert: PriceAlert) => void;
  removeAlert: (id: string) => void;
  triggerAlert: (id: string) => void;
  getStockStatistics: (code: string) => StockStatistics | undefined;
  getAIAccuracy: () => AIAccuracy;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistStock[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "changePercent",
    order: "desc"
  });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({});
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  const addToWatchlist = (stock: WatchlistStock) => {
    if (!watchlist.find(w => w.code === stock.code)) {
      setWatchlist([...watchlist, { ...stock, addedAt: new Date() }]);
    }
  };

  const removeFromWatchlist = (code: string) => {
    setWatchlist(watchlist.filter(w => w.code !== code));
  };

  const isInWatchlist = (code: string) => {
    return watchlist.some(w => w.code === code);
  };

  const getAIAnalysis = (code: string): AIAnalysis | undefined => {
    return mockAIAnalyses[code];
  };

  const addAlert = (alert: PriceAlert) => {
    setAlerts([...alerts, alert]);
  };

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const triggerAlert = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, triggeredAt: new Date() } : a));
  };

  const getStockStatistics = (code: string): StockStatistics | undefined => {
    return mockStockStatistics[code];
  };

  const getAIAccuracy = (): AIAccuracy => {
    return mockAIAccuracy;
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        getAIAnalysis,
        sortConfig,
        setSortConfig,
        filterConfig,
        setFilterConfig,
        alerts,
        addAlert,
        removeAlert,
        triggerAlert,
        getStockStatistics,
        getAIAccuracy
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
}
