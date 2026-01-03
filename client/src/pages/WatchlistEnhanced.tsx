import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { useStockData } from "@/contexts/StockDataContext";
import { Heart, Trash2, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PriceAlertManager from "@/components/PriceAlertManager";
import HistoricalComparison from "@/components/HistoricalComparison";
import ExportReport from "@/components/ExportReport";
import { useState } from "react";

export default function WatchlistEnhanced() {
  const { watchlist, removeFromWatchlist, getAIAnalysis } = useWatchlist();
  const { limitUpStocks } = useStockData();
  const [expandedStock, setExpandedStock] = useState<string | null>(null);

  const watchlistWithData = watchlist
    .map(item => ({
      ...item,
      stock: limitUpStocks.find(s => s.code === item.code)
    }))
    .filter(item => item.stock);

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6 lg:space-y-8">
        <section className="space-y-2 md:space-y-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            我的自选股
          </h2>
          <p className="text-muted-foreground">
            共 {watchlist.length} 只股票，管理您关注的涨停潜力股、设置价格预警、查看历史数据
          </p>
        </section>

        {watchlistWithData.length === 0 ? (
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardContent className="p-12 text-center">
              <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">还没有收藏任何股票</h3>
              <p className="text-muted-foreground">
                点击涨停追踪页面中的心形图标，将感兴趣的股票添加到自选股
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Stocks List */}
            <div className="space-y-4">
              {watchlistWithData.map(({ stock, ...item }) => {
                const aiAnalysis = getAIAnalysis(stock!.code);
                const isExpanded = expandedStock === stock!.code;

                return (
                  <Card
                    key={stock!.code}
                    className="bg-card/40 backdrop-blur-md border-border/50 hover:border-primary/50 transition-all duration-300 group overflow-hidden"
                  >
                    <CardHeader
                      className="pb-3 cursor-pointer"
                      onClick={() => setExpandedStock(isExpanded ? null : stock!.code)}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <CardTitle className="text-base md:text-lg">{stock!.name}</CardTitle>
                            <Badge variant="secondary" className="bg-secondary/50">
                              {stock!.sector}
                            </Badge>
                          </div>
                          <p className="text-xs font-mono text-muted-foreground">{stock!.code}</p>
                        </div>
                        <div className="text-left md:text-right">
                          <div className="text-xl md:text-2xl font-bold font-mono">{stock!.price.toFixed(2)}</div>
                          <Badge className={cn(
                            "font-mono font-bold border-0",
                            stock!.changePercent >= 0
                              ? "bg-[var(--chart-1)]/10 text-[var(--chart-1)]"
                              : "bg-[var(--chart-2)]/10 text-[var(--chart-2)]"
                          )}>
                            +{stock!.changePercent.toFixed(2)}%
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <CardContent className="space-y-6 border-t border-border/50 pt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Left: Price Alert */}
                          <div>
                            <PriceAlertManager
                              stockCode={stock!.code}
                              stockName={stock!.name}
                              currentPrice={stock!.price}
                            />
                          </div>

                          {/* Right: AI Analysis Summary */}
                          {aiAnalysis && (
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                              <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                AI智能分析
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">预测方向:</span>
                                  <Badge className={cn(
                                    "text-xs font-bold",
                                    aiAnalysis.prediction === "UP"
                                      ? "bg-[var(--chart-1)]/20 text-[var(--chart-1)]"
                                      : aiAnalysis.prediction === "DOWN"
                                        ? "bg-[var(--chart-2)]/20 text-[var(--chart-2)]"
                                        : "bg-muted text-muted-foreground"
                                  )}>
                                    {aiAnalysis.prediction === "UP" ? "看涨" : aiAnalysis.prediction === "DOWN" ? "看跌" : "中性"}
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">置信度:</span>
                                  <span className="font-mono font-bold">{aiAnalysis.confidence}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">风险等级:</span>
                                  <Badge variant="outline" className={cn(
                                    aiAnalysis.riskLevel === "LOW"
                                      ? "border-green-500/50 text-green-500"
                                      : aiAnalysis.riskLevel === "MEDIUM"
                                        ? "border-yellow-500/50 text-yellow-500"
                                        : "border-red-500/50 text-red-500"
                                  )}>
                                    {aiAnalysis.riskLevel === "LOW" ? "低" : aiAnalysis.riskLevel === "MEDIUM" ? "中" : "高"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Historical Comparison */}
                        <HistoricalComparison
                          stockCode={stock!.code}
                          stockName={stock!.name}
                        />

                        {/* Remove Button */}
                        <Button
                          variant="outline"
                          onClick={() => removeFromWatchlist(stock!.code)}
                          className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          移除自选股
                        </Button>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Export Section */}
            <div className="lg:w-1/3">
              <ExportReport />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
