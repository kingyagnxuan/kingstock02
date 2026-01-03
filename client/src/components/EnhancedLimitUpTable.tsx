import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Stock } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Brain, Heart, TrendingUp, Zap } from "lucide-react";
import React, { useState } from "react";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface EnhancedLimitUpTableProps {
  stocks: Stock[];
}

export default function EnhancedLimitUpTable({ stocks }: EnhancedLimitUpTableProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, getAIAnalysis, sortConfig, setSortConfig, filterConfig, setFilterConfig } = useWatchlist();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

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
    <Card className="bg-card/40 backdrop-blur-md border-border/50 overflow-hidden">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">涨停潜力股追踪</CardTitle>
              <p className="text-sm text-muted-foreground">实时监控市场强势资金流向</p>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary bg-primary/5">
            实时更新
          </Badge>
        </div>

        {/* Filters and Sorting */}
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
            {sortConfig.order === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="w-[50px]">收藏</TableHead>
              <TableHead className="w-[100px]">代码</TableHead>
              <TableHead>名称</TableHead>
              <TableHead className="text-right">现价</TableHead>
              <TableHead className="text-right">涨跌幅</TableHead>
              <TableHead className="text-right">封板时间</TableHead>
              <TableHead>板块</TableHead>
              <TableHead className="w-[80px]">AI分析</TableHead>
              <TableHead className="w-[300px]">涨停原因</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStocks.map((stock) => {
              const aiAnalysis = getAIAnalysis(stock.code);
              const inWatchlist = isInWatchlist(stock.code);

              return (
                <React.Fragment key={stock.code}>
                  <TableRow className="hover:bg-muted/30 border-border/50 group transition-colors">
                    <TableCell>
                      <button
                        onClick={() => handleAddToWatchlist(stock)}
                        className="transition-colors"
                      >
                        <Heart
                          className={cn(
                            "w-4 h-4",
                            inWatchlist ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"
                          )}
                        />
                      </button>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                      {stock.code}
                    </TableCell>
                    <TableCell className="font-medium text-lg">{stock.name}</TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      {stock.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={cn(
                        "font-mono font-bold border-0",
                        stock.changePercent >= 0
                          ? "bg-[var(--chart-1)]/10 text-[var(--chart-1)] hover:bg-[var(--chart-1)]/20"
                          : "bg-[var(--chart-2)]/10 text-[var(--chart-2)] hover:bg-[var(--chart-2)]/20"
                      )}>
                        +{stock.changePercent.toFixed(2)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {stock.limitUpTime || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-secondary/50 hover:bg-secondary/80 transition-colors">
                        {stock.sector}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {aiAnalysis && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setExpandedRow(expandedRow === stock.code ? null : stock.code)}
                              className={cn(
                                "p-1.5 rounded transition-colors",
                                aiAnalysis.prediction === "UP"
                                  ? "bg-[var(--chart-1)]/10 text-[var(--chart-1)] hover:bg-[var(--chart-1)]/20"
                                  : aiAnalysis.prediction === "DOWN"
                                    ? "bg-[var(--chart-2)]/10 text-[var(--chart-2)] hover:bg-[var(--chart-2)]/20"
                                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                              )}
                            >
                              <Brain className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <p>预测: {aiAnalysis.prediction === "UP" ? "上涨" : aiAnalysis.prediction === "DOWN" ? "下跌" : "中性"}</p>
                              <p>置信度: {aiAnalysis.confidence}%</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate" title={stock.reason}>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-primary shrink-0" />
                        {stock.reason}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* AI Analysis Expanded Row */}
                  {expandedRow === stock.code && aiAnalysis && (
                    <TableRow className="bg-muted/20 border-border/50">
                      <TableCell colSpan={9} className="p-6">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                                <Brain className="w-4 h-4 text-primary" />
                                AI预测分析
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">预测方向:</span>
                                  <Badge className={cn(
                                    "font-bold",
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
                            <div>
                              <h4 className="text-sm font-bold mb-2">关键因素</h4>
                              <ul className="space-y-1 text-sm text-muted-foreground">
                                {aiAnalysis.keyFactors.map((factor, idx) => (
                                  <li key={idx} className="flex gap-2">
                                    <span className="text-primary">•</span>
                                    <span>{factor}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                            <p className="text-sm text-foreground">
                              <span className="font-bold text-primary">次日展望:</span> {aiAnalysis.nextDayOutlook}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
