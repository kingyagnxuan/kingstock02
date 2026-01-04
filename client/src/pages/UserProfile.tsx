import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { User, LogOut, Edit2, Trophy, MessageSquare, Heart, Users, X, Check, Upload, Copy, Crown, Gift, Link as LinkIcon, Calendar } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function UserProfile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateUserMutation = trpc.users.updateProfile.useMutation();
  const configQuery = trpc.system.getConfig.useQuery();

  // 获取配置
  useEffect(() => {
    if (configQuery.data?.paymentEnabled !== undefined) {
      setPaymentEnabled(configQuery.data.paymentEnabled);
    }
  }, [configQuery.data]);

  // 编辑表单状态
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: (user as any)?.bio || "",
    biography: (user as any)?.biography || "",
    avatar: (user as any)?.avatar || "",
  });

  if (!isAuthenticated || !user) {
    setLocation("/login");
    return null;
  }

  // 模拟数据（实际应从后端获取）
  const mockSubscription = {
    planType: "free", // 前期所有用户都是免费用户
    status: "active",
    startDate: new Date(),
    endDate: null,
    autoRenew: false,
  };

  const mockInvitation = {
    code: "STOCK123456",
    link: "https://stock-tracker.app/invite/STOCK123456",
    totalInvites: 5,
    completedInvites: 3,
    pendingInvites: 2,
    pointsEarned: 150,
  };

  const mockInvitationRecords = [
    {
      id: 1,
      inviteeName: "张三",
      status: "completed",
      completedAt: new Date("2024-01-15"),
      pointsRewarded: 50,
    },
    {
      id: 2,
      inviteeName: "李四",
      status: "completed",
      completedAt: new Date("2024-01-20"),
      pointsRewarded: 50,
    },
    {
      id: 3,
      inviteeName: "王五",
      status: "completed",
      completedAt: new Date("2024-01-25"),
      pointsRewarded: 50,
    },
    {
      id: 4,
      inviteeName: "赵六",
      status: "pending",
      completedAt: null,
      pointsRewarded: 0,
    },
    {
      id: 5,
      inviteeName: "孙七",
      status: "pending",
      completedAt: null,
      pointsRewarded: 0,
    },
  ];

  const isPremium = false; // 前期所有用户都是免费用户
  const premiumFeatures = [
    "✓ 高级股票分析",
    "✓ AI问票服务",
    "✓ 自定义策略",
    "✓ 优先客服支持",
    "✓ 专属社区",
  ];

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setFormData({
      name: user.name || "",
      bio: (user as any)?.bio || "",
      biography: (user as any)?.biography || "",
      avatar: (user as any)?.avatar || "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarPreview(null);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAvatarPreview(result);
        setFormData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateUserMutation.mutateAsync({
        name: formData.name,
        bio: formData.bio,
        biography: formData.biography,
        avatar: formData.avatar,
      });
      toast.success("个人资料已更新");
      setIsEditing(false);
      setAvatarPreview(null);
    } catch (error) {
      toast.error("更新失败，请重试");
      console.error(error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mockInvitation.link);
    toast.success("邀请链接已复制");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(mockInvitation.code);
    toast.success("邀请码已复制");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-xl p-8 border border-border/50">
          <div className="flex items-start justify-between gap-6">
            <div className="flex gap-6 flex-1">
              {isEditing ? (
                <div className="relative">
                  <div
                    onClick={handleAvatarClick}
                    className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-4xl shadow-lg shadow-primary/20 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden flex-shrink-0"
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar preview" className="w-full h-full object-cover" />
                    ) : (user as any)?.avatar ? (
                      <img src={(user as any).avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      "👤"
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-primary rounded-full p-2 shadow-lg">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-4xl shadow-lg shadow-primary/20 overflow-hidden flex-shrink-0">
                  {(user as any)?.avatar ? (
                    <img src={(user as any).avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    "👤"
                  )}
                </div>
              )}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="输入昵称"
                      className="text-lg font-bold"
                    />
                    <Input
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="输入个人签名"
                      maxLength={200}
                    />
                    <div className="text-xs text-muted-foreground">
                      {formData.bio.length}/200
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-bold">{user.name || user.openId}</h1>
                      <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/20 gap-1">
                        <Users className="w-3 h-3" />
                        免费用户
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{(user as any)?.bio || "暂无签名"}</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={updateUserMutation.isPending}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4" />
                    保存
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    取消
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleEditClick}
                    variant="outline"
                    className="gap-2"
                  >
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
                </>
              )}
            </div>
          </div>

          {/* Biography Section */}
          {isEditing && (
            <div className="mt-6 pt-6 border-t border-border/50">
              <label className="text-sm font-medium mb-2 block">个人资料</label>
              <Textarea
                name="biography"
                value={formData.biography}
                onChange={handleInputChange}
                placeholder="输入个人资料/简介"
                maxLength={500}
                rows={4}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {formData.biography.length}/500
              </div>
            </div>
          )}

          {!isEditing && (user as any)?.biography && (
            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-2">个人资料</p>
              <p className="text-sm leading-relaxed">{(user as any).biography}</p>
            </div>
          )}
        </div>

        {/* Account Information */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              账户信息
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">账户类型</span>
              <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/20">免费用户</Badge>
            </div>
            <div className="h-px bg-border/50" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">邮箱</span>
              <span className="text-sm font-mono">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">加入时间</span>
              <span className="text-sm">{user.createdAt.toLocaleDateString()}</span>
            </div>
            {paymentEnabled && (
              <>
                <div className="h-px bg-border/50" />
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                  升级到VIP
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Premium Features - Only show if payment is enabled */}
        {paymentEnabled && (
          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <CardHeader className="border-b border-yellow-500/20 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Gift className="w-5 h-5 text-yellow-500" />
                VIP特权
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                {premiumFeatures.map((feature, idx) => (
                  <div key={idx} className="text-sm text-foreground">
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invitation Section - Only show if payment is enabled */}
        {paymentEnabled && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Invitation Link */}
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-primary" />
                  专属邀请链接
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">邀请码</p>
                  <div className="flex gap-2">
                    <Input
                      value={mockInvitation.code}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyCode}
                      className="gap-1"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">邀请链接</p>
                  <div className="flex gap-2">
                    <Input
                      value={mockInvitation.link}
                      readOnly
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyLink}
                      className="gap-1"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="h-px bg-border/50" />

                {/* Invitation Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{mockInvitation.totalInvites}</p>
                    <p className="text-xs text-muted-foreground">总邀请数</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">{mockInvitation.completedInvites}</p>
                    <p className="text-xs text-muted-foreground">已完成</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-500">{mockInvitation.pointsEarned}</p>
                    <p className="text-xs text-muted-foreground">获得积分</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invitation Stats Card */}
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  邀请奖励
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">每次邀请奖励</span>
                    <span className="font-bold text-primary">50积分</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">被邀请者奖励</span>
                    <span className="font-bold text-primary">20积分</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">邀请VIP用户</span>
                    <span className="font-bold text-yellow-500">100积分</span>
                  </div>
                </div>

                <div className="h-px bg-border/50" />

                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">💡 邀请提示：</p>
                  <ul className="space-y-1 text-xs">
                    <li>• 分享链接给朋友，邀请他们注册</li>
                    <li>• 被邀请者完成注册后即可获得奖励</li>
                    <li>• 积分可用于购买VIP或兑换特权</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Invitation Records - Only show if payment is enabled */}
        {paymentEnabled && (
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-bold">邀请记录</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {mockInvitationRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/30"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{record.inviteeName}</p>
                      {record.completedAt && (
                        <p className="text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {record.completedAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        className={
                          record.status === "completed"
                            ? "bg-green-500/20 text-green-500 border-green-500/20"
                            : "bg-yellow-500/20 text-yellow-500 border-yellow-500/20"
                        }
                      >
                        {record.status === "completed" ? "已完成" : "待完成"}
                      </Badge>
                      {record.pointsRewarded > 0 && (
                        <span className="font-bold text-primary">+{record.pointsRewarded}积分</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
