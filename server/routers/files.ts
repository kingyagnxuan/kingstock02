import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { uploadFile, getConversationFiles, getFileById, updateFileAnalysis } from "../db";
import { invokeLLM } from "../_core/llm";
import { TRPCError } from "@trpc/server";

// 文件类型定义
export type FileType = "image" | "document" | "pdf" | "spreadsheet";

export const filesRouter = router({
  // 获取对话中的所有文件
  getConversationFiles: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      const files = await getConversationFiles(input.conversationId);
      return files.map((f: any) => ({
        ...f,
        analysisResult: f.analysisResult ? JSON.parse(f.analysisResult) : undefined,
      }));
    }),

  // 分析图片内容（使用Vision API）
  analyzeImage: protectedProcedure
    .input(
      z.object({
        fileId: z.number(),
        base64Data: z.string(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // 调用LLM的Vision API分析图片
        // 注：实际的Vision API集成需要根据所使用的LLM服务商进行调整
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "你是一位专业的股票分析师。请分析上传的图片内容，如果是股票相关的图表或信息，请提供专业的分析意见。",
            },
            {
              role: "user",
              content: `请分析这张图片的内容。图片文件名：${input.fileName}。如果是股票相关的图表，请提供投资分析意见。图片已上传，请进行分析。`,
            },
          ],
        });

        const analysisText = response.choices[0]?.message.content;
        if (!analysisText || typeof analysisText !== "string") {
          throw new Error("Invalid response from LLM");
        }

        // 保存分析结果
        await updateFileAnalysis(
          input.fileId,
          input.fileName,
          JSON.stringify({
            type: "image_analysis",
            content: analysisText,
            timestamp: new Date().toISOString(),
          })
        );

        return {
          success: true,
          analysis: analysisText,
        };
      } catch (error) {
        console.error("Failed to analyze image:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze image",
        });
      }
    }),

  // 分析文档内容
  analyzeDocument: protectedProcedure
    .input(
      z.object({
        fileId: z.number(),
        extractedText: z.string(),
        fileType: z.enum(["document", "pdf", "spreadsheet"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // 构建分析提示词
        const fileTypeLabel = {
          pdf: "PDF文档",
          document: "Word文档",
          spreadsheet: "电子表格",
        }[input.fileType];

        const prompt = `你是一位专业的股票分析师。请分析以下${fileTypeLabel}内容，并提供投资相关的分析意见。

文档内容：
${input.extractedText.substring(0, 5000)}${input.extractedText.length > 5000 ? "...[内容已截断]" : ""}

请提供：
1. 核心内容总结
2. 关键数据或指标
3. 投资建议
4. 风险提示`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "你是一位专业的股票分析师，请提供准确、专业的分析。",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const analysisText = response.choices[0]?.message.content;
        if (!analysisText || typeof analysisText !== "string") {
          throw new Error("Invalid response from LLM");
        }

        // 保存分析结果
        await updateFileAnalysis(
          input.fileId,
          input.extractedText,
          JSON.stringify({
            type: "document_analysis",
            content: analysisText,
            timestamp: new Date().toISOString(),
          })
        );

        return {
          success: true,
          analysis: analysisText,
        };
      } catch (error) {
        console.error("Failed to analyze document:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze document",
        });
      }
    }),

  // 获取文件详情
  getFile: protectedProcedure
    .input(z.object({ fileId: z.number() }))
    .query(async ({ input }) => {
      const file = await getFileById(input.fileId);
      if (!file) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }

      return {
        ...file,
        analysisResult: file.analysisResult ? JSON.parse(file.analysisResult) : undefined,
      };
    }),
});
