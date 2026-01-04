import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, UserCheck, Activity } from "lucide-react";

export default function AdminDashboard() {
  const userStatsQuery = trpc.admin.getUserStats.useQuery();
  const systemStatsQuery = trpc.admin.getSystemStats.useQuery();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">仪表板</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Users */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardHeader className="border-b border-blue-500/20 pb-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                用户总数
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-3xl font-bold">
                {userStatsQuery.data?.totalUsers || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                注册用户总数
              </p>
            </CardContent>
          </Card>

          {/* Regular Users */}
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardHeader className="border-b border-green-500/20 pb-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-green-500" />
                普通用户
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-3xl font-bold">
                {userStatsQuery.data?.regularUsers || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                非管理员用户
              </p>
            </CardContent>
          </Card>

          {/* Admin Users */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <CardHeader className="border-b border-purple-500/20 pb-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-500" />
                管理员
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-3xl font-bold">
                {userStatsQuery.data?.adminUsers || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                系统管理员数量
              </p>
            </CardContent>
          </Card>
        </div>

        {/* System Info */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle>系统信息</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">系统状态</p>
                <p className="text-lg font-semibold text-green-500">正常运行</p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">最后更新</p>
                <p className="text-lg font-semibold">
                  {systemStatsQuery.data?.timestamp
                    ? new Date(systemStatsQuery.data.timestamp).toLocaleString()
                    : "加载中..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle>快速操作</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/admin/settings"
                className="p-4 bg-background/50 rounded-lg hover:bg-background/80 transition-colors cursor-pointer"
              >
                <p className="font-medium">系统配置</p>
                <p className="text-sm text-muted-foreground">管理系统全局配置</p>
              </a>
              <a
                href="/admin/users"
                className="p-4 bg-background/50 rounded-lg hover:bg-background/80 transition-colors cursor-pointer"
              >
                <p className="font-medium">用户管理</p>
                <p className="text-sm text-muted-foreground">查看和管理用户</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
