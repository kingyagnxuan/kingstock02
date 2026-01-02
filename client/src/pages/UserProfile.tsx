import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { User, LogOut, Edit2, Trophy, MessageSquare, Heart, Users } from "lucide-react";
import { mockUserProfile } from "@/lib/mockAuthData";
import { getReputationLevel, getReputationColor } from "@/lib/mockAuthData";

export default function UserProfile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated || !user) {
    setLocation("/login");
    return null;
  }

  const profile = mockUserProfile;

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-xl p-8 border border-border/50">
          <div className="flex items-start justify-between gap-6">
            <div className="flex gap-6">
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-4xl shadow-lg shadow-primary/20">
                {user.avatar}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
                <p className="text-muted-foreground mb-3">{user.bio}</p>
                <div className="flex items-center gap-2">
                  <Badge className={`${getReputationColor(user.reputation)} bg-transparent border`}>
                    {getReputationLevel(user.reputation)}
                  </Badge>
                  {user.isVerified && (
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/20">
                      ✓ 已认证
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Edit2 className="w-4 h-4" />
                编辑资料
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">信誉值</p>
                  <p className="text-2xl font-bold">{user.reputation}</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">发帖数</p>
                  <p className="text-2xl font-bold">{profile.postsCount}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">回复数</p>
                  <p className="text-2xl font-bold">{profile.repliesCount}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">获赞数</p>
                  <p className="text-2xl font-bold">{profile.likesReceived}</p>
                </div>
                <Heart className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">自选股</p>
                  <p className="text-2xl font-bold">{profile.watchlistCount}</p>
                </div>
                <Heart className="w-8 h-8 text-pink-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Social Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                社交统计
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">粉丝</span>
                <span className="text-2xl font-bold">{profile.followersCount}</span>
              </div>
              <div className="h-px bg-border/50" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">关注</span>
                <span className="text-2xl font-bold">{profile.followingCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-bold">账户信息</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">邮箱</p>
                <p className="text-sm font-mono">{user.email}</p>
              </div>
              <div className="h-px bg-border/50" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">加入时间</p>
                <p className="text-sm">{user.joinedAt.toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-lg font-bold">最近活动</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex gap-4 pb-4 border-b border-border/50 last:border-b-0">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">发布了讨论</p>
                  <p className="text-xs text-muted-foreground">AI应用龙头分析 · 2小时前</p>
                </div>
              </div>
              <div className="flex gap-4 pb-4 border-b border-border/50 last:border-b-0">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">回复了讨论</p>
                  <p className="text-xs text-muted-foreground">商业航天政策支持 · 4小时前</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">收藏了股票</p>
                  <p className="text-xs text-muted-foreground">蓝色光标 (300058) · 1天前</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
