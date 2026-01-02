import { AIAnalysis } from "./types";

export const mockAIAnalyses: Record<string, AIAnalysis> = {
  "300058": {
    code: "300058",
    name: "蓝色光标",
    prediction: "UP",
    confidence: 85,
    keyFactors: [
      "AI营销概念热度持续上升",
      "主力资金连续净流入",
      "技术面突破关键阻力位",
      "板块内龙头地位稳固"
    ],
    nextDayOutlook: "预计继续维持强势，可能在9:30-10:00出现跳高开盘，建议关注第一波回调机会。",
    riskLevel: "MEDIUM"
  },
  "600363": {
    code: "600363",
    name: "联创光电",
    prediction: "UP",
    confidence: 78,
    keyFactors: [
      "商业航天政策支持力度加大",
      "资金突袭涨停显示强势",
      "双龙头地位（商业航天+AI医疗）",
      "成交量温和放大"
    ],
    nextDayOutlook: "午盘涨停后可能面临获利回吐，建议在10:00-11:00寻找低吸机会。",
    riskLevel: "MEDIUM"
  },
  "300516": {
    code: "300516",
    name: "久之洋",
    prediction: "UP",
    confidence: 92,
    keyFactors: [
      "创业板20%涨停罕见",
      "中船系+军工双重利好",
      "资金高度关注",
      "技术面形成强势突破"
    ],
    nextDayOutlook: "一字板可能性较大，建议提前排队。若开板，换手充分后在回封时介入。",
    riskLevel: "HIGH"
  },
  "002131": {
    code: "002131",
    name: "利欧股份",
    prediction: "UP",
    confidence: 72,
    keyFactors: [
      "新媒体营销龙头地位明确",
      "快手小红书商业化加速",
      "成交量创新高",
      "资金介入度高"
    ],
    nextDayOutlook: "涨停后可能高开，建议在回调至分时均线附近时轻仓介入。",
    riskLevel: "MEDIUM"
  },
  "601698": {
    code: "601698",
    name: "中国卫通",
    prediction: "NEUTRAL",
    confidence: 65,
    keyFactors: [
      "商业航天概念受益",
      "国企背景稳定性强",
      "成交量相对温和",
      "估值相对合理"
    ],
    nextDayOutlook: "可能继续小幅上涨，但涨幅有限。建议观望为主，等待更明确的方向。",
    riskLevel: "LOW"
  }
};
