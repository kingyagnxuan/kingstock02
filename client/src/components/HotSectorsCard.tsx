import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HotSector } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

interface HotSectorsCardProps {
  sectors: HotSector[];
}

export default function HotSectorsCard({ sectors }: HotSectorsCardProps) {
  return (
    <Card className="bg-card/40 backdrop-blur-md border-border/50 h-full">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">热门板块资金流向</CardTitle>
            <p className="text-sm text-muted-foreground">主力资金净流入排行</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {sectors.map((sector, index) => (
          <div key={sector.name} className="space-y-2 group">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-5 h-5 rounded flex items-center justify-center text-xs font-bold font-mono",
                  index < 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </span>
                <span className="font-medium group-hover:text-primary transition-colors">{sector.name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-mono font-bold text-[var(--chart-1)]">
                  +{sector.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>龙头: <span className="text-foreground font-medium">{sector.leadingStock}</span></span>
              <span>净流入: <span className="text-[var(--chart-1)] font-mono">{sector.netInflow}亿</span></span>
            </div>
            
            <Progress 
              value={sector.changePercent * 10} 
              className="h-1.5 bg-muted/50" 
              
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
