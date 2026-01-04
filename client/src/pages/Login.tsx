import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";

export default function Login() {
  const { user, loading } = useAuth();

  // 如果已登录，重定向到首页
  useEffect(() => {
    if (user && !loading) {
      window.location.href = "/";
    }
  }, [user, loading]);

  const handleManusSSOLogin = () => {
    // 使用Manus OAuth登录
    window.location.href = getLoginUrl();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/40 backdrop-blur-md border-border/50">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/40 backdrop-blur-md border-border/50">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
              📈
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">StockTracker</CardTitle>
          <p className="text-sm text-muted-foreground">
            股票投资专家
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="bg-blue-500/10 border-blue-500/30">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-500">
              使用Manus账户登录以访问所有功能
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleManusSSOLogin}
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-medium py-2 rounded-lg transition-all"
          >
            <span>通过Manus登录</span>
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            <p>首次登录会自动创建账户</p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 text-xs text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">关于登录：</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>点击上方按钮使用Manus账户登录</li>
              <li>首次登录会自动为您创建StockTracker账户</li>
              <li>您的所有数据都会安全保存</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
