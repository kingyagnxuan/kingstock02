import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface ScoreFactor {
  name: string;
  score: number;
  description: string;
}

interface ScoreFactorsRadarProps {
  stockCode: string;
  stockName: string;
  factors: ScoreFactor[];
  totalScore: number;
}

export default function ScoreFactorsRadar({
  stockCode,
  stockName,
  factors,
  totalScore,
}: ScoreFactorsRadarProps) {
  // 准备雷达图数据
  const radarData = factors.map((factor) => ({
    name: factor.name,
    value: factor.score,
    fullMark: 100,
  }));

  // 准备柱状图数据
  const barData = factors.map((factor) => ({
    name: factor.name,
    score: factor.score,
  }));

  // 获取最高和最低的因子
  const maxFactor = factors.reduce((prev, current) =>
    prev.score > current.score ? prev : current
  );
  const minFactor = factors.reduce((prev, current) =>
    prev.score < current.score ? prev : current
  );

  return (
    <div className="space-y-6">
      {/* 总分卡片 */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">
            {stockName} ({stockCode}) - 综合评分
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-5xl font-bold text-red-500">{totalScore}</div>
              <p className="text-sm text-muted-foreground mt-2">综合涨停潜力评分</p>
            </div>
            <div className="text-right space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">最强因子</p>
                <p className="text-lg font-semibold text-green-500">
                  {maxFactor.name}
                </p>
                <p className="text-sm text-muted-foreground">{maxFactor.score}分</p>
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">最弱因子</p>
                <p className="text-lg font-semibold text-yellow-500">
                  {minFactor.name}
                </p>
                <p className="text-sm text-muted-foreground">{minFactor.score}分</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 雷达图 */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">5因子评分分析</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#475569" />
              <PolarAngleAxis
                dataKey="name"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "#64748b", fontSize: 11 }}
              />
              <Radar
                name="评分"
                dataKey="value"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 柱状图 */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">各因子详细评分</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid stroke="#475569" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Bar
                dataKey="score"
                fill="#ef4444"
                radius={[8, 8, 0, 0]}
                animationDuration={500}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 因子说明 */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">因子说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {factors.map((factor) => (
              <div
                key={factor.name}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20">
                    <span className="text-sm font-bold text-red-500">
                      {factor.score}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">{factor.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {factor.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 评分说明 */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">评分标准</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
              <span className="text-muted-foreground">80-100分</span>
              <span className="font-semibold text-green-500">极强</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
              <span className="text-muted-foreground">60-79分</span>
              <span className="font-semibold text-blue-500">强</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
              <span className="text-muted-foreground">40-59分</span>
              <span className="font-semibold text-yellow-500">中等</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
              <span className="text-muted-foreground">20-39分</span>
              <span className="font-semibold text-orange-500">弱</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
              <span className="text-muted-foreground">0-19分</span>
              <span className="font-semibold text-red-500">极弱</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
