/**
 * 语音播报工具函数
 * 支持股票代码识别、文本清理、多人声选择等功能
 */

// 语音配置接口
export interface VoiceConfig {
  voiceIndex: number; // 人声索引
  rate: number; // 播报速度 (0.5-2.0)
  pitch: number; // 音调 (0.5-2.0)
  volume: number; // 音量 (0-1)
}

// 默认语音配置
export const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  voiceIndex: 0,
  rate: 1.2, // 默认速度稍快
  pitch: 1.0,
  volume: 1.0,
};

/**
 * 清理文本中的Markdown标记
 * 移除##、###等标题标记，以及其他Markdown格式
 */
export function cleanMarkdownText(text: string): string {
  // 移除标题标记 (# ## ### 等)
  text = text.replace(/^#+\s+/gm, "");

  // 移除粗体标记 (**text** 或 __text__)
  text = text.replace(/\*\*(.+?)\*\*/g, "$1");
  text = text.replace(/__(.+?)__/g, "$1");

  // 移除斜体标记 (*text* 或 _text_)
  text = text.replace(/\*(.+?)\*/g, "$1");
  text = text.replace(/_(.+?)_/g, "$1");

  // 移除代码标记 (`code`)
  text = text.replace(/`(.+?)`/g, "$1");

  // 移除代码块标记 (```code```)
  text = text.replace(/```[\s\S]*?```/g, "");

  // 移除链接标记 ([text](url))
  text = text.replace(/\[(.+?)\]\(.+?\)/g, "$1");

  // 移除列表标记 (- 或 * 或 1.)
  text = text.replace(/^[\s]*[-*+]\s+/gm, "");
  text = text.replace(/^[\s]*\d+\.\s+/gm, "");

  // 移除引用标记 (> text)
  text = text.replace(/^>\s+/gm, "");

  // 移除多余的空白和换行
  text = text.replace(/\n\n+/g, "。");
  text = text.replace(/\n/g, "");

  return text.trim();
}

/**
 * 识别和转换股票代码
 * 将6位数字股票代码转换为逐位播报格式
 * 例如: 600516 -> "六零零五一六"
 */
export function convertStockCode(text: string): string {
  // 匹配6位数字的股票代码 (前面可能有股票代码标识)
  const stockCodePattern = /(?:代码|code|股票代码)?[\s：:]*([0-9]{6})/gi;

  const numberMap: { [key: string]: string } = {
    "0": "零",
    "1": "一",
    "2": "二",
    "3": "三",
    "4": "四",
    "5": "五",
    "6": "六",
    "7": "七",
    "8": "八",
    "9": "九",
  };

  return text.replace(stockCodePattern, (match: string, code: string) => {
    // 逐位转换股票代码
    const convertedCode = code
      .split("")
      .map((digit: string) => numberMap[digit])
      .join("");
    return `${convertedCode}`;
  });
}

/**
 * 识别价格数字并进行特殊处理
 * 例如: 12.45元 -> "十二点四五元"
 */
export function convertPriceNumbers(text: string): string {
  // 匹配价格格式 (数字.数字 + 可选的单位)
  const pricePattern = /(\d+)\.(\d+)(元|块|块钱)?/g;

  const numberMap: { [key: string]: string } = {
    "0": "零",
    "1": "一",
    "2": "二",
    "3": "三",
    "4": "四",
    "5": "五",
    "6": "六",
    "7": "七",
    "8": "八",
    "9": "九",
  };

  return text.replace(pricePattern, (match: string, integer: string, decimal: string, unit: string) => {
    const integerPart = integer
      .split("")
      .map((digit: string) => numberMap[digit])
      .join("");
    const decimalPart = decimal
      .split("")
      .map((digit: string) => numberMap[digit])
      .join("");
    return `${integerPart}点${decimalPart}${unit || ""}`;
  });
}

/**
 * 预处理文本以优化语音播报
 */
export function preprocessTextForSpeech(text: string): string {
  // 1. 清理Markdown标记
  let processed = cleanMarkdownText(text);

  // 2. 转换股票代码
  processed = convertStockCode(processed);

  // 3. 转换价格数字
  processed = convertPriceNumbers(processed);

  // 4. 替换常见的特殊符号
  processed = processed
    .replace(/&/g, "和")
    .replace(/\//g, "或")
    .replace(/\+/g, "加")
    .replace(/-/g, "减")
    .replace(/×/g, "乘")
    .replace(/÷/g, "除");

  // 5. 移除多余的标点和空白
  processed = processed.replace(/\s+/g, "");

  return processed;
}

/**
 * 获取可用的语音列表
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] | [] {
  if (!("speechSynthesis" in window)) {
    return [];
  }

  const voices = window.speechSynthesis.getVoices();
  // 优先返回中文语音
  return voices.filter((voice) => voice.lang.startsWith("zh"));
}

/**
 * 执行语音播报
 */
export function speakText(
  text: string,
  config: VoiceConfig = DEFAULT_VOICE_CONFIG,
  onEnd?: () => void
): void {
  if (!("speechSynthesis" in window)) {
    console.error("浏览器不支持语音播报");
    return;
  }

  // 停止当前播报
  window.speechSynthesis.cancel();

  // 预处理文本
  const processedText = preprocessTextForSpeech(text);

  // 创建语音播报对象
  const utterance = new SpeechSynthesisUtterance(processedText);

  // 获取可用的语音
  const voices = getAvailableVoices();
  if (voices.length > 0) {
    const voiceIndex = Math.min(config.voiceIndex, voices.length - 1);
    utterance.voice = voices[voiceIndex];
  }

  // 设置语音参数
  utterance.rate = config.rate;
  utterance.pitch = config.pitch;
  utterance.volume = config.volume;
  utterance.lang = "zh-CN";

  // 设置结束回调
  if (onEnd) {
    utterance.onend = onEnd;
  }

  // 开始播报
  window.speechSynthesis.speak(utterance);
}

/**
 * 停止语音播报
 */
export function stopSpeech(): void {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * 检查是否正在播报
 */
export function isSpeaking(): boolean {
  if (!("speechSynthesis" in window)) {
    return false;
  }
  return window.speechSynthesis.speaking;
}
