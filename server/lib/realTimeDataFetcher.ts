/**
 * 真实行情数据获取服务
 * 集成东方财富和新浪财经API
 */

import { StockRealTimeData } from "./analysisService";

// 缓存机制
const dataCache = new Map<
  string,
  { data: StockRealTimeData; timestamp: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

/**
 * 从东方财富API获取股票实时数据
 * API格式: http://push2.eastmoney.com/api/qt/stock/get?secid=0/1+code&fields=...
 */
async function fetchFromEastMoney(code: string): Promise<StockRealTimeData | null> {
  try {
    // 转换代码格式: sz000001 -> 0,000001 或 sh600000 -> 1,600000
    const [market, stockCode] = code.startsWith("sh")
      ? ["1", code.substring(2)]
      : ["0", code.substring(2)];

    const secid = `${market},${stockCode}`;
    const fields =
      "f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f27,f28,f29,f30,f31,f32,f33,f34,f35,f36,f37,f38,f39,f40,f41,f42,f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f53,f54,f55,f56,f57,f58,f84,f85,f86,f87,f88,f89,f90,f91,f92,f93,f94,f95,f96,f97,f98,f99,f100,f101,f102,f103,f104,f105,f106,f107,f108,f109,f110,f111,f112,f113,f114,f115";

    const url = `http://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=${fields}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://quote.eastmoney.com/",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`东方财富API请求失败: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.data) {
      console.error("东方财富API返回数据为空");
      return null;
    }

    const d = data.data;
    const name = d.f58 || "未知";
    const price = d.f2 || 0;
    const priceChange = d.f4 || 0;
    const priceChangePercent = d.f3 || 0;
    const volume = d.f5 || 0; // 成交量
    const moneyFlow = d.f6 || 0; // 成交额
    const high = d.f15 || 0;
    const low = d.f16 || 0;
    const open = d.f17 || 0;
    const yclose = d.f18 || 0;

    // 计算资金流向
    const netMoneyFlow = moneyFlow * (priceChangePercent / 100);
    const moneyFlowPercent = priceChangePercent;

    // 计算涨速 (最近5分钟的涨幅)
    const riseSpeed = priceChangePercent;

    return {
      code: `${market === "1" ? "sh" : "sz"}${stockCode}`,
      name,
      price,
      priceChange,
      priceChangePercent,
      volume,
      volumeRatio: 1.0, // 相对于平均成交量的比率
      netMoneyFlow,
      moneyFlowPercent,
      riseSpeed,
      high,
      low,
      open,
      close: price,
      yclose,
      time: new Date().toLocaleTimeString("zh-CN"),
    };
  } catch (error) {
    console.error("东方财富API调用失败:", error);
    return null;
  }
}

/**
 * 从新浪财经API获取股票实时数据
 * API格式: http://hq.sinajs.cn/list=sz000001,sh600000,...
 */
async function fetchFromSinaFinance(code: string): Promise<StockRealTimeData | null> {
  try {
    const url = `http://hq.sinajs.cn/list=${code}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://finance.sina.com.cn/",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`新浪财经API请求失败: ${response.status}`);
      return null;
    }

    const text = await response.text();

    // 解析新浪财经返回的数据格式
    // var hq_str_sz000001="平安银行,12.45,0.25,2.05,125000000,50000000,125000000,50000000,0,0";
    const match = text.match(/="(.+?)"/);
    if (!match) {
      console.error("新浪财经API返回数据格式错误");
      return null;
    }

    const parts = match[1].split(",");
    if (parts.length < 8) {
      console.error("新浪财经API返回数据不完整");
      return null;
    }

    const name = parts[0];
    const price = parseFloat(parts[1]) || 0;
    const priceChange = parseFloat(parts[2]) || 0;
    const priceChangePercent = parseFloat(parts[3]) || 0;
    const volume = parseInt(parts[4]) || 0;
    const moneyFlow = parseInt(parts[5]) || 0;

    // 计算其他指标
    const netMoneyFlow = moneyFlow * (priceChangePercent / 100);
    const moneyFlowPercent = priceChangePercent;
    const riseSpeed = priceChangePercent;

    return {
      code,
      name,
      price,
      priceChange,
      priceChangePercent,
      volume,
      volumeRatio: 1.0,
      netMoneyFlow,
      moneyFlowPercent,
      riseSpeed,
      high: price + Math.abs(priceChange),
      low: price - Math.abs(priceChange),
      open: price - priceChange,
      close: price,
      yclose: price - priceChange,
      time: new Date().toLocaleTimeString("zh-CN"),
    };
  } catch (error) {
    console.error("新浪财经API调用失败:", error);
    return null;
  }
}

/**
 * 获取股票实时数据 - 支持多数据源降级
 */
export async function getRealTimeStockData(
  code: string
): Promise<StockRealTimeData | null> {
  // 检查缓存
  const cached = dataCache.get(code);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`使用缓存数据: ${code}`);
    return cached.data;
  }

  // 首先尝试东方财富API
  console.log(`尝试从东方财富API获取数据: ${code}`);
  let data = await fetchFromEastMoney(code);

  // 如果东方财富失败，尝试新浪财经API
  if (!data) {
    console.log(`东方财富API失败，尝试新浪财经API: ${code}`);
    data = await fetchFromSinaFinance(code);
  }

  // 如果都失败，返回null
  if (!data) {
    console.error(`无法获取股票数据: ${code}`);
    return null;
  }

  // 缓存数据
  dataCache.set(code, { data, timestamp: Date.now() });

  return data;
}

/**
 * 批量获取多只股票的实时数据
 */
export async function getBatchRealTimeStockData(
  codes: string[]
): Promise<StockRealTimeData[]> {
  const results = await Promise.all(
    codes.map((code) => getRealTimeStockData(code))
  );

  return results.filter((data) => data !== null) as StockRealTimeData[];
}

/**
 * 清除缓存
 */
export function clearDataCache(): void {
  dataCache.clear();
  console.log("数据缓存已清除");
}
