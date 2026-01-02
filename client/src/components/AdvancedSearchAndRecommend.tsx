import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DiscussionThread } from "@/lib/communityTypes";
import { SearchEngine, RecommendationEngine, SearchResult, RecommendationItem } from "@/lib/searchEngine";
import { Search, TrendingUp, Zap, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface AdvancedSearchAndRecommendProps {
  threads: DiscussionThread[];
}

export default function AdvancedSearchAndRecommend({ threads }: AdvancedSearchAndRecommendProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [sortBy, setSortBy] = useState<"relevance" | "views" | "replies" | "recent">("relevance");
  const [activeTab, setActiveTab] = useState<"search" | "hot" | "latest" | "interest">("search");

  const searchEngine = useMemo(() => new SearchEngine(threads), [threads]);
  const recommendEngine = useMemo(
    () => new RecommendationEngine(threads, ["AI应用", "商业航天", "新媒体"]),
    [threads]
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchEngine.advancedSearch(searchQuery, {
      category: selectedCategory || undefined,
      stockCode: selectedStock || undefined,
      sortBy
    });
  }, [searchQuery, selectedCategory, selectedStock, sortBy, searchEngine]);

  const hotRecommendations = useMemo(() => recommendEngine.recommendHotTopics(), [recommendEngine]);
  const latestRecommendations = useMemo(() => recommendEngine.recommendLatest(), [recommendEngine]);
  const interestRecommendations = useMemo(() => recommendEngine.recommendByInterests(), [recommendEngine]);

  const uniqueStocks = Array.from(new Set(threads.map(t => t.stockCode)));
  const categories = ["strategy", "analysis", "news", "question"];

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      strategy: "策略",
      analysis: "分析",
      news: "新闻",
      question: "提问"
    };
    return labels[cat] || cat;
  };

  const renderResultItem = (item: SearchResult | RecommendationItem) => (
    <div key={item.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-2">
          {item.title}
        </h3>
        <Badge variant="outline" className="text-xs flex-shrink-0">
          {"relevance" in item ? `${item.relevance}` : `${item.score}`}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
        {"content" in item ? item.content : item.reason}
      </p>
      {"metadata" in item && item.metadata && (
        <div className="flex gap-2 flex-wrap">
          {item.metadata.stockName && (
            <Badge variant="secondary" className="text-xs">
              {item.metadata.stockName}
            </Badge>
          )}
          {item.metadata.views && (
            <Badge variant="outline" className="text-xs">
              👁 {item.metadata.views}
            </Badge>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="bg-card/40 backdrop-blur-md border-border/50">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            高级搜索
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索讨论、股票、话题..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">分类</label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("")}
                  className="text-xs"
                >
                  全部
                </Button>
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="text-xs"
                  >
                    {getCategoryLabel(cat)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">股票</label>
              <select
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                className="w-full px-3 py-2 rounded border border-border bg-background text-sm text-foreground"
              >
                <option value="">全部股票</option>
                {uniqueStocks.map(stock => (
                  <option key={stock} value={stock}>
                    {stock}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">排序</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 rounded border border-border bg-background text-sm text-foreground"
              >
                <option value="relevance">相关性</option>
                <option value="views">浏览量</option>
                <option value="replies">回复数</option>
                <option value="recent">最新</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50">
        {[
          { id: "search", label: "搜索结果", icon: Search },
          { id: "hot", label: "热门讨论", icon: TrendingUp },
          { id: "latest", label: "最新讨论", icon: Clock },
          { id: "interest", label: "为您推荐", icon: Zap }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-3">
        {activeTab === "search" && (
          <>
            {searchQuery.trim() === "" ? (
              <Card className="bg-card/40 backdrop-blur-md border-border/50">
                <CardContent className="p-12 text-center">
                  <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">输入关键词开始搜索</p>
                </CardContent>
              </Card>
            ) : searchResults.length === 0 ? (
              <Card className="bg-card/40 backdrop-blur-md border-border/50">
                <CardContent className="p-12 text-center">
                  <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">未找到相关结果</p>
                </CardContent>
              </Card>
            ) : (
              searchResults.map(renderResultItem)
            )}
          </>
        )}

        {activeTab === "hot" && hotRecommendations.map(renderResultItem)}
        {activeTab === "latest" && latestRecommendations.map(renderResultItem)}
        {activeTab === "interest" && interestRecommendations.map(renderResultItem)}
      </div>
    </div>
  );
}
