import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Share2, Gift } from "lucide-react";
import { toast } from "sonner";

export function Invitations() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // 获取邀请信息
  const { data: invitations, isLoading: invitationsLoading } = trpc.invitations.getMyInvitations.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  // 获取积分信息
  const { data: points, isLoading: pointsLoading } = trpc.invitations.getPoints.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  // 创建邀请码
  const createInvitation = trpc.invitations.createInvitation.useMutation({
    onSuccess: (data) => {
      toast.success("邀请码已生成");
    },
    onError: (error) => {
      toast.error("生成邀请码失败");
    },
  });

  const handleCreateInvitation = async () => {
    if (!user?.id) return;
    await createInvitation.mutateAsync({ userId: user.id });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("已复制到剪贴板");
  };

  const handleShareLink = (link: string) => {
    if (navigator.share) {
      navigator.share({
        title: "邀请您加入 StockTracker",
        text: "一起追踪涨停潜力股，获得积分奖励！",
        url: link,
      });
    } else {
      navigator.clipboard.writeText(link);
      toast.success("邀请链接已复制");
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">请先登录</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">邀请和积分</h1>
        <p className="text-muted-foreground mt-2">邀请朋友注册，双方都能获得积分奖励</p>
      </div>

      <Tabs defaultValue="invitations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invitations">邀请管理</TabsTrigger>
          <TabsTrigger value="points">我的积分</TabsTrigger>
        </TabsList>

        {/* 邀请管理标签页 */}
        <TabsContent value="invitations" className="space-y-6">
          {/* 创建邀请码卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                生成邀请码
              </CardTitle>
              <CardDescription>
                生成邀请码分享给朋友，邀请成功后双方各获得 500 积分
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCreateInvitation}
                disabled={createInvitation.isPending}
                className="w-full"
              >
                {createInvitation.isPending ? "生成中..." : "生成新的邀请码"}
              </Button>
            </CardContent>
          </Card>

          {/* 邀请列表 */}
          {invitationsLoading ? (
            <div className="text-center text-muted-foreground">加载中...</div>
          ) : invitations && invitations.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">我的邀请</h3>
              {invitations.map((invitation: any) => (
                <Card key={invitation.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">邀请码</p>
                          <p className="font-mono text-lg font-bold">{invitation.invitationCode}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyCode(invitation.invitationCode)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          {copied ? "已复制" : "复制"}
                        </Button>
                      </div>

                      <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground mb-2">邀请链接</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={invitation.invitationLink}
                            readOnly
                            className="flex-1 px-3 py-2 bg-muted rounded text-sm"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShareLink(invitation.invitationLink)}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="border-t pt-4 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">状态</p>
                          <p className="font-semibold">
                            {invitation.status === "pending" && "待使用"}
                            {invitation.status === "completed" && "已使用"}
                            {invitation.status === "expired" && "已过期"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">邀请者奖励</p>
                          <p className="font-semibold text-green-600">
                            +{invitation.inviterPointsRewarded}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">被邀请者奖励</p>
                          <p className="font-semibold text-green-600">
                            +{invitation.inviteePointsRewarded}
                          </p>
                        </div>
                      </div>

                      {invitation.expiresAt && (
                        <div className="border-t pt-4 text-sm text-muted-foreground">
                          过期时间: {new Date(invitation.expiresAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                还没有生成邀请码，点击上方按钮生成第一个邀请码吧
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 积分管理标签页 */}
        <TabsContent value="points" className="space-y-6">
          {pointsLoading ? (
            <div className="text-center text-muted-foreground">加载中...</div>
          ) : points ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">总积分</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{points.totalPoints}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">可用积分</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{points.availablePoints}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">已使用积分</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-orange-600">{points.usedPoints}</p>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* 积分说明 */}
          <Card>
            <CardHeader>
              <CardTitle>积分说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">如何获得积分？</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 邀请朋友注册：邀请者和被邀请者各获得 500 积分</li>
                  <li>• 完成任务：参与平台活动获得积分</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">积分如何使用？</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 100 积分 = ¥50 抵扣费用</li>
                  <li>• 可用于升级付费订阅</li>
                  <li>• 可用于兑换其他权益</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded">
                <p className="text-sm">
                  <span className="font-semibold">当前积分价值：</span>
                  {points?.availablePoints || 0} 积分 = ¥
                  {((points?.availablePoints || 0) / 100) * 50}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
