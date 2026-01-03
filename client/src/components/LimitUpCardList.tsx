import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stock } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TrendingUp, Zap, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

interface LimitUpCardListProps {
  stocks: Stock[];
  maxItems?: number;
}

export default function LimitUpCardList({ stocks, maxItems = 5 }: LimitUpCardListProps) {
  const [, setLocation] = useLocation();
  const displayStocks = stocks.slice(0, maxItems);

  return (
    <Card className="bg-card/40 backdrop-blur-md border-border/50 overflow-hidden">
      <CardHeader className="border-b border-border/50 pb-2 md:pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 md:p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
              <Zap className="w-4 md:w-5 h-4 md:h-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base md:text-lg font-bold truncate">涨停潜力股追踪</CardTitle>
              <p className="text-xs md:text-sm text-muted-foreground hidden md:block">实时监控市场强势资金流向</p>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary bg-primary/5 flex-shrink-0">
            实时更新
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-2 md:space-y-3 p-3 md:p-4">
          {displayStocks.map((stock, index) => (
            <div
              key={stock.code}
              onClick={() => setLocation(`/stock/${stock.code}`)}
              className="p-3 md:p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-card/60 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs md:text-sm font-bold text-muted-foreground">#{index + 1}</span>
                    <h3 className="text-sm md:text-base font-bold text-foreground truncate">{stock.name}</h3>
                    <Badge variant="secondary" className="bg-secondary/50 text-xs flex-shrink-0">
                      {stock.sector}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">{stock.code}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg md:text-xl font-bold font-mono text-foreground">{stock.price.toFixed(2)}</div>
                  <Badge className={cn(
                    "font-mono font-bold border-0 text-xs",
                    stock.changePercent >= 0
                      ? "bg-[var(--chart-1)]/10 text-[var(--chart-1)]"
                      : "bg-[var(--chart-2)]/10 text-[var(--chart-2)]"
                  )}>
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="bg-muted/30 rounded p-2">
                  <p className="text-muted-foreground text-xs mb-1">涨停原因</p>
                  <p className="font-semibold text-foreground truncate">{stock.reason}</p>
                </div>
                <div className="bg-muted/30 rounded p-2">
                  <p className="text-muted-foreground text-xs mb-1">封板时间</p>
                  <p className="font-mono font-semibold text-foreground">{stock.limitUpTime}</p>
                </div>
                <div className="bg-muted/30 rounded p-2">
                  <p className="text-muted-foreground text-xs mb-1">成交量</p>
                  <p className="font-semibold text-foreground truncate">{stock.volume}</p>
                </div>
                <div className="bg-muted/30 rounded p-2">
                  <p className="text-muted-foreground text-xs mb-1">热度</p>
                  <p className="font-semibold text-primary">高</p>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground line-clamp-1">点击查看详情</p>
                <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>

        {stocks.length > maxItems && (
          <div className="p-3 md:p-4 border-t border-border/50 text-center">
            <button
              onClick={() => setLocation('/limit-up')}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              查看全部 ({stocks.length})
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
