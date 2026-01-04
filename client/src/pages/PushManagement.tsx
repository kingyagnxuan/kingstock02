import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function PushManagement() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    stockCode: "",
    stockName: "",
    message: "",
    buyRange: "",
    targetUsers: "premium" as "all" | "premium" | "specific",
  });

  // 创建推送消息
  const createPush = trpc.invitations.createPushNotification.useMutation({
    onSuccess: () => {
      toast.success("推送消息已创建");
      setFormData({
        stockCode: "",
        stockName: "",
        message: "",
        buyRange: "",
        targetUsers: "premium",
      });
    },
    onError: () => {
      toast.error("创建推送消息失败");
    },
  });

  // 获取推送列表
  const { data: pushNotifications } = trpc.invitations.getPushNotifications.useQuery({
    limit: 50,
  });

  // 发送推送
  const sendPush = trpc.invitations.sendPushNotification.useMutation({
    onSuccess: () => {
      toast.success("推送已发送");
    },
    onError: () => {
      toast.error("发送推送失败");
    },
  });

  const handleCreatePush = async () => {
    if (!user?.id || !formData.stockCode || !formData.stockName || !formData.message || !formData.buyRange) {
      toast.error("请填写所有必填字段");
      return;
    }

    await createPush.mutateAsync({
      ...formData,
      createdBy: user.id,
    });
  };

  const handleSendPush = async (pushId: number) => {
    await sendPush.mutateAsync({ pushNotificationId: pushId });
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">仅管理员可以访问此页面</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">推送管理</h1>
        <p className="text-muted-foreground mt-2">创建和管理向用户推送的股票信息</p>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">创建推送</TabsTrigger>
          <TabsTrigger value="list">推送列表</TabsTrigger>
        </TabsList>

        {/* 创建推送标签页 */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>创建新的推送消息</CardTitle>
              <CardDescription>
                填写股票信息和推送内容，选择目标用户后发送
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">股票代码 *</label>
                  <Input
                    placeholder="如：600363"
                    value={formData.stockCode}
                    onChange={(e) =>
                      setFormData({ ...formData, stockCode: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">股票名称 *</label>
                  <Input
                    placeholder="如：联创光电"
                    value={formData.stockName}
                    onChange={(e) =>
                      setFormData({ ...formData, stockName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">推送信息 *</label>
                <Textarea
                  placeholder="输入推送的信息内容，如：该股票今日表现强势，资金净流入突增..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">买入区间 *</label>
                <Input
                  placeholder="如：12.50-13.00元"
                  value={formData.buyRange}
                  onChange={(e) =>
                    setFormData({ ...formData, buyRange: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">目标用户</label>
                <Select
                  value={formData.targetUsers}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, targetUsers: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有用户</SelectItem>
                    <SelectItem value="premium">付费用户</SelectItem>
                    <SelectItem value="specific">特定用户</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCreatePush}
                disabled={createPush.isPending}
                className="w-full"
                size="lg"
              >
                {createPush.isPending ? "创建中..." : "创建推送"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 推送列表标签页 */}
        <TabsContent value="list" className="space-y-6">
          {!pushNotifications || pushNotifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                还没有推送消息
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pushNotifications.map((push: any) => (
                <Card key={push.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {push.stockName} ({push.stockCode})
                            </h3>
                            <span className="text-xs px-2 py-1 bg-muted rounded">
                              {push.status === "draft" && "草稿"}
                              {push.status === "scheduled" && "定时"}
                              {push.status === "sent" && "已发送"}
                              {push.status === "cancelled" && "已取消"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {push.message}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">买入区间：</span>
                              <span className="font-semibold">{push.buyRange}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">目标用户：</span>
                              <span className="font-semibold">
                                {push.targetUsers === "all" && "所有用户"}
                                {push.targetUsers === "premium" && "付费用户"}
                                {push.targetUsers === "specific" && "特定用户"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {push.status === "draft" && (
                          <Button
                            onClick={() => handleSendPush(push.id)}
                            disabled={sendPush.isPending}
                            className="ml-4"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            发送
                          </Button>
                        )}
                      </div>

                      <div className="border-t pt-4 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          {push.sentTime && (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span>
                                发送于 {new Date(push.sentTime).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {push.scheduledTime && !push.sentTime && (
                            <div className="flex items-center gap-2 text-blue-600">
                              <Clock className="w-4 h-4" />
                              <span>
                                定时于 {new Date(push.scheduledTime).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-muted-foreground">
                          创建于 {new Date(push.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
