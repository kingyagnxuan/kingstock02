import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketNews } from "@/lib/communityTypes";
import { Newspaper, TrendingUp, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface MarketNewsAndQuotesProps {
  news: MarketNews[];
}

export default function MarketNewsAndQuotes({ news }: MarketNewsAndQuotesProps) {
  const [, setLocation] = useLocation();
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
    <Card className="bg-card/40 backdrop-blur-md border-border/50">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg font-bold">市场资讯</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-0">
          {news.length === 0 ? (
            <div className="p-6 text-center">
              <Newspaper className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">暂无最新资讯</p>
            </div>
          ) : (
            news.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "p-4 hover:bg-muted/30 transition-colors cursor-pointer border-b border-border/50 last:border-b-0",
                  "group"
                )}
                onClick={() => setLocation(`/news/${item.id}`)}
              >
                <div className="flex gap-3">
                  {/* Importance Indicator */}
                  <div className={cn(
                    "flex-shrink-0 w-1 rounded-full",
                    item.importance === "high" ? "bg-red-500" : item.importance === "medium" ? "bg-yellow-500" : "bg-blue-500"
                  )} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={cn("text-xs flex-shrink-0", getImportanceColor(item.importance))}
                      >
                        <span className="flex items-center gap-1">
                          {getImportanceIcon(item.importance)}
                          {getImportanceLabel(item.importance)}
                        </span>
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {item.content}
                    </p>

                    {/* Related Stocks */}
                    {item.relatedStocks.length > 0 && (
                      <div className="flex gap-1 flex-wrap mb-2">
                        {item.relatedStocks.map(stock => (
                          <Badge key={stock} variant="secondary" className="text-xs">
                            {stock}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Source and Time */}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        来源: {item.source}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.publishedAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
