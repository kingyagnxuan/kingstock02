import { AnalysisReport, HotSector, MarketIndex, Stock } from "./types";

export const mockIndices: MarketIndex[] = [
  { name: "上证指数", code: "000001", value: 3968.84, change: 3.72, changePercent: 0.09 },
  { name: "深证成指", code: "399001", value: 11890.25, change: -69.32, changePercent: -0.58 },
  { name: "创业板指", code: "399006", value: 3203.17, change: -39.88, changePercent: -1.23 },
  { name: "科创50", code: "000688", value: 1344.20, change: -15.63, changePercent: -1.15 },
];

export const mockHotSectors: HotSector[] = [
  { name: "AI应用", changePercent: 2.88, leadingStock: "蓝色光标", netInflow: 27.46 },
  { name: "商业航天", changePercent: 2.55, leadingStock: "联创光电", netInflow: 15.32 },
  { name: "军工信息化", changePercent: 2.22, leadingStock: "久之洋", netInflow: 11.05 },
  { name: "中船系", changePercent: 2.30, leadingStock: "中国海防", netInflow: 3.06 },
  { name: "AI语料", changePercent: 2.00, leadingStock: "掌阅科技", netInflow: 6.88 },
];

export const mockLimitUpStocks: Stock[] = [
  {
    code: "300058",
    name: "蓝色光标",
    price: 12.45,
    changePercent: 20.00,
    volume: 2500000,
    turnoverRate: 15.2,
    marketCap: 310.5,
    pe: 45.2,
    sector: "AI应用",
    isLimitUp: true,
    limitUpTime: "09:35:00",
    reason: "AI营销龙头，主力资金大幅流入"
  },
  {
    code: "600363",
    name: "联创光电",
    price: 38.88,
    changePercent: 10.00,
    volume: 850000,
    turnoverRate: 8.5,
    marketCap: 176.8,
    pe: 32.1,
    sector: "商业航天",
    isLimitUp: true,
    limitUpTime: "13:01:00",
    reason: "商业航天+AI医疗双龙头，午后直线涨停"
  },
  {
    code: "300516",
    name: "久之洋",
    price: 42.60,
    changePercent: 20.00,
    volume: 320000,
    turnoverRate: 12.8,
    marketCap: 76.8,
    pe: 55.4,
    sector: "军工信息化",
    isLimitUp: true,
    limitUpTime: "09:30:00",
    reason: "中船系+军工信息化龙头"
  },
  {
    code: "002131",
    name: "利欧股份",
    price: 3.52,
    changePercent: 10.00,
    volume: 5600000,
    turnoverRate: 18.5,
    marketCap: 238.2,
    pe: 28.6,
    sector: "新媒体营销",
    isLimitUp: true,
    limitUpTime: "10:15:00",
    reason: "新媒体营销龙头，受益于快手、小红书商业化"
  },
  {
    code: "601698",
    name: "中国卫通",
    price: 22.15,
    changePercent: 10.00,
    volume: 1200000,
    turnoverRate: 5.6,
    marketCap: 935.4,
    pe: 68.2,
    sector: "商业航天",
    isLimitUp: true,
    limitUpTime: "13:15:00",
    reason: "商业航天、国产航母概念龙头"
  }
];

export const mockReport: AnalysisReport = {
  date: "2026-01-02",
  marketOutlook: "当前A股市场在经历了2025年的显著上涨后，整体处于强势格局。沪指实现11连阳，市场情绪较为乐观。资金面上，主力资金向AI应用、商业航天、军工等热点板块聚集。技术面上，主要指数处于上升趋势，但短期涨幅较大，临近关键阻力位，可能面临一定的获利回吐压力。",
  strategy: "建议采取“聚焦热点、快进快出、严格止损”的短线交易策略。重点关注市场最强主线，即AI应用与新媒体营销和商业航天与军工信息化两大方向。",
  coreSectors: [
    {
      name: "AI应用与新媒体营销",
      logic: "AI产业链正从上游的硬件算力向下游的应用场景加速延伸。新媒体平台商业化进程提速，为AI营销带来巨大增量空间。",
      stocks: [
        {
          code: "300058",
          name: "蓝色光标",
          logic: "AI营销绝对龙头，多重概念叠加，资金介入最深。",
          buyPoint: "等待股价回调至5日均线附近企稳后介入，或在强势横盘突破时跟进。",
          stopLoss: "跌破5日均线或买入价下跌8%",
          rating: "Strong Buy"
        },
        {
          code: "002131",
          name: "利欧股份",
          logic: "新媒体营销龙头，受益于快手、小红书商业化。",
          buyPoint: "竞价高开幅度不大（3%以内）可轻仓试错，或等待盘中回调至分时均线附近。",
          stopLoss: "跌破买入价下方5%",
          rating: "Buy"
        }
      ]
    },
    {
      name: "商业航天与军工信息化",
      logic: "商业航天产业正迎来加速发展的黄金时期，政策与产业链共振。军工信息化作为国防现代化关键环节，战略价值凸显。",
      stocks: [
        {
          code: "600363",
          name: "联创光电",
          logic: "商业航天+AI医疗双龙头，资金突袭涨停，市场焦点。",
          buyPoint: "关注竞价情况，若高开封板可少量排队。若开板，在换手后回封瞬间介入。",
          stopLoss: "跌破当日涨停价或买入价下跌7%",
          rating: "Buy"
        },
        {
          code: "300516",
          name: "久之洋",
          logic: "中船系+军工信息化龙头，20%涨停，板块辨识度高。",
          buyPoint: "优先考虑排一字板。若开板，等待换手充分后在回封瞬间介入。",
          stopLoss: "跌破当日涨停价",
          rating: "Strong Buy"
        }
      ]
    }
  ]
};
