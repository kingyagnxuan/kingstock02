import React, { useRef } from "react";
import { Paperclip, Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileUploadButtonProps {
  onFileSelect: (file: File, base64?: string) => Promise<void>;
  isLoading?: boolean;
  accept?: string;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFileSelect,
  isLoading = false,
  accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // 验证文件大小（最大50MB）
    if (file.size > 50 * 1024 * 1024) {
      toast.error("文件大小不能超过50MB");
      return;
    }

    // 如果是图片，生成base64用于预览和分析
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        try {
          await onFileSelect(file, base64);
          toast.success("图片已上传");
        } catch (error) {
          toast.error("文件上传失败");
        }
      };
      reader.readAsDataURL(file);
    } else {
      // 对于其他文件类型，直接上传
      try {
        await onFileSelect(file);
        toast.success("文件已上传");
      } catch (error) {
        toast.error("文件上传失败");
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={isLoading}
      />

      <Button
        onClick={handleClick}
        disabled={isLoading}
        variant="ghost"
        size="sm"
        className="p-2 h-auto"
        title="上传文件（支持拖拽和粘贴）"
      >
        <Paperclip className="w-5 h-5" />
      </Button>
    </>
  );
};
