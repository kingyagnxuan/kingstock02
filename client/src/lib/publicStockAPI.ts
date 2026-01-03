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
 * 从新浪财经获取A股实时行情（已禁用CORS限制）
 * 注：由于CORS限制，此接口无法从浏览器直接调用
 * 实际应用中应该使用后端代理或专业API
 */
export async function getStockQuoteFromSina(code: string): Promise<StockQuote | null> {
  // 由于CORS限制，此接口已禁用
  // 在生产环境中应该使用后端代理或付费API
  return null;
}

/**
 * 从腾讯财经获取A股实时行情（已禁用CORS限制）
 * 注：由于CORS限制，此接口无法从浏览器直接调用
 * 实际应用中应该使用后端代理或专业API
 */
export async function getStockQuoteFromTencent(code: string): Promise<StockQuote | null> {
  // 由于CORS限制，此接口已禁用
  // 在生产环境中应该使用后端代理或付费API
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
