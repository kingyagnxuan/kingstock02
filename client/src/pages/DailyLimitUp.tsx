import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, AlertTriangle, Zap, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function DailyLimitUp() {
  const [, setLocation] = useLocation();
  const [sortBy, setSortBy] = useState<"probability" | "volume" | "moneyFlow">(
    "probability"
  );
  const [limit, setLimit] = useState(20);

  // 获取当日涨停潜力股
  const { data: potentials, isLoading } = trpc.limitUp.getDailyPotentials.useQuery({
    limit,
    minProbability: 40,
  });

  // 排序数据
  const sortedPotentials = useMemo(() => {
    if (!potentials) return [];

    const sorted = [...potentials];
    switch (sortBy) {
      case "probability":
        return sorted.sort(
          (a, b) =>
            parseFloat(b.limitUpProbability || "0") -
            parseFloat(a.limitUpProbability || "0")
        );
      case "volume":
        return sorted.sort(
          (a, b) => parseFloat(b.volume || "0") - parseFloat(a.volume || "0")
        );
      case "moneyFlow":
        return sorted.sort(
          (a, b) =>
            parseFloat(b.netMoneyFlow || "0") -
            parseFloat(a.netMoneyFlow || "0")
        );
      default:
        return sorted;
    }
  }, [potentials, sortBy]);

  const handleStockClick = (stockCode: string) => {
    setLocation(`/stock/${stockCode}`);
  };

  return (
    <div className="space-y-6">
      {/* 返回按钮和页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="mr-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Zap className="w-8 h-8 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold">当日涨停潜力</h1>
            <p className="text-muted-foreground mt-1">
              实时监控今日涨停潜力股，把握交易机会
            </p>
          </div>
        </div>
      </div>

      {/* 控制面板 */}
      <Card className="bg-card/40 border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">排序方式</label>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="probability">涨停概率（从高到低）</SelectItem>
                  <SelectItem value="volume">成交量（从高到低）</SelectItem>
                  <SelectItem value="moneyFlow">资金流入（从高到低）</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">显示数量</label>
              <Select value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10只</SelectItem>
                  <SelectItem value="20">20只</SelectItem>
                  <SelectItem value="50">50只</SelectItem>
                  <SelectItem value="100">100只</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计信息 */}
      {sortedPotentials.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-card/60 to-card/30 border-border/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">总数量</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {sortedPotentials.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card/60 to-card/30 border-border/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">平均涨停概率</p>
                <p className="text-3xl font-bold text-green-500 mt-2">
                  {(
                    sortedPotentials.reduce(
                      (sum, s) => sum + parseFloat(s.limitUpProbability || "0"),
                      0
                    ) / sortedPotentials.length
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card/60 to-card/30 border-border/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">超高概率（≥80%）</p>
                <p className="text-3xl font-bold text-red-500 mt-2">
                  {sortedPotentials.filter(
                    (s) => parseFloat(s.limitUpProbability || "0") >= 80
                  ).length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card/60 to-card/30 border-border/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">高概率（60-80%）</p>
                <p className="text-3xl font-bold text-yellow-500 mt-2">
                  {
                    sortedPotentials.filter(
                      (s) =>
                        parseFloat(s.limitUpProbability || "0") >= 60 &&
                        parseFloat(s.limitUpProbability || "0") < 80
                    ).length
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 股票列表 */}
      <Card className="bg-card/40 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            涨停潜力股列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">加载中...</div>
            </div>
          ) : sortedPotentials.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">暂无数据</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      代码
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      名称
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                      现价
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                      涨幅
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                      涨停概率
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                      成交量
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                      资金流入
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPotentials.map((stock, index) => {
                    const probability = parseFloat(stock.limitUpProbability || "0");
                    const priceChange = parseFloat(stock.priceChangePercent || "0");

                    return (
                      <tr
                        key={stock.stockCode}
                        className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono text-primary font-medium">
                            {stock.stockCode}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{stock.stockName}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          {stock.currentPrice}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`font-mono font-medium ${
                              priceChange > 0
                                ? "text-red-500"
                                : priceChange < 0
                                  ? "text-green-500"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {priceChange > 0 ? "+" : ""}
                            {stock.priceChangePercent}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  probability >= 80
                                    ? "bg-red-500"
                                    : probability >= 60
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                }`}
                                style={{ width: `${probability}%` }}
                              />
                            </div>
                            <span className="font-mono font-medium w-12 text-right">
                              {probability.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-sm">
                          {stock.volume}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`font-mono font-medium ${
                              parseFloat(stock.netMoneyFlow || "0") > 0
                                ? "text-red-500"
                                : "text-green-500"
                            }`}
                          >
                            {stock.netMoneyFlow}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStockClick(stock.stockCode)}
                            className="text-primary hover:text-primary hover:bg-primary/10"
                          >
                            查看详情
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分析说明 */}
      <Card className="bg-card/40 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            分析说明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">涨停概率评分：</strong>
            基于成交量、资金流向、价格动量、市场情绪、行业热度等多个因素综合计算。
          </p>
          <p>
            <strong className="text-foreground">更新频率：</strong>
            交易时间内每5分钟更新一次（9:30-15:00）。
          </p>
          <p>
            <strong className="text-foreground">风险提示：</strong>
            涨停概率仅供参考，不构成投资建议。股市有风险，投资需谨慎。
          </p>
          <p>
            <strong className="text-foreground">数据来源：</strong>
            实时行情数据、技术指标、资金流向等多个数据源。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
