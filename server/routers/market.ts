import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getLatestMarketInsight, createMarketInsight, getRecentStockRecommendations } from "../db";
import { invokeLLM } from "../_core/llm";

export const marketRouter = router({
  // 获取最新市场观点
  getLatestInsight: publicProcedure.query(async () => {
    const insight = await getLatestMarketInsight();
    if (!insight) {
      return null;
    }
    return {
      ...insight,
      hotSectors: JSON.parse(insight.hotSectors),
      riskFactors: JSON.parse(insight.riskFactors),
    };
  }),

  // 生成市场观点（基于LLM）
  generateInsight: publicProcedure
    .input(
      z.object({
        hotSectors: z.array(z.object({ name: z.string(), change: z.number() })),
        marketIndices: z.array(z.object({ name: z.string(), value: z.number(), change: z.number() })),
        topGainers: z.array(z.object({ code: z.string(), name: z.string(), change: z.number() })),
        topLosers: z.array(z.object({ code: z.string(), name: z.string(), change: z.number() })),
      })
    )
    .mutation(async ({ input }) => {
      // 构建提示词
      const prompt = `
你是一位资深的股市分析师。根据以下市场数据，生成一份专业的市场观点分析报告。

热点板块：
${input.hotSectors.map((s) => `- ${s.name}: ${s.change > 0 ? "↑" : "↓"} ${Math.abs(s.change).toFixed(2)}%`).join("\n")}

市场指数：
${input.marketIndices.map((m) => `- ${m.name}: ${m.value.toFixed(2)} (${m.change > 0 ? "↑" : "↓"} ${Math.abs(m.change).toFixed(2)}%)`).join("\n")}

涨幅前5：
${input.topGainers.map((s) => `- ${s.name}(${s.code}): ↑ ${s.change.toFixed(2)}%`).join("\n")}

跌幅前5：
${input.topLosers.map((s) => `- ${s.name}(${s.code}): ↓ ${Math.abs(s.change).toFixed(2)}%`).join("\n")}

请生成一份包含以下内容的分析报告（JSON格式）：
{
  "outlook": "市场总体观点（2-3句话）",
  "strategy": "投资策略建议（具体的买卖建议）",
  "riskFactors": ["风险因素1", "风险因素2", "风险因素3"]
}
      `;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "你是一位专业的股市分析师，提供准确、专业的市场分析。",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "market_insight",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  outlook: { type: "string", description: "市场观点" },
                  strategy: { type: "string", description: "投资策略" },
                  riskFactors: {
                    type: "array",
                    items: { type: "string" },
                    description: "风险因素列表",
                  },
                },
                required: ["outlook", "strategy", "riskFactors"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message.content;
        if (!content || typeof content !== "string") throw new Error("No response from LLM");

        const parsed = JSON.parse(content);

        // 保存到数据库
        const today = new Date().toISOString().split("T")[0];
        await createMarketInsight({
          date: today,
          outlook: parsed.outlook,
          strategy: parsed.strategy,
          hotSectors: JSON.stringify(input.hotSectors),
          riskFactors: JSON.stringify(parsed.riskFactors),
        });

        return {
          outlook: parsed.outlook,
          strategy: parsed.strategy,
          riskFactors: parsed.riskFactors,
          hotSectors: input.hotSectors,
        };
      } catch (error) {
        console.error("Failed to generate market insight:", error);
        throw error;
      }
    }),

  // 获取最近的股票推荐
  getRecentRecommendations: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const recommendations = await getRecentStockRecommendations(input.limit);
      return recommendations;
    }),
});
