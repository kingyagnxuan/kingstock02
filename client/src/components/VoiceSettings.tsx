import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VoiceConfig, getAvailableVoices, speakText } from "@/lib/speechUtils";
import { toast } from "sonner";

interface VoiceSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: VoiceConfig;
  onConfigChange: (config: VoiceConfig) => void;
}

export function VoiceSettings({
  open,
  onOpenChange,
  config,
  onConfigChange,
}: VoiceSettingsProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testText] = useState(
    "这是一个语音测试。代码600516的股价是12.45元。"
  );

  // 获取可用的语音列表
  useEffect(() => {
    const availableVoices = getAvailableVoices();
    setVoices(availableVoices);
  }, []);

  // 测试语音
  const handleTestVoice = () => {
    speakText(testText, config, () => {
      toast.success("播报完成");
    });
  };

  // 更新配置
  const handleVoiceChange = (voiceIndex: number) => {
    onConfigChange({
      ...config,
      voiceIndex,
    });
  };

  const handleRateChange = (rate: number[]) => {
    onConfigChange({
      ...config,
      rate: rate[0],
    });
  };

  const handlePitchChange = (pitch: number[]) => {
    onConfigChange({
      ...config,
      pitch: pitch[0],
    });
  };

  const handleVolumeChange = (volume: number[]) => {
    onConfigChange({
      ...config,
      volume: volume[0],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>语音设置</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 人声选择 */}
          <div className="space-y-2">
            <Label htmlFor="voice-select">选择人声</Label>
            <Select
              value={config.voiceIndex.toString()}
              onValueChange={(value) => handleVoiceChange(parseInt(value))}
            >
              <SelectTrigger id="voice-select">
                <SelectValue placeholder="选择人声" />
              </SelectTrigger>
              <SelectContent>
                {voices.length > 0 ? (
                  voices.map((voice, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {voice.name || `语音 ${index + 1}`}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="0">默认语音</SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {voices.length > 0
                ? `共有 ${voices.length} 种语音可选`
                : "未检测到可用语音"}
            </p>
          </div>

          {/* 播报速度 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="rate-slider">播报速度</Label>
              <span className="text-sm font-medium">{config.rate.toFixed(1)}x</span>
            </div>
            <Slider
              id="rate-slider"
              min={0.5}
              max={2}
              step={0.1}
              value={[config.rate]}
              onValueChange={handleRateChange}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              范围: 0.5x (慢) - 2.0x (快)
            </p>
          </div>

          {/* 音调 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="pitch-slider">音调</Label>
              <span className="text-sm font-medium">{config.pitch.toFixed(1)}</span>
            </div>
            <Slider
              id="pitch-slider"
              min={0.5}
              max={2}
              step={0.1}
              value={[config.pitch]}
              onValueChange={handlePitchChange}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              范围: 0.5 (低) - 2.0 (高)
            </p>
          </div>

          {/* 音量 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="volume-slider">音量</Label>
              <span className="text-sm font-medium">{(config.volume * 100).toFixed(0)}%</span>
            </div>
            <Slider
              id="volume-slider"
              min={0}
              max={1}
              step={0.1}
              value={[config.volume]}
              onValueChange={handleVolumeChange}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              范围: 0% (静音) - 100% (最大)
            </p>
          </div>

          {/* 测试文本 */}
          <div className="space-y-2">
            <Label>测试文本</Label>
            <p className="text-sm p-3 bg-muted rounded-md text-muted-foreground">
              {testText}
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleTestVoice}>
            试听
          </Button>
          <Button onClick={() => onOpenChange(false)}>完成</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
