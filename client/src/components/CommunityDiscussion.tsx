import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DiscussionThread, DiscussionReply } from "@/lib/communityTypes";
import { Heart, MessageCircle, Eye, Search } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface CommunityDiscussionProps {
  threads: DiscussionThread[];
  replies?: Record<string, DiscussionReply[]>;
}

export default function CommunityDiscussion({
  threads,
  replies = {},
}: CommunityDiscussionProps) {
  const [, setLocation] = useLocation();
  const [selectedThread, setSelectedThread] = useState<DiscussionThread | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { value: "all", label: "全部" },
    { value: "strategy", label: "策略" },
    { value: "analysis", label: "分析" },
    { value: "news", label: "新闻" },
    { value: "question", label: "提问" },
  ];

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.title.includes(searchQuery) || thread.content.includes(searchQuery);
    const matchesCategory = selectedCategory === "all" || thread.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "strategy":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "analysis":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "news":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "question":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.label || category;
  };

  return (
    <div className="space-y-6">
      {!selectedThread ? (
        <>
          {/* Search and Filter */}
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-bold">社区讨论</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索讨论..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <Button
                    key={cat.value}
                    variant={selectedCategory === cat.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.value)}
                    className="text-xs"
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Threads List */}
          <div className="space-y-3">
            {filteredThreads.length === 0 ? (
              <Card className="bg-card/40 backdrop-blur-md border-border/50">
                <CardContent className="p-12 text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">暂无相关讨论</p>
                </CardContent>
              </Card>
            ) : (
              filteredThreads.map(thread => (
                <Card
                  key={thread.id}
                  className="bg-card/40 backdrop-blur-md border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
                  onClick={() => setLocation(`/discussion/${thread.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-lg">
                          {thread.authorAvatar}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-bold text-sm group-hover:text-primary transition-colors">
                              {thread.title}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {thread.author} · {thread.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={cn("text-xs flex-shrink-0", getCategoryColor(thread.category))}>
                            {getCategoryLabel(thread.category)}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {thread.content}
                        </p>

                        {/* Tags */}
                        <div className="flex gap-1 mb-3 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {thread.stockName}
                          </Badge>
                          {thread.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1 hover:text-primary transition-colors">
                            <Eye className="w-3 h-3" />
                            <span>{thread.views}</span>
                          </div>
                          <div className="flex items-center gap-1 hover:text-primary transition-colors">
                            <MessageCircle className="w-3 h-3" />
                            <span>{thread.replies}</span>
                          </div>
                          <div className="flex items-center gap-1 hover:text-primary transition-colors">
                            <Heart className="w-3 h-3" />
                            <span>{thread.likes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      ) : (
        /* Thread Detail View */
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedThread(null)}
                  className="mb-2 h-8"
                >
                  ← 返回讨论列表
                </Button>
                <h2 className="text-xl font-bold">{selectedThread.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-sm">
                    {selectedThread.authorAvatar}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{selectedThread.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedThread.createdAt.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <Badge className={cn("text-xs", getCategoryColor(selectedThread.category))}>
                {getCategoryLabel(selectedThread.category)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Main Post */}
            <div className="bg-muted/20 rounded-lg p-4">
              <p className="text-sm leading-relaxed">{selectedThread.content}</p>
              <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{selectedThread.views} 浏览</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{selectedThread.likes} 赞</span>
                </div>
              </div>
            </div>

            {/* Replies */}
            {replies[selectedThread.id] && replies[selectedThread.id].length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-sm">回复 ({replies[selectedThread.id].length})</h3>
                {replies[selectedThread.id].map(reply => (
                  <div key={reply.id} className="bg-muted/20 rounded-lg p-4 border border-border/50">
                    <div className="flex gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-sm flex-shrink-0">
                        {reply.authorAvatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{reply.author}</p>
                        <p className="text-xs text-muted-foreground">
                          {reply.createdAt.toLocaleString()}
                        </p>
                      </div>
                      {reply.isAuthorReply && (
                        <Badge variant="outline" className="text-xs">
                          楼主
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{reply.content}</p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        <Heart className="w-3 h-3 mr-1" />
                        {reply.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        回复
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input */}
            <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
              <textarea
                placeholder="分享您的想法..."
                className="w-full bg-background rounded border border-border p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
              <Button className="mt-3 w-full">发布回复</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
