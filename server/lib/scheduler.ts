import {
  calculateDailyLimitUpPotential,
  calculateNextDayLimitUpPotential,
  getStockRealTimeData,
  saveDailyAnalysisResult,
  saveNextDayAnalysisResult,
} from "./analysisService";

/**
 * 热门股票列表（用于演示）
 */
const HOT_STOCKS = [
  "000001", // 平安银行
  "000002", // 万科A
  "000333", // 美的集团
  "000858", // 五粮液
  "000651", // 格力电器
  "000651", // 格力电器
  "002230", // 科大讯飞
  "002415", // 海康威视
  "300750", // 宁德时代
  "600000", // 浦发银行
  "600016", // 民生银行
  "600519", // 贵州茅台
  "600900", // 长江电力
];

/**
 * 是否在交易时间内
 */
function isInTradingHours(): boolean {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const dayOfWeek = now.getDay();

  // 周一到周五，9:30-15:00
  if (dayOfWeek === 0 || dayOfWeek === 6) return false; // 周末不交易
  if (hours < 9 || hours > 15) return false;
  if (hours === 9 && minutes < 30) return false;
  if (hours === 15 && minutes > 0) return false;

  return true;
}

/**
 * 是否是收盘时间（15:00后）
 */
function isAfterMarketClose(): boolean {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const dayOfWeek = now.getDay();

  // 周一到周五，15:00后
  if (dayOfWeek === 0 || dayOfWeek === 6) return false; // 周末不处理
  if (hours < 15) return false;
  if (hours === 15 && minutes < 0) return false;
  if (hours > 20) return false; // 晚上8点后不处理

  return true;
}

/**
 * 更新当日涨停潜力股
 */
export async function updateDailyLimitUpPotentials(forceUpdate: boolean = false): Promise<void> {
  if (!forceUpdate && !isInTradingHours()) {
    console.log("不在交易时间内，跳过当日涨停潜力股更新");
    return;
  }

  console.log("开始更新当日涨停潜力股...");

  try {
    for (const stockCode of HOT_STOCKS) {
      try {
        // 获取实时数据
        const stockData = await getStockRealTimeData(stockCode);
        if (!stockData) {
          console.warn(`无法获取${stockCode}的实时数据`);
          continue;
        }

        // 计算涨停潜力
        const analysis = await calculateDailyLimitUpPotential(stockData);

        // 保存到数据库
        const saved = await saveDailyAnalysisResult(analysis);
        if (saved) {
          console.log(
            `✓ 已更新${stockCode}的当日涨停潜力：${analysis.limitUpProbability}%`
          );
        }
      } catch (error) {
        console.error(`更新${stockCode}失败:`, error);
      }

      // 避免请求过快
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("当日涨停潜力股更新完成");
  } catch (error) {
    console.error("更新当日涨停潜力股失败:", error);
  }
}

/**
 * 更新次日涨停潜力股
 */
export async function updateNextDayLimitUpPotentials(forceUpdate: boolean = false): Promise<void> {
  if (!forceUpdate && !isAfterMarketClose()) {
    console.log("不在收盘后时间内，跳过次日涨停潜力股更新");
    return;
  }

  console.log("开始更新次日涨停潜力股...");

  try {
    for (const stockCode of HOT_STOCKS) {
      try {
        // 获取实时数据
        const stockData = await getStockRealTimeData(stockCode);
        if (!stockData) {
          console.warn(`无法获取${stockCode}的实时数据`);
          continue;
        }

        // 计算次日涨停潜力
        const analysis = await calculateNextDayLimitUpPotential(stockData);

        // 保存到数据库
        const saved = await saveNextDayAnalysisResult(
          stockCode,
          stockData.name,
          analysis
        );
        if (saved) {
          console.log(
            `✓ 已更新${stockCode}的次日涨停潜力：${analysis.nextDayPotential}%`
          );
        }
      } catch (error) {
        console.error(`更新${stockCode}失败:`, error);
      }

      // 避免请求过快
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("次日涨停潜力股更新完成");
  } catch (error) {
    console.error("更新次日涨停潜力股失败:", error);
  }
}

/**
 * 启动定时任务
 */
export function startScheduler(): () => void {
  console.log("启动涨停潜力股定时更新任务...");

  // 当日涨停潜力：每5分钟更新一次（交易时间内）
  const dailyInterval = setInterval(() => {
    updateDailyLimitUpPotentials().catch(console.error);
  }, 5 * 60 * 1000); // 5分钟

  // 次日涨停潜力：每30分钟检查一次（收盘后）
  const nextDayInterval = setInterval(() => {
    updateNextDayLimitUpPotentials().catch(console.error);
  }, 30 * 60 * 1000); // 30分钟

  // 初始化立即执行一次
  updateDailyLimitUpPotentials().catch(console.error);
  updateNextDayLimitUpPotentials().catch(console.error);

  // 返回清理函数
  return () => {
    clearInterval(dailyInterval);
    clearInterval(nextDayInterval);
    console.log("已停止涨停潜力股定时更新任务");
  };
}

/**
 * 手动触发更新（用于测试）
 */
export async function manualUpdateAll(): Promise<void> {
  console.log("手动触发全量更新...");
  await updateDailyLimitUpPotentials(true);
  await updateNextDayLimitUpPotentials(true);
  console.log("手动更新完成");
}
