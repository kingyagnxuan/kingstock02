import DashboardLayout from "@/components/DashboardLayout";
import StrategyBuilder from "@/components/StrategyBuilder";
import StrategyList from "@/components/StrategyList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStrategy } from "@/contexts/StrategyContext";
import { InvestmentStrategy, Portfolio } from "@/lib/strategyTypes";
import { Plus, TrendingUp, BarChart3, PieChart } from "lucide-react";
import StrategyCharts from "@/components/StrategyCharts";
import { useState } from "react";

export default function StrategyManagement() {
  const { strategies, portfolios, getPortfoliosByStrategy } = useStrategy();
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<InvestmentStrategy | null>(null);

  const selectedPortfolios = selectedStrategy
    ? getPortfoliosByStrategy(selectedStrategy.id)
    : [];

  const totalStrategyReturn = strategies.reduce((sum, s) => sum + (s.performance?.totalReturn || 0), 0) / Math.max(strategies.length, 1);
  const totalPortfolioValue = portfolios.reduce((sum, p) => sum + p.totalValue, 0);
  const totalPortfolioProfit = portfolios.reduce((sum, p) => sum + p.totalProfit, 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">投资策略管理</h1>
              <p className="text-muted-foreground mt-2">
                创建和管理您的自定义投资策略，追踪组合收益
              </p>
            </div>
            <Button
              onClick={() => setShowBuilder(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              创建新策略
            </Button>
          </div>
        </section>

        {/* Strategy Builder Modal */}
        {showBuilder && (
          <Card className="bg-card/40 backdrop-blur-md border-border/50 ring-1 ring-primary">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-bold">创建新的投资策略</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <StrategyBuilder onClose={() => setShowBuilder(false)} />
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">策略数量</p>
                  <p className="text-2xl font-bold">{strategies.length}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">平均收益</p>
                  <p className={`text-2xl font-bold ${totalStrategyReturn >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {totalStrategyReturn >= 0 ? "+" : ""}{totalStrategyReturn.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">投资组合数</p>
                  <p className="text-2xl font-bold">{portfolios.length}</p>
                </div>
                <PieChart className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">总资产</p>
                  <p className="text-2xl font-bold">¥{(totalPortfolioValue / 10000).toFixed(1)}万</p>
                </div>
                <div className="text-sm text-green-500">
                  +¥{(totalPortfolioProfit / 10000).toFixed(1)}万
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Strategy List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">我的投资策略</h2>
            <StrategyList onSelectStrategy={setSelectedStrategy} />
          </div>

          {/* Strategy Details */}
          <div className="space-y-4">
            {selectedStrategy ? (
              <>
                <Card className="bg-card/40 backdrop-blur-md border-border/50">
                  <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle className="text-lg font-bold">{selectedStrategy.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {selectedStrategy.description && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">策略描述</p>
                        <p className="text-sm">{selectedStrategy.description}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-muted-foreground mb-2">选股因子</p>
                      <div className="space-y-2">
                        {selectedStrategy.factors.map(factor => (
                          <div key={factor.id} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                            <span>{factor.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {factor.value === true ? "✓" : factor.value === false ? "✗" : String(factor.value)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedStrategy.performance && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">历史表现</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span>总收益</span>
                            <span className={selectedStrategy.performance.totalReturn >= 0 ? "text-green-500" : "text-red-500"}>
                              {selectedStrategy.performance.totalReturn >= 0 ? "+" : ""}{selectedStrategy.performance.totalReturn.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>胜率</span>
                            <span>{selectedStrategy.performance.winRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>最大回撤</span>
                            <span className="text-red-500">{selectedStrategy.performance.maxDrawdown.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>夏普比率</span>
                            <span>{selectedStrategy.performance.sharpeRatio.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Strategy Charts */}
                <Card className="bg-card/40 backdrop-blur-md border-border/50">
                  <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle className="text-sm font-bold">策略分析</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <StrategyCharts strategy={selectedStrategy} />
                  </CardContent>
                </Card>

                {/* Related Portfolios */}
                {selectedPortfolios.length > 0 && (
                  <Card className="bg-card/40 backdrop-blur-md border-border/50">
                    <CardHeader className="border-b border-border/50 pb-4">
                      <CardTitle className="text-sm font-bold">关联投资组合</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                      {selectedPortfolios.map(portfolio => (
                        <div key={portfolio.id} className="p-3 rounded border border-border/50 hover:bg-muted/30 transition-colors">
                          <p className="text-sm font-medium mb-1">{portfolio.name}</p>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>¥{(portfolio.totalValue / 10000).toFixed(1)}万</span>
                            <span className={portfolio.totalProfitRate >= 0 ? "text-green-500" : "text-red-500"}>
                              {portfolio.totalProfitRate >= 0 ? "+" : ""}{portfolio.totalProfitRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="bg-card/40 backdrop-blur-md border-border/50">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">选择一个策略查看详情</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Portfolios Section */}
        {portfolios.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">投资组合追踪</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolios.map(portfolio => (
                <Card key={portfolio.id} className="bg-card/40 backdrop-blur-md border-border/50">
                  <CardHeader className="border-b border-border/50 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold">{portfolio.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {portfolio.items.length} 只股票
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">总资产</p>
                        <p className="text-lg font-bold">¥{(portfolio.totalValue / 10000).toFixed(1)}万</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">总收益</p>
                        <p className={`text-lg font-bold ${portfolio.totalProfitRate >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {portfolio.totalProfitRate >= 0 ? "+" : ""}{portfolio.totalProfitRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      更新于 {portfolio.updatedAt.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
