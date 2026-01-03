import { useRoute } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { strategySharingManager } from "@/lib/strategySharing";
import { ArrowLeft, Heart, Eye, MessageCircle, TrendingUp, Trophy, Download } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function StrategyDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/strategy-detail/:id");
  const [isLiked, setIsLiked] = useState(false);

  if (!match) {
    return null;
  }

  const strategyId = params?.id;
  const rankings = strategySharingManager.getRankings("score");
  const ranking = rankings.find(r => r.strategy.id === strategyId);

  if (!ranking) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">策略不存在</p>
            <Button onClick={() => setLocation("/strategy-ranking")}>
              返回排行榜
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const strategy = ranking.strategy;

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/strategy-ranking")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{strategy.name}</h1>
              <div className="flex gap-2">
                <Badge className={getRiskColor(strategy.riskLevel)}>
                  {getRiskLabel(strategy.riskLevel)}
                </Badge>
                <Badge variant="outline">
                  {getDifficultyLabel(strategy.difficulty)}
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground">
              作者：{strategy.authorName} • 分享于 {strategy.shareDate.toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Description & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader>
                <CardTitle>策略描述</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {strategy.description || "暂无描述"}
                </p>
              </CardContent>
            </Card>

            {/* Tags */}
            {strategy.tags && strategy.tags.length > 0 && (
              <Card className="bg-card/40 backdrop-blur-md border-border/50">
                <CardHeader>
                  <CardTitle>标签</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {strategy.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Details */}
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader>
                <CardTitle>性能指标</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">综合评分</p>
                    <p className="text-2xl font-bold text-primary">{ranking.score.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">总收益</p>
                    <p className={`text-lg font-bold ${(strategy.performance?.totalReturn || 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {(strategy.performance?.totalReturn || 0) >= 0 ? "+" : ""}{strategy.performance?.totalReturn.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">胜率</p>
                    <p className="text-lg font-bold text-blue-500">{strategy.performance?.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">夏普比率</p>
                    <p className="text-lg font-bold text-purple-500">{strategy.performance?.sharpeRatio.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategy Details */}
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader>
                <CardTitle>策略详情</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">风险等级</p>
                    <p className="text-sm text-muted-foreground">
                      {getRiskLabel(strategy.riskLevel)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">难度等级</p>
                    <p className="text-sm text-muted-foreground">
                      {getDifficultyLabel(strategy.difficulty)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">最大回撤</p>
                    <p className="text-sm text-muted-foreground">
                      {strategy.performance?.maxDrawdown.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Ranking */}
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  排名
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary mb-2">{ranking.rank}</p>
                  <p className="text-sm text-muted-foreground">在所有策略中</p>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Stats */}
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader>
                <CardTitle>互动数据</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">浏览</span>
                  </div>
                  <span className="font-bold">{strategy.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">点赞</span>
                  </div>
                  <span className="font-bold">{strategy.likes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">评论</span>
                  </div>
                  <span className="font-bold">{strategy.comments}</span>
                </div>
                {ranking.followers && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">关注者</span>
                    </div>
                    <span className="font-bold">{ranking.followers}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={() => setIsLiked(!isLiked)}
                variant={isLiked ? "default" : "outline"}
              >
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                {isLiked ? "已点赞" : "点赞"}
              </Button>
              <Button className="w-full" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                导出策略
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
