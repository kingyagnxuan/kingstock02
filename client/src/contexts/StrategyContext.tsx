import { createContext, useContext, useState, ReactNode } from "react";
import { InvestmentStrategy, Portfolio } from "@/lib/strategyTypes";
import { mockStrategies, mockPortfolios } from "@/lib/mockStrategyData";

interface StrategyContextType {
  strategies: InvestmentStrategy[];
  portfolios: Portfolio[];
  createStrategy: (strategy: InvestmentStrategy) => void;
  updateStrategy: (id: string, updates: Partial<InvestmentStrategy>) => void;
  deleteStrategy: (id: string) => void;
  createPortfolio: (portfolio: Portfolio) => void;
  updatePortfolio: (id: string, updates: Partial<Portfolio>) => void;
  deletePortfolio: (id: string) => void;
  getStrategyById: (id: string) => InvestmentStrategy | undefined;
  getPortfoliosByStrategy: (strategyId: string) => Portfolio[];
}

const StrategyContext = createContext<StrategyContextType | undefined>(undefined);

export function StrategyProvider({ children }: { children: ReactNode }) {
  const [strategies, setStrategies] = useState<InvestmentStrategy[]>(mockStrategies);
  const [portfolios, setPortfolios] = useState<Portfolio[]>(mockPortfolios);

  const createStrategy = (strategy: InvestmentStrategy) => {
    setStrategies(prev => [...prev, strategy]);
  };

  const updateStrategy = (id: string, updates: Partial<InvestmentStrategy>) => {
    setStrategies(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, ...updates, updatedAt: new Date() }
          : s
      )
    );
  };

  const deleteStrategy = (id: string) => {
    setStrategies(prev => prev.filter(s => s.id !== id));
    setPortfolios(prev => prev.filter(p => p.strategyId !== id));
  };

  const createPortfolio = (portfolio: Portfolio) => {
    setPortfolios(prev => [...prev, portfolio]);
  };

  const updatePortfolio = (id: string, updates: Partial<Portfolio>) => {
    setPortfolios(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date() }
          : p
      )
    );
  };

  const deletePortfolio = (id: string) => {
    setPortfolios(prev => prev.filter(p => p.id !== id));
  };

  const getStrategyById = (id: string) => {
    return strategies.find(s => s.id === id);
  };

  const getPortfoliosByStrategy = (strategyId: string) => {
    return portfolios.filter(p => p.strategyId === strategyId);
  };

  return (
    <StrategyContext.Provider
      value={{
        strategies,
        portfolios,
        createStrategy,
        updateStrategy,
        deleteStrategy,
        createPortfolio,
        updatePortfolio,
        deletePortfolio,
        getStrategyById,
        getPortfoliosByStrategy
      }}
    >
      {children}
    </StrategyContext.Provider>
  );
}

export function useStrategy() {
  const context = useContext(StrategyContext);
  if (!context) {
    throw new Error("useStrategy must be used within StrategyProvider");
  }
  return context;
}
