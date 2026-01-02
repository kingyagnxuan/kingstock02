import { AIAnalysis, FilterConfig, SortConfig, WatchlistStock } from "@/lib/types";
import { mockAIAnalyses } from "@/lib/mockAIData";
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
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistStock[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "changePercent",
    order: "desc"
  });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({});

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
        setFilterConfig
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
