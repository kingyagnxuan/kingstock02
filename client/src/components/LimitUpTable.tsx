import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Stock } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TrendingUp, Zap } from "lucide-react";

interface LimitUpTableProps {
  stocks: Stock[];
}

export default function LimitUpTable({ stocks }: LimitUpTableProps) {
  return (
    <Card className="bg-card/40 backdrop-blur-md border-border/50 overflow-hidden">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">涨停潜力股追踪</CardTitle>
              <p className="text-sm text-muted-foreground">实时监控市场强势资金流向</p>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary bg-primary/5">
            实时更新
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="w-[100px]">代码</TableHead>
              <TableHead>名称</TableHead>
              <TableHead className="text-right">现价</TableHead>
              <TableHead className="text-right">涨跌幅</TableHead>
              <TableHead className="text-right">封板时间</TableHead>
              <TableHead>板块</TableHead>
              <TableHead className="w-[300px]">涨停原因</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stocks.map((stock) => (
              <TableRow key={stock.code} className="hover:bg-muted/30 border-border/50 group transition-colors">
                <TableCell className="font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                  {stock.code}
                </TableCell>
                <TableCell className="font-medium text-lg">{stock.name}</TableCell>
                <TableCell className="text-right font-mono font-bold">
                  {stock.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge className={cn(
                    "font-mono font-bold border-0",
                    stock.changePercent >= 0 
                      ? "bg-[var(--chart-1)]/10 text-[var(--chart-1)] hover:bg-[var(--chart-1)]/20" 
                      : "bg-[var(--chart-2)]/10 text-[var(--chart-2)] hover:bg-[var(--chart-2)]/20"
                  )}>
                    +{stock.changePercent.toFixed(2)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {stock.limitUpTime || "-"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-secondary/50 hover:bg-secondary/80 transition-colors">
                    {stock.sector}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate" title={stock.reason}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-primary shrink-0" />
                    {stock.reason}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
