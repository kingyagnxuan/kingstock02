import { describe, it, expect } from "vitest";
import {
  cleanMarkdownText,
  convertStockCode,
  convertPriceNumbers,
  preprocessTextForSpeech,
} from "../speechUtils";

describe("speechUtils", () => {
  describe("cleanMarkdownText", () => {
    it("应该移除标题标记", () => {
      const text = "## 这是一个标题\n### 这是一个子标题";
      const result = cleanMarkdownText(text);
      expect(result).not.toContain("##");
      expect(result).not.toContain("###");
      expect(result).toContain("这是一个标题");
    });

    it("应该移除粗体标记", () => {
      const text = "这是**粗体**文本和__粗体__文本";
      const result = cleanMarkdownText(text);
      expect(result).toContain("粗体");
      expect(result).not.toContain("**");
      expect(result).not.toContain("__");
    });

    it("应该移除斜体标记", () => {
      const text = "这是*斜体*文本和_斜体_文本";
      const result = cleanMarkdownText(text);
      expect(result).toContain("斜体");
      expect(result).not.toContain("*");
    });

    it("应该移除代码标记", () => {
      const text = "这是`代码`文本";
      const result = cleanMarkdownText(text);
      expect(result).toContain("代码");
      expect(result).not.toContain("`");
    });

    it("应该移除链接标记", () => {
      const text = "这是[链接](https://example.com)文本";
      const result = cleanMarkdownText(text);
      expect(result).toContain("链接");
      expect(result).not.toContain("(https://");
    });

    it("应该移除列表标记", () => {
      const text = "- 项目1\n- 项目2\n1. 项目3";
      const result = cleanMarkdownText(text);
      expect(result).toContain("项目1");
      expect(result).not.toContain("- ");
      expect(result).not.toContain("1. ");
    });

    it("应该将换行符转换为句号", () => {
      const text = "第一句\n\n第二句";
      const result = cleanMarkdownText(text);
      expect(result).toContain("。");
    });
  });

  describe("convertStockCode", () => {
    it("应该将6位数字股票代码转换为逐位播报格式", () => {
      const text = "代码600516";
      const result = convertStockCode(text);
      expect(result).toContain("六零零五一六");
      expect(result).not.toContain("600516");
    });

    it("应该处理多个股票代码", () => {
      const text = "代码600516和代码000001";
      const result = convertStockCode(text);
      expect(result).toContain("六零零五一六");
      expect(result).toContain("零零零零零一");
    });

    it("应该处理不同的代码前缀", () => {
      const text = "stock code 600516";
      const result = convertStockCode(text);
      expect(result).toContain("六零零五一六");
    });

    it("应该保留非股票代码的数字", () => {
      const text = "这是一个123456的数字";
      const result = convertStockCode(text);
      // 123456不是股票代码格式，应该保留
      expect(result).toContain("123456");
    });
  });

  describe("convertPriceNumbers", () => {
    it("应该将价格数字转换为逐位播报格式", () => {
      const text = "股价是12.45元";
      const result = convertPriceNumbers(text);
      expect(result).toContain("一二点四五");
      expect(result).not.toContain("12.45");
    });

    it("应该处理多个价格", () => {
      const text = "昨天12.45元，今天13.67元";
      const result = convertPriceNumbers(text);
      expect(result).toContain("一二点四五");
      expect(result).toContain("一三点六七");
    });

    it("应该保留价格单位", () => {
      const text = "股价是12.45元";
      const result = convertPriceNumbers(text);
      expect(result).toContain("元");
    });

    it("应该处理没有单位的价格", () => {
      const text = "股价是12.45";
      const result = convertPriceNumbers(text);
      expect(result).toContain("一二点四五");
    });
  });

  describe("preprocessTextForSpeech", () => {
    it("应该综合处理文本", () => {
      const text = "## 股票分析\n代码**600516**的股价是12.45元";
      const result = preprocessTextForSpeech(text);
      
      // 应该移除Markdown标记
      expect(result).not.toContain("##");
      expect(result).not.toContain("**");
      
      // 应该转换股票代码
      expect(result).toContain("六零零五一六");
      
      // 应该转换价格
      expect(result).toContain("一二点四五");
    });

    it("应该移除多余的空白", () => {
      const text = "这是   一个   文本";
      const result = preprocessTextForSpeech(text);
      expect(result).not.toContain("   ");
    });

    it("应该替换特殊符号", () => {
      const text = "A & B / C + D - E × F ÷ G";
      const result = preprocessTextForSpeech(text);
      expect(result).toContain("和");
      expect(result).toContain("或");
      expect(result).toContain("加");
      expect(result).toContain("减");
      expect(result).toContain("乘");
      expect(result).toContain("除");
    });

    it("应该处理复杂的混合文本", () => {
      const text = `
        ## 市场分析
        
        - 上证指数：3968.84 (+0.09%)
        - 代码600516：12.45元 (+20%)
        
        **建议**：关注[热点板块](https://example.com)
      `;
      const result = preprocessTextForSpeech(text);
      
      // 验证关键信息被保留
      expect(result).toContain("市场分析");
      expect(result).toContain("上证指数");
      expect(result).toContain("六零零五一六");
      expect(result).toContain("一二点四五");
      expect(result).toContain("建议");
      expect(result).toContain("热点板块");
      
      // 验证Markdown被移除
      expect(result).not.toContain("##");
      expect(result).not.toContain("**");
      expect(result).not.toContain("[");
      expect(result).not.toContain("](");
    });
  });
});
