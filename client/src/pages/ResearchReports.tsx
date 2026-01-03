import DashboardLayout from "@/components/DashboardLayout";
import { getLatestReports, getReportById, ResearchReport } from "@/lib/mockResearchReports";
import { generateProfessionalReport } from "@/lib/professionalReportGenerator";
import { BookOpen, TrendingUp, AlertCircle, Target, MessageCircle, Share2, Plus, Loader2, BarChart3, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ResearchReports() {
  const initialReports = getLatestReports(10);
  const [reports, setReports] = useState<ResearchReport[]>(initialReports);
  const [selectedReport, setSelectedReport] = useState<ResearchReport | null>(initialReports[0] || null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    if (!keyword.trim()) {
      toast.error("请输入行业名称");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      // 使用专业级研报生成器生成报告
      const professionalReport = generateProfessionalReport(keyword);
      
      // 转换为 ResearchReport 格式
      const newReport: ResearchReport = {
        id: professionalReport.id,
        title: professionalReport.title,
        category: "专业研报",
        author: professionalReport.author,
        date: professionalReport.date,
        content: `${professionalReport.executiveSummary}\n\n行业概况\n市场规模: ${professionalReport.industryOverview.marketSize}\n增长率: ${professionalReport.industryOverview.growthRate}\n${professionalReport.industryOverview.description}\n\n宏观分析\n${professionalReport.macroAnalysis.description}\n\n竞争格局\n${professionalReport.competitiveAnalysis.description}\n\n财务分析\n${professionalReport.financialAnalysis.description}`,
        keyPoints: professionalReport.investmentThesis,
        marketOutlook: professionalReport.investment.recommendation,
        stocks: professionalReport.relatedStocks.map(s => ({
          code: s.code,
          name: s.name,
          currentPrice: s.currentPrice,
          targetPrice: s.targetPrice,
          rating: s.rating
        })),
        riskFactors: professionalReport.risks.map(r => r.risk)
      };

      // 将新报告添加到列表顶部
      const updatedReports = [newReport, ...reports];
      setReports(updatedReports);
      setSelectedReport(newReport);
      setIsGenerating(false);
      toast.success(`已生成专业级"${keyword}"研究报告`);
      setShowGenerateForm(false);
      setKeyword("");
    }, 2500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                深度研究报告
              </h2>
              <p className="text-muted-foreground">
                专业的市场分析、行业研究和投资建议，帮助您把握投资机会
              </p>
            </div>
            <Button
              onClick={() => setShowGenerateForm(!showGenerateForm)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              生成研报
            </Button>
          </div>
        </section>

        {showGenerateForm && (
          <Card className="bg-primary/5 border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg">生成定制化研究报告</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">研报关键词</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="输入行业、公司或投资主题"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    disabled={isGenerating}
                  />
                  <Button
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      "生成"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reports List */}
          <div className="lg:col-span-1">
            <Card className="bg-card/40 backdrop-blur-md border-border/50 h-full">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-lg">最新研报</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {reports.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`w-full text-left p-4 border-b border-border/30 hover:bg-muted/50 transition-colors ${
                        selectedReport?.id === report.id ? "bg-primary/10 border-l-2 border-l-primary" : ""
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm line-clamp-2">{report.title}</h4>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {report.category}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{report.author}</span>
                          <span>{report.date}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Details */}
          <div className="lg:col-span-2">
            {selectedReport ? (
              <Card className="bg-card/40 backdrop-blur-md border-border/50">
                <CardHeader className="border-b border-border/50 pb-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <h2 className="text-2xl font-bold">{selectedReport.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>作者: {selectedReport.author}</span>
                          <span>发布: {selectedReport.date}</span>
                          <Badge variant="secondary">{selectedReport.category}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  <Tabs defaultValue="content" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="content">研报内容</TabsTrigger>
                      <TabsTrigger value="analysis">专业分析</TabsTrigger>
                      <TabsTrigger value="stocks">相关股票</TabsTrigger>
                      <TabsTrigger value="risks">风险评估</TabsTrigger>
                    </TabsList>

                    <TabsContent value="content" className="space-y-4">
                      <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                        <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                          {selectedReport.content}
                        </div>

                        <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg space-y-3">
                          <h4 className="font-bold text-primary flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            核心要点
                          </h4>
                          <ul className="space-y-2">
                            {selectedReport.keyPoints.map((point, idx) => (
                              <li key={idx} className="flex gap-2 text-sm">
                                <span className="text-primary font-bold">•</span>
                                <span className="text-primary">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                          <p className="text-sm text-yellow-600 font-medium">
                            📊 市场展望: {selectedReport.marketOutlook}
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="stocks" className="space-y-4">
                      <div className="space-y-3">
                        {selectedReport.stocks.map((stock) => (
                          <div
                            key={stock.code}
                            className="bg-muted/30 rounded-lg p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="font-medium">
                                {stock.name} ({stock.code})
                              </div>
                              <div className="text-sm text-muted-foreground">
                                当前价: ¥{stock.currentPrice.toFixed(2)} | 目标价: ¥{stock.targetPrice.toFixed(2)}
                              </div>
                            </div>
                            <Badge
                              className={
                                stock.rating === "买入"
                                  ? "bg-green-500/20 text-green-500"
                                  : stock.rating === "增持"
                                    ? "bg-blue-500/20 text-blue-500"
                                    : "bg-yellow-500/20 text-yellow-500"
                              }
                            >
                              {stock.rating}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="analysis" className="space-y-4">
                      <div className="space-y-4">
                        <div className="bg-blue-500/10 border-l-4 border-blue-500 rounded-r-lg p-4">
                          <h4 className="font-bold text-blue-600 mb-2 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            行业数据
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-muted-foreground">市场规模:</span> <span className="font-medium">3,500亿元</span></div>
                            <div><span className="text-muted-foreground">增长率:</span> <span className="font-medium">35-40%</span></div>
                            <div><span className="text-muted-foreground">净利润率:</span> <span className="font-medium">15-25%</span></div>
                            <div><span className="text-muted-foreground">市盈率:</span> <span className="font-medium">25-35倍</span></div>
                          </div>
                        </div>
                        <div className="bg-purple-500/10 border-l-4 border-purple-500 rounded-r-lg p-4">
                          <h4 className="font-bold text-purple-600 mb-2">政策支持</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• 产业发展规划支持</li>
                            <li>• 税收优惠政策</li>
                            <li>• 研发投入扶持</li>
                            <li>• 人才引进计划</li>
                          </ul>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="risks" className="space-y-4">
                      <div className="space-y-3">
                        {selectedReport.riskFactors.map((risk, idx) => (
                          <div
                            key={idx}
                            className="bg-red-500/10 border-l-4 border-red-500 rounded-r-lg p-4 flex gap-3"
                          >
                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-red-600">{risk}</p>
                              <p className="text-xs text-red-500 mt-1">风险等级: 中等 | 建议关注</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex gap-3 pt-4 border-t border-border/50 flex-wrap">
                    <Button className="flex-1 min-w-[120px]" variant="default">
                      <Target className="w-4 h-4 mr-2" />
                      设置提醒
                    </Button>
                    <Button
                      className="flex-1 min-w-[120px]"
                      variant="outline"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: selectedReport.title,
                            text: `查看我在StockTracker上发现的研究报告：${selectedReport.title}`,
                            url: window.location.href,
                          });
                        } else {
                          toast.success("已复制分享链接，可分享到微信朋友圈");
                        }
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      分享到微信
                    </Button>
                    <Button
                      className="flex-1 min-w-[120px]"
                      variant="outline"
                      onClick={() => {
                        toast.success("已生成朋友圈分享卡片");
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      朋友圈
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card/40 backdrop-blur-md border-border/50 p-12 text-center">
                <p className="text-muted-foreground">选择一份研报查看详细内容</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
