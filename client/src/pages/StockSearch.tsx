import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { searchStocks, getMockStockDetail } from "@/lib/mockStockDetail";

export default function StockSearch() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ code: string; name: string; pinyin: string }>>([]);
  const [selectedStock, setSelectedStock] = useState<any>(null);

  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchStocks(query);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSelectStock = (code: string) => {
    const detail = getMockStockDetail(code);
    setSelectedStock(detail);
  };

  const handleViewDetail = (code: string) => {
    setLocation(`/stock-detail?code=${code}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Search Header */}
        <section className="space-y-4">
          <h1 className="text-3xl font-bold">股票搜索</h1>
          <p className="text-muted-foreground">支持股票代码、名称、拼音首字母搜索</p>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="输入股票代码、名称或拼音首字母..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-6">
          {/* Search Results */}
          <div className="col-span-2 space-y-4">
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg font-bold">
                  搜索结果 {results.length > 0 && `(${results.length})`}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {results.length > 0 ? (
                  <div className="divide-y divide-border/50">
                    {results.map((stock) => (
                      <div
                        key={stock.code}
                        className="p-4 hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => handleSelectStock(stock.code)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{stock.name}</p>
                            <p className="text-sm text-muted-foreground">{stock.code}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetail(stock.code);
                            }}
                          >
                            查看详情
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    {query ? "未找到匹配的股票" : "输入搜索条件查看结果"}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stock Preview */}
          <div>
            {selectedStock ? (
              <Card className="bg-card/40 backdrop-blur-md border-border/50 sticky top-24">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-lg font-bold">{selectedStock.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{selectedStock.code}</p>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">当前价格</p>
                    <p className="text-3xl font-bold">¥{selectedStock.price.toFixed(2)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">涨跌</p>
                      <div className="flex items-center gap-1">
                        {selectedStock.change > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <p
                          className={`font-semibold text-sm ${
                            selectedStock.change > 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {selectedStock.change > 0 ? "+" : ""}{selectedStock.change.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">涨幅</p>
                      <p
                        className={`font-semibold text-sm ${
                          selectedStock.changePercent > 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {selectedStock.changePercent > 0 ? "+" : ""}
                        {selectedStock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground mb-1">PE</p>
                      <p className="font-semibold">{selectedStock.pe.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">PB</p>
                      <p className="font-semibold">{selectedStock.pb}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground mb-1">成交量</p>
                      <p className="font-semibold">{(selectedStock.volume / 1000000).toFixed(2)}M</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">成交额</p>
                      <p className="font-semibold">{(selectedStock.amount / 100000000).toFixed(2)}亿</p>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleViewDetail(selectedStock.code)}
                  >
                    查看完整详情
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card/40 backdrop-blur-md border-border/50">
                <CardContent className="p-8 text-center text-muted-foreground">
                  选择一只股票查看预览
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
