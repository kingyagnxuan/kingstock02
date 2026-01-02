import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, TrendingUp, TrendingDown, BarChart3, PieChart, Newspaper } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as PieChartComponent, Pie, Cell } from "recharts";
import { useWatchlist } from "@/contexts/WatchlistContext";
import {
  getMockStockDetail,
  getMockCashFlow,
  getMockFundFlow,
  getMockTechnicalIndicators,
  getMockStockNews,
  getMockStockAnalysis,
  getKLineData
} from "@/lib/mockStockDetail";
import type { KLinePeriod } from "@/lib/stockDetailTypes";

export default function StockDetail() {
  const [location] = useLocation();
  const code = new URLSearchParams(location).get("code") || "000001";
  const [klinePeriod, setKlinePeriod] = useState<KLinePeriod>("1d");
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const isInWatchlist = watchlist.some(w => w.code === code);

  const detail = getMockStockDetail(code);
  const cashFlow = getMockCashFlow(code);
  const fundFlow = getMockFundFlow(code);
  const technicalIndicators = getMockTechnicalIndicators(code);
  const news = getMockStockNews(code);
  const analysis = getMockStockAnalysis(code);
  const klineData = getKLineData(code, klinePeriod);

  const handleAddToWatchlist = () => {
    if (!isInWatchlist) {
      addToWatchlist({
        code,
        name: detail.name,
        addedAt: new Date(),
        targetPrice: detail.price * 1.1
      });
    } else {
      removeFromWatchlist(code);
    }
  };

  const fundFlowData = [
    { name: "超大单", value: fundFlow.superLarge, fill: "#ef4444" },
    { name: "大单", value: fundFlow.large, fill: "#f97316" },
    { name: "中单", value: fundFlow.medium, fill: "#eab308" },
    { name: "小单", value: fundFlow.small, fill: "#22c55e" }
  ];

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "strong-buy":
        return "text-green-500";
      case "buy":
        return "text-green-400";
      case "hold":
        return "text-yellow-500";
      case "sell":
        return "text-orange-500";
      case "strong-sell":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getRatingLabel = (rating: string) => {
    const labels: Record<string, string> = {
      "strong-buy": "强烈看好",
      "buy": "看好",
      "hold": "中性",
      "sell": "看空",
      "strong-sell": "强烈看空"
    };
    return labels[rating] || rating;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <section className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{detail.name}</h1>
                <span className="text-2xl text-muted-foreground">{code}</span>
              </div>
              <p className="text-muted-foreground">{detail.industry} | {detail.description}</p>
            </div>
            <Button
              onClick={handleAddToWatchlist}
              variant={isInWatchlist ? "default" : "outline"}
              size="lg"
              className="gap-2"
            >
              <Heart className={`w-5 h-5 ${isInWatchlist ? "fill-current" : ""}`} />
              {isInWatchlist ? "已添加自选" : "添加自选"}
            </Button>
          </div>

          {/* Price Info */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-2">当前价格</p>
                <p className="text-3xl font-bold">¥{detail.price.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card className={`bg-card/40 backdrop-blur-md border-border/50 ${detail.change > 0 ? "border-green-500/30" : "border-red-500/30"}`}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-2">涨跌</p>
                <div className="flex items-center gap-2">
                  {detail.change > 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                  <p className={`text-2xl font-bold ${detail.change > 0 ? "text-green-500" : "text-red-500"}`}>
                    {detail.change > 0 ? "+" : ""}{detail.change.toFixed(2)}
                  </p>
                  <p className={`text-lg ${detail.change > 0 ? "text-green-500" : "text-red-500"}`}>
                    {detail.changePercent > 0 ? "+" : ""}{detail.changePercent.toFixed(2)}%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-2">市盈率(PE)</p>
                <p className="text-2xl font-bold">{detail.pe.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-2">市净率(PB)</p>
                <p className="text-2xl font-bold">{detail.pb}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tabs */}
        <Tabs defaultValue="kline" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-card/40 backdrop-blur-md border border-border/50">
            <TabsTrigger value="kline">K线图</TabsTrigger>
            <TabsTrigger value="cashflow">资金流向</TabsTrigger>
            <TabsTrigger value="technical">技术指标</TabsTrigger>
            <TabsTrigger value="analysis">分析评级</TabsTrigger>
            <TabsTrigger value="news">相关资讯</TabsTrigger>
          </TabsList>

          {/* K Line */}
          <TabsContent value="kline" className="space-y-4">
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">K线图</CardTitle>
                  <div className="flex gap-2">
                    {["1m", "5m", "15m", "30m", "1h", "1d", "1w", "1M"].map(period => (
                      <Button
                        key={period}
                        size="sm"
                        variant={klinePeriod === period ? "default" : "outline"}
                        onClick={() => setKlinePeriod(period as KLinePeriod)}
                      >
                        {period}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={klineData.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />                    <Bar dataKey="volume" fill="#8884d8" name="成交量" />
                    <Line type="monotone" dataKey="open" stroke="#82ca9d" name="开盘价" />
                    <Line type="monotone" dataKey="high" stroke="#ffc658" name="最高价" />
                    <Line type="monotone" dataKey="low" stroke="#ff7c7c" name="最低价" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Volume */}
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg font-bold">成交量</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={klineData.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="volume" fill="#8884d8" name="成交量" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cash Flow */}
          <TabsContent value="cashflow" className="space-y-4">
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  资金流向
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={cashFlow}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="inflow" stroke="#22c55e" name="资金流入" />
                    <Line type="monotone" dataKey="outflow" stroke="#ef4444" name="资金流出" />
                    <Line type="monotone" dataKey="netInflow" stroke="#3b82f6" name="净流入" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Fund Distribution */}
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  资金分布
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChartComponent>
                    <Pie
                      data={fundFlowData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ¥${(value / 100000000).toFixed(2)}亿`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {fundFlowData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `¥${(value / 100000000).toFixed(2)}亿`} />
                  </PieChartComponent>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical Indicators */}
          <TabsContent value="technical" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card/40 backdrop-blur-md border-border/50">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-lg font-bold">移动平均线</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MA5:</span>
                    <span className="font-semibold">{technicalIndicators.ma5.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MA10:</span>
                    <span className="font-semibold">{technicalIndicators.ma10.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MA20:</span>
                    <span className="font-semibold">{technicalIndicators.ma20.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MA60:</span>
                    <span className="font-semibold">{technicalIndicators.ma60.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 backdrop-blur-md border-border/50">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-lg font-bold">其他指标</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RSI:</span>
                    <span className="font-semibold">{technicalIndicators.rsi.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MACD DIF:</span>
                    <span className="font-semibold">{technicalIndicators.macd.dif.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">KDJ K:</span>
                    <span className="font-semibold">{technicalIndicators.kdj.k.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">KDJ D:</span>
                    <span className="font-semibold">{technicalIndicators.kdj.d.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analysis */}
          <TabsContent value="analysis" className="space-y-4">
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg font-bold">分析评级</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                  <span className="text-muted-foreground">综合评级</span>
                  <span className={`text-2xl font-bold ${getRatingColor(analysis.rating)}`}>
                    {getRatingLabel(analysis.rating)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-sm text-muted-foreground mb-2">目标价</p>
                    <p className="text-2xl font-bold">¥{analysis.targetPrice.toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-sm text-muted-foreground mb-2">上涨空间</p>
                    <p className="text-2xl font-bold text-green-500">{analysis.upside}%</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-sm text-muted-foreground mb-2">下跌风险</p>
                    <p className="text-2xl font-bold text-red-500">{analysis.downside}%</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-sm text-muted-foreground mb-2">分析师共识</p>
                  <p className="text-lg font-semibold mb-2">{analysis.consensus}</p>
                  <p className="text-sm text-muted-foreground">{analysis.analystCount}位分析师参与评级</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* News */}
          <TabsContent value="news" className="space-y-4">
            {news.map(item => (
              <Card key={item.id} className="bg-card/40 backdrop-blur-md border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Newspaper className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{item.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.source}</span>
                        <span>{item.timestamp.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
