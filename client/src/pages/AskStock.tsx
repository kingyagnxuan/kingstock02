import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Streamdown } from "streamdown";
import { Send, Plus, Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { FileUpload } from "@/components/FileUpload";
import { FilePreview } from "@/components/FilePreview";

export default function AskStock() {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // tRPC查询和变更
  const getConversationsQuery = trpc.ai.getConversations.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const createConversationMutation = trpc.ai.createConversation.useMutation();
  const sendMessageMutation = trpc.ai.sendMessage.useMutation();
  const getMessagesQuery = trpc.ai.getMessages.useQuery(
    { conversationId: currentConversationId! },
    { enabled: !!currentConversationId }
  );
  const generateReportMutation = trpc.ai.generateReport.useMutation();
  const getConversationFilesQuery = trpc.files.getConversationFiles.useQuery(
    { conversationId: currentConversationId! },
    { enabled: !!currentConversationId }
  );
  const analyzeImageMutation = trpc.files.analyzeImage.useMutation();
  const analyzeDocumentMutation = trpc.files.analyzeDocument.useMutation();

  // 加载对话列表
  useEffect(() => {
    if (getConversationsQuery.data) {
      setConversations(getConversationsQuery.data);
      if (getConversationsQuery.data.length > 0 && !currentConversationId) {
        setCurrentConversationId(getConversationsQuery.data[0].id);
      }
    }
  }, [getConversationsQuery.data]);

  // 加载对话消息
  useEffect(() => {
    if (getMessagesQuery.data) {
      setMessages(getMessagesQuery.data);
    }
  }, [getMessagesQuery.data]);

  // 加载对话文件
  useEffect(() => {
    if (getConversationFilesQuery.data) {
      setUploadedFiles(getConversationFilesQuery.data);
    }
  }, [getConversationFilesQuery.data]);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 创建新对话
  const handleNewConversation = async () => {
    try {
      await createConversationMutation.mutateAsync({
        title: `问票对话 ${new Date().toLocaleString()}`,
      });
      // 重新加载对话列表
      await getConversationsQuery.refetch();
      toast.success("新对话已创建");
    } catch (error) {
      toast.error("创建对话失败");
    }
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentConversationId) return;

    const userMessage = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        conversationId: currentConversationId,
        message: userMessage,
      });

      // 添加用户消息和AI回复到消息列表
      setMessages([
        ...messages,
        {
          id: Date.now(),
          conversationId: currentConversationId,
          role: "user",
          content: userMessage,
          createdAt: new Date(),
        },
        {
          id: Date.now() + 1,
          conversationId: currentConversationId,
          role: "assistant",
          content: response.content,
          createdAt: new Date(),
        },
      ]);
      toast.success("AI已回复");
    } catch (error) {
      toast.error("发送消息失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 处理文件上传
  const handleFileSelect = async (file: File, base64?: string) => {
    if (!currentConversationId) {
      toast.error("请先创建对话");
      return;
    }

    setIsUploadingFile(true);
    try {
      const isImage = file.type.startsWith("image/");

      if (isImage && base64) {
        // 分析图片
        const result = await analyzeImageMutation.mutateAsync({
          fileId: Date.now(),
          base64Data: base64.split(",")[1] || base64,
          fileName: file.name,
        });
        toast.success("图片分析完成");
      } else {
        // 分析文档
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target?.result as string;
          try {
            await analyzeDocumentMutation.mutateAsync({
              fileId: Date.now(),
              extractedText: text,
              fileType: file.type.includes("pdf") ? "pdf" : "document",
            });
            toast.success("文档分析完成");
          } catch (error) {
            toast.error("文档分析失败");
          }
        };
        reader.readAsText(file);
      }

      // 重新加载文件列表
      await getConversationFilesQuery.refetch();
    } catch (error) {
      toast.error("文件处理失败");
    } finally {
      setIsUploadingFile(false);
    }
  };

  // 导出对话
  const handleExport = async () => {
    if (!currentConversationId) return;
    try {
      // 构建对话文本
      const text = [
        `对话标题: ${conversations.find((c) => c.id === currentConversationId)?.title || ""}`,
        `创建时间: ${new Date().toLocaleString()}`,
        "",
        "对话内容:",
        "---",
        ...messages.map((m) => {
          const role = m.role === "user" ? "用户" : "AI分析师";
          return `[${role}]: ${m.content}`;
        }),
      ].join("\n");

      // 创建下载链接
      const element = document.createElement("a");
      element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
      element.setAttribute(
        "download",
        `问票对话_${new Date().toISOString().split("T")[0]}.txt`
      );
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("对话已导出");
    } catch (error) {
      toast.error("导出失败");
    }
  };

  // 生成报告
  const handleGenerateReport = async () => {
    if (!currentConversationId) return;
    try {
      setIsLoading(true);
      const result = await generateReportMutation.mutateAsync({
        conversationId: currentConversationId,
      });
      // 创建下载链接
      const element = document.createElement("a");
      element.setAttribute("href", "data:text/markdown;charset=utf-8," + encodeURIComponent(result.content));
      element.setAttribute("download", result.filename);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("报告已生成");
    } catch (error) {
      toast.error("生成报告失败");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>需要登录</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">请登录后使用问票功能</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* 侧边栏 - 对话列表 */}
      <aside className="w-64 border-r border-border bg-card/50 flex flex-col">
        <div className="p-4 border-b border-border">
          <Button onClick={handleNewConversation} className="w-full" variant="default">
            <Plus className="w-4 h-4 mr-2" />
            新对话
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => {
                setCurrentConversationId(conv.id);
                setMessages([]);
              }}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                currentConversationId === conv.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <p className="text-sm font-medium truncate">{conv.title}</p>
              <p className="text-xs opacity-75">
                {new Date(conv.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </aside>

      {/* 主聊天区域 */}
      <main className="flex-1 flex flex-col">
        {currentConversationId ? (
          <>
            {/* 工具栏 */}
            <div className="border-b border-border bg-card/50 p-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={messages.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                导出对话
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateReport}
                disabled={messages.length === 0 || isLoading}
              >
                <FileText className="w-4 h-4 mr-2" />
                生成报告
              </Button>
            </div>

            {/* 消息区域 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>开始提问，获取专业的股票投资分析</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <Card
                      className={`max-w-2xl ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <CardContent className="p-4">
                        {msg.role === "assistant" ? (
                          <Streamdown>{msg.content}</Streamdown>
                        ) : (
                          <p>{msg.content}</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 文件上传区域 */}
            <div className="border-t border-border bg-card/50 p-4">
              <FileUpload onFileSelect={handleFileSelect} isLoading={isUploadingFile} />
            </div>

            {/* 已上传文件列表 */}
            {uploadedFiles.length > 0 && (
              <div className="border-t border-border bg-card/50 p-4 max-h-48 overflow-y-auto">
                <h3 className="text-sm font-medium mb-3">已上传文件</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <FilePreview
                      key={file.id}
                      fileName={file.fileName}
                      fileType={file.fileType}
                      mimeType={file.mimeType}
                      s3Url={file.s3Url}
                      extractedText={file.extractedText}
                      analysisResult={file.analysisResult ? JSON.parse(file.analysisResult) : undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 输入区域 */}
            <div className="border-t border-border bg-card/50 p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="输入您的问题..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>创建新对话</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">点击左侧"新对话"按钮开始</p>
                <Button onClick={handleNewConversation} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  创建对话
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
