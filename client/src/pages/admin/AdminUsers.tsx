import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, Crown, User } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ userId: number; role: "admin" | "user" } | null>(null);
  const pageSize = 20;
  const { user: currentUser } = useAuth();

  const usersQuery = trpc.admin.getUsers.useQuery({
    page,
    pageSize,
    search: search || undefined,
  });

  const setUserRoleMutation = trpc.admin.setUserRole.useMutation({
    onSuccess: () => {
      toast.success("用户角色已更新");
      usersQuery.refetch();
      setShowConfirm(false);
      setConfirmAction(null);
    },
    onError: (error) => {
      toast.error(error.message || "更新失败");
    },
  });

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (usersQuery.data?.pagination.totalPages && page < usersQuery.data.pagination.totalPages) {
      setPage(page + 1);
    }
  };

  const handleSetRole = (userId: number, newRole: "admin" | "user") => {
    setConfirmAction({ userId, role: newRole });
    setShowConfirm(true);
  };

  const confirmSetRole = () => {
    if (confirmAction) {
      setUserRoleMutation.mutate({
        userId: confirmAction.userId,
        role: confirmAction.role,
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500/20 text-purple-500 border-purple-500/20";
      case "user":
        return "bg-blue-500/20 text-blue-500 border-blue-500/20";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/20";
    }
  };

  const getRoleLabel = (role: string) => {
    return role === "admin" ? "管理员" : "普通用户";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">用户管理</h1>
        </div>

        {/* Search */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardContent className="p-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="搜索用户名、邮箱或ID..."
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle>用户列表</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {usersQuery.isLoading ? (
              <p className="text-muted-foreground text-center py-8">加载中...</p>
            ) : usersQuery.data?.data && usersQuery.data.data.length > 0 ? (
              <div className="space-y-3">
                {usersQuery.data.data.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/30 hover:border-border/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
                          {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-medium">{user.name || user.email}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role === "admin" ? (
                          <>
                            <Crown className="w-3 h-3 mr-1" />
                            {getRoleLabel(user.role)}
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 mr-1" />
                            {getRoleLabel(user.role)}
                          </>
                        )}
                      </Badge>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">加入时间</p>
                        <p className="text-sm font-medium">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">最后登录</p>
                        <p className="text-sm font-medium">
                          {user.lastSignedIn
                            ? new Date(user.lastSignedIn).toLocaleDateString()
                            : "未登录"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {user.role === "user" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetRole(user.id, "admin")}
                            disabled={setUserRoleMutation.isPending}
                          >
                            升级为管理员
                          </Button>
                        ) : currentUser?.id !== user.id ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetRole(user.id, "user")}
                            disabled={setUserRoleMutation.isPending}
                          >
                            降级为用户
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            当前用户
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">暂无用户</p>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {usersQuery.data?.pagination && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              第 {usersQuery.data.pagination.page} 页，共 {usersQuery.data.pagination.totalPages} 页
              （总计 {usersQuery.data.pagination.total} 个用户）
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
                disabled={page >= usersQuery.data.pagination.totalPages}
              >
                下一页
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirm && confirmAction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>确认操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  确定要将此用户{confirmAction.role === "admin" ? "升级为管理员" : "降级为普通用户"}吗？
                </p>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowConfirm(false);
                      setConfirmAction(null);
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={confirmSetRole}
                    disabled={setUserRoleMutation.isPending}
                  >
                    {setUserRoleMutation.isPending ? "处理中..." : "确认"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
