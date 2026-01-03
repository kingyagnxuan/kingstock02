import { Card, CardContent } from "@/components/ui/card";
import { MarketIndex } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

interface MarketIndexCardProps {
  index: MarketIndex;
}

export default function MarketIndexCard({ index }: MarketIndexCardProps) {
  const isUp = index.change >= 0;

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 transition-all duration-300 group overflow-hidden relative">
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full transition-all duration-300 opacity-100",
        isUp ? "bg-[var(--chart-1)]" : "bg-[var(--chart-2)]",
        "group-hover:w-1.5"
      )} />
      
      <CardContent className="p-5 pl-7">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{index.name}</h3>
            <p className="text-xs font-mono text-muted-foreground/60">{index.code}</p>
          </div>
          <div className={cn(
            "px-2 py-1 rounded text-xs font-bold flex items-center gap-1",
            isUp 
              ? "bg-[var(--chart-1)]/10 text-[var(--chart-1)]" 
              : "bg-[var(--chart-2)]/10 text-[var(--chart-2)]"
          )}>
            {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(index.changePercent).toFixed(2)}%
          </div>
        </div>
        
        <div className="flex items-baseline gap-2 mt-1">
          <span className={cn(
            "text-2xl font-bold font-mono tracking-tight",
            isUp ? "text-[var(--chart-1)]" : "text-[var(--chart-2)]"
          )}>
            {index.value.toFixed(2)}
          </span>
          <span className={cn(
            "text-sm font-mono",
            isUp ? "text-[var(--chart-1)]/80" : "text-[var(--chart-2)]/80"
          )}>
            {index.change > 0 ? "+" : ""}{index.change.toFixed(2)}
          </span>
        </div>
      </CardContent>
      
      {/* Background Glow Effect */}
      <div className={cn(
        "absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-20",
        isUp ? "bg-[var(--chart-1)]" : "bg-[var(--chart-2)]"
      )} />
    </Card>
  );
}
