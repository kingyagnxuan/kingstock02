import DashboardLayout from "@/components/DashboardLayout";
import { getLatestReports, getReportById, ResearchReport } from "@/lib/mockResearchReports";
import { BookOpen, TrendingUp, AlertCircle, Target } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ResearchReports() {
  const reports = getLatestReports(10);
  const [selectedReport, setSelectedReport] = useState<ResearchReport | null>(reports[0] || null);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            深度研究报告
          </h2>
          <p className="text-muted-foreground">
            专业的市场分析、行业研究和投资建议，帮助您把握投资机会
          </p>
        </section>

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
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="content">研报内容</TabsTrigger>
                      <TabsTrigger value="stocks">相关股票</TabsTrigger>
                      <TabsTrigger value="risks">风险因素</TabsTrigger>
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

                    <TabsContent value="risks" className="space-y-4">
                      <div className="space-y-3">
                        {selectedReport.riskFactors.map((risk, idx) => (
                          <div
                            key={idx}
                            className="bg-red-500/10 border-l-4 border-red-500 rounded-r-lg p-4 flex gap-3"
                          >
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600">{risk}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex gap-3 pt-4 border-t border-border/50">
                    <Button className="flex-1" variant="default">
                      <Target className="w-4 h-4 mr-2" />
                      设置提醒
                    </Button>
                    <Button className="flex-1" variant="outline">
                      分享报告
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
