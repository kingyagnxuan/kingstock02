import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import HotSectorsCard from "@/components/HotSectorsCard";
import LimitUpTable from "@/components/LimitUpTable";
import MarketIndexCard from "@/components/MarketIndexCard";
import { useStockData } from "@/contexts/StockDataContext";
import { AlertTriangle, TrendingUp } from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";
import MarketNewsAndQuotes from "@/components/MarketNewsAndQuotes";
import { mockNotifications, mockMarketNews } from "@/lib/mockCommunityData";
import { useState } from "react";

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const { indices, hotSectors, limitUpStocks, report, lastUpdated } = useStockData();
  const [notifications, setNotifications] = useState(mockNotifications);

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  return (
    <DashboardLayout>
      <div className="fixed top-4 right-4 z-50">
        <NotificationCenter
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onClear={handleClearNotifications}
        />
      </div>
      <div className="space-y-3 md:space-y-4 lg:space-y-6">
        {/* Market Overview Section */}
        <section className="space-y-2 md:space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-2">
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 md:w-6 h-5 md:h-6 text-primary" />
              市场概览
            </h2>
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-xs">
              <div className="text-xs text-muted-foreground font-mono">
                {lastUpdated.toLocaleTimeString()}
              </div>
              <div className="hidden md:block text-muted-foreground">•</div>
              <div className="text-xs text-muted-foreground font-mono">
                {report.date}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
            {indices.map((index) => (
              <MarketIndexCard key={index.code} index={index} />
            ))}
          </div>

          {/* Limit Up Top 5 Card */}

        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
          {/* Left Column: Limit Up Stocks (2/3 width) */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4 lg:space-y-6">
            <LimitUpTable stocks={limitUpStocks} />
            
            {/* Analysis Report Preview */}
            <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                市场核心观点
              </h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {report.marketOutlook}
                </p>
                <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg mt-4">
                  <p className="text-primary font-medium m-0">
                    策略建议：{report.strategy}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hot Sectors & Info (1/3 width) */}
          <div className="space-y-3 md:space-y-4 lg:space-y-6">
            <HotSectorsCard sectors={hotSectors} />
            
            {/* Quick Actions / Promo */}
            <div className="bg-gradient-to-br from-primary/20 to-purple-600/20 border border-primary/20 rounded-xl p-3 md:p-4 lg:p-6 text-center space-y-2 md:space-y-3 relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-500" />
              <div className="relative z-10">
                <h3 className="text-base md:text-lg font-bold text-primary">获取深度研报</h3>
                <p className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2 mb-2 md:mb-3">
                  解锁更多涨停潜力股分析和买卖点建议
                </p>
                <a href="/research-reports" className="inline-block w-full">
                  <button className="bg-primary text-primary-foreground px-4 md:px-6 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 w-full">
                    立即查看
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
