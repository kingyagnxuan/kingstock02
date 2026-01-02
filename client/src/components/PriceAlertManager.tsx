import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { PriceAlert } from "@/lib/extendedTypes";
import { Bell, Trash2, X } from "lucide-react";
import { useState } from "react";
import { nanoid } from "nanoid";

interface PriceAlertManagerProps {
  stockCode: string;
  stockName: string;
  currentPrice: number;
}

export default function PriceAlertManager({
  stockCode,
  stockName,
  currentPrice,
}: PriceAlertManagerProps) {
  const { alerts, addAlert, removeAlert } = useWatchlist();
  const [targetPrice, setTargetPrice] = useState<string>("");
  const [alertType, setAlertType] = useState<"above" | "below">("above");
  const [isOpen, setIsOpen] = useState(false);

  const stockAlerts = alerts.filter(a => a.code === stockCode);

  const handleAddAlert = () => {
    if (!targetPrice) return;

    const newAlert: PriceAlert = {
      id: nanoid(),
      code: stockCode,
      name: stockName,
      targetPrice: parseFloat(targetPrice),
      alertType,
      isActive: true,
      createdAt: new Date()
    };

    addAlert(newAlert);
    setTargetPrice("");
    setAlertType("above");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          价格预警
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8"
        >
          {isOpen ? "关闭" : "添加预警"}
        </Button>
      </div>

      {isOpen && (
        <Card className="bg-muted/30 border-border/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="目标价格"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                step="0.01"
                className="flex-1"
              />
              <Select value={alertType} onValueChange={(value: any) => setAlertType(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">高于</SelectItem>
                  <SelectItem value="below">低于</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddAlert} size="sm" className="px-4">
                设置
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              当 {stockName} 的价格 {alertType === "above" ? "高于" : "低于"} {targetPrice || "目标价格"} 时，您将收到通知
            </p>
          </CardContent>
        </Card>
      )}

      {stockAlerts.length > 0 && (
        <div className="space-y-2">
          {stockAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-muted/30 rounded-lg p-3 flex items-center justify-between border border-border/50"
            >
              <div className="flex items-center gap-3 flex-1">
                <Badge
                  variant="outline"
                  className={alert.alertType === "above" ? "border-green-500/50 text-green-500" : "border-red-500/50 text-red-500"}
                >
                  {alert.alertType === "above" ? "↑" : "↓"} {alert.targetPrice.toFixed(2)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {alert.triggeredAt ? (
                    <span className="text-green-500">已触发 • {alert.triggeredAt.toLocaleString()}</span>
                  ) : (
                    <span>等待触发 • 当前 {currentPrice.toFixed(2)}</span>
                  )}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAlert(alert.id)}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {stockAlerts.length === 0 && !isOpen && (
        <p className="text-xs text-muted-foreground italic">暂无预警设置</p>
      )}
    </div>
  );
}
