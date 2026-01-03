import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, RefreshCw, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

interface TopStock {
  code: string;
  name: string;
  currentPrice: string;
  priceChangePercent: string;
  limitUpProbability: string;
}

export default function LimitUpTopCard() {
  const [, setLocation] = useLocation();
  const [topStocks, setTopStocks] = useState<TopStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 调用后端API获取当日涨停潜力股
  const { data: dailyData, refetch } = trpc.limitUp.getDailyPotentials.useQuery(
    { limit: 100 },
    {
      refetchInterval: 5 * 60 * 1000, // 5分钟自动刷新
    }
  );

  useEffect(() => {
    if (dailyData && dailyData.length > 0) {
      // 按涨停概率排序，取前5个
      const sorted = [...dailyData]
        .sort((a, b) => {
          const probA = parseFloat(a.limitUpProbability) || 0;
          const probB = parseFloat(b.limitUpProbability) || 0;
          return probB - probA;
        })
        .slice(0, 5);

      setTopStocks(sorted);
      setIsLoading(false);
    }
  }, [dailyData]);

  const handleRefresh = () => {
    setIsLoading(true);
    refetch().then(() => setIsLoading(false));
  };

  const handleViewDetails = (code: string) => {
    setLocation(`/stock/${code}`);
  };

  const handleViewAll = () => {
    setLocation("/limit-up");
  };

  return (
    <Card className="bg-card/40 backdrop-blur-md border-border/40 hover:border-primary/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-500" />
            <CardTitle className="text-lg font-bold">当日涨停潜力TOP5</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div key="loading" className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">加载中...</div>
          </div>
        ) : topStocks.length === 0 ? (
          <div key="empty" className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">暂无数据</div>
          </div>
        ) : (
          <div key="content" className="space-y-2">
            {topStocks.map((stock, index) => (
              <div
                key={stock.code}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => handleViewDetails(stock.code)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 text-red-500 text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {stock.name}
                    </div>
                    <div className="text-xs text-muted-foreground">{stock.code}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0 ml-2">
                  <div className="text-right">
                    <div className="text-sm font-semibold">{stock.currentPrice}</div>
                    <div
                      className={`text-xs font-medium ${
                        parseFloat(stock.priceChangePercent) >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {parseFloat(stock.priceChangePercent) >= 0 ? "+" : ""}
                      {stock.priceChangePercent}%
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-red-500">
                      {stock.limitUpProbability}%
                    </div>
                    <div className="text-xs text-muted-foreground">涨停概率</div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                </div>
              </div>
            ))}

            <div className="mt-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleViewAll}
            >
                查看全部涨停潜力股
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
