import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, AlertCircle, CheckCircle } from "lucide-react";

export default function AdminLogs() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [resource, setResource] = useState("");
  const pageSize = 20;

  const logsQuery = trpc.adminLogs.getLogs.useQuery({
    page,
    pageSize,
    action: action || undefined,
    resource: resource || undefined,
  });

  const statsQuery = trpc.adminLogs.getLogStats.useQuery();

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (logsQuery.data?.pagination.totalPages && page < logsQuery.data.pagination.totalPages) {
      setPage(page + 1);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      createConfig: "创建配置",
      updateConfig: "更新配置",
      deleteConfig: "删除配置",
      updateUser: "更新用户",
      deleteUser: "删除用户",
    };
    return labels[action] || action;
  };

  const getResourceLabel = (resource: string) => {
    const labels: Record<string, string> = {
      config: "系统配置",
      user: "用户",
      system: "系统",
    };
    return labels[resource] || resource;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">操作日志</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardHeader className="border-b border-blue-500/20 pb-4">
              <CardTitle className="text-sm font-medium">总操作数</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-3xl font-bold">
                {statsQuery.data?.totalLogs || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardHeader className="border-b border-green-500/20 pb-4">
              <CardTitle className="text-sm font-medium">成功操作</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-500">
                {statsQuery.data?.successLogs || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
            <CardHeader className="border-b border-red-500/20 pb-4">
              <CardTitle className="text-sm font-medium">失败操作</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-red-500">
                {statsQuery.data?.failedLogs || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">操作类型</label>
                <select
                  value={action}
                  onChange={(e) => {
                    setAction(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border/50 text-foreground"
                >
                  <option value="">所有操作</option>
                  <option value="createConfig">创建配置</option>
                  <option value="updateConfig">更新配置</option>
                  <option value="deleteConfig">删除配置</option>
                  <option value="updateUser">更新用户</option>
                  <option value="deleteUser">删除用户</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">资源类型</label>
                <select
                  value={resource}
                  onChange={(e) => {
                    setResource(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border/50 text-foreground"
                >
                  <option value="">所有资源</option>
                  <option value="config">系统配置</option>
                  <option value="user">用户</option>
                  <option value="system">系统</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle>操作日志列表</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {logsQuery.isLoading ? (
              <p className="text-muted-foreground text-center py-8">加载中...</p>
            ) : logsQuery.data?.data && logsQuery.data.data.length > 0 ? (
              <div className="space-y-3">
                {logsQuery.data.data.map((log: any) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between p-4 bg-background/50 rounded-lg border border-border/30 hover:border-border/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {log.status === "success" ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            {getActionLabel(log.action)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getResourceLabel(log.resource)}
                            {log.resourceId && ` - ${log.resourceId}`}
                          </p>
                        </div>
                      </div>
                      {log.errorMessage && (
                        <p className="text-xs text-red-500 ml-8 mb-2">
                          错误: {log.errorMessage}
                        </p>
                      )}
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <div className="text-xs text-muted-foreground ml-8 bg-background/30 rounded p-2 font-mono">
                          {JSON.stringify(log.changes, null, 2)}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <Badge
                        className={
                          log.status === "success"
                            ? "bg-green-500/20 text-green-500 border-green-500/20"
                            : "bg-red-500/20 text-red-500 border-red-500/20"
                        }
                      >
                        {log.status === "success" ? "成功" : "失败"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">暂无日志</p>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {logsQuery.data?.pagination && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              第 {logsQuery.data.pagination.page} 页，共 {logsQuery.data.pagination.totalPages} 页
              （总计 {logsQuery.data.pagination.total} 条日志）
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page >= logsQuery.data.pagination.totalPages}
              >
                下一页
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
