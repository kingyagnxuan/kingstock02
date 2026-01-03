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
import { TrendingUp, AlertTriangle, Moon } from "lucide-react";
import { useLocation } from "wouter";

export default function NextDayLimitUp() {
  const [, setLocation] = useLocation();
  const [sortBy, setSortBy] = useState<"potential" | "fundamentals" | "sentiment">(
    "potential"
  );
  const [limit, setLimit] = useState(20);

  // 获取次日涨停潜力股
  const { data: potentials, isLoading } = trpc.limitUp.getNextDayPotentials.useQuery({
    limit,
    minProbability: 40,
  });

  // 排序数据
  const sortedPotentials = useMemo(() => {
    if (!potentials) return [];

    const sorted = [...potentials];
    switch (sortBy) {
      case "potential":
        return sorted.sort(
          (a, b) =>
            parseFloat(b.nextDayPotential || "0") -
            parseFloat(a.nextDayPotential || "0")
        );
      case "fundamentals":
        return sorted.sort(
          (a, b) =>
            parseFloat(b.fundamentalScore || "0") -
            parseFloat(a.fundamentalScore || "0")
        );
      case "sentiment":
        return sorted.sort(
          (a, b) =>
            parseFloat(b.sentimentScore || "0") -
            parseFloat(a.sentimentScore || "0")
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
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Moon className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">次日涨停潜力</h1>
            <p className="text-muted-foreground mt-1">
              基于日线数据预测次日涨停概率，制定明日交易计划
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
                  <SelectItem value="potential">涨停潜力（从高到低）</SelectItem>
                  <SelectItem value="fundamentals">基本面评分（从高到低）</SelectItem>
                  <SelectItem value="sentiment">情绪评分（从高到低）</SelectItem>
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
                <p className="text-muted-foreground text-sm">平均涨停潜力</p>
                <p className="text-3xl font-bold text-blue-500 mt-2">
                  {(
                    sortedPotentials.reduce(
                      (sum, s) => sum + parseFloat(s.nextDayPotential || "0"),
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
                <p className="text-muted-foreground text-sm">高潜力（≥70%）</p>
                <p className="text-3xl font-bold text-green-500 mt-2">
                  {sortedPotentials.filter(
                    (s) => parseFloat(s.nextDayPotential || "0") >= 70
                  ).length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card/60 to-card/30 border-border/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">平均基本面评分</p>
                <p className="text-3xl font-bold text-yellow-500 mt-2">
                  {(
                    sortedPotentials.reduce(
                      (sum, s) => sum + parseFloat(s.fundamentalScore || "0"),
                      0
                    ) / sortedPotentials.length
                  ).toFixed(1)}
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
            次日涨停潜力股列表
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
                      收盘价
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                      日涨幅
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                      次日潜力
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                      基本面
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                      情绪评分
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      关键因素
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPotentials.map((stock) => {
                    const potential = parseFloat(stock.nextDayPotential || "0");
                    const fundamentals = parseFloat(stock.fundamentalScore || "0");
                    const sentiment = parseFloat(stock.sentimentScore || "0");
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
                          {stock.closingPrice}
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
                                  potential >= 80
                                    ? "bg-red-500"
                                    : potential >= 60
                                      ? "bg-yellow-500"
                                      : "bg-blue-500"
                                }`}
                                style={{ width: `${Math.min(potential, 100)}%` }}
                              />
                            </div>
                            <span className="font-mono font-medium w-12 text-right">
                              {potential.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-12 bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-green-500 transition-all"
                                style={{ width: `${Math.min(fundamentals * 10, 100)}%` }}
                              />
                            </div>
                            <span className="font-mono font-medium w-8 text-right">
                              {fundamentals.toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-12 bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-yellow-500 transition-all"
                                style={{ width: `${Math.min(sentiment * 10, 100)}%` }}
                              />
                            </div>
                            <span className="font-mono font-medium w-8 text-right">
                              {sentiment.toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground truncate">
                          {stock.keyFactors}
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
            <strong className="text-foreground">次日涨停潜力：</strong>
            基于日线技术指标、基本面评分、资金流向、市场情绪等多个因素，预测次日涨停概率。
          </p>
          <p>
            <strong className="text-foreground">基本面评分：</strong>
            综合考虑公司财务状况、行业地位、成长性等因素，满分10分。
          </p>
          <p>
            <strong className="text-foreground">情绪评分：</strong>
            基于市场资讯、投资者情绪、舆情分析等因素，满分10分。
          </p>
          <p>
            <strong className="text-foreground">更新频率：</strong>
            每个交易日收盘后（15:00后）更新一次。
          </p>
          <p>
            <strong className="text-foreground">风险提示：</strong>
            涨停潜力仅供参考，不构成投资建议。股市有风险，投资需谨慎。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
