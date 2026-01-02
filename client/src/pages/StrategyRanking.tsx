import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { strategySharingManager } from "@/lib/strategySharing";
import { useState } from "react";
import { Heart, Eye, MessageCircle, TrendingUp, Trophy, Flame } from "lucide-react";

export default function StrategyRanking() {
  const [sortBy, setSortBy] = useState<"score" | "return" | "winRate" | "views" | "likes">("score");
  const [filterRisk, setFilterRisk] = useState<"all" | "low" | "medium" | "high">("all");
  const [filterDifficulty, setFilterDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all");

  const rankings = strategySharingManager.getRankings(sortBy);
  const filtered = rankings.filter(r => {
    const riskMatch = filterRisk === "all" || r.strategy.riskLevel === filterRisk;
    const diffMatch = filterDifficulty === "all" || r.strategy.difficulty === filterDifficulty;
    return riskMatch && diffMatch;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-500/20 text-green-500 border-green-500/20";
      case "medium":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/20";
      case "high":
        return "bg-red-500/20 text-red-500 border-red-500/20";
      default:
        return "";
    }
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case "easy":
        return "简单";
      case "medium":
        return "中等";
      case "hard":
        return "困难";
      default:
        return diff;
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "low":
        return "低风险";
      case "medium":
        return "中风险";
      case "high":
        return "高风险";
      default:
        return risk;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold tracking-tight">策略排行榜</h1>
          </div>
          <p className="text-muted-foreground">
            发现社区中表现最好的投资策略，学习优秀投资者的思路
          </p>
        </section>

        {/* Filters */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">排序方式</label>
                <div className="flex gap-2 flex-wrap">
                  {(["score", "return", "winRate", "views", "likes"] as const).map(sort => (
                    <Button
                      key={sort}
                      variant={sortBy === sort ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy(sort)}
                    >
                      {sort === "score" && "综合评分"}
                      {sort === "return" && "收益率"}
                      {sort === "winRate" && "胜率"}
                      {sort === "views" && "浏览量"}
                      {sort === "likes" && "点赞数"}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">风险等级</label>
                <div className="flex gap-2 flex-wrap">
                  {(["all", "low", "medium", "high"] as const).map(risk => (
                    <Button
                      key={risk}
                      variant={filterRisk === risk ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterRisk(risk)}
                    >
                      {risk === "all" && "全部"}
                      {risk === "low" && "低风险"}
                      {risk === "medium" && "中风险"}
                      {risk === "high" && "高风险"}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">难度等级</label>
                <div className="flex gap-2 flex-wrap">
                  {(["all", "easy", "medium", "hard"] as const).map(diff => (
                    <Button
                      key={diff}
                      variant={filterDifficulty === diff ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterDifficulty(diff)}
                    >
                      {diff === "all" && "全部"}
                      {diff === "easy" && "简单"}
                      {diff === "medium" && "中等"}
                      {diff === "hard" && "困难"}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rankings List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">没有找到匹配的策略</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((ranking, index) => (
              <Card
                key={ranking.strategy.id}
                className="bg-card/40 backdrop-blur-md border-border/50 hover:border-border transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                        ranking.rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
                        ranking.rank === 2 ? "bg-gray-400/20 text-gray-400" :
                        ranking.rank === 3 ? "bg-orange-500/20 text-orange-500" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {ranking.rank <= 3 ? <Trophy className="w-6 h-6" /> : ranking.rank}
                      </div>
                    </div>

                    {/* Strategy Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold truncate">{ranking.strategy.name}</h3>
                        <div className="flex gap-2">
                          <Badge className={getRiskColor(ranking.strategy.riskLevel)}>
                            {getRiskLabel(ranking.strategy.riskLevel)}
                          </Badge>
                          <Badge variant="outline">
                            {getDifficultyLabel(ranking.strategy.difficulty)}
                          </Badge>
                        </div>
                      </div>

                      {ranking.strategy.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {ranking.strategy.description}
                        </p>
                      )}

                      {ranking.strategy.tags && ranking.strategy.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-3">
                          {ranking.strategy.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Author Info */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <span>作者：{ranking.strategy.authorName}</span>
                        <span>•</span>
                        <span>分享于 {ranking.strategy.shareDate.toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4 text-right">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">综合评分</p>
                        <p className="text-2xl font-bold text-primary">{ranking.score.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">总收益</p>
                        <p className={`text-lg font-bold ${(ranking.strategy.performance?.totalReturn || 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {(ranking.strategy.performance?.totalReturn || 0) >= 0 ? "+" : ""}{ranking.strategy.performance?.totalReturn.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">胜率</p>
                        <p className="text-lg font-bold text-blue-500">{ranking.strategy.performance?.winRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">夏普比率</p>
                        <p className="text-lg font-bold text-purple-500">{ranking.strategy.performance?.sharpeRatio.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Footer */}
                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{ranking.strategy.views} 浏览</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{ranking.strategy.likes} 点赞</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{ranking.strategy.comments} 评论</span>
                      </div>
                      {ranking.followers && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>{ranking.followers} 关注者</span>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      查看详情
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
