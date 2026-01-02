import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { mockHistoricalData } from "@/lib/mockHistoricalData";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoricalComparisonProps {
  stockCode: string;
  stockName: string;
}

export default function HistoricalComparison({
  stockCode,
  stockName,
}: HistoricalComparisonProps) {
  const { getStockStatistics } = useWatchlist();
  const stats = getStockStatistics(stockCode);
  const historicalData = mockHistoricalData[stockCode] || [];

  if (!stats) return null;

  return (
    <Card className="bg-card/40 backdrop-blur-md border-border/50">
      <CardHeader className="border-b border-border/50 pb-4">
        <CardTitle className="text-lg font-bold">历史数据对比</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/20 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">涨停次数</p>
            <p className="text-2xl font-bold text-primary">{stats.limitUpCount}</p>
          </div>
          <div className="bg-muted/20 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">成功率</p>
            <p className="text-2xl font-bold text-green-500">{stats.limitUpSuccessRate}%</p>
          </div>
          <div className="bg-muted/20 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">平均收益</p>
            <p className={cn(
              "text-2xl font-bold",
              stats.avgGainAfterLimitUp >= 0 ? "text-[var(--chart-1)]" : "text-[var(--chart-2)]"
            )}>
              {stats.avgGainAfterLimitUp > 0 ? "+" : ""}{stats.avgGainAfterLimitUp.toFixed(2)}%
            </p>
          </div>
          <div className="bg-muted/20 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">最大收益</p>
            <p className="text-2xl font-bold text-[var(--chart-1)]">+{stats.maxGainAfterLimitUp.toFixed(2)}%</p>
          </div>
        </div>

        {/* Gain Range */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm font-bold mb-3">涨停后收益范围</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">最大收益</span>
              <Badge className="bg-[var(--chart-1)]/20 text-[var(--chart-1)] border-0">
                +{stats.maxGainAfterLimitUp.toFixed(2)}%
              </Badge>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--chart-2)] to-[var(--chart-1)]"
                style={{
                  width: `${Math.max(0, (stats.avgGainAfterLimitUp - stats.minGainAfterLimitUp) / (stats.maxGainAfterLimitUp - stats.minGainAfterLimitUp) * 100)}%`
                }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">最小收益</span>
              <Badge className={cn(
                "border-0",
                stats.minGainAfterLimitUp >= 0
                  ? "bg-[var(--chart-1)]/20 text-[var(--chart-1)]"
                  : "bg-[var(--chart-2)]/20 text-[var(--chart-2)]"
              )}>
                {stats.minGainAfterLimitUp > 0 ? "+" : ""}{stats.minGainAfterLimitUp.toFixed(2)}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Recent History */}
        {historicalData.length > 0 && (
          <div>
            <p className="text-sm font-bold mb-3">近期行情</p>
            <div className="space-y-2">
              {historicalData.slice(-5).reverse().map((data) => (
                <div key={data.date} className="flex justify-between items-center p-2 bg-muted/20 rounded">
                  <span className="text-xs font-mono text-muted-foreground">{data.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono">{data.closePrice.toFixed(2)}</span>
                    <Badge className={cn(
                      "text-xs font-mono border-0",
                      data.changePercent >= 0
                        ? "bg-[var(--chart-1)]/10 text-[var(--chart-1)]"
                        : "bg-[var(--chart-2)]/10 text-[var(--chart-2)]"
                    )}>
                      {data.changePercent > 0 ? "+" : ""}{data.changePercent.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Potential */}
        {stats.nextPotentialDate && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-sm font-bold text-yellow-600 flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4" />
              下一个潜在涨停日期
            </p>
            <p className="text-xs text-muted-foreground">{stats.nextPotentialDate}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
