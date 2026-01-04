import type { StockDetail, KLineData, CashFlowData, FundFlow, TechnicalIndicators, StockNews, StockAnalysis, KLineResponse, KLinePeriod } from "./stockDetailTypes";

/**
 * 生成模拟K线数据
 */
export function generateMockKLineData(code: string, period: KLinePeriod, days: number = 60): KLineData[] {
  const data: KLineData[] = [];
  const now = new Date();
  let basePrice = 20 + Math.random() * 80;

  for (let i = days; i > 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const open = basePrice;
    const close = basePrice + (Math.random() - 0.5) * 2;
    const high = Math.max(open, close) + Math.random() * 1;
    const low = Math.min(open, close) - Math.random() * 1;
    const volume = Math.floor(Math.random() * 10000000);
    const amount = Math.floor(volume * close);

    data.push({
      time: date.toISOString().split("T")[0],
      open,
      high,
      low,
      close,
      volume,
      amount
    });

    basePrice = close;
  }

  return data;
}

/**
 * 获取模拟股票详情
 */
export function getMockStockDetail(code: string): StockDetail {
  const basePrice = 20 + Math.random() * 80;
  const change = (Math.random() - 0.5) * 4;

  return {
    code,
    name: `股票${code}`,
    price: basePrice + change,
    change,
    changePercent: (change / basePrice) * 100,
    open: basePrice,
    high: basePrice + 2,
    low: basePrice - 2,
    volume: Math.floor(Math.random() * 100000000),
    amount: Math.floor(Math.random() * 5000000000),
    pe: Math.floor(Math.random() * 50) + 5,
    pb: (Math.random() * 5 + 0.5).toFixed(2) as any,
    marketCap: Math.floor(Math.random() * 500000000000),
    circulation: Math.floor(Math.random() * 1000000000),
    totalShares: Math.floor(Math.random() * 2000000000),
    eps: (Math.random() * 2 + 0.1).toFixed(2) as any,
    bvps: (Math.random() * 10 + 1).toFixed(2) as any,
    roe: (Math.random() * 30 + 5).toFixed(2) as any,
    industry: ["医药生物", "电子", "化工", "机械设备", "电气设备"][Math.floor(Math.random() * 5)],
    description: `${code}是一家优秀的上市公司，主要从事相关业务。公司具有强大的竞争力和发展潜力。`,
    timestamp: new Date()
  };
}

/**
 * 获取模拟资金流向
 */
export function getMockCashFlow(code: string): CashFlowData[] {
  const data: CashFlowData[] = [];
  const now = new Date();

  for (let i = 9; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const inflow = Math.floor(Math.random() * 1000000000);
    const outflow = Math.floor(Math.random() * 800000000);
    const netInflow = inflow - outflow;

    data.push({
      date: date.toISOString().split("T")[0],
      inflow,
      outflow,
      netInflow
    });
  }

  return data;
}

/**
 * 获取模拟资金流向统计
 */
export function getMockFundFlow(code: string): FundFlow {
  return {
    superLarge: Math.floor(Math.random() * 500000000),
    large: Math.floor(Math.random() * 300000000),
    medium: Math.floor(Math.random() * 200000000),
    small: Math.floor(Math.random() * 100000000),
    timestamp: new Date()
  };
}

/**
 * 获取模拟技术指标
 */
export function getMockTechnicalIndicators(code: string): TechnicalIndicators {
  const basePrice = 20 + Math.random() * 80;

  return {
    ma5: basePrice + (Math.random() - 0.5) * 2,
    ma10: basePrice + (Math.random() - 0.5) * 3,
    ma20: basePrice + (Math.random() - 0.5) * 4,
    ma60: basePrice + (Math.random() - 0.5) * 5,
    rsi: Math.floor(Math.random() * 100),
    macd: {
      dif: (Math.random() - 0.5) * 2,
      dea: (Math.random() - 0.5) * 2,
      histogram: (Math.random() - 0.5) * 1
    },
    kdj: {
      k: Math.floor(Math.random() * 100),
      d: Math.floor(Math.random() * 100),
      j: Math.floor(Math.random() * 100)
    }
  };
}

/**
 * 获取模拟新闻
 */
