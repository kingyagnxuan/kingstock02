import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, TrendingUp, TrendingDown, BarChart3, PieChart, Newspaper, Loader2, ArrowLeft } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as PieChartComponent, Pie, Cell } from "recharts";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { getSinaStockInfo } from "@/lib/sinaFinanceAPI";
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
  // 从路由参数或查询参数获取股票代码
  const match = location.match(/\/stock\/([^/?]+)/);
  const code = match ? match[1] : new URLSearchParams(location).get("code") || "000001";
  const [klinePeriod, setKlinePeriod] = useState<KLinePeriod>("1d");
  const [loading, setLoading] = useState(false);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const isInWatchlist = watchlist.some(w => w.code === code);

  // 加载K线数据和实时行情
  useEffect(() => {
    loadKlineData();
  }, [code, klinePeriod]);

  const loadKlineData = async () => {
    setLoading(true);
    try {
      // 尝试从新浪财经获取实时行情
      const sinaCode = code.startsWith("sh") || code.startsWith("sz") ? code : `sh${code}`;
      const realData = await getSinaStockInfo(sinaCode);
      if (realData) {
        setRealTimeData(realData);
        console.log("成功获取新浪财经实时数据:", realData);
      } else {
        console.log("新浪财经API返回空数据，使用模拟数据");
      }
      // 模拟加载延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      setLoading(false);
    } catch (error) {
      console.error("加载实时数据失败，使用模拟数据:", error);
      setLoading(false);
    }
  };

  // 使用实时数据或模拟数据
  let detail = getMockStockDetail(code);
  if (realTimeData) {
    detail = {
      ...detail,
      price: realTimeData.price,
      change: realTimeData.bid,
      changePercent: realTimeData.percent,
      volume: realTimeData.volume,
      amount: realTimeData.amount,
      high: realTimeData.high,
      low: realTimeData.low,
      open: realTimeData.open
    };
  }

  const cashFlow = getMockCashFlow(code);
  const fundFlow = getMockFundFlow(code);
  const technicalIndicators = getMockTechnicalIndicators(code);
  const news = getMockStockNews(code);
  const analysis = getMockStockAnalysis(code);
  const klineData = getKLineData(code, klinePeriod).data;

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
        {/* 返回按钮和股票头部信息 */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{detail.name}</h1>
                <p className="text-muted-foreground">{code}</p>
              </div>
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
              <Card className="bg-card/40 backdrop-blur-md border-border/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">MA5</p>
                  <p className="text-lg font-bold mt-2">{technicalIndicators.ma5.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/40 backdrop-blur-md border-border/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">RSI</p>
                  <p className="text-lg font-bold mt-2">{technicalIndicators.rsi.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/40 backdrop-blur-md border-border/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">MACD</p>
                  <p className="text-lg font-bold mt-2">{technicalIndicators.macd.histogram.toFixed(2)}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 新闻 */}
          <TabsContent value="news" className="space-y-4">
            {news.map((item: any, index: number) => (
              <Card key={index} className="bg-card/40 backdrop-blur-md border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Newspaper className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.summary}</p>
                      <p className="text-xs text-muted-foreground mt-2">{item.date}</p>
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
                <CardTitle>机构评级</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">综合评级</span>
                  <span className={`font-semibold ${getRatingColor(analysis.rating)}`}>
                    {getRatingLabel(analysis.rating)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">分析师数量</span>
                  <span className="font-semibold">{analysis.analystCount}位</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">目标价</span>
                  <span className="font-semibold">{analysis.targetPrice.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle>分析师观点</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm leading-relaxed">{analysis.consensus}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
