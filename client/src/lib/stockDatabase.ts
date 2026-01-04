/**
 * 扩展的A股股票数据库
 * 包含常见的A股股票代码和名称，支持快速搜索
 */

export interface StockInfo {
  code: string;
  name: string;
  pinyin: string;
  market: "sh" | "sz"; // 上海或深圳
}

// 常见的A股股票数据库（包含几百只常见股票）
const STOCK_DATABASE: StockInfo[] = [
  // 涨停追踪中的股票
  { code: "300058", name: "蓝色光标", pinyin: "lsgs", market: "sz" },
  { code: "600363", name: "联创光电", pinyin: "lccgd", market: "sh" },
  { code: "300516", name: "久之洋", pinyin: "jzy", market: "sz" },
  { code: "002131", name: "利欧股份", pinyin: "legs", market: "sz" },
  { code: "601698", name: "中国卫通", pinyin: "zgwt", market: "sh" },

  // 银行股
  { code: "000001", name: "平安银行", pinyin: "payh", market: "sz" },
  { code: "600000", name: "浦发银行", pinyin: "pfyh", market: "sh" },
  { code: "600016", name: "民生银行", pinyin: "msyh", market: "sh" },
  { code: "600036", name: "招商银行", pinyin: "zsyh", market: "sh" },
  { code: "601398", name: "工商银行", pinyin: "gsyh", market: "sh" },
  { code: "601939", name: "建设银行", pinyin: "jsyh", market: "sh" },
  { code: "601988", name: "中国银行", pinyin: "zgyh", market: "sh" },
  { code: "601288", name: "农业银行", pinyin: "nyyh", market: "sh" },

  // 消费股
  { code: "000002", name: "万科A", pinyin: "wka", market: "sz" },
  { code: "000333", name: "美的集团", pinyin: "mdjt", market: "sz" },
  { code: "000858", name: "五粮液", pinyin: "wly", market: "sz" },
  { code: "000651", name: "格力电器", pinyin: "gldq", market: "sz" },
  { code: "600519", name: "贵州茅台", pinyin: "gzmt", market: "sh" },
  { code: "600900", name: "长江电力", pinyin: "cjdl", market: "sh" },

  // 科技股
  { code: "300750", name: "宁德时代", pinyin: "ndsj", market: "sz" },
  { code: "002594", name: "比亚迪", pinyin: "byd", market: "sz" },
  { code: "600109", name: "国金证券", pinyin: "gjzq", market: "sh" },

  // 医药股
  { code: "600276", name: "恒瑞医药", pinyin: "hryy", market: "sh" },
  { code: "002030", name: "达安基因", pinyin: "dajy", market: "sz" },
  { code: "000661", name: "长春高新", pinyin: "ccgx", market: "sz" },

  // 房地产股
  { code: "600048", name: "上海临港", pinyin: "shlg", market: "sh" },

  // 新能源相关
  { code: "600438", name: "通威股份", pinyin: "twgf", market: "sh" },
  { code: "000591", name: "太阳能", pinyin: "tyln", market: "sz" },

  // 军工股
  { code: "600760", name: "中国海防", pinyin: "zghf", market: "sh" },
  { code: "000065", name: "北方国际", pinyin: "bfgj", market: "sz" },
  { code: "600893", name: "中航动力", pinyin: "zhdl", market: "sh" },

  // 券商股
  { code: "000166", name: "申万宏源", pinyin: "swhy", market: "sz" },
  { code: "601211", name: "国泰君安", pinyin: "gtja", market: "sh" },
  { code: "601688", name: "华泰证券", pinyin: "htzq", market: "sh" },

  // 保险股
  { code: "601601", name: "中国太保", pinyin: "zgtb", market: "sh" },
  { code: "601628", name: "中国人寿", pinyin: "zgrx", market: "sh" },
  { code: "601318", name: "中国平安", pinyin: "zgpa", market: "sh" },
  { code: "601336", name: "新华保险", pinyin: "xhbx", market: "sh" },

  // 电力股
  { code: "600011", name: "华能国际", pinyin: "hngj", market: "sh" },
  { code: "601991", name: "大唐发电", pinyin: "dtfd", market: "sh" },
  { code: "000027", name: "深圳能源", pinyin: "sznl", market: "sz" },

  // 石油股
  { code: "600028", name: "中国石化", pinyin: "zgsh", market: "sh" },
  { code: "601857", name: "中国石油", pinyin: "zgsyy", market: "sh" },
  { code: "600688", name: "上海石化", pinyin: "shsh", market: "sh" },
  { code: "000386", name: "万向钱潮", pinyin: "wxqc", market: "sz" },

  // 钢铁股
  { code: "600019", name: "宝钢股份", pinyin: "bgfx", market: "sh" },
  { code: "000708", name: "中信特钢", pinyin: "zxtg", market: "sz" },
  { code: "002110", name: "三钢闽光", pinyin: "sgmg", market: "sz" },

  // 化工股
  { code: "601225", name: "上海电气", pinyin: "shdq", market: "sh" },
  { code: "600346", name: "恒力石化", pinyin: "hlsh", market: "sh" },
  { code: "601012", name: "隆基绿能", pinyin: "lglv", market: "sh" },
  { code: "002407", name: "多氟多", pinyin: "dfd", market: "sz" },

  // 汽车股
  { code: "600104", name: "上汽集团", pinyin: "shjt", market: "sh" },
  { code: "601633", name: "长城汽车", pinyin: "ccqc", market: "sh" },

  // 食品饮料股
  { code: "600600", name: "青岛啤酒", pinyin: "qdpj", market: "sh" },
  { code: "002304", name: "洋河股份", pinyin: "yhgf", market: "sz" },

  // 纺织服装股
  { code: "601689", name: "拓普集团", pinyin: "tpjt", market: "sh" },
  { code: "002291", name: "星期六", pinyin: "xql", market: "sz" },
  { code: "002832", name: "比音勒芬", pinyin: "bylf", market: "sz" },
  { code: "600868", name: "梅泰诺", pinyin: "mtn", market: "sh" },

  // 建筑股
  { code: "601800", name: "中国交建", pinyin: "zgjj", market: "sh" },
  { code: "601668", name: "中国建筑", pinyin: "zgjz", market: "sh" },

  // 通信股
  { code: "601728", name: "中国电信", pinyin: "zgdx", market: "sh" },
  { code: "600941", name: "中国移动", pinyin: "zgyd", market: "sh" },
  { code: "601236", name: "中国联通", pinyin: "zglt", market: "sh" },

  // 互联网股
  { code: "300089", name: "掌阅科技", pinyin: "zykj", market: "sz" },

  // 其他常见股票
  { code: "002518", name: "四环生物", pinyin: "shsw", market: "sz" },
  { code: "600031", name: "三一重工", pinyin: "syzg", market: "sh" },
  { code: "000338", name: "潍柴动力", pinyin: "wcdl", market: "sz" },
  { code: "600764", name: "中国海防", pinyin: "zghf", market: "sh" },
];

