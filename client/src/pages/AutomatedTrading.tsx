import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { automatedTradingEngine } from "@/lib/automatedTrading";
import { useStrategy } from "@/contexts/StrategyContext";
import { useState } from "react";
import { AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown, Zap, AlertTriangle } from "lucide-react";

export default function AutomatedTrading() {
  const { strategies } = useStrategy();
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"signals" | "orders" | "portfolio" | "alerts">("signals");

  const strategy = selectedStrategy ? strategies.find(s => s.id === selectedStrategy) : null;
  const signals = selectedStrategy ? automatedTradingEngine.getPendingSignals(selectedStrategy) : [];
  const portfolio = selectedStrategy ? automatedTradingEngine.getPortfolioStatus(selectedStrategy) : null;
  const alerts = selectedStrategy ? automatedTradingEngine.getRiskAlerts(selectedStrategy) : [];
  const tradeHistory = selectedStrategy ? automatedTradingEngine.getTradeHistory(selectedStrategy) : [];

  const handleExecuteSignal = (signalId: string) => {
    automatedTradingEngine.executeSignal(signalId);
  };

  const handleExecuteAll = () => {
    signals.forEach(signal => automatedTradingEngine.executeSignal(signal.id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold tracking-tight">自动化交易执行</h1>
          </div>
          <p className="text-muted-foreground">
            自动生成交易信号，执行策略，实时监控投资组合和风险预警
          </p>
        </section>

        {/* Strategy Selection */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-lg font-bold">选择策略</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-2 flex-wrap">
              {strategies.map(s => (
                <Button
                  key={s.id}
                  variant={selectedStrategy === s.id ? "default" : "outline"}
                  onClick={() => setSelectedStrategy(s.id)}
                >
                  {s.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedStrategy && strategy ? (
          <>
            {/* Portfolio Overview */}
            {portfolio && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-card/40 backdrop-blur-md border-border/50">
                  <CardContent className="p-6">
                    <p className="text-xs text-muted-foreground mb-1">总资产</p>
                    <p className="text-2xl font-bold">¥{(portfolio.totalValue / 10000).toFixed(1)}万</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      成本：¥{(portfolio.totalCost / 10000).toFixed(1)}万
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-md border-border/50">
                  <CardContent className="p-6">
                    <p className="text-xs text-muted-foreground mb-1">总收益</p>
                    <p className={`text-2xl font-bold ${portfolio.totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                      ¥{portfolio.totalProfit.toFixed(0)}
                    </p>
                    <p className={`text-xs mt-2 ${portfolio.profitRate >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {portfolio.profitRate >= 0 ? "+" : ""}{portfolio.profitRate.toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-md border-border/50">
                  <CardContent className="p-6">
                    <p className="text-xs text-muted-foreground mb-1">当前回撤</p>
                    <p className={`text-2xl font-bold ${portfolio.currentDrawdown >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {portfolio.currentDrawdown.toFixed(2)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      最大：{portfolio.maxDrawdown.toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-md border-border/50">
                  <CardContent className="p-6">
                    <p className="text-xs text-muted-foreground mb-1">持仓数量</p>
                    <p className="text-2xl font-bold">{portfolio.positions.length}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      更新于 {portfolio.lastUpdated.toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border/50">
              {(["signals", "orders", "portfolio", "alerts"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "signals" && `交易信号 (${signals.length})`}
                  {tab === "orders" && `交易订单 (${tradeHistory.length})`}
                  {tab === "portfolio" && `投资组合 (${portfolio?.positions.length || 0})`}
                  {tab === "alerts" && `风险预警 (${alerts.length})`}
                </button>
              ))}
            </div>

            {/* Signals Tab */}
            {activeTab === "signals" && (
              <div className="space-y-4">
                {signals.length > 0 && (
                  <Button onClick={handleExecuteAll} className="w-full gap-2">
                    <Zap className="w-4 h-4" />
                    执行所有信号 ({signals.length})
                  </Button>
                )}

                {signals.length === 0 ? (
                  <Card className="bg-card/40 backdrop-blur-md border-border/50">
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">暂无待执行的交易信号</p>
                    </CardContent>
                  </Card>
                ) : (
                  signals.map(signal => (
                    <Card key={signal.id} className="bg-card/40 backdrop-blur-md border-border/50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {signal.action === "buy" ? (
                              <TrendingUp className="w-6 h-6 text-green-500" />
                            ) : (
                              <TrendingDown className="w-6 h-6 text-red-500" />
                            )}
                            <div>
                              <p className="font-bold">{signal.name} ({signal.code})</p>
                              <p className="text-sm text-muted-foreground">{signal.reason}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">¥{signal.price.toFixed(2)}</p>
                            <Badge className={signal.action === "buy" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}>
                              {signal.action === "buy" ? "买入" : "卖出"}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">数量</p>
                            <p className="font-bold">{signal.quantity} 股</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">预计金额</p>
                            <p className="font-bold">¥{(signal.price * signal.quantity).toFixed(0)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">置信度</p>
                            <p className="font-bold text-blue-500">{signal.confidence}%</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleExecuteSignal(signal.id)}
                            className="flex-1 gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            执行
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => automatedTradingEngine.cancelSignal(signal.id)}
                          >
                            取消
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                {tradeHistory.length === 0 ? (
                  <Card className="bg-card/40 backdrop-blur-md border-border/50">
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">暂无交易记录</p>
                    </CardContent>
                  </Card>
                ) : (
                  tradeHistory.map(order => (
                    <Card key={order.id} className="bg-card/40 backdrop-blur-md border-border/50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {order.action === "buy" ? (
                              <TrendingUp className="w-5 h-5 text-green-500" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-red-500" />
                            )}
                            <div>
                              <p className="font-bold">{order.name}</p>
                              <p className="text-xs text-muted-foreground">{order.timestamp.toLocaleString()}</p>
                            </div>
                          </div>
                          <Badge className={
                            order.status === "filled" ? "bg-green-500/20 text-green-500" :
                            order.status === "partial" ? "bg-yellow-500/20 text-yellow-500" :
                            "bg-gray-500/20 text-gray-500"
                          }>
                            {order.status === "filled" && "已成交"}
                            {order.status === "partial" && "部分成交"}
                            {order.status === "cancelled" && "已取消"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">成交价</p>
                            <p className="font-bold">¥{order.executedPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">成交量</p>
                            <p className="font-bold">{order.executedQuantity}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">成交额</p>
                            <p className="font-bold">¥{(order.executedPrice * order.executedQuantity).toFixed(0)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">手续费</p>
                            <p className="font-bold">¥{order.commission.toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Portfolio Tab */}
            {activeTab === "portfolio" && portfolio && (
              <div className="space-y-4">
                {portfolio.positions.length === 0 ? (
                  <Card className="bg-card/40 backdrop-blur-md border-border/50">
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">暂无持仓</p>
                    </CardContent>
                  </Card>
                ) : (
                  portfolio.positions.map(position => (
                    <Card key={position.code} className="bg-card/40 backdrop-blur-md border-border/50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-bold">{position.name}</p>
                            <p className="text-sm text-muted-foreground">{position.code}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">¥{position.currentPrice.toFixed(2)}</p>
                            <p className={`text-sm ${position.profitRate >= 0 ? "text-green-500" : "text-red-500"}`}>
                              {position.profitRate >= 0 ? "+" : ""}{position.profitRate.toFixed(2)}%
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">持仓量</p>
                            <p className="font-bold">{position.quantity}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">成本价</p>
                            <p className="font-bold">¥{position.entryPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">浮动盈亏</p>
                            <p className={`font-bold ${position.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                              ¥{position.profit.toFixed(0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">占比</p>
                            <p className="font-bold">{position.percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Alerts Tab */}
            {activeTab === "alerts" && (
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <Card className="bg-card/40 backdrop-blur-md border-border/50">
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">暂无风险预警</p>
                    </CardContent>
                  </Card>
                ) : (
                  alerts.map(alert => (
                    <Card
                      key={alert.id}
                      className={`backdrop-blur-md border-border/50 ${
                        alert.level === "critical"
                          ? "bg-red-500/10 border-red-500/30"
                          : "bg-yellow-500/10 border-yellow-500/30"
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {alert.level === "critical" ? (
                            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                          ) : (
                            <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                          )}
                          <div className="flex-1">
                            <p className="font-bold mb-1">{alert.message}</p>
                            <p className="text-sm text-muted-foreground">
                              当前值：{alert.currentValue.toFixed(2)} | 预警阈值：{alert.threshold.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {alert.timestamp.toLocaleString()}
                            </p>
                          </div>
                          <Badge className={
                            alert.level === "critical"
                              ? "bg-red-500/20 text-red-500"
                              : "bg-yellow-500/20 text-yellow-500"
                          }>
                            {alert.level === "critical" ? "严重" : "警告"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </>
        ) : (
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">请选择一个策略开始</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
