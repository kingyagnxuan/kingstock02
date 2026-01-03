/**
 * 多LLM模型支持
 * 支持OpenAI、Claude、Gemini等多种模型
 */

import { ENV } from "./env";

export type LLMProvider = "openai" | "claude" | "gemini" | "deepseek" | "qwen";

export interface LLMModelConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  apiUrl?: string;
  maxTokens?: number;
}

export const LLM_MODELS: Record<string, LLMModelConfig> = {
  // OpenAI 模型
  "gpt-4-turbo": {
    provider: "openai",
    model: "gpt-4-turbo",
    apiUrl: "https://api.openai.com/v1/chat/completions",
  },
  "gpt-4": {
    provider: "openai",
    model: "gpt-4",
    apiUrl: "https://api.openai.com/v1/chat/completions",
  },
  "gpt-3.5-turbo": {
    provider: "openai",
    model: "gpt-3.5-turbo",
    apiUrl: "https://api.openai.com/v1/chat/completions",
  },

  // Claude 模型
  "claude-3-opus": {
    provider: "claude",
    model: "claude-3-opus-20240229",
    apiUrl: "https://api.anthropic.com/v1/messages",
  },
  "claude-3-sonnet": {
    provider: "claude",
    model: "claude-3-sonnet-20240229",
    apiUrl: "https://api.anthropic.com/v1/messages",
  },
  "claude-3-haiku": {
    provider: "claude",
    model: "claude-3-haiku-20240307",
    apiUrl: "https://api.anthropic.com/v1/messages",
  },

  // Google Gemini 模型
  "gemini-2.5-flash": {
    provider: "gemini",
    model: "gemini-2.5-flash",
    apiUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
  },
  "gemini-2.0-flash": {
    provider: "gemini",
    model: "gemini-2.0-flash",
    apiUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
  },
  "gemini-1.5-pro": {
    provider: "gemini",
    model: "gemini-1.5-pro",
    apiUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
  },

  // DeepSeek 模型
  "deepseek-chat": {
    provider: "deepseek",
    model: "deepseek-chat",
    apiUrl: "https://api.deepseek.com/v1/chat/completions",
  },

  // 阿里通义千问
  "qwen-max": {
    provider: "qwen",
    model: "qwen-max",
    apiUrl: "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
  },
};

/**
 * 获取LLM模型配置
 */
export function getLLMModelConfig(modelKey: string): LLMModelConfig {
  const config = LLM_MODELS[modelKey];
  if (!config) {
    // 默认使用Gemini 2.5 Flash
    return LLM_MODELS["gemini-2.5-flash"];
  }
  return config;
}

/**
 * 获取所有可用的LLM模型列表
 */
export function getAvailableLLMModels(): Array<{
  key: string;
  name: string;
  provider: LLMProvider;
  model: string;
}> {
  return Object.entries(LLM_MODELS).map(([key, config]) => ({
    key,
    name: `${config.provider.toUpperCase()} - ${config.model}`,
    provider: config.provider,
    model: config.model,
  }));
}

/**
 * 验证LLM模型是否可用
 */
export function isLLMModelAvailable(modelKey: string): boolean {
  return modelKey in LLM_MODELS;
}
