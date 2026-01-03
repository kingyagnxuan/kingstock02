import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Stock } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Brain, Heart, TrendingUp, Zap, ArrowUp, ArrowDown } from "lucide-react";
import React, { useState } from "react";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocation } from "wouter";

interface LimitUpCardGridProps {
  stocks: Stock[];
}

export default function LimitUpCardGrid({ stocks }: LimitUpCardGridProps) {
  const [, setLocation] = useLocation();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, getAIAnalysis, sortConfig, setSortConfig, filterConfig, setFilterConfig } = useWatchlist();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Apply filters and sorting
  let filteredStocks = stocks.filter(stock => {
    if (filterConfig.sector && stock.sector !== filterConfig.sector) return false;
    if (filterConfig.isLimitUp !== undefined && stock.isLimitUp !== filterConfig.isLimitUp) return false;
    if (filterConfig.minChangePercent !== undefined && stock.changePercent < filterConfig.minChangePercent) return false;
    if (filterConfig.maxChangePercent !== undefined && stock.changePercent > filterConfig.maxChangePercent) return false;
    return true;
  });

  filteredStocks.sort((a, b) => {
    const aVal = a[sortConfig.field];
    const bVal = b[sortConfig.field];
    return sortConfig.order === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const sectors = Array.from(new Set(stocks.map(s => s.sector)));

  const handleAddToWatchlist = (stock: Stock) => {
    if (!isInWatchlist(stock.code)) {
      addToWatchlist({
        code: stock.code,
        name: stock.name,
        addedAt: new Date()
      });
    } else {
      removeFromWatchlist(stock.code);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Sorting */}
      <Card className="bg-card/40 backdrop-blur-md border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <Select value={filterConfig.sector || "all"} onValueChange={(value) => setFilterConfig({ ...filterConfig, sector: value === "all" ? undefined : value })}>
                <SelectTrigger className="w-[150px] h-9 text-sm">
                  <SelectValue placeholder="筛选板块" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部板块</SelectItem>
                  {sectors.map(sector => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortConfig.field} onValueChange={(value) => setSortConfig({ ...sortConfig, field: value as any })}>
                <SelectTrigger className="w-[150px] h-9 text-sm">
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="changePercent">涨跌幅</SelectItem>
                  <SelectItem value="price">股价</SelectItem>
                  <SelectItem value="volume">成交量</SelectItem>
                  <SelectItem value="turnoverRate">换手率</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortConfig({ ...sortConfig, order: sortConfig.order === "asc" ? "desc" : "asc" })}
                className="h-9"
              >
                {sortConfig.order === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              </Button>
            </div>
            <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary bg-primary/5">
              共 {filteredStocks.length} 只
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Stock Cards Grid */}
      {filteredStocks.length === 0 ? (
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardContent className="p-12 text-center">
            <Zap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">暂无符合条件的涨停股票</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStocks.map((stock) => {
            const aiAnalysis = getAIAnalysis(stock.code);
            const inWatchlist = isInWatchlist(stock.code);
            const isExpanded = expandedCard === stock.code;

            return (
              <Card
                key={stock.code}
                className={cn(
                  "bg-card/40 backdrop-blur-md border-border/50 hover:border-primary/50 transition-all cursor-pointer group overflow-hidden",
                  isExpanded && "lg:col-span-2"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors truncate">
                          {stock.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {stock.code}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{stock.sector}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToWatchlist(stock);
                      }}
                      className="transition-colors flex-shrink-0"
                    >
                      <Heart
                        className={cn(
                          "w-5 h-5",
                          inWatchlist ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"
                        )}
                      />
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price and Change */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">现价</p>
                      <p className="text-2xl font-bold">{stock.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">涨跌幅</p>
                      <div className="flex items-center gap-1">
                        <Badge className={cn(
                          "font-mono font-bold border-0 text-base",
                          stock.changePercent >= 0
                            ? "bg-[var(--chart-1)]/10 text-[var(--chart-1)]"
                            : "bg-[var(--chart-2)]/10 text-[var(--chart-2)]"
                        )}>
                          {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="bg-muted/20 rounded-lg p-3 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-primary" />
                      涨停原因
                    </p>
                    <p className="text-sm text-foreground line-clamp-2">{stock.reason}</p>
                  </div>

                  {/* Key Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted/10 rounded p-2">
                      <p className="text-xs text-muted-foreground">封板时间</p>
                      <p className="text-sm font-mono font-bold text-foreground">{stock.limitUpTime || "-"}</p>
                    </div>
                    <div className="bg-muted/10 rounded p-2">
                      <p className="text-xs text-muted-foreground">换手率</p>
                      <p className="text-sm font-mono font-bold text-foreground">{stock.turnoverRate?.toFixed(2) || "-"}%</p>
                    </div>
                    <div className="bg-muted/10 rounded p-2">
                      <p className="text-xs text-muted-foreground">成交量</p>
                      <p className="text-sm font-mono font-bold text-foreground">{(stock.volume / 1000000).toFixed(1)}M</p>
                    </div>
                  </div>

                  {/* AI Analysis Button and Details */}
                  <div className="flex gap-2">
                    {aiAnalysis && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedCard(isExpanded ? null : stock.code);
                            }}
                            className={cn(
                              "flex-1",
                              aiAnalysis.prediction === "UP"
                                ? "border-[var(--chart-1)]/50 text-[var(--chart-1)] hover:bg-[var(--chart-1)]/10"
                                : aiAnalysis.prediction === "DOWN"
                                  ? "border-[var(--chart-2)]/50 text-[var(--chart-2)] hover:bg-[var(--chart-2)]/10"
                                  : ""
                            )}
                          >
                            <Brain className="w-4 h-4 mr-1" />
                            AI分析
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs space-y-1">
                            <p>预测: {aiAnalysis.prediction === "UP" ? "看涨" : aiAnalysis.prediction === "DOWN" ? "看跌" : "中性"}</p>
                            <p>置信度: {aiAnalysis.confidence}%</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/stock/${stock.code}`);
                      }}
                    >
                      查看详情
                    </Button>
                  </div>

                  {/* AI Analysis Details */}
                  {isExpanded && aiAnalysis && (
                    <div className="border-t border-border/50 pt-4 space-y-3 mt-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-bold text-primary mb-2 flex items-center gap-1">
                            <Brain className="w-3 h-3" />
                            AI预测
                          </p>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">方向:</span>
                              <Badge className={cn(
                                "text-xs",
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
                              <span className="text-muted-foreground">风险:</span>
                              <Badge variant="outline" className={cn(
                                "text-xs",
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
                        <div>
                          <p className="text-xs font-bold text-primary mb-2">关键因素</p>
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            {aiAnalysis.keyFactors.slice(0, 3).map((factor, idx) => (
                              <li key={idx} className="flex gap-1">
                                <span className="text-primary flex-shrink-0">•</span>
                                <span className="line-clamp-1">{factor}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                        <p className="text-xs text-foreground">
                          <span className="font-bold text-primary">次日展望:</span> {aiAnalysis.nextDayOutlook}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
