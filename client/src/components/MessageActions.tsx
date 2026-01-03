import { useState, useEffect } from "react";
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
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { VoiceSettings } from "@/components/VoiceSettings";
import {
  VoiceConfig,
  DEFAULT_VOICE_CONFIG,
  speakText,
  stopSpeech,
  isSpeaking,
} from "@/lib/speechUtils";

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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>(
    DEFAULT_VOICE_CONFIG
  );
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  // 检查播报状态
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPlayingAudio(isSpeaking());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // 语音播报
  const handleSpeak = () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
    } else {
      speakText(content, voiceConfig, () => {
        setIsPlayingAudio(false);
      });
      setIsPlayingAudio(true);
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
            title={isPlayingAudio ? "停止播报" : "语音播报"}
          >
            <Volume2
              className={`w-4 h-4 ${
                isPlayingAudio ? "text-blue-500 animate-pulse" : ""
              }`}
            />
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
              className={`w-4 h-4 ${
                feedback === "like" ? "fill-current text-green-500" : ""
              }`}
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
              className={`w-4 h-4 ${
                feedback === "dislike" ? "fill-current text-red-500" : ""
              }`}
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
              <DropdownMenuItem onClick={() => setShowVoiceSettings(true)}>
                <Settings className="w-4 h-4 mr-2" />
                语音设置
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 语音设置对话框 */}
          <VoiceSettings
            open={showVoiceSettings}
            onOpenChange={setShowVoiceSettings}
            config={voiceConfig}
            onConfigChange={setVoiceConfig}
          />
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
