import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, TrendingUp, TrendingDown, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { getSectorStocks } from "@/lib/sectorStockMapping";

interface SectorStock {
  code: string;
  name: string;
  currentPrice: number;
  priceChangePercent: number;
  volume: number;
  volumeRatio: number;
  capitalFlow: number;
  capitalFlowPercent: number;
}

type SortBy = "capitalFlow" | "volume" | "priceChange";

export default function SectorDetail() {
  const { sector } = useParams<{ sector: string }>();
  const [, setLocation] = useLocation();
  const [stocks, setStocks] = useState<SectorStock[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("capitalFlow");
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    // 初始化自选股状态
    const initialFavorites = new Set<string>();
    stocks.forEach(stock => {
      if (isInWatchlist(stock.code)) {
        initialFavorites.add(stock.code);
      }
    });
    setFavorites(initialFavorites);
  }, [stocks]);

  useEffect(() => {
    // 模拟加载板块内的个股数据
    loadSectorStocks();
  }, [sector]);

  const loadSectorStocks = async () => {
    setIsLoading(true);
    try {
      // 根据板块名称获取对应的个股数据
      const sectorData = getSectorStocks(sector || "");
      setStocks(sectorData as SectorStock[]);
    } catch (error) {
      console.error("Failed to load sector stocks:", error);
      setStocks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  const sortedStocks = [...stocks].sort((a, b) => {
    switch (sortBy) {
      case "capitalFlow":
        return b.capitalFlow - a.capitalFlow;
      case "volume":
        return b.volume - a.volume;
      case "priceChange":
        return b.priceChangePercent - a.priceChangePercent;
      default:
        return 0;
    }
  });

  const handleAddFavorite = (stock: SectorStock) => {
    if (isInWatchlist(stock.code)) {
      removeFromWatchlist(stock.code);
      const newFavorites = new Set(favorites);
      newFavorites.delete(stock.code);
      setFavorites(newFavorites);
    } else {
      addToWatchlist({
        code: stock.code,
        name: stock.name,
        addedAt: new Date(),
      });
      const newFavorites = new Set(favorites);
      newFavorites.add(stock.code);
      setFavorites(newFavorites);
    }
  };

  const handleViewDetail = (code: string) => {
    setLocation(`/stock/${code}`);
  };

  const handleBack = () => {
    setLocation("/");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{sector || "板块"}</h1>
            <p className="text-sm text-muted-foreground">个股资金排行</p>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2">
          <Button
            variant={sortBy === "capitalFlow" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("capitalFlow")}
          >
            资金流向
          </Button>
          <Button
            variant={sortBy === "volume" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("volume")}
          >
            成交量
          </Button>
          <Button
            variant={sortBy === "priceChange" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("priceChange")}
          >
            涨幅
          </Button>
        </div>

        {/* Stocks List */}
        <Card className="bg-card/40 backdrop-blur-md border-border/40">
          <CardHeader>
            <CardTitle>个股排行</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">加载中...</div>
              </div>
            ) : sortedStocks.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">暂无数据</div>
              </div>
            ) : (
              <div key="content" className="space-y-2">
                {sortedStocks.map((stock, index) => (
                  <div
                    key={stock.code}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => handleViewDetail(stock.code)}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 text-red-500 text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{stock.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {stock.code}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 flex-shrink-0">
                      {/* Price */}
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          ¥{stock.currentPrice.toFixed(2)}
                        </div>
                        <div
                          className={`text-xs font-medium ${
                            stock.priceChangePercent >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {stock.priceChangePercent >= 0 ? "+" : ""}
                          {stock.priceChangePercent.toFixed(2)}%
                        </div>
                      </div>

                      {/* Volume */}
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-semibold">
                          {(stock.volume / 1000000).toFixed(0)}M
                        </div>
                        <div className="text-xs text-muted-foreground">
                          成交量
                        </div>
                      </div>

                      {/* Capital Flow */}
                      <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-red-500">
                          {stock.capitalFlowPercent.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          资金流向
                        </div>
                      </div>

                      {/* Favorite Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddFavorite(stock);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Heart
                          className={cn(
                            "w-4 h-4 transition-colors",
                            isInWatchlist(stock.code)
                              ? "fill-red-500 text-red-500"
                              : "text-muted-foreground"
                          )}
                        />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
