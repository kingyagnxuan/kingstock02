import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStrategy } from "@/contexts/StrategyContext";
import { InvestmentStrategy } from "@/lib/strategyTypes";
import { TrendingUp, TrendingDown, Eye, Trash2, Edit2 } from "lucide-react";
import { useState } from "react";

interface StrategyListProps {
  onSelectStrategy?: (strategy: InvestmentStrategy) => void;
}

export default function StrategyList({ onSelectStrategy }: StrategyListProps) {
  const { strategies, deleteStrategy } = useStrategy();
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);

  const handleToggleSelect = (strategyId: string) => {
    setSelectedStrategies(prev =>
      prev.includes(strategyId)
        ? prev.filter(id => id !== strategyId)
        : [...prev, strategyId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-500 border-green-500/20";
      case "testing":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/20";
      case "inactive":
        return "bg-gray-500/20 text-gray-500 border-gray-500/20";
      default:
        return "bg-blue-500/20 text-blue-500 border-blue-500/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "活跃";
      case "testing":
        return "测试中";
      case "inactive":
        return "已停用";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      {strategies.length === 0 ? (
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">还没有创建任何策略，立即创建您的第一个投资策略吧！</p>
          </CardContent>
        </Card>
      ) : (
        strategies.map(strategy => (
          <Card
            key={strategy.id}
            className={`bg-card/40 backdrop-blur-md border-border/50 cursor-pointer transition-all ${
              selectedStrategies.includes(strategy.id)
                ? "border-primary ring-1 ring-primary"
                : "hover:border-border"
            }`}
            onClick={() => handleToggleSelect(strategy.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{strategy.name}</h3>
                    <Badge className={getStatusColor(strategy.status)}>
                      {getStatusLabel(strategy.status)}
                    </Badge>
                  </div>
                  {strategy.description && (
                    <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
                  )}
                  {strategy.tags && strategy.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {strategy.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectStrategy?.(strategy);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteStrategy(strategy.id);
                    }}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {strategy.performance && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">总收益</p>
                    <p className={`text-lg font-bold ${strategy.performance.totalReturn >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {strategy.performance.totalReturn >= 0 ? "+" : ""}{strategy.performance.totalReturn.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">胜率</p>
                    <p className="text-lg font-bold text-blue-500">{strategy.performance.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">交易次数</p>
                    <p className="text-lg font-bold">{strategy.performance.tradesCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">夏普比率</p>
                    <p className="text-lg font-bold text-purple-500">{strategy.performance.sharpeRatio.toFixed(2)}</p>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                <span>创建于 {strategy.createdAt.toLocaleDateString()}</span>
                <span>{strategy.factors.length} 个因子</span>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {selectedStrategies.length > 1 && (
        <div className="sticky bottom-4 bg-card/40 backdrop-blur-md border border-border/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-3">
            已选择 {selectedStrategies.length} 个策略
          </p>
          <Button className="w-full">
            对比选中的策略
          </Button>
        </div>
      )}
    </div>
  );
}
