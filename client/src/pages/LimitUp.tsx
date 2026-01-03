import DashboardLayout from "@/components/DashboardLayout";
import LimitUpCardGrid from "@/components/LimitUpCardGrid";
import { useStockData } from "@/contexts/StockDataContext";
import { Zap } from "lucide-react";

export default function LimitUp() {
  const { limitUpStocks } = useStockData();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            涨停潜力股追踪
          </h2>
          <p className="text-muted-foreground">
            支持筛选、排序、自选收藏和AI智能分析，精准捕捉每一个涨停机会
          </p>
        </section>

        <LimitUpCardGrid stocks={limitUpStocks} />
      </div>
    </DashboardLayout>
  );
}
