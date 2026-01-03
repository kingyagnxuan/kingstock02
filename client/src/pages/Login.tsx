import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useState } from "react";
import { AlertCircle, Loader2, QrCode, Smartphone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password");
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegister) {
      // 注册逻辑
      if (!username || !email || !password || !confirmPassword) {
        return;
      }
    } else {
      // 登录逻辑
      await login({ email, password });
      if (!error) {
        setLocation("/");
      }
    }
  };

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
            {isRegister ? "创建新账户" : "登录您的账户"}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert className="bg-destructive/10 border-destructive/50">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <label className="text-sm font-medium">用户名</label>
                <Input
                  placeholder="输入用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">邮箱</label>
              <Input
                type="email"
                placeholder="输入邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">密码</label>
              <Input
                type="password"
                placeholder="输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {isRegister && (
              <div className="space-y-2">
                <label className="text-sm font-medium">确认密码</label>
                <Input
                  type="password"
                  placeholder="再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                isRegister ? "创建账户" : "登录"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">或</span>
            </div>
          </div>

          {/* 微信登录选项 */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full border-green-500/30 hover:bg-green-500/5"
              onClick={() => {
                // 微信扫码登录逻辑
                window.location.href = `${import.meta.env.VITE_OAUTH_PORTAL_URL}?client_id=${import.meta.env.VITE_APP_ID}&redirect_uri=${window.location.origin}/auth/wechat&response_type=code&scope=snsapi_login&state=wechat_scan`;
              }}
            >
              <QrCode className="w-4 h-4 mr-2 text-green-500" />
              <span className="text-green-600">微信扫码登录</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-green-500/30 hover:bg-green-500/5"
              onClick={() => {
                // 微信一键登录逻辑
                window.location.href = `${import.meta.env.VITE_OAUTH_PORTAL_URL}?client_id=${import.meta.env.VITE_APP_ID}&redirect_uri=${window.location.origin}/auth/wechat&response_type=code&scope=snsapi_userinfo&state=wechat_quick`;
              }}
            >
              <Smartphone className="w-4 h-4 mr-2 text-green-500" />
              <span className="text-green-600">微信一键登录</span>
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-center text-muted-foreground">
              {isRegister ? "已有账户？" : "还没有账户？"}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-primary hover:underline font-medium ml-1"
              >
                {isRegister ? "立即登录" : "创建新账户"}
              </button>
            </p>
          </div>

          {!isRegister && (
            <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium">演示账户：</p>
              <p>邮箱: demo@example.com</p>
              <p>密码: password</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