export function getMockStockNews(code: string): StockNews[] {
  const titles = [
    `${code}发布季度业绩，同比增长20%`,
    `${code}获得新产品认证`,
    `${code}与知名企业签署战略合作协议`,
    `${code}投资者大会召开`,
    `${code}获得行业奖项`
  ];

  return titles.map((title, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);

    return {
      id: `news-${code}-${index}`,
      title,
      content: `关于"${title}"的详细内容。这是一条重要的市场资讯，可能会影响股票价格。`,
      source: ["新浪财经", "东方财富", "证券时报"][Math.floor(Math.random() * 3)],
      timestamp: date,
      importance: ["high", "medium", "low"][Math.floor(Math.random() * 3)] as any
    };
  });
}

/**
 * 获取模拟分析评级
 */
export function getMockStockAnalysis(code: string): StockAnalysis {
  const ratings = ["strong-buy", "buy", "hold", "sell", "strong-sell"];

  return {
    code,
    name: `股票${code}`,
    rating: ratings[Math.floor(Math.random() * ratings.length)] as any,
    targetPrice: 20 + Math.random() * 100,
    upside: Math.floor(Math.random() * 50),
    downside: Math.floor(Math.random() * 30),
    consensus: ["看好", "中性", "看空"][Math.floor(Math.random() * 3)],
    analystCount: Math.floor(Math.random() * 50) + 5
  };
}

/**
 * 获取K线数据
 */
export function getKLineData(code: string, period: KLinePeriod): KLineResponse {
  let days = 60;

  switch (period) {
    case "1m":
    case "5m":
    case "15m":
    case "30m":
      days = 1;
      break;
    case "1h":
      days = 5;
      break;
    case "1d":
      days = 60;
      break;
    case "1w":
      days = 240;
      break;
    case "1M":
      days = 720;
      break;
  }

  return {
    code,
    period,
    data: generateMockKLineData(code, period, days),
    timestamp: new Date()
  };
}

/**
 * 搜索股票
 */
export function searchStocks(query: string): Array<{ code: string; name: string; pinyin: string }> {
  const stocks = [
    // 涨停追踪中的股票
    { code: "300058", name: "蓝色光标", pinyin: "lsgs" },
    { code: "600363", name: "联创光电", pinyin: "lccgd" },
    { code: "300516", name: "久之洋", pinyin: "jzy" },
    { code: "002131", name: "利欧股份", pinyin: "legs" },
    { code: "601698", name: "中国卫通", pinyin: "zgwt" },
    // 热点板块中的龙头股票
    { code: "000001", name: "平安银行", pinyin: "payh" },
    { code: "000002", name: "万科A", pinyin: "wka" },
    { code: "000333", name: "美的集团", pinyin: "mdjt" },
    { code: "000858", name: "五粮液", pinyin: "wly" },
    { code: "000651", name: "格力电器", pinyin: "gldq" },
    { code: "000858", name: "五粮液", pinyin: "wly" },
    { code: "000858", name: "五粮液", pinyin: "wly" },
    // 其他热门股票
    { code: "600000", name: "浦发银行", pinyin: "pfyh" },
    { code: "600016", name: "民生银行", pinyin: "msyh" },
    { code: "600031", name: "三一重工", pinyin: "syzg" },
    { code: "600036", name: "招商银行", pinyin: "zsyh" },
    { code: "600048", name: "上海临港", pinyin: "shlg" },
    { code: "600109", name: "国金证券", pinyin: "gjzq" },
    { code: "600519", name: "贵州茅台", pinyin: "gzmt" },
    { code: "600900", name: "长江电力", pinyin: "cjdl" },
    { code: "601398", name: "工商银行", pinyin: "gsyh" },
    { code: "601939", name: "建设银行", pinyin: "jsyh" },
    { code: "600363", name: "中国海防", pinyin: "zghf" },
    { code: "300058", name: "掌阅科技", pinyin: "zykj" }
  ];

  const lowerQuery = query.toLowerCase();

  return stocks.filter(stock =>
    stock.code.includes(query) ||
    stock.name.includes(query) ||
    stock.pinyin.includes(lowerQuery)
  );
}
