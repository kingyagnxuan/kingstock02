import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SelectionFactor, InvestmentStrategy } from "@/lib/strategyTypes";
import { PREDEFINED_FACTORS } from "@/lib/strategyTypes";
import { useStrategy } from "@/contexts/StrategyContext";
import { useState } from "react";
import { Plus, X, Zap, MessageCircle, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { nanoid } from "nanoid";

interface StrategyBuilderProps {
  onClose?: () => void;
}

export default function StrategyBuilder({ onClose }: StrategyBuilderProps) {
  const { createStrategy } = useStrategy();
  const [strategyName, setStrategyName] = useState("");
  const [strategyDescription, setStrategyDescription] = useState("");
  const [selectedFactors, setSelectedFactors] = useState<SelectionFactor[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"manual" | "ai">("manual");

  const factorsByCategory = {
    technical: Object.values(PREDEFINED_FACTORS).filter(f => f.category === "technical"),
    fundamental: Object.values(PREDEFINED_FACTORS).filter(f => f.category === "fundamental"),
    sentiment: Object.values(PREDEFINED_FACTORS).filter(f => f.category === "sentiment")
  };

  const handleAddFactor = (factor: SelectionFactor) => {
    if (!selectedFactors.find(f => f.id === factor.id)) {
      setSelectedFactors([...selectedFactors, { ...factor }]);
    }
  };

  const handleRemoveFactor = (factorId: string) => {
    setSelectedFactors(selectedFactors.filter(f => f.id !== factorId));
  };

  const handleFactorValueChange = (factorId: string, value: any) => {
    setSelectedFactors(selectedFactors.map(f =>
      f.id === factorId ? { ...f, value } : f
    ));
  };

  const handleCreateStrategy = () => {
    if (!strategyName.trim() || selectedFactors.length === 0) {
      alert("请输入策略名称并选择至少一个因子");
      return;
    }

    const newStrategy: InvestmentStrategy = {
      id: `strategy-${nanoid()}`,
      name: strategyName,
      description: strategyDescription,
      factors: selectedFactors,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "active",
      tags: []
    };

    createStrategy(newStrategy);
    alert("策略创建成功！");
    setStrategyName("");
    setStrategyDescription("");
    setSelectedFactors([]);
    onClose?.();
  };

  const handleAiGenerate = () => {
    if (!aiPrompt.trim()) {
      alert("请输入您的投资偏好");
      return;
    }

    // 模拟AI根据用户输入生成策略因子
    const aiGeneratedFactors: SelectionFactor[] = [];
    
    if (aiPrompt.includes("涨停") || aiPrompt.includes("追涨")) {
      aiGeneratedFactors.push({ ...PREDEFINED_FACTORS["tech-limit-up"], value: true });
      aiGeneratedFactors.push({ ...PREDEFINED_FACTORS["sentiment-hot"], value: true });
    }
    
    if (aiPrompt.includes("低估") || aiPrompt.includes("价值")) {
      aiGeneratedFactors.push({ ...PREDEFINED_FACTORS["fund-pe"], value: [10, 25] });
      aiGeneratedFactors.push({ ...PREDEFINED_FACTORS["fund-pb"], value: [0.5, 2] });
    }
    
    if (aiPrompt.includes("成长") || aiPrompt.includes("高增长")) {
      aiGeneratedFactors.push({ ...PREDEFINED_FACTORS["fund-growth"], value: "high" });
      aiGeneratedFactors.push({ ...PREDEFINED_FACTORS["fund-roe"], value: [15, 100] });
    }
    
    if (aiPrompt.includes("AI") || aiPrompt.includes("科技")) {
      aiGeneratedFactors.push({ ...PREDEFINED_FACTORS["sentiment-hot"], value: true });
    }

    if (aiGeneratedFactors.length === 0) {
      // 默认生成基础策略
      aiGeneratedFactors.push({ ...PREDEFINED_FACTORS["tech-volume"], value: [10, 100] });
      aiGeneratedFactors.push({ ...PREDEFINED_FACTORS["fund-growth"], value: "medium" });
    }

    setSelectedFactors(aiGeneratedFactors);
    setStrategyName(`AI生成策略-${new Date().toLocaleTimeString()}`);
    setActiveTab("manual");
  };

  const renderFactorInput = (factor: SelectionFactor) => {
    switch (factor.type) {
      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={factor.value || false}
            onChange={(e) => handleFactorValueChange(factor.id, e.target.checked)}
            className="w-4 h-4"
          />
        );
      case "range":
        return (
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min={factor.min}
              max={factor.max}
              value={factor.value?.[0] || factor.min || 0}
              onChange={(e) => handleFactorValueChange(factor.id, [Number(e.target.value), factor.value?.[1] || factor.max || 100])}
              className="w-16 px-2 py-1 border border-border rounded text-sm"
            />
            <span className="text-xs text-muted-foreground">-</span>
            <input
              type="number"
              min={factor.min}
              max={factor.max}
              value={factor.value?.[1] || factor.max || 100}
              onChange={(e) => handleFactorValueChange(factor.id, [factor.value?.[0] || factor.min || 0, Number(e.target.value)])}
              className="w-16 px-2 py-1 border border-border rounded text-sm"
            />
            {factor.unit && <span className="text-xs text-muted-foreground">{factor.unit}</span>}
          </div>
        );
      case "select":
        return (
          <select
            value={factor.value || ""}
            onChange={(e) => handleFactorValueChange(factor.id, e.target.value)}
            className="px-2 py-1 border border-border rounded text-sm bg-background"
          >
            <option value="">选择...</option>
            {factor.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Strategy Name */}
      <Card className="bg-card/40 backdrop-blur-md border-border/50">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-lg font-bold">策略基本信息</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">策略名称</label>
            <Input
              placeholder="输入策略名称，如：AI应用龙头追涨"
              value={strategyName}
              onChange={(e) => setStrategyName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">策略描述</label>
            <Textarea
              placeholder="描述您的投资理念和策略逻辑"
              value={strategyDescription}
              onChange={(e) => setStrategyDescription(e.target.value)}
              className="min-h-24"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50">
        <button
          onClick={() => setActiveTab("manual")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "manual"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          手动选择因子
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "ai"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Zap className="w-4 h-4" />
          AI对话生成
        </button>
      </div>

      {/* Manual Factor Selection */}
      {activeTab === "manual" && (
        <div className="space-y-6">
          {Object.entries(factorsByCategory).map(([category, factors]) => (
            <Card key={category} className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-sm font-bold capitalize">
                  {category === "technical" && "📊 技术面因子"}
                  {category === "fundamental" && "📈 基本面因子"}
                  {category === "sentiment" && "💬 情绪面因子"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {factors.map(factor => (
                  <div key={factor.id} className="flex items-center justify-between p-3 rounded border border-border/50 hover:bg-muted/30 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{factor.name}</p>
                      {factor.description && (
                        <p className="text-xs text-muted-foreground">{factor.description}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddFactor(factor)}
                      disabled={selectedFactors.some(f => f.id === factor.id)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI Dialog */}
      {activeTab === "ai" && (
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              AI策略助手
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">描述您的投资偏好</label>
              <Textarea
                placeholder="例如：我想追踪AI应用龙头的涨停机会，同时希望选择高增长的公司。请帮我生成一个策略。"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="min-h-32"
              />
            </div>
            <Button
              onClick={handleAiGenerate}
              className="w-full gap-2"
            >
              <Zap className="w-4 h-4" />
              生成策略因子
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              AI将根据您的描述自动选择合适的选股因子
            </p>
          </CardContent>
        </Card>
      )}

      {/* Selected Factors */}
      {selectedFactors.length > 0 && (
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-lg font-bold">已选择的因子 ({selectedFactors.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {selectedFactors.map(factor => (
              <div key={factor.id} className="flex items-center justify-between p-4 rounded border border-border/50 bg-muted/20">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-medium">{factor.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {factor.category === "technical" && "技术"}
                      {factor.category === "fundamental" && "基本"}
                      {factor.category === "sentiment" && "情绪"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {renderFactorInput(factor)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFactor(factor.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleCreateStrategy}
          disabled={!strategyName.trim() || selectedFactors.length === 0}
          className="flex-1"
        >
          创建策略
        </Button>
        {onClose && (
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            取消
          </Button>
        )}
      </div>
    </div>
  );
}