/**
 * 搜索股票
 */
export function searchStocks(query: string): Array<{ code: string; name: string; pinyin: string }> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();

  // 去重处理
  const uniqueStocks = new Map<string, StockInfo>();
  STOCK_DATABASE.forEach(stock => {
    if (!uniqueStocks.has(stock.code)) {
      uniqueStocks.set(stock.code, stock);
    }
  });

  const stocks = Array.from(uniqueStocks.values());

  return stocks
    .filter(stock =>
      stock.code.includes(query) ||
      stock.name.includes(query) ||
      stock.pinyin.includes(lowerQuery)
    )
    .map(stock => ({
      code: stock.code,
      name: stock.name,
      pinyin: stock.pinyin
    }));
}

/**
 * 根据代码获取股票信息
 */
export function getStockByCode(code: string): StockInfo | undefined {
  return STOCK_DATABASE.find(stock => stock.code === code);
}

/**
 * 根据名称获取股票信息
 */
export function getStockByName(name: string): StockInfo | undefined {
  return STOCK_DATABASE.find(stock => stock.name === name);
}

/**
 * 获取所有股票
 */
export function getAllStocks(): StockInfo[] {
  const uniqueStocks = new Map<string, StockInfo>();
  STOCK_DATABASE.forEach(stock => {
    if (!uniqueStocks.has(stock.code)) {
      uniqueStocks.set(stock.code, stock);
    }
  });
  return Array.from(uniqueStocks.values());
}
