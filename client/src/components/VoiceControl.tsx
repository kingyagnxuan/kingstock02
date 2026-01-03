import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Mic, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { speakText, stopSpeech, isSpeaking } from "@/lib/speechUtils";
import { toast } from "sonner";

interface VoiceControlProps {
  text: string;
  onTranscript?: (transcript: string) => void;
  className?: string;
}

export default function VoiceControl({
  text,
  onTranscript,
  className,
}: VoiceControlProps) {
  const [isSpeakingState, setIsSpeakingState] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  // 初始化语音识别
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "zh-CN";

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        setInterimTranscript(interim);

        if (final) {
          setInterimTranscript("");
          if (onTranscript) {
            onTranscript(final);
          }
          toast.success(`识别成功: ${final}`);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        const errorMessages: Record<string, string> = {
          "no-speech": "未检测到语音，请重试",
          "audio-capture": "未找到麦克风",
          network: "网络错误",
          "not-allowed": "未授予麦克风权限",
        };
        toast.error(
          errorMessages[event.error] || `语音识别错误: ${event.error}`
        );
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [onTranscript]);

  // 处理播报
  const handleSpeak = () => {
    if (!text.trim()) {
      toast.error("没有文本可播报");
      return;
    }

    if (isSpeakingState) {
      stopSpeech();
      setIsSpeakingState(false);
    } else {
      speakText(text, {
        voiceIndex: 0,
        rate: 1.2,
        pitch: 1.0,
        volume: 1.0,
      });
      setIsSpeakingState(true);

      // 监听播报结束
      const checkInterval = setInterval(() => {
        if (!isSpeaking()) {
          setIsSpeakingState(false);
          clearInterval(checkInterval);
        }
      }, 100);
    }
  };

  // 处理语音识别
  const handleListen = () => {
    if (!recognitionRef.current) {
      toast.error("浏览器不支持语音识别");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
    }
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {/* 播报按钮 */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleSpeak}
        disabled={!text.trim()}
        className="gap-2"
        title={isSpeakingState ? "停止播报" : "播报文本"}
      >
        {isSpeakingState ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            停止
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4" />
            播报
          </>
        )}
      </Button>

      {/* 语音识别按钮 */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleListen}
        className={cn("gap-2", isListening && "bg-red-500/10 border-red-500")}
        title={isListening ? "停止录音" : "开始录音"}
      >
        {isListening ? (
          <>
            <Square className="w-4 h-4 fill-red-500 text-red-500" />
            录音中...
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" />
            语音输入
          </>
        )}
      </Button>

      {/* 显示临时识别结果 */}
      {interimTranscript && (
        <div className="text-xs text-muted-foreground italic">
          {interimTranscript}
        </div>
      )}
    </div>
  );
}
