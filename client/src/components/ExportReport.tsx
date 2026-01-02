import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { useStockData } from "@/contexts/StockDataContext";
import { ExportData } from "@/lib/extendedTypes";
import { Download, FileJson, FileText } from "lucide-react";
import { useState } from "react";

export default function ExportReport() {
  const { watchlist, getStockStatistics, getAIAccuracy, alerts } = useWatchlist();
  const { limitUpStocks } = useStockData();
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");

  const generateExportData = (): ExportData => {
    return {
      watchlist: watchlist
        .map(item => {
          const stock = limitUpStocks.find(s => s.code === item.code);
          return {
            code: item.code,
            name: item.name,
            currentPrice: stock?.price || 0,
            changePercent: stock?.changePercent || 0,
            sector: stock?.sector || "",
            aiPrediction: "待分析",
            addedDate: item.addedAt.toISOString().split("T")[0]
          };
        }),
      statistics: watchlist
        .map(item => getStockStatistics(item.code))
        .filter(Boolean) as any[],
      alerts: alerts.map(a => ({
        ...a,
        createdAt: a.createdAt
      })) as any[],
      generatedAt: new Date().toISOString()
    };
  };

  const exportAsJSON = () => {
    const data = generateExportData();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stock-tracker-report-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = () => {
    const data = generateExportData();
    let csv = "自选股报告\n\n";
    csv += "代码,名称,当前价格,涨跌幅(%),板块,添加日期\n";
    
    data.watchlist.forEach(item => {
      csv += `${item.code},${item.name},${item.currentPrice.toFixed(2)},${item.changePercent.toFixed(2)},${item.sector},${item.addedDate}\n`;
    });

    csv += "\n\n历史统计数据\n\n";
    csv += "代码,名称,涨停次数,成功率(%),平均收益(%),最大收益(%)\n";
    
    data.statistics.forEach(stat => {
      csv += `${stat.code},${stat.name},${stat.limitUpCount},${stat.limitUpSuccessRate},${stat.avgGainAfterLimitUp.toFixed(2)},${stat.maxGainAfterLimitUp.toFixed(2)}\n`;
    });

    csv += "\n\n价格预警\n\n";
    csv += "代码,名称,目标价格,预警类型,状态,创建时间\n";
    
    data.alerts.forEach(alert => {
      csv += `${alert.code},${alert.name},${alert.targetPrice.toFixed(2)},${alert.alertType === "above" ? "高于" : "低于"},${alert.triggeredAt ? "已触发" : "等待中"},${alert.createdAt}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stock-tracker-report-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (exportFormat === "json") {
      exportAsJSON();
    } else {
      exportAsCSV();
    }
  };

  const accuracy = getAIAccuracy();
  const hasData = watchlist.length > 0 || alerts.length > 0;

  return (
    <Card className="bg-card/40 backdrop-blur-md border-border/50">
      <CardHeader className="border-b border-border/50 pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          导出报告
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/20 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">自选股数</p>
            <p className="text-2xl font-bold text-primary">{watchlist.length}</p>
          </div>
          <div className="bg-muted/20 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">预警数</p>
            <p className="text-2xl font-bold text-yellow-500">{alerts.length}</p>
          </div>
          <div className="bg-muted/20 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">AI准确率</p>
            <p className="text-2xl font-bold text-green-500">{accuracy.accuracy.toFixed(1)}%</p>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <label className="text-sm font-medium">导出格式</label>
          <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <FileJson className="w-4 h-4" />
                  JSON格式
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  CSV格式（Excel）
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export Info */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">
            {exportFormat === "json"
              ? "导出为JSON格式，包含完整的自选股、统计数据和预警信息"
              : "导出为CSV格式，可直接在Excel中打开和编辑"}
          </p>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          className="w-full"
          disabled={watchlist.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          导出报告
        </Button>

        {watchlist.length === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            请先添加自选股后再导出
          </p>
        )}
      </CardContent>
    </Card>
  );
}
