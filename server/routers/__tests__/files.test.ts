import { describe, it, expect, vi, beforeEach } from "vitest";
import * as db from "../../db";

// Mock数据库函数
vi.mock("../../db", () => ({
  uploadFile: vi.fn(),
  getConversationFiles: vi.fn(),
  getFileById: vi.fn(),
  updateFileAnalysis: vi.fn(),
}));

// Mock LLM函数
vi.mock("../../_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: "这是一份关于平安银行的分析报告。基于提供的数据，该股票显示出良好的基本面。",
        },
      },
    ],
  }),
}));

describe("Files Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("uploadFile", () => {
    it("should upload a file successfully", async () => {
      vi.mocked(db.uploadFile).mockResolvedValue(undefined);

      await db.uploadFile({
        conversationId: 1,
        messageId: 1,
        fileName: "test.pdf",
        fileType: "pdf",
        mimeType: "application/pdf",
        fileSize: 1024,
        s3Key: "files/test.pdf",
        s3Url: "https://s3.example.com/files/test.pdf",
      });

      expect(db.uploadFile).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: "test.pdf",
          fileType: "pdf",
        })
      );
    });
  });

  describe("getConversationFiles", () => {
    it("should get all files in a conversation", async () => {
      const mockFiles = [
        {
          id: 1,
          conversationId: 1,
          messageId: 1,
          fileName: "image.png",
          fileType: "image",
          mimeType: "image/png",
          fileSize: 2048,
          s3Key: "files/image.png",
          s3Url: "https://s3.example.com/files/image.png",
          extractedText: null,
          analysisResult: null,
          createdAt: new Date(),
        },
        {
          id: 2,
          conversationId: 1,
          messageId: 2,
          fileName: "document.pdf",
          fileType: "pdf",
          mimeType: "application/pdf",
          fileSize: 5120,
          s3Key: "files/document.pdf",
          s3Url: "https://s3.example.com/files/document.pdf",
          extractedText: "PDF内容...",
          analysisResult: JSON.stringify({ type: "document_analysis", content: "分析结果" }),
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.getConversationFiles).mockResolvedValue(mockFiles as any);

      const result = await db.getConversationFiles(1);

      expect(result).toHaveLength(2);
      expect(result[0].fileName).toBe("image.png");
      expect(result[1].fileName).toBe("document.pdf");
    });

    it("should return empty array if no files exist", async () => {
      vi.mocked(db.getConversationFiles).mockResolvedValue([]);

      const result = await db.getConversationFiles(999);

      expect(result).toHaveLength(0);
    });
  });

  describe("getFileById", () => {
    it("should get file by ID", async () => {
      const mockFile = {
        id: 1,
        conversationId: 1,
        messageId: 1,
        fileName: "image.png",
        fileType: "image",
        mimeType: "image/png",
        fileSize: 2048,
        s3Key: "files/image.png",
        s3Url: "https://s3.example.com/files/image.png",
        extractedText: null,
        analysisResult: null,
        createdAt: new Date(),
      };

      vi.mocked(db.getFileById).mockResolvedValue(mockFile as any);

      const result = await db.getFileById(1);

      expect(result).toBeDefined();
      expect(result?.fileName).toBe("image.png");
    });

    it("should return undefined if file not found", async () => {
      vi.mocked(db.getFileById).mockResolvedValue(undefined);

      const result = await db.getFileById(999);

      expect(result).toBeUndefined();
    });
  });

  describe("updateFileAnalysis", () => {
    it("should update file analysis results", async () => {
      vi.mocked(db.updateFileAnalysis).mockResolvedValue(undefined);

      const extractedText = "这是提取的文本内容";
      const analysisResult = JSON.stringify({
        type: "document_analysis",
        content: "这是分析结果",
      });

      await db.updateFileAnalysis(1, extractedText, analysisResult);

      expect(db.updateFileAnalysis).toHaveBeenCalledWith(1, extractedText, analysisResult);
    });
  });

  describe("File type validation", () => {
    it("should handle different file types", async () => {
      const fileTypes = ["image", "pdf", "document", "spreadsheet"];

      for (const fileType of fileTypes) {
        vi.mocked(db.uploadFile).mockResolvedValue(undefined);

        await db.uploadFile({
          conversationId: 1,
          messageId: 1,
          fileName: `test.${fileType}`,
          fileType: fileType as any,
          mimeType: "application/octet-stream",
          fileSize: 1024,
          s3Key: `files/test.${fileType}`,
          s3Url: `https://s3.example.com/files/test.${fileType}`,
        });

        expect(db.uploadFile).toHaveBeenCalled();
      }
    });
  });
});
