import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MarketNews } from "@/lib/communityTypes";
import { mockMarketNews } from "@/lib/mockCommunityData";
import { ArrowLeft, Share2, Bookmark, MessageCircle, TrendingUp, AlertCircle, Newspaper } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { cn } from "@/lib/utils";

export default function NewsDetail() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/news/:id");

  if (!match) {
    return null;
  }

  const newsId = params?.id as string;
  const news = mockMarketNews.find(n => n.id === newsId);

  if (!news) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">资讯不存在</h2>
            <Button onClick={() => setLocation("/community")}>
              返回社区
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "high":
        return "bg-red-500/10 border-red-500/20 text-red-500";
      case "medium":
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-500";
      default:
        return "bg-blue-500/10 border-blue-500/20 text-blue-500";
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case "high":
        return <AlertCircle className="w-4 h-4" />;
      case "medium":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Newspaper className="w-4 h-4" />;
    }
  };

  const getImportanceLabel = (importance: string) => {
    switch (importance) {
      case "high":
        return "重要";
      case "medium":
        return "中等";
      default:
        return "普通";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/community")}
            className="h-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回社区
          </Button>
        </div>

        {/* News Card */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-4">{news.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>来源: {news.source}</span>
                  <span>•</span>
                  <span>{news.publishedAt.toLocaleString()}</span>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn("text-xs flex-shrink-0 h-fit", getImportanceColor(news.importance))}
              >
                <span className="flex items-center gap-1">
                  {getImportanceIcon(news.importance)}
                  {getImportanceLabel(news.importance)}
                </span>
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* News Content */}
            <div className="bg-muted/20 rounded-lg p-6 border border-border/50">
              <p className="text-base leading-relaxed text-foreground mb-6">
                {news.content}
              </p>

              {/* Related Stocks */}
              {news.relatedStocks.length > 0 && (
                <div className="space-y-3 pt-6 border-t border-border/50">
                  <h3 className="font-bold text-sm">相关股票</h3>
                  <div className="flex gap-2 flex-wrap">
                    {news.relatedStocks.map(stock => (
                      <Badge
                        key={stock}
                        variant="secondary"
                        className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                        onClick={() => setLocation(`/stock/${stock}`)}
                      >
                        {stock}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border/50">
              <Button variant="outline" size="sm" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Bookmark className="w-4 h-4 mr-2" />
                收藏
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                讨论
              </Button>
            </div>

            {/* Related News */}
            <div className="space-y-4 pt-6 border-t border-border/50">
              <h3 className="font-bold text-lg">相关资讯</h3>
              <div className="space-y-3">
                {mockMarketNews
                  .filter(
                    n =>
                      n.id !== newsId &&
                      n.relatedStocks.some(stock =>
                        news.relatedStocks.includes(stock)
                      )
                  )
                  .slice(0, 3)
                  .map(relatedNews => (
                    <div
                      key={relatedNews.id}
                      className="p-4 bg-muted/20 rounded-lg border border-border/50 hover:border-primary/30 transition-colors cursor-pointer group"
                      onClick={() => setLocation(`/news/${relatedNews.id}`)}
                    >
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {relatedNews.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {relatedNews.source}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {relatedNews.publishedAt.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
