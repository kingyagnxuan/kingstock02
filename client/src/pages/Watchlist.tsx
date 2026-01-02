import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { useStockData } from "@/contexts/StockDataContext";
import { Heart, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Watchlist() {
  const { watchlist, removeFromWatchlist, getAIAnalysis } = useWatchlist();
  const { limitUpStocks } = useStockData();

  // Get full stock data for watchlist items
  const watchlistWithData = watchlist
    .map(item => ({
      ...item,
      stock: limitUpStocks.find(s => s.code === item.code)
    }))
    .filter(item => item.stock);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            我的自选股
          </h2>
          <p className="text-muted-foreground">
            共 {watchlist.length} 只股票，管理您关注的涨停潜力股
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlistWithData.map(({ stock, ...item }) => {
              const aiAnalysis = getAIAnalysis(stock!.code);

              return (
                <Card key={stock!.code} className="bg-card/40 backdrop-blur-md border-border/50 hover:border-primary/50 transition-all duration-300 group overflow-hidden relative">
                  <div className={cn(
                    "absolute top-0 left-0 w-1 h-full transition-all duration-300",
                    stock!.changePercent >= 0 ? "bg-[var(--chart-1)]" : "bg-[var(--chart-2)]",
                    "group-hover:w-1.5"
                  )} />

                  <CardHeader className="pb-3 pl-7">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <CardTitle className="text-lg">{stock!.name}</CardTitle>
                        <p className="text-xs font-mono text-muted-foreground">{stock!.code}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromWatchlist(stock!.code)}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pl-7">
                    {/* Price Info */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">现价</span>
                        <span className="text-2xl font-bold font-mono">{stock!.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">涨跌幅</span>
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

                    {/* Stock Info */}
                    <div className="bg-muted/20 rounded-lg p-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">板块</span>
                        <Badge variant="secondary" className="bg-secondary/50">{stock!.sector}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">换手率</span>
                        <span className="font-mono">{stock!.turnoverRate.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">成交量</span>
                        <span className="font-mono">{(stock!.volume / 1000000).toFixed(2)}M</span>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    {aiAnalysis && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-primary">AI预测</span>
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
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>置信度: {aiAnalysis.confidence}%</span>
                          <span>风险: {aiAnalysis.riskLevel === "LOW" ? "低" : aiAnalysis.riskLevel === "MEDIUM" ? "中" : "高"}</span>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {item.notes && (
                      <div className="bg-muted/20 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground italic">{item.notes}</p>
                      </div>
                    )}
                  </CardContent>

                  {/* Background Glow */}
                  <div className={cn(
                    "absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-20",
                    stock!.changePercent >= 0 ? "bg-[var(--chart-1)]" : "bg-[var(--chart-2)]"
                  )} />
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
