/**
 * AI模型自动选择和综合分析工具库
 * 根据用户问题的特性自动选择最适合的模型或综合多个模型的分析结果
 */

export interface ModelCapability {
  key: string;
  name: string;
  strengths: string[]; // 模型的优势领域
  speed: "fast" | "medium" | "slow";
  costEfficiency: "high" | "medium" | "low";
  contextLength: number;
}

export interface QuestionAnalysis {
  type: "technical" | "fundamental" | "sentiment" | "general" | "complex";
  complexity: "simple" | "medium" | "complex";
  requiresRealtime: boolean;
  requiresDeepAnalysis: boolean;
  suggestedModels: string[];
}

/**
 * 分析用户问题的特性
 */
export function analyzeQuestion(question: string): QuestionAnalysis {
  const lowerQuestion = question.toLowerCase();

  // 定义关键词
  const technicalKeywords = ["k线", "支撑", "阻力", "均线", "macd", "rsi", "技术面", "图表", "走势"];
  const fundamentalKeywords = ["财报", "eps", "pe", "pb", "roe", "净利润", "营收", "基本面", "估值"];
  const sentimentKeywords = ["情绪", "市场", "风险", "机会", "预期", "看好", "看空", "信心"];
  const realtimeKeywords = ["现在", "今天", "最新", "实时", "当前", "马上", "立即"];
  const complexKeywords = ["对比", "分析", "策略", "建议", "方案", "综合", "评估"];

  let type: QuestionAnalysis["type"] = "general";
  let requiresRealtime = false;
  let requiresDeepAnalysis = false;

  // 判断问题类型
  if (technicalKeywords.some(kw => lowerQuestion.includes(kw))) {
    type = "technical";
  } else if (fundamentalKeywords.some(kw => lowerQuestion.includes(kw))) {
    type = "fundamental";
  } else if (sentimentKeywords.some(kw => lowerQuestion.includes(kw))) {
    type = "sentiment";
  } else if (complexKeywords.some(kw => lowerQuestion.includes(kw))) {
    type = "complex";
  }

  // 判断是否需要实时数据
  requiresRealtime = realtimeKeywords.some(kw => lowerQuestion.includes(kw));

  // 判断复杂度
  const complexity = question.length > 100 || question.split("。").length > 2 ? "complex" : 
                     question.length > 50 ? "medium" : "simple";

  // 判断是否需要深度分析
  requiresDeepAnalysis = complexity === "complex" || type === "complex" || 
                         type === "fundamental" || type === "technical";

  // 根据问题类型推荐模型
  const suggestedModels = selectModelsForQuestion(type, complexity, requiresRealtime, requiresDeepAnalysis);

  return {
    type,
    complexity: complexity as "simple" | "medium" | "complex",
    requiresRealtime,
    requiresDeepAnalysis,
    suggestedModels,
  };
}

/**
 * 根据问题特性选择最适合的模型
 */
function selectModelsForQuestion(
  type: QuestionAnalysis["type"],
  complexity: "simple" | "medium" | "complex",
  requiresRealtime: boolean,
  requiresDeepAnalysis: boolean
): string[] {
  const models: string[] = [];

  // 基础模型（快速、成本低）
  const fastModels = ["gemini-2.5-flash", "claude-3.5-haiku"];
  
  // 中等模型（平衡性能和成本）
  const balancedModels = ["claude-3.5-sonnet", "gemini-2.0-pro"];
  
  // 高级模型（深度分析）
  const advancedModels = ["claude-3-opus", "gpt-4o"];

  // 根据问题类型和复杂度选择模型
  if (complexity === "simple") {
    // 简单问题：使用快速模型
    models.push(...fastModels);
  } else if (complexity === "medium") {
    // 中等问题：使用平衡模型
    models.push(...balancedModels);
  } else {
    // 复杂问题：使用高级模型进行深度分析
    models.push(...advancedModels);
    // 复杂问题也可以加入平衡模型进行交叉验证
    if (type === "complex" || type === "fundamental") {
      models.push(...balancedModels);
    }
  }

  // 对于需要深度分析的问题，确保至少有一个高级模型
  if (requiresDeepAnalysis && !models.some(m => advancedModels.includes(m))) {
    models.unshift(advancedModels[0]);
  }

  // 去重并返回
  return Array.from(new Set(models));
}

/**
 * 综合多个模型的分析结果
 */
export function synthesizeAnalyses(
  analyses: Array<{ model: string; content: string }>,
  questionType: QuestionAnalysis["type"]
): string {
  if (analyses.length === 0) return "";
  if (analyses.length === 1) return analyses[0].content;

  // 构建综合分析
  let synthesized = "## 综合分析结果\n\n";

  // 添加多模型分析标记
  synthesized += `基于 ${analyses.length} 个AI模型的联合分析：\n\n`;

  // 按模型分别展示
  analyses.forEach((analysis, index) => {
    synthesized += `### ${analysis.model} 的分析\n`;
    synthesized += `${analysis.content}\n\n`;
  });

  // 添加综合观点
  synthesized += "### 综合观点\n";
  synthesized += generateSynthesizedView(analyses, questionType);

  return synthesized;
}

/**
 * 生成综合观点
 */
function generateSynthesizedView(
  analyses: Array<{ model: string; content: string }>,
  questionType: QuestionAnalysis["type"]
): string {
  let view = "";

  if (questionType === "technical") {
    view = "根据多个AI模型的技术面分析，综合考虑了K线形态、技术指标等因素。建议投资者结合自身风险承受能力，在确认支撑位后逐步建仓。\n";
  } else if (questionType === "fundamental") {
    view = "从基本面角度，多个模型综合评估了公司的财务状况、盈利能力和估值水平。建议投资者关注公司的后续财报表现和行业发展趋势。\n";
  } else if (questionType === "sentiment") {
    view = "市场情绪分析表明，投资者对该股票的关注度和预期存在一定分歧。建议投资者保持理性，不被短期情绪波动所影响。\n";
  } else if (questionType === "complex") {
    view = "这是一个综合性问题，涉及多个维度的分析。多个AI模型的观点基本一致，建议投资者综合考虑各个维度的因素，制定适合自己的投资策略。\n";
  } else {
    view = "多个AI模型的分析结果已为您呈现，建议您根据自身情况进行综合判断。\n";
  }

  return view;
}

/**
 * 根据问题自动选择最佳模型
 * 如果是简单问题，返回单个最快的模型
 * 如果是复杂问题，返回多个模型用于综合分析
 */
export function selectBestModels(question: string): {
  models: string[];
  shouldSynthesize: boolean;
  description: string;
} {
  const analysis = analyzeQuestion(question);

  const shouldSynthesize = analysis.complexity === "complex" || analysis.type === "complex";
  const models = analysis.suggestedModels;

  let description = "";
  if (shouldSynthesize) {
    description = `检测到复杂问题，将使用 ${models.length} 个AI模型进行联合分析，确保答案的准确性和全面性...`;
  } else {
    description = `检测到${analysis.complexity === "simple" ? "简单" : "中等"}问题，使用最优模型快速回答...`;
  }

  return {
    models,
    shouldSynthesize,
    description,
  };
}
