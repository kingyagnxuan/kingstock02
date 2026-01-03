import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Streamdown } from "streamdown";
import { Send, Plus, Download, FileText, Loader2, Paperclip, Mic, Zap } from "lucide-react";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { FileList } from "@/components/FileList";
import { MessageActions } from "@/components/MessageActions";
import { useAuth } from "@/_core/hooks/useAuth";
import { selectBestModels } from "@/lib/aiModelSelector";

export default function AskStock() {
  const { user, isAuthenticated, loading } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [useAutoModel, setUseAutoModel] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  // tRPC查询和变更
  const getConversationsQuery = trpc.ai.getConversations.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const getAvailableModelsQuery = trpc.ai.getAvailableModels.useQuery(undefined, {
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

  // 加载可用的LLM模型
  useEffect(() => {
    if (getAvailableModelsQuery.data) {
      setAvailableModels(getAvailableModelsQuery.data);
    }
  }, [getAvailableModelsQuery.data]);

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

  // 处理输入框的拖拽和粘贴
  useEffect(() => {
    const container = inputContainerRef.current;
    if (!container) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      container.classList.add("ring-2", "ring-blue-500");
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      container.classList.remove("ring-2", "ring-blue-500");
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      container.classList.remove("ring-2", "ring-blue-500");

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].kind === "file") {
            const file = items[i].getAsFile();
            if (file) {
              handleFile(file);
            }
          }
        }
      }
    };

    container.addEventListener("dragover", handleDragOver);
    container.addEventListener("dragleave", handleDragLeave);
    container.addEventListener("drop", handleDrop);
    container.addEventListener("paste", handlePaste);

    return () => {
      container.removeEventListener("dragover", handleDragOver);
      container.removeEventListener("dragleave", handleDragLeave);
      container.removeEventListener("drop", handleDrop);
      container.removeEventListener("paste", handlePaste);
    };
  }, []);

  // 创建新对话
  const handleNewConversation = async () => {
    try {
      await createConversationMutation.mutateAsync({
        title: `问票对话 ${new Date().toLocaleString()}`,
        model: selectedModel,
      });
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
      let modelToUse = selectedModel;
      
      if (useAutoModel) {
        const selection = selectBestModels(userMessage);
        modelToUse = selection.models[0];
        
        if (selection.shouldSynthesize) {
          toast.info(`🤖 ${selection.description}`);
        }
      }
      
      const response = await sendMessageMutation.mutateAsync({
        conversationId: currentConversationId,
        message: userMessage,
        model: modelToUse,
      });

      setMessages([
        ...messages,
        {
          id: Date.now(),
          conversationId: currentConversationId,
          role: "user",
          content: userMessage,
        },
        {
          id: Date.now() + 1,
          conversationId: currentConversationId,
          role: "assistant",
          content: response.content,
        },
      ]);
      toast.success("消息已发送");
    } catch (error) {
      toast.error("发送消息失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 处理文件上传
  const handleFile = async (file: File) => {
    if (!currentConversationId) {
      toast.error("请先选择或创建一个对话");
      return;
    }

    setIsUploadingFile(true);
    try {
      if (file.type.includes("image")) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64 = e.target?.result as string;
          try {
            await analyzeImageMutation.mutateAsync({
              fileId: Date.now(),
              base64Data: base64,
              fileName: file.name,
            });
            toast.success("图片已分析");
          } catch (error) {
            toast.error("图片分析失败");
          }
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target?.result as string;
          try {
            await analyzeDocumentMutation.mutateAsync({
              fileId: Date.now(),
              extractedText: text,
              fileType: file.type.includes("pdf") ? "pdf" : "document",
            });
            toast.success("文档已分析");
          } catch (error) {
            toast.error("文档分析失败");
          }
        };
        reader.readAsText(file);
      }

      await getConversationFilesQuery.refetch();
    } catch (error) {
      toast.error("文件处理失败");
    } finally {
      setIsUploadingFile(false);
    }
  };

  // 点击文件上传按钮
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // 导出对话
  const handleExport = async () => {
    if (!currentConversationId) return;
    try {
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

  // 重新生成消息
  const handleRegenerateMessage = async (messageId: number) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message || message.role !== "assistant") return;

    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex <= 0) return;

    const userMessage = messages[messageIndex - 1];
    if (userMessage.role !== "user") return;

    setIsLoading(true);
    try {
      const response = await sendMessageMutation.mutateAsync({
        conversationId: currentConversationId!,
        message: userMessage.content,
        model: selectedModel,
      });

      setMessages(
        messages.map((m) =>
          m.id === messageId
            ? { ...m, content: response.content }
            : m
        )
      );
      toast.success("已重新生成");
    } catch (error) {
      toast.error("重新生成失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 编辑用户消息
  const handleEditMessage = (messageId: number) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message || message.role !== "user") return;
    setInputValue(message.content);
    setMessages(messages.filter((m) => m.id !== messageId));
  };

  // 删除消息
  const handleDeleteMessage = (messageId: number) => {
    setMessages(messages.filter((m) => m.id !== messageId));
    toast.success("已删除");
  };

  // 分享消息
  const handleShareMessage = (messageId: number, content: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    const shareText = `${message.role === "user" ? "我的提问" : "AI分析"}: ${content}`;
    if (navigator.share) {
      navigator.share({
        title: "问票分享",
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("分享内容已复制");
    }
  };

  // 消息反馈
  const handleMessageFeedback = (messageId: number, type: "like" | "dislike") => {
    console.log(`Message ${messageId} feedback: ${type}`);
  };

  // 加载状态
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

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
        <div className="p-4 border-b border-border space-y-3">
          <Button onClick={handleNewConversation} className="w-full" variant="default">
            <Plus className="w-4 h-4 mr-2" />
            新对话
          </Button>

          {/* 自动模型选择开关 */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <Zap className="w-3 h-3 text-primary" />
              AI模型
            </label>
            <div className="space-y-2">
              <Button
                onClick={() => setUseAutoModel(!useAutoModel)}
                variant={useAutoModel ? "default" : "outline"}
                className="w-full text-xs"
              >
                {useAutoModel ? "✓ 自动选择" : "手动选择"}
              </Button>
              
              {!useAutoModel && (
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="选择模型" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.key} value={model.key}>
                        <span className="text-xs">{model.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {useAutoModel && (
              <p className="text-xs text-muted-foreground italic">系统将根据您的问题自动选择最优模型</p>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => {
                setCurrentConversationId(conv.id);
              }}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                currentConversationId === conv.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card hover:bg-card/80"
              }`}
            >
              <p className="text-sm font-medium truncate">{conv.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(conv.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="border-b border-border bg-card/50 p-3 md:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
          <h1 className="text-base md:text-lg font-semibold">
            {conversations.find((c) => c.id === currentConversationId)?.title || "问票"}
          </h1>
          <div className="flex items-center gap-2">
            <Button onClick={handleExport} variant="outline" size="sm" className="text-xs md:text-sm">
              <Download className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">导出</span>
            </Button>
            <Button onClick={handleGenerateReport} variant="outline" size="sm" disabled={isLoading} className="text-xs md:text-sm">
              <FileText className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">生成报告</span>
            </Button>
          </div>
        </div>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">开始提问，获取专业的投资分析建议</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="space-y-2 group">
                <div
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-2xl rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border"
                    }`}
                  >
                    <Streamdown>{message.content}</Streamdown>
                  </div>
                </div>
                {message.role === "assistant" && (
                  <div className="flex justify-start">
                    <MessageActions
                      messageId={message.id}
                      content={message.content}
                      role="assistant"
                      onRegenerate={() => handleRegenerateMessage(message.id)}
                      onShare={() => handleShareMessage(message.id, message.content)}
                      onFeedback={(type) => handleMessageFeedback(message.id, type)}
                    />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="border-t border-border bg-card/50 p-3 md:p-4">
          <div
            ref={inputContainerRef}
            className="flex items-end gap-2 rounded-lg border border-border bg-background p-2"
          >
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 px-0"
              placeholder="输入您的问题...（支持拖拽和粘贴图片）"
            />

            {/* 右边操作按预 */}
            <div className="flex items-center gap-1">
              <Button
                onClick={handleFileButtonClick}
                disabled={isUploadingFile}
                variant="ghost"
                size="sm"
                className="p-2 h-auto"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-auto"
              >
                <Mic className="w-5 h-5" />
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                size="sm"
                className="p-2 h-auto rounded-full bg-foreground text-background hover:bg-foreground/90"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
