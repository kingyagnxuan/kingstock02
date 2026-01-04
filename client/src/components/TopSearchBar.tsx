import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { searchStocks } from "@/lib/stockDatabase";

export default function TopSearchBar() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ code: string; name: string; pinyin: string }>>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchStocks(query);
      setResults(searchResults);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  const handleSelectStock = (code: string) => {
    setLocation(`/stock/${code}`);
    setQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索股票代码、名称或拼音..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          className="pl-9 h-9 text-sm"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 bg-card/95 backdrop-blur-md border-border/50 shadow-lg">
          <CardContent className="p-0 max-h-80 overflow-y-auto">
            {results.map((stock) => (
              <div
                key={stock.code}
                onClick={() => handleSelectStock(stock.code)}
                className="px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/30 last:border-b-0 flex items-center justify-between group"
              >
                <div>
                  <p className="font-semibold text-sm">{stock.name}</p>
                  <p className="text-xs text-muted-foreground">{stock.code}</p>
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  →
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {isOpen && query && results.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 bg-card/95 backdrop-blur-md border-border/50 shadow-lg">
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            未找到匹配的股票
          </CardContent>
        </Card>
      )}
    </div>
  );
}
