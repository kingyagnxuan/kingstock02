import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, TrendingUp, TrendingDown, BarChart3, PieChart, Newspaper, Loader2 } from "lucide-react";
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
import { getStockQuote, getKLineData as getRealKLineData, getCachedData, setCachedData } from "@/lib/publicStockAPI";
import type { KLinePeriod } from "@/lib/stockDetailTypes";

export default function StockDetail() {
  const [location] = useLocation();
  const code = new URLSearchParams(location).get("code") || "000001";
  const [klinePeriod, setKlinePeriod] = useState<KLinePeriod>("1d");
  const [loading, setLoading] = useState(false);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [realKlineData, setRealKlineData] = useState<any[]>([]);
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const isInWatchlist = watchlist.some(w => w.code === code);

  // 加载真实行情数据
  useEffect(() => {
    loadRealTimeData();
    const interval = setInterval(loadRealTimeData, 60000); // 每分钟更新一次
    return () => clearInterval(interval);
  }, [code]);

  // 加载K线数据
  useEffect(() => {
    loadKlineData();
  }, [code, klinePeriod]);

  const loadRealTimeData = async () => {
    try {
      const quote = await getStockQuote(code);
      if (quote) {
        setRealTimeData(quote);
      }
    } catch (error) {
      console.error("加载实时行情失败:", error);
    }
  };

  const loadKlineData = async () => {
    setLoading(true);
    try {
      const cacheKey = `kline_${code}_${klinePeriod}`;
      const cached = getCachedData(cacheKey);
      
      if (cached) {
        setRealKlineData(cached);
        setLoading(false);
        return;
      }

      const period = klinePeriod === "5m" ? "1d" : klinePeriod === "15m" ? "1d" : klinePeriod === "30m" ? "1d" : klinePeriod === "1h" ? "1d" : (klinePeriod as "1d" | "1w" | "1m");
      const chartData = await getRealKLineData(code, period, 60);
      
      if (chartData && chartData.data.length > 0) {
        setRealKlineData(chartData.data);
        setCachedData(cacheKey, chartData.data);
      } else {
        // 使用模拟数据
        const mockData = getKLineData(code, klinePeriod);
        setRealKlineData(mockData.data);
      }
    } catch (error) {
      console.error("加载K线数据失败:", error);
      const mockData = getKLineData(code, klinePeriod);
      setRealKlineData(mockData.data);
    } finally {
      setLoading(false);
    }
  };

  // 使用真实数据或模拟数据
  const detail = realTimeData ? {
    ...getMockStockDetail(code),
    name: realTimeData.name,
    price: realTimeData.price,
    change: realTimeData.change,
    changePercent: realTimeData.changePercent,
    open: realTimeData.open,
    high: realTimeData.high,
    low: realTimeData.low,
    volume: realTimeData.volume
  } : getMockStockDetail(code);

  const cashFlow = getMockCashFlow(code);
  const fundFlow = getMockFundFlow(code);
  const technicalIndicators = getMockTechnicalIndicators(code);
  const news = getMockStockNews(code);
  const analysis = getMockStockAnalysis(code);
  const klineData = realKlineData.length > 0 ? realKlineData : getKLineData(code, klinePeriod).data;

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
    return labels[rating] || "未评级";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 股票头部信息 */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{detail.name}</h1>
              <p className="text-muted-foreground">{code}</p>
            </div>
            <Button
              variant={isInWatchlist ? "default" : "outline"}
              onClick={handleAddToWatchlist}
              className="gap-2"
            >
              <Heart className="w-4 h-4" fill={isInWatchlist ? "currentColor" : "none"} />
              {isInWatchlist ? "已收藏" : "收藏"}
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">现价</p>
                <p className="text-2xl font-bold">{detail.price.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">涨跌</p>
                <p className={`text-2xl font-bold flex items-center gap-1 ${detail.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {detail.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {detail.change.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">涨幅</p>
                <p className={`text-2xl font-bold ${detail.changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {detail.changePercent.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">成交量</p>
                <p className="text-2xl font-bold">{(detail.volume / 1000000).toFixed(1)}M</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 选项卡 */}
        <Tabs defaultValue="kline" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="kline">K线</TabsTrigger>
            <TabsTrigger value="cashflow">资金流向</TabsTrigger>
            <TabsTrigger value="technical">技术指标</TabsTrigger>
            <TabsTrigger value="news">新闻</TabsTrigger>
            <TabsTrigger value="analysis">分析</TabsTrigger>
          </TabsList>

          {/* K线图表 */}
          <TabsContent value="kline" className="space-y-4">
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle>K线图</CardTitle>
                  <div className="flex gap-2">
                    {["1d", "1w", "1m", "3m", "6m", "1y"].map((period) => (
                      <Button
                        key={period}
                        variant={klinePeriod === period ? "default" : "outline"}
                        size="sm"
                        onClick={() => setKlinePeriod(period as KLinePeriod)}
                        disabled={loading}
                      >
                        {period}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={klineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.8)",
                          border: "1px solid rgba(255,255,255,0.1)"
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="close" stroke="#3b82f6" name="收盘价" />
                      <Line type="monotone" dataKey="open" stroke="#10b981" name="开盘价" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* 成交量 */}
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle>成交量</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={klineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.1)"
                      }}
                    />
                    <Bar dataKey="volume" fill="#8b5cf6" name="成交量" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 资金流向 */}
          <TabsContent value="cashflow" className="space-y-4">
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  资金流向分布
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChartComponent>
                    <Pie
                      data={fundFlowData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value.toFixed(0)}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {fundFlowData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChartComponent>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 资金流向详情 */}
            <div className="grid grid-cols-2 gap-4">
              {cashFlow.map((flow: any, index: number) => (
                <Card key={index} className="bg-card/40 backdrop-blur-md border-border/50">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{flow.date}</p>
                    <p className="text-lg font-bold mt-2">{(flow.netInflow || flow.netFlow || 0).toFixed(2)}万</p>
                    <p className={`text-sm ${(flow.netInflow || flow.netFlow || 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {(flow.netInflow || flow.netFlow || 0) >= 0 ? "净流入" : "净流出"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 技术指标 */}
          <TabsContent value="technical" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {Array.isArray(technicalIndicators) ? technicalIndicators.map((indicator: any, index: number) => (
                <Card key={index} className="bg-card/40 backdrop-blur-md border-border/50">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{indicator.name}</p>
                    <p className="text-2xl font-bold mt-2">{indicator.value.toFixed(2)}</p>
                    <p className={`text-sm mt-2 ${indicator.signal === "buy" ? "text-green-500" : indicator.signal === "sell" ? "text-red-500" : "text-yellow-500"}`}>
                      {indicator.signal === "buy" ? "买入信号" : indicator.signal === "sell" ? "卖出信号" : "中性"}
                    </p>
                  </CardContent>
                </Card>
              )) : null}
            </div>
          </TabsContent>

          {/* 新闻 */}
          <TabsContent value="news" className="space-y-4">
            {news.map((item: any, index: number) => (
              <Card key={index} className="bg-card/40 backdrop-blur-md border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Newspaper className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{item.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">{item.publishTime || "未知时间"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* 分析 */}
          <TabsContent value="analysis" className="space-y-4">
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle>分析观点</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">评级: {getRatingLabel(analysis.rating)}</p>
                    <p className="text-sm text-muted-foreground mt-2">{(analysis as any).opinion || "暂无分析意见"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
