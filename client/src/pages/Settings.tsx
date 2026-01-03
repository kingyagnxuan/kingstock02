import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Bell, Shield, Palette } from "lucide-react";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="space-y-2">
          <h1 className="text-3xl font-bold">系统设置</h1>
          <p className="text-muted-foreground">管理您的应用偏好和通知设置</p>
        </section>

        {/* Notification Settings */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle>通知设置</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">价格预警通知</p>
                <p className="text-sm text-muted-foreground">当股票价格触及预警价位时通知</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">交易信号通知</p>
                <p className="text-sm text-muted-foreground">当出现买卖信号时通知</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">市场资讯推送</p>
                <p className="text-sm text-muted-foreground">接收最新的市场资讯和分析</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <CardTitle>显示设置</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">深色模式</p>
                <p className="text-sm text-muted-foreground">使用深色主题</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">实时更新</p>
                <p className="text-sm text-muted-foreground">启用实时数据更新</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle>安全设置</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">两步验证</p>
                <p className="text-sm text-muted-foreground">增强账户安全</p>
              </div>
              <Button variant="outline" size="sm">启用</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">修改密码</p>
                <p className="text-sm text-muted-foreground">定期更新您的密码</p>
              </div>
              <Button variant="outline" size="sm">修改</Button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-primary" />
              <CardTitle>关于</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">应用版本</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">最后更新</span>
              <span className="font-medium">2026-01-02</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
