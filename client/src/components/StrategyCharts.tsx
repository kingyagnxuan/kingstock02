import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvestmentStrategy } from "@/lib/strategyTypes";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface StrategyChartsProps {
  strategy: InvestmentStrategy;
}

export default function StrategyCharts({ strategy }: StrategyChartsProps) {
  if (!strategy.performance) {
    return null;
  }

  // 模拟收益曲线数据
  const equityCurveData = [
    { date: "1月", value: 100 },
    { date: "2月", value: 108 },
    { date: "3月", value: 115 },
    { date: "4月", value: 112 },
    { date: "5月", value: 125 },
    { date: "6月", value: 128 },
    { date: "7月", value: 135 },
    { date: "8月", value: 142 }
  ];

  // 交易收益分布
  const tradeDistribution = [
    { range: "0-5%", count: strategy.performance.winTrades * 0.4 },
    { range: "5-10%", count: strategy.performance.winTrades * 0.35 },
    { range: "10-15%", count: strategy.performance.winTrades * 0.15 },
    { range: "15%+", count: strategy.performance.winTrades * 0.1 }
  ];

  // 月度收益率
  const monthlyReturns = [
    { month: "1月", return: 8 },
    { month: "2月", return: 7 },
    { month: "3月", return: 6.5 },
    { month: "4月", return: -3 },
    { month: "5月", return: 11.6 },
    { month: "6月", return: 2.4 },
    { month: "7月", return: 5.5 },
    { month: "8月", return: 5.2 }
  ];

  // 胜负比例
  const winLossData = [
    { name: "获胜", value: strategy.performance.winTrades, fill: "#10b981" },
    { name: "亏损", value: strategy.performance.lossTrades, fill: "#ef4444" }
  ];

  return (
    <div className="space-y-6">
      {/* Equity Curve */}
      <Card className="bg-card/40 backdrop-blur-md border-border/50">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-lg font-bold">收益曲线</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={equityCurveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px"
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
                activeDot={{ r: 6 }}
                name="账户价值"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Returns */}
      <Card className="bg-card/40 backdrop-blur-md border-border/50">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-lg font-bold">月度收益率</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyReturns}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px"
                }}
              />
              <Bar
                dataKey="return"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                name="收益率 (%)"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Win/Loss Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-lg font-bold">胜负比例</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={winLossData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name} ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {winLossData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-lg font-bold">收益分布</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tradeDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                <YAxis dataKey="range" type="category" stroke="rgba(255,255,255,0.5)" width={60} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="count" fill="#a855f7" radius={[0, 8, 8, 0]} name="交易数" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="bg-card/40 backdrop-blur-md border-border/50">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-lg font-bold">详细指标</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">平均利润</p>
              <p className="text-xl font-bold text-green-500">+{strategy.performance.avgProfit.toFixed(2)}%</p>
            </div>
            <div className="p-4 rounded bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">平均亏损</p>
              <p className="text-xl font-bold text-red-500">{strategy.performance.avgLoss.toFixed(2)}%</p>
            </div>
            <div className="p-4 rounded bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">最佳交易</p>
              <p className="text-xl font-bold text-green-500">+{strategy.performance.bestTrade.toFixed(2)}%</p>
            </div>
            <div className="p-4 rounded bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">最差交易</p>
              <p className="text-xl font-bold text-red-500">{strategy.performance.worstTrade.toFixed(2)}%</p>
            </div>
            <div className="p-4 rounded bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">最大回撤</p>
              <p className="text-xl font-bold text-orange-500">{strategy.performance.maxDrawdown.toFixed(2)}%</p>
            </div>
            <div className="p-4 rounded bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">夏普比率</p>
              <p className="text-xl font-bold text-purple-500">{strategy.performance.sharpeRatio.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">利润因子</p>
              <p className="text-xl font-bold text-blue-500">
                {(Math.abs(strategy.performance.avgProfit * strategy.performance.winTrades) / Math.abs(strategy.performance.avgLoss * strategy.performance.lossTrades)).toFixed(2)}
              </p>
            </div>
            <div className="p-4 rounded bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">期望值</p>
              <p className="text-xl font-bold text-green-500">
                +{((strategy.performance.avgProfit * strategy.performance.winRate / 100) + (strategy.performance.avgLoss * (100 - strategy.performance.winRate) / 100)).toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
