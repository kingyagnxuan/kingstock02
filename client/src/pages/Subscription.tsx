import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Zap } from "lucide-react";
import { toast } from "sonner";

export function Subscription() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");

  // 获取用户订阅信息
  const { data: subscription } = trpc.invitations.getSubscription.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  // 获取用户积分
  const { data: points } = trpc.invitations.getPoints.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  // 升级订阅
  const upgradeSubscription = trpc.invitations.upgradeWithPoints.useMutation({
    onSuccess: (data) => {
      toast.success("升级成功！");
    },
    onError: (error) => {
      toast.error("升级失败，请检查积分是否足够");
    },
  });

  const handleUpgrade = async (planType: "monthly" | "yearly") => {
    if (!user?.id || !points) return;

    // 计算所需积分
    const planPrices: Record<string, number> = {
      monthly: 99900, // ¥999
      yearly: 880000, // ¥8800
    };

    const price = planPrices[planType];
    const pointsNeeded = Math.ceil(price / 5000); // 100积分 = ¥50 = 5000分

    if (points.availablePoints < pointsNeeded) {
      toast.error(`积分不足，需要 ${pointsNeeded} 积分，当前有 ${points.availablePoints} 积分`);
      return;
    }

    await upgradeSubscription.mutateAsync({
      userId: user.id,
      planType,
      pointsToUse: pointsNeeded,
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">请先登录</p>
      </div>
    );
  }

  const plans = [
    {
      name: "月度订阅",
      type: "monthly" as const,
      price: 999,
      period: "月",
      description: "按月订阅，随时取消",
      features: [
        "每日盘中推送股票信息",
        "推送涨停潜力股",
        "推送买入区间建议",
        "微信实时通知",
        "无限制查看历史推送",
      ],
    },
    {
      name: "年度订阅",
      type: "yearly" as const,
      price: 8800,
      period: "年",
      description: "按年订阅，享受优惠",
      features: [
        "每日盘中推送股票信息",
        "推送涨停潜力股",
        "推送买入区间建议",
        "微信实时通知",
        "无限制查看历史推送",
        "VIP 客服支持",
        "优先获得新功能",
      ],
    },
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">升级订阅</h1>
        <p className="text-muted-foreground mt-2">
          订阅后可以接收每日盘中推送，获得涨停潜力股和买入建议
        </p>
      </div>

      {/* 当前订阅状态 */}
      {subscription && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">当前订阅</p>
                <p className="text-2xl font-bold">
                  {subscription.planType === "free" && "免费版"}
                  {subscription.planType === "monthly" && "月度订阅"}
                  {subscription.planType === "yearly" && "年度订阅"}
                </p>
              </div>
              {subscription.endDate && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">到期时间</p>
                  <p className="font-semibold">{new Date(subscription.endDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 积分余额 */}
      {points && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">可用积分</p>
                <p className="text-2xl font-bold text-green-600">{points.availablePoints}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">积分价值</p>
                <p className="text-2xl font-bold text-blue-600">
                  ¥{((points.availablePoints / 100) * 50).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 订阅方案 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.type}
            className={`relative ${
              plan.type === "yearly" ? "border-blue-500 shadow-lg md:scale-105" : ""
            }`}
          >
            {plan.type === "yearly" && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  最划算
                </span>
              </div>
            )}

            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <p className="text-4xl font-bold">¥{plan.price}</p>
                <p className="text-muted-foreground">/{plan.period}</p>
              </div>

              {points && (
                <div className="bg-muted p-3 rounded">
                  <p className="text-sm text-muted-foreground">
                    需要 {Math.ceil((plan.type === "monthly" ? 99900 : 880000) / 5000)} 积分
                  </p>
                  <p className="text-sm font-semibold">
                    {points.availablePoints >= Math.ceil((plan.type === "monthly" ? 99900 : 880000) / 5000)
                      ? "✓ 积分足够"
                      : "✗ 积分不足"}
                  </p>
                </div>
              )}

              <Button
                onClick={() => handleUpgrade(plan.type)}
                disabled={
                  upgradeSubscription.isPending ||
                  !points ||
                  points.availablePoints < Math.ceil((plan.type === "monthly" ? 99900 : 880000) / 5000)
                }
                className="w-full"
                size="lg"
              >
                {upgradeSubscription.isPending ? "升级中..." : "用积分升级"}
              </Button>

              <div className="space-y-3">
                <p className="font-semibold text-sm">包含功能：</p>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 常见问题 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            常见问题
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-1">如何获得积分？</h4>
            <p className="text-sm text-muted-foreground">
              邀请朋友注册可以获得积分，邀请者和被邀请者各获得 500 积分。
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-1">推送内容是什么？</h4>
            <p className="text-sm text-muted-foreground">
              推送内容包括股票代码、信息分析和买入区间建议，帮助您快速了解投资机会。
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-1">推送频率是多少？</h4>
            <p className="text-sm text-muted-foreground">
              推送频率不定期，根据市场情况和优质机会的出现而定。
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-1">支持哪些推送方式？</h4>
            <p className="text-sm text-muted-foreground">
              目前支持微信推送，可以直接通过微信号接收推送消息。
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-1">可以随时取消订阅吗？</h4>
            <p className="text-sm text-muted-foreground">
              可以，您可以随时取消订阅，已支付的费用不予退款。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
