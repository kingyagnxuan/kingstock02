import { cn } from "@/lib/utils";
import { Heart, Home, LineChart, BarChart3, Settings, MessageSquare } from "lucide-react";
import { Link, useLocation } from "wouter";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "市场概览", href: "/" },
    { icon: LineChart, label: "涨停追踪", href: "/limit-up" },
    { icon: Heart, label: "自选股", href: "/watchlist" },
    { icon: BarChart3, label: "AI准确率", href: "/analytics" },
    { icon: MessageSquare, label: "社区讨论", href: "/community" },
    { icon: Settings, label: "系统设置", href: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col fixed h-full z-10">
        <div className="p-6 flex items-center gap-3 border-b border-sidebar-border">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <img src="/images/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">StockTracker</h1>
            <p className="text-xs text-muted-foreground">A股涨停潜力追踪</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group cursor-pointer",
                    isActive
                      ? "bg-sidebar-accent text-primary shadow-sm border border-sidebar-border/50"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="bg-card/50 rounded-lg p-4 border border-border/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">系统状态</span>
              <span className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                在线
              </span>
            </div>
            <div className="text-xs font-mono text-muted-foreground/80">
              数据更新: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen bg-[url('/images/hero-bg.jpg')] bg-cover bg-fixed bg-center">
        <div className="min-h-screen bg-background/90 backdrop-blur-sm">
          <div className="container py-8 animate-in fade-in duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
