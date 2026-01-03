import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DiscussionThread, DiscussionReply } from "@/lib/communityTypes";
import { mockDiscussionThreads, mockDiscussionReplies } from "@/lib/mockCommunityData";
import { Heart, MessageCircle, Eye, ArrowLeft } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function DiscussionDetail() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/discussion/:id");
  const [replyText, setReplyText] = useState("");

  if (!match) {
    return null;
  }

  const threadId = params?.id as string;
  const thread = mockDiscussionThreads.find(t => t.id === threadId);
  const replies = mockDiscussionReplies[threadId] || [];

  if (!thread) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">讨论不存在</h2>
            <Button onClick={() => setLocation("/community")}>
              返回社区
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
    const categories = [
      { value: "strategy", label: "策略" },
      { value: "analysis", label: "分析" },
      { value: "news", label: "新闻" },
      { value: "question", label: "提问" },
    ];
    const cat = categories.find(c => c.value === category);
    return cat?.label || category;
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

        {/* Main Thread Card */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-4">{thread.title}</h1>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-lg">
                    {thread.authorAvatar}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{thread.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {thread.createdAt.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <Badge className={cn("text-xs", getCategoryColor(thread.category))}>
                {getCategoryLabel(thread.category)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Main Post Content */}
            <div className="bg-muted/20 rounded-lg p-6 border border-border/50">
              <p className="text-base leading-relaxed text-foreground mb-4">
                {thread.content}
              </p>
              
              {/* Tags */}
              <div className="flex gap-2 flex-wrap mb-4">
                <Badge variant="secondary" className="text-xs">
                  {thread.stockName}
                </Badge>
                {thread.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="flex gap-6 text-sm text-muted-foreground pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                  <Eye className="w-4 h-4" />
                  <span>{thread.views} 浏览</span>
                </div>
                <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                  <MessageCircle className="w-4 h-4" />
                  <span>{thread.replies} 回复</span>
                </div>
                <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                  <Heart className="w-4 h-4" />
                  <span>{thread.likes} 赞</span>
                </div>
              </div>
            </div>

            {/* Replies Section */}
            {replies.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">回复 ({replies.length})</h2>
                <div className="space-y-3">
                  {replies.map(reply => (
                    <div
                      key={reply.id}
                      className="bg-muted/20 rounded-lg p-4 border border-border/50 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-sm flex-shrink-0">
                          {reply.authorAvatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{reply.author}</p>
                            {reply.isAuthorReply && (
                              <Badge variant="outline" className="text-xs">
                                楼主
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {reply.createdAt.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-foreground mb-3">{reply.content}</p>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          <Heart className="w-3 h-3 mr-1" />
                          {reply.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          回复
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reply Input Section */}
            <div className="bg-muted/20 rounded-lg p-6 border border-border/50 space-y-4">
              <h3 className="font-bold text-sm">发表回复</h3>
              <textarea
                placeholder="分享您的想法..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full bg-background rounded border border-border p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
              />
              <Button className="w-full">发布回复</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
