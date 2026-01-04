import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, X, TrendingUp, MessageSquare, Heart, Zap, Users } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

interface GuideStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
  action: string;
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 1,
    title: "涨停潜力股追踪",
    description: "实时监控A股市场涨停潜力股",
    icon: <TrendingUp className="w-12 h-12 text-red-500" />,
    details: [
      "📊 当日涨停潜力分析 - 每5分钟实时更新",
      "🎯 次日涨停潜力预测 - 基于多因子评分",
      "💰 资金流向追踪 - 看清主力动向",
      "📈 技术指标分析 - 完整的K线图表"
    ],
    action: "查看涨停追踪"
  },
  {
    id: 2,
    title: "问票AI分析",
    description: "与AI智能体对话分析股票",
    icon: <MessageSquare className="w-12 h-12 text-blue-500" />,
    details: [
      "🤖 多LLM模型支持 - OpenAI、Claude、Gemini等",
      "📁 文件上传分析 - 支持图片、PDF、Word等",
      "🎤 语音交互 - 语音提问和播报结果",
      "💾 对话历史保存 - 随时查看分析记录"
    ],
    action: "开始提问"
  },
  {
    id: 3,
    title: "自选股管理",
    description: "建立个人股票监控清单",
    icon: <Heart className="w-12 h-12 text-pink-500" />,
    details: [
      "⭐ 快速添加自选 - 一键收藏感兴趣的股票",
      "📍 价格预警设置 - 到达目标价格自动提醒",
      "📊 历史数据对比 - 查看股票历史表现",
      "📤 报告导出 - 导出JSON/CSV格式数据"
    ],
    action: "管理自选股"
  },
  {
    id: 4,
    title: "投资策略",
    description: "构建和分享投资策略",
    icon: <Zap className="w-12 h-12 text-yellow-500" />,
    details: [
      "🎨 策略构建器 - 手动选择或AI生成因子",
      "📊 性能分析 - 查看收益曲线和胜率",
      "🏆 策略排行榜 - 发现社区最优策略",
      "🔄 自动交易 - 执行策略信号自动下单"
    ],
    action: "浏览策略"
  },
  {
    id: 5,
    title: "社区讨论",
    description: "与投资者交流分享经验",
    icon: <Users className="w-12 h-12 text-green-500" />,
    details: [
      "💬 发起讨论 - 分享你的投资观点",
      "👥 社区互动 - 与其他投资者交流",
      "📰 市场资讯 - 获取最新的市场动态",
      "🔔 实时通知 - 不错过重要信息"
    ],
    action: "进入社区"
  }
];

export default function WelcomeGuide() {
  const [currentStep, setCurrentStep] = useState(0);
  const [, setLocation] = useLocation();
  const updateUserMutation = trpc.users.markWelcomeGuideCompleted.useMutation();

  const step = GUIDE_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === GUIDE_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await updateUserMutation.mutateAsync();
      setLocation("/");
    } catch (error) {
      console.error("Failed to mark guide as completed:", error);
      // 即使出错也进入首页
      setLocation("/");
    }
  };

  const handleSkip = async () => {
    try {
      await updateUserMutation.mutateAsync();
      setLocation("/");
    } catch (error) {
      console.error("Failed to mark guide as completed:", error);
      setLocation("/");
    }
  };

  const handleActionClick = () => {
    handleComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* 关闭按钮 */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="跳过引导"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 主卡片 */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50 overflow-hidden">
          <CardContent className="p-8 space-y-8">
            {/* 进度指示器 */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {GUIDE_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index <= currentStep
                        ? "bg-primary w-8"
                        : "bg-muted w-2"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} / {GUIDE_STEPS.length}
              </span>
            </div>

            {/* 内容区域 */}
            <div className="space-y-6">
              {/* 图标和标题 */}
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-muted/30 rounded-2xl">
                  {step.icon}
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-foreground">
                    {step.title}
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* 功能详情列表 */}
              <div className="bg-muted/20 rounded-xl p-6 space-y-3">
                {step.details.map((detail, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 text-foreground"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                      <span className="text-xs font-semibold text-primary">
                        ✓
                      </span>
                    </div>
                    <span className="text-sm leading-relaxed">{detail}</span>
                  </div>
                ))}
              </div>

              {/* 截图或演示区域 */}
              <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">
                  {step.icon}
                </div>
                <p className="text-sm text-muted-foreground">
                  点击下方按钮立即体验此功能
                </p>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="flex gap-3 justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={isFirstStep}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                上一步
              </Button>

              <Button
                onClick={handleActionClick}
                className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                {step.action}
              </Button>

              <Button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                {isLastStep ? "完成引导" : "下一步"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* 跳过链接 */}
            <div className="text-center">
              <button
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                跳过此引导，直接进入应用
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
