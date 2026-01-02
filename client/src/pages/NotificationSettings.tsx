import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/contexts/NotificationContext";
import { Bell, Mail, MessageSquare, Clock, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import type { NotificationPreference } from "@/lib/notificationService";

export default function NotificationSettings() {
  const { preferences, setPreferences, requestPermission } = useNotification();
  const [localPrefs, setLocalPrefs] = useState<NotificationPreference | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  if (!localPrefs) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleToggleBrowser = () => {
    setLocalPrefs(prev => prev ? { ...prev, enableBrowserNotification: !prev.enableBrowserNotification } : null);
    setSaved(false);
  };

  const handleToggleEmail = () => {
    setLocalPrefs(prev => prev ? { ...prev, enableEmailNotification: !prev.enableEmailNotification } : null);
    setSaved(false);
  };

  const handleToggleInApp = () => {
    setLocalPrefs(prev => prev ? { ...prev, enableInAppNotification: !prev.enableInAppNotification } : null);
    setSaved(false);
  };

  const handleToggleSignal = () => {
    setLocalPrefs(prev => prev ? { ...prev, signalNotification: !prev.signalNotification } : null);
    setSaved(false);
  };

  const handleToggleAlert = () => {
    setLocalPrefs(prev => prev ? { ...prev, alertNotification: !prev.alertNotification } : null);
    setSaved(false);
  };

  const handleToggleTrade = () => {
    setLocalPrefs(prev => prev ? { ...prev, tradeNotification: !prev.tradeNotification } : null);
    setSaved(false);
  };

  const handleToggleNews = () => {
    setLocalPrefs(prev => prev ? { ...prev, newsNotification: !prev.newsNotification } : null);
    setSaved(false);
  };

  const handleToggleSystem = () => {
    setLocalPrefs(prev => prev ? { ...prev, systemNotification: !prev.systemNotification } : null);
    setSaved(false);
  };

  const handleQuietHoursToggle = () => {
    setLocalPrefs(prev => {
      if (!prev) return null;
      return {
        ...prev,
        quietHours: prev.quietHours ? {
          ...prev.quietHours,
          enabled: !prev.quietHours.enabled
        } : {
          enabled: true,
          startTime: "22:00",
          endTime: "08:00"
        }
      };
    });
    setSaved(false);
  };

  const handleQuietHoursChange = (field: "startTime" | "endTime", value: string) => {
    setLocalPrefs(prev => {
      if (!prev) return null;
      return {
        ...prev,
        quietHours: prev.quietHours ? {
          ...prev.quietHours,
          [field]: value
        } : {
          enabled: true,
          startTime: "22:00",
          endTime: "08:00",
          [field]: value
        }
      };
    });
    setSaved(false);
  };

  const handleEmailChange = (email: string) => {
    setLocalPrefs(prev => prev ? { ...prev, emailAddress: email } : null);
    setSaved(false);
  };

  const handleSave = async () => {
    if (localPrefs) {
      setPreferences(localPrefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      setLocalPrefs(prev => prev ? { ...prev, enableBrowserNotification: true } : null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold tracking-tight">通知设置</h1>
          </div>
          <p className="text-muted-foreground">
            自定义通知偏好，选择接收通知的方式和时间
          </p>
        </section>

        {/* Success Message */}
        {saved && (
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-4">
              <p className="text-sm text-green-500">✓ 设置已保存</p>
            </CardContent>
          </Card>
        )}

        {/* Notification Channels */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              通知渠道
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Browser Notification */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
              <div>
                <p className="font-semibold mb-1">浏览器通知</p>
                <p className="text-sm text-muted-foreground">
                  在浏览器中接收实时通知提醒
                </p>
              </div>
              <div className="flex gap-2">
                {!localPrefs.enableBrowserNotification && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRequestPermission}
                  >
                    启用权限
                  </Button>
                )}
                <input
                  type="checkbox"
                  checked={localPrefs.enableBrowserNotification}
                  onChange={handleToggleBrowser}
                  className="w-5 h-5 cursor-pointer"
                />
              </div>
            </div>

            {/* Email Notification */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold mb-1">邮件通知</p>
                  <p className="text-sm text-muted-foreground">
                    通过邮件接收重要通知
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localPrefs.enableEmailNotification}
                  onChange={handleToggleEmail}
                  className="w-5 h-5 cursor-pointer"
                />
              </div>

              {localPrefs.enableEmailNotification && (
                <div>
                  <label className="text-sm font-medium mb-2 block">邮箱地址</label>
                  <input
                    type="email"
                    value={localPrefs.emailAddress || ""}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                  />
                </div>
              )}
            </div>

            {/* In-App Notification */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
              <div>
                <p className="font-semibold mb-1">应用内通知</p>
                <p className="text-sm text-muted-foreground">
                  在应用中显示通知
                </p>
              </div>
              <input
                type="checkbox"
                checked={localPrefs.enableInAppNotification}
                onChange={handleToggleInApp}
                className="w-5 h-5 cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              通知类型
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
              <div>
                <p className="font-medium">交易信号</p>
                <p className="text-xs text-muted-foreground">当生成新的交易信号时通知</p>
              </div>
              <input
                type="checkbox"
                checked={localPrefs.signalNotification}
                onChange={handleToggleSignal}
                className="w-5 h-5 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
              <div>
                <p className="font-medium">风险预警</p>
                <p className="text-xs text-muted-foreground">当触发风险预警时立即通知</p>
              </div>
              <input
                type="checkbox"
                checked={localPrefs.alertNotification}
                onChange={handleToggleAlert}
                className="w-5 h-5 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
              <div>
                <p className="font-medium">交易执行</p>
                <p className="text-xs text-muted-foreground">当交易订单执行时通知</p>
              </div>
              <input
                type="checkbox"
                checked={localPrefs.tradeNotification}
                onChange={handleToggleTrade}
                className="w-5 h-5 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
              <div>
                <p className="font-medium">市场资讯</p>
                <p className="text-xs text-muted-foreground">接收市场新闻和资讯</p>
              </div>
              <input
                type="checkbox"
                checked={localPrefs.newsNotification}
                onChange={handleToggleNews}
                className="w-5 h-5 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
              <div>
                <p className="font-medium">系统通知</p>
                <p className="text-xs text-muted-foreground">系统维护和更新通知</p>
              </div>
              <input
                type="checkbox"
                checked={localPrefs.systemNotification}
                onChange={handleToggleSystem}
                className="w-5 h-5 cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              静音时间
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
              <div>
                <p className="font-semibold mb-1">启用静音时间</p>
                <p className="text-sm text-muted-foreground">
                  在指定时间内不发送通知
                </p>
              </div>
              <input
                type="checkbox"
                checked={localPrefs.quietHours?.enabled || false}
                onChange={handleQuietHoursToggle}
                className="w-5 h-5 cursor-pointer"
              />
            </div>

            {localPrefs.quietHours?.enabled && (
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">开始时间</label>
                  <input
                    type="time"
                    value={localPrefs.quietHours.startTime}
                    onChange={(e) => handleQuietHoursChange("startTime", e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">结束时间</label>
                  <input
                    type="time"
                    value={localPrefs.quietHours.endTime}
                    onChange={(e) => handleQuietHoursChange("endTime", e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full gap-2" size="lg">
          <Bell className="w-5 h-5" />
          保存设置
        </Button>
      </div>
    </DashboardLayout>
  );
}
