// 深度研报数据模块
export interface ResearchReport {
  id: string;
  title: string;
  date: string;
  author: string;
  category: string;
  content: string;
  keyPoints: string[];
  stocks: {
    code: string;
    name: string;
    rating: string;
    targetPrice: number;
    currentPrice: number;
  }[];
  marketOutlook: string;
  riskFactors: string[];
}

export const mockResearchReports: ResearchReport[] = [
  {
    id: "report-001",
    title: "AI芯片产业链投资机会分析",
    date: "2026-01-02",
    author: "研究部",
    category: "行业研究",
    content: `
    当前AI芯片产业处于高速发展阶段，市场需求持续增长。随着大模型应用的普及，
    对高性能芯片的需求呈指数级增长。国内芯片企业在技术积累和产能扩张方面取得
    显著进展，有望在中高端市场实现突破。
    
    产业链分析：
    1. 上游芯片设计：国内企业技术水平不断提升，与国际先进水平差距逐步缩小
    2. 中游制造：产能持续扩张，良率稳步提高
    3. 下游应用：云计算、数据中心、消费电子等领域需求旺盛
    
    投资建议：
    - 重点关注芯片设计龙头企业，具有较强的技术积累和市场地位
    - 关注产能扩张受益的制造企业
    - 关注应用端的创新企业
    `,
    keyPoints: [
      "AI芯片需求保持高增长，市场空间广阔",
      "国内企业技术进步明显，竞争力不断增强",
      "产业链各环节均有投资机会",
      "政策支持力度大，产业发展有保障"
    ],
    stocks: [
      { code: "688008", name: "澜起科技", rating: "买入", targetPrice: 85.5, currentPrice: 72.3 },
      { code: "688126", name: "沪硅产业", rating: "买入", targetPrice: 92.0, currentPrice: 78.6 },
      { code: "688981", name: "中芯国际", rating: "增持", targetPrice: 145.0, currentPrice: 128.5 }
    ],
    marketOutlook: "AI芯片产业处于黄金发展期，产业链投资机会丰富",
    riskFactors: [
      "国际贸易摩擦可能影响产业链",
      "技术进步不及预期",
      "市场竞争加剧导致利润下滑"
    ]
  },
  {
    id: "report-002",
    title: "新能源汽车产业链深度研究",
    date: "2026-01-02",
    author: "研究部",
    category: "行业研究",
    content: `
    新能源汽车产业已进入快速发展阶段，市场渗透率持续提升。2025年全球新能源
    汽车销量预计超过2000万辆，同比增长超过20%。中国市场作为全球最大的新能源
    汽车市场，增长动力强劲。
    
    产业链分析：
    1. 整车企业：竞争格局逐步稳定，龙头企业优势明显
    2. 电池企业：产能持续扩张，成本下降空间有限
    3. 上游材料：锂、钴、镍等原材料价格波动
    
    投资建议：
    - 整车企业中关注销量增长稳定、毛利率改善的龙头
    - 电池企业中关注技术领先、成本控制能力强的企业
    - 上游材料企业中关注资源禀赋好、成本优势明显的企业
    `,
    keyPoints: [
      "新能源汽车渗透率持续提升，市场空间广阔",
      "整车企业竞争格局逐步稳定",
      "电池技术进步带来成本下降",
      "产业链各环节均面临重构"
    ],
    stocks: [
      { code: "001696", name: "宁德时代", rating: "买入", targetPrice: 185.0, currentPrice: 165.2 },
      { code: "600519", name: "贵州茅台", rating: "持有", targetPrice: 1850.0, currentPrice: 1750.5 },
      { code: "002594", name: "比亚迪", rating: "买入", targetPrice: 320.0, currentPrice: 285.6 }
    ],
    marketOutlook: "新能源汽车产业链投资机会丰富，龙头企业优势明显",
    riskFactors: [
      "原材料价格波动风险",
      "产能过剩导致价格战",
      "技术进步不及预期"
    ]
  },
  {
    id: "report-003",
    title: "消费板块投资策略分析",
    date: "2026-01-02",
    author: "研究部",
    category: "策略研究",
    content: `
    消费板块在经济增速放缓背景下表现相对稳定。随着居民收入增长和消费升级，
    消费需求结构不断优化。高端消费、服务消费、绿色消费等新兴消费领域增长
    快速。
    
    细分领域分析：
    1. 食品饮料：龙头企业品牌优势明显，提价能力强
    2. 家电：产品升级驱动增长，出口市场表现良好
    3. 服装纺织：消费升级带动品牌企业增长
    4. 商业零售：线上线下融合发展，渠道优势重要
    
    投资建议：
    - 关注品牌力强、提价能力强的龙头企业
    - 关注消费升级受益的细分领域龙头
    - 关注渠道优势明显的流通企业
    `,
    keyPoints: [
      "消费升级趋势明确，高端消费增长快速",
      "龙头企业品牌优势和定价权强",
      "线上线下融合成为发展方向",
      "出口市场表现良好，增长动力充足"
    ],
    stocks: [
      { code: "600519", name: "贵州茅台", rating: "买入", targetPrice: 1900.0, currentPrice: 1750.5 },
      { code: "000858", name: "五粮液", rating: "买入", targetPrice: 185.0, currentPrice: 165.3 },
      { code: "603288", name: "海天味业", rating: "增持", targetPrice: 52.0, currentPrice: 46.8 }
    ],
    marketOutlook: "消费板块长期增长动力充足，龙头企业估值合理",
    riskFactors: [
      "经济增速下行风险",
      "消费需求不及预期",
      "竞争加剧导致利润压力"
    ]
  }
];

export function getLatestReports(limit: number = 3): ResearchReport[] {
  return mockResearchReports.slice(0, limit);
}

export function getReportById(id: string): ResearchReport | undefined {
  return mockResearchReports.find(r => r.id === id);
}

export function searchReports(keyword: string): ResearchReport[] {
  const lowerKeyword = keyword.toLowerCase();
  return mockResearchReports.filter(r =>
    r.title.toLowerCase().includes(lowerKeyword) ||
    r.category.toLowerCase().includes(lowerKeyword) ||
    r.content.toLowerCase().includes(lowerKeyword)
  );
}
