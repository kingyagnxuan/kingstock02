import { useState } from "react";
import {
  Volume2,
  Copy,
  RotateCcw,
  Share2,
  Edit2,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface MessageActionsProps {
  messageId: number;
  content: string;
  role: "user" | "assistant";
  onRegenerate?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onFeedback?: (type: "like" | "dislike") => void;
}

export function MessageActions({
  messageId,
  content,
  role,
  onRegenerate,
  onEdit,
  onDelete,
  onShare,
  onFeedback,
}: MessageActionsProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  // 语音播报
  const handleSpeak = () => {
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(content);
        utterance.lang = "zh-CN";
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    } else {
      toast.error("浏览器不支持语音播报");
    }
  };

  // 复制内容
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("已复制到剪贴板");
  };

  // 分享
  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      const shareText = `${role === "user" ? "我的提问" : "AI分析"}: ${content}`;
      if (navigator.share) {
        navigator.share({
          title: "问票分享",
          text: shareText,
        });
      } else {
        navigator.clipboard.writeText(shareText);
        toast.success("分享内容已复制");
      }
    }
  };

  // 点赞/点踩
  const handleFeedback = (type: "like" | "dislike") => {
    if (feedback === type) {
      setFeedback(null);
      onFeedback?.(null as any);
    } else {
      setFeedback(type);
      onFeedback?.(type);
    }
    toast.success(`已${type === "like" ? "点赞" : "点踩"}`);
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {role === "assistant" && (
        <>
          {/* 语音播报 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            onClick={handleSpeak}
            title={isSpeaking ? "停止播报" : "语音播报"}
          >
            <Volume2 className={`w-4 h-4 ${isSpeaking ? "text-blue-500" : ""}`} />
          </Button>

          {/* 复制 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            onClick={handleCopy}
            title="复制"
          >
            <Copy className="w-4 h-4" />
          </Button>

          {/* 重新生成 */}
          {onRegenerate && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-muted"
              onClick={onRegenerate}
              title="重新生成"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}

          {/* 点赞 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            onClick={() => handleFeedback("like")}
            title="点赞"
          >
            <ThumbsUp
              className={`w-4 h-4 ${feedback === "like" ? "fill-current text-green-500" : ""}`}
            />
          </Button>

          {/* 点踩 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            onClick={() => handleFeedback("dislike")}
            title="点踩"
          >
            <ThumbsDown
              className={`w-4 h-4 ${feedback === "dislike" ? "fill-current text-red-500" : ""}`}
            />
          </Button>

          {/* 分享 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            onClick={handleShare}
            title="分享"
          >
            <Share2 className="w-4 h-4" />
          </Button>

          {/* 更多选项 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleCopy()}>
                <Copy className="w-4 h-4 mr-2" />
                复制全文
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit2 className="w-4 h-4 mr-2" />
                转为文档编辑
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      {role === "user" && (
        <>
          {/* 复制 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            onClick={handleCopy}
            title="复制"
          >
            <Copy className="w-4 h-4" />
          </Button>

          {/* 分享 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            onClick={handleShare}
            title="分享"
          >
            <Share2 className="w-4 h-4" />
          </Button>

          {/* 编辑 */}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-muted"
              onClick={onEdit}
              title="编辑"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}

          {/* 删除 */}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-muted text-red-500 hover:text-red-600"
              onClick={onDelete}
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}

          {/* 更多选项 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleCopy()}>
                <Copy className="w-4 h-4 mr-2" />
                复制全文
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                分享提问
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  编辑提问
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}
