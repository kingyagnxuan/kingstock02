/**
 * 公开股票行情API集成模块
 * 使用免费的公开API获取实时数据（新浪财经、腾讯财经等）
 */

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  pe: number;
  currency: string;
  exchange: string;
}

export interface KLinePoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockChartData {
  symbol: string;
  name: string;
  currency: string;
  exchange: string;
  currentPrice: number;
  data: KLinePoint[];
  timestamp: Date;
}

/**
 * 从新浪财经获取A股实时行情
 * 使用新浪财经的公开接口
 */
export async function getStockQuoteFromSina(code: string): Promise<StockQuote | null> {
  try {
    // 新浪财经格式: sh600000 (上海) 或 sz000001 (深圳)
    const sinaCode = code.startsWith("6") ? `sh${code}` : `sz${code}`;
    
    // 使用新浪财经的公开接口
    const url = `https://hq.sinajs.cn/?list=${sinaCode}&_=${Date.now()}`;
    
    const response = await fetch(url);
    const text = await response.text();
    
    // 解析新浪财经返回的数据格式
    // 格式: var hq_str_sh600000="浦发银行,13.50,13.50,13.47,13.55,13.45,13.47,13.48,2000000,27000000";
    const match = text.match(/hq_str_[^=]*="([^"]+)"/);
    
    if (match && match[1]) {
      const data = match[1].split(",");
      
      if (data.length >= 8) {
        const name = data[0];
        const price = parseFloat(data[3]);
        const open = parseFloat(data[1]);
        const high = parseFloat(data[4]);
        const low = parseFloat(data[5]);
        const volume = parseInt(data[8]) || 0;
        const previousClose = parseFloat(data[2]);
        
        const change = price - previousClose;
        const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;
        
        return {
          symbol: code,
          name,
          price,
          change,
          changePercent,
          open,
          high,
          low,
          volume,
          marketCap: 0,
          pe: 0,
          currency: "CNY",
          exchange: code.startsWith("6") ? "SSE" : "SZSE"
        };
      }
    }
  } catch (error) {
    console.error(`从新浪财经获取${code}行情失败:`, error);
  }

  return null;
}

/**
 * 从腾讯财经获取A股实时行情
 */
export async function getStockQuoteFromTencent(code: string): Promise<StockQuote | null> {
  try {
    // 腾讯财经格式: sh600000 (上海) 或 sz000001 (深圳)
    const tencentCode = code.startsWith("6") ? `sh${code}` : `sz${code}`;
    
    // 使用腾讯财经的公开接口
    const url = `https://qt.gtimg.cn/q=${tencentCode}`;
    
    const response = await fetch(url);
    const text = await response.text();
    
    // 解析腾讯财经返回的数据格式
    // 格式: v_sh600000="浦发银行 sh600000 13.50 13.50 13.47 13.55 13.45 13.47 13.48 2000000 27000000 ...";
    const match = text.match(/v_[^=]*="([^"]+)"/);
    
    if (match && match[1]) {
      const data = match[1].split(" ");
      
      if (data.length >= 8) {
        const name = data[0];
        const price = parseFloat(data[3]);
        const open = parseFloat(data[4]);
        const high = parseFloat(data[5]);
        const low = parseFloat(data[6]);
        const volume = parseInt(data[9]) || 0;
        const previousClose = parseFloat(data[2]);
        
        const change = price - previousClose;
        const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;
        
        return {
          symbol: code,
          name,
          price,
          change,
          changePercent,
          open,
          high,
          low,
          volume,
          marketCap: 0,
          pe: 0,
          currency: "CNY",
          exchange: code.startsWith("6") ? "SSE" : "SZSE"
        };
      }
    }
  } catch (error) {
    console.error(`从腾讯财经获取${code}行情失败:`, error);
  }

  return null;
}

/**
 * 获取股票实时行情（自动选择数据源）
 */
export async function getStockQuote(code: string): Promise<StockQuote | null> {
  // 先尝试新浪财经
  let quote = await getStockQuoteFromSina(code);
  
  if (!quote) {
    // 如果新浪失败，尝试腾讯财经
    quote = await getStockQuoteFromTencent(code);
  }
  
  return quote;
}

/**
 * 从网络获取K线数据（使用模拟数据，因为公开API限制）
 * 实际应用中应该集成专业的付费API
 */
export async function getKLineData(
  code: string,
  period: "1d" | "1w" | "1m" = "1d",
  days: number = 60
): Promise<StockChartData | null> {
  try {
    // 先获取实时行情
    const quote = await getStockQuote(code);
    
    if (!quote) {
      return null;
    }

    // 生成模拟K线数据（实际应该从API获取）
    const klineData: KLinePoint[] = [];
    const now = new Date();
    let basePrice = quote.price;

    for (let i = days; i > 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const open = basePrice;
      const close = basePrice + (Math.random() - 0.5) * 2;
      const high = Math.max(open, close) + Math.random() * 1;
      const low = Math.min(open, close) - Math.random() * 1;
      const volume = Math.floor(Math.random() * 10000000);

      klineData.push({
        time: date.toISOString().split("T")[0],
        open,
        high,
        low,
        close,
        volume
      });

      basePrice = close;
    }

    return {
      symbol: code,
      name: quote.name,
      currency: quote.currency,
      exchange: quote.exchange,
      currentPrice: quote.price,
      data: klineData,
      timestamp: new Date()
    };
  } catch (error) {
    console.error(`获取${code}K线数据失败:`, error);
  }

  return null;
}

/**
 * 获取多只股票的行情
 */
export async function getMultipleStockQuotes(codes: string[]): Promise<StockQuote[]> {
  const quotes: StockQuote[] = [];

  for (const code of codes) {
    const quote = await getStockQuote(code);
    if (quote) {
      quotes.push(quote);
    }
    // 避免API限流，延迟200ms
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return quotes;
}

/**
 * 缓存管理
 */
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000; // 60秒缓存

export function getCachedData(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

export function setCachedData(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function clearCache(): void {
  cache.clear();
}
