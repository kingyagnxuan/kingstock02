import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";

export default function Analytics() {
  const { getAIAccuracy } = useWatchlist();
  const accuracy = getAIAccuracy();

  const accuracyData = [
    {
      name: "看涨预测",
      total: accuracy.upPredictions,
      correct: accuracy.upCorrect,
      incorrect: accuracy.upPredictions - accuracy.upCorrect
    },
    {
      name: "看跌预测",
      total: accuracy.downPredictions,
      correct: accuracy.downCorrect,
      incorrect: accuracy.downPredictions - accuracy.downCorrect
    }
  ];

  const pieData = [
    { name: "正确预测", value: accuracy.correctPredictions, fill: "var(--chart-1)" },
    { name: "错误预测", value: accuracy.totalPredictions - accuracy.correctPredictions, fill: "var(--chart-2)" }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            AI分析准确率
          </h2>
          <p className="text-muted-foreground">
            展示AI预测模型的历史准确率和性能指标
          </p>
        </section>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground mb-2">总预测次数</p>
              <p className="text-3xl font-bold text-primary">{accuracy.totalPredictions}</p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground mb-2">正确预测</p>
              <p className="text-3xl font-bold text-green-500">{accuracy.correctPredictions}</p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground mb-2">错误预测</p>
              <p className="text-3xl font-bold text-red-500">{accuracy.totalPredictions - accuracy.correctPredictions}</p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground mb-2">准确率</p>
              <p className="text-3xl font-bold text-yellow-500">{accuracy.accuracy.toFixed(1)}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Accuracy by Prediction Type */}
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-bold">预测类型准确率</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)"
                    }}
                  />
                  <Legend />
                  <Bar dataKey="correct" fill="var(--chart-1)" name="正确预测" />
                  <Bar dataKey="incorrect" fill="var(--chart-2)" name="错误预测" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Overall Accuracy */}
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-bold">总体准确率分布</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-lg font-bold">详细统计</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Up Predictions */}
              <div className="bg-muted/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <h3 className="font-bold">看涨预测</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">总预测数</span>
                    <span className="font-mono font-bold">{accuracy.upPredictions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">正确数</span>
                    <span className="font-mono font-bold text-green-500">{accuracy.upCorrect}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">错误数</span>
                    <span className="font-mono font-bold text-red-500">{accuracy.upPredictions - accuracy.upCorrect}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border/50">
                    <span className="text-muted-foreground">准确率</span>
                    <Badge className="bg-green-500/20 text-green-500 border-0">
                      {((accuracy.upCorrect / accuracy.upPredictions) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Down Predictions */}
              <div className="bg-muted/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <h3 className="font-bold">看跌预测</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">总预测数</span>
                    <span className="font-mono font-bold">{accuracy.downPredictions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">正确数</span>
                    <span className="font-mono font-bold text-green-500">{accuracy.downCorrect}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">错误数</span>
                    <span className="font-mono font-bold text-red-500">{accuracy.downPredictions - accuracy.downCorrect}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border/50">
                    <span className="text-muted-foreground">准确率</span>
                    <Badge className="bg-green-500/20 text-green-500 border-0">
                      {((accuracy.downCorrect / accuracy.downPredictions) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Last Updated */}
        <div className="text-center text-xs text-muted-foreground">
          最后更新: {accuracy.lastUpdated.toLocaleString()}
        </div>
      </div>
    </DashboardLayout>
  );
}
