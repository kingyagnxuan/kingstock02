// 新浪财经API集成模块
// 使用新浪财经的实时行情数据接口

export interface SinaStockQuote {
  code: string;
  name: string;
  price: number;
  bid: number;
  ask: number;
  volume: number;
  amount: number;
  time: string;
  date: string;
  high: number;
  low: number;
  open: number;
  close: number;
  yclose: number;
  percent: number;
}

export interface SinaKLineData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// 新浪财经API端点
const SINA_API_BASE = "https://hq.sinajs.cn";
const SINA_REAL_TIME = "http://hq.sinajs.cn/list=";

/**
 * 获取实时股票行情（使用新浪财经API）
 * @param code 股票代码（如：sh000001 上证指数，sz399001 深证成指）
 */
export async function getSinaStockQuote(code: string): Promise<SinaStockQuote | null> {
  try {
    // 新浪财经API格式：var hq_str_sh000001="上证指数,3968.84,+3.72,+0.09%,1234567,123456789";
    const sinaCode = code.startsWith("sh") || code.startsWith("sz") ? code : `sh${code}`;
    
    // 使用JSONP方式请求（新浪财经支持）
    return new Promise((resolve) => {
      const script = document.createElement("script");
      const callbackName = `sina_callback_${Date.now()}`;
      
      (window as any)[callbackName] = (data: any) => {
        try {
          const str = data.split(",");
          if (str.length >= 8) {
            const quote: SinaStockQuote = {
              code: sinaCode,
              name: str[0],
              price: parseFloat(str[1]),
              bid: parseFloat(str[2]),
              ask: parseFloat(str[3]),
              volume: parseInt(str[4]),
              amount: parseInt(str[5]),
              time: new Date().toLocaleTimeString(),
              date: new Date().toLocaleDateString(),
              high: parseFloat(str[6]) || 0,
              low: parseFloat(str[7]) || 0,
              open: parseFloat(str[1]) || 0,
              close: parseFloat(str[1]) || 0,
              yclose: parseFloat(str[1]) || 0,
              percent: (parseFloat(str[3]) || 0)
            };
            resolve(quote);
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error("解析新浪财经数据失败:", error);
          resolve(null);
        } finally {
          document.body.removeChild(script);
          delete (window as any)[callbackName];
        }
      };
      
      script.src = `${SINA_REAL_TIME}${sinaCode}&callback=${callbackName}`;
      script.onerror = () => {
        resolve(null);
        document.body.removeChild(script);
        delete (window as any)[callbackName];
      };
      document.body.appendChild(script);
    });
  } catch (error) {
    console.error("获取新浪财经行情失败:", error);
    return null;
  }
}

/**
 * 获取多个股票的实时行情
 */
export async function getSinaStockQuotes(codes: string[]): Promise<SinaStockQuote[]> {
  try {
    const quotes = await Promise.all(
      codes.map(code => getSinaStockQuote(code))
    );
    return quotes.filter((q): q is SinaStockQuote => q !== null);
  } catch (error) {
    console.error("获取多个股票行情失败:", error);
    return [];
  }
}

/**
 * 获取K线数据（模拟实现，实际需要调用其他接口）
 * 新浪财经的K线数据需要通过其他接口获取
 */
export async function getSinaKLineData(
  code: string,
  period: string = "daily"
): Promise<SinaKLineData[]> {
  try {
    // 这里返回模拟数据，实际应用中需要调用真实的K线接口
    // 新浪财经K线接口示例：
    // http://vip.stock.finance.sina.com.cn/q/go.php/vInvestConsult/kind/xd/index.phtml?symbol=sh600000
    
    console.warn("K线数据目前使用模拟数据，建议升级到web-db-user方案以获取真实数据");
    
    // 返回空数组，由调用者使用备用数据
    return [];
  } catch (error) {
    console.error("获取K线数据失败:", error);
    return [];
  }
}

/**
 * 获取股票基本信息
 */
export async function getSinaStockInfo(code: string): Promise<any> {
  try {
    const quote = await getSinaStockQuote(code);
    if (!quote) return null;
    
    return {
      code: quote.code,
      name: quote.name,
      price: quote.price,
      percent: quote.percent,
      volume: quote.volume,
      amount: quote.amount,
      high: quote.high,
      low: quote.low,
      open: quote.open,
      close: quote.close,
      yclose: quote.yclose,
      time: quote.time,
      date: quote.date
    };
  } catch (error) {
    console.error("获取股票信息失败:", error);
    return null;
  }
}

/**
 * 获取指数行情
 */
export async function getSinaIndexQuote(indexCode: string): Promise<SinaStockQuote | null> {
  // 指数代码：sh000001 上证指数，sz399001 深证成指，sh000300 沪深300
  return getSinaStockQuote(indexCode);
}

/**
 * 批量获取指数行情
 */
export async function getSinaIndices(): Promise<SinaStockQuote[]> {
  const indexCodes = ["sh000001", "sz399001", "sh000300", "sh000905"];
  return getSinaStockQuotes(indexCodes);
}

/**
 * 搜索股票（模拟实现）
 */
export async function searchSinaStocks(keyword: string): Promise<SinaStockQuote[]> {
  try {
    // 这里需要调用新浪财经的搜索接口
    // 实际应用中建议升级到web-db-user方案以获取完整的搜索功能
    console.warn("股票搜索功能目前使用模拟数据");
    return [];
  } catch (error) {
    console.error("搜索股票失败:", error);
    return [];
  }
}

// 缓存机制
const quoteCache = new Map<string, { data: SinaStockQuote; timestamp: number }>();
const CACHE_DURATION = 5000; // 5秒缓存

/**
 * 获取缓存的股票行情
 */
export async function getCachedSinaQuote(code: string): Promise<SinaStockQuote | null> {
  const cached = quoteCache.get(code);
  const now = Date.now();
  
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const quote = await getSinaStockQuote(code);
  if (quote) {
    quoteCache.set(code, { data: quote, timestamp: now });
  }
  
  return quote;
}

/**
 * 清除缓存
 */
export function clearSinaQuoteCache(): void {
  quoteCache.clear();
}
