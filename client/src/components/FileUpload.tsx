import React, { useRef, useState } from "react";
import { Upload, X, File, Image as ImageIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileUploadProps {
  onFileSelect: (file: File, base64?: string) => Promise<void>;
  isLoading?: boolean;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  isLoading = false,
  accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="w-4 h-4" />;
    }
    if (file.type === "application/pdf") {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const getFileTypeLabel = (file: File) => {
    if (file.type.startsWith("image/")) return "图片";
    if (file.type === "application/pdf") return "PDF文档";
    if (file.type.includes("word") || file.type.includes("document")) return "Word文档";
    if (file.type.includes("sheet")) return "电子表格";
    if (file.type.includes("presentation")) return "PPT演示文稿";
    return "文件";
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
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

    setSelectedFile(file);

    // 如果是图片，生成base64用于预览和分析
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        try {
          await onFileSelect(file, base64);
        } catch (error) {
          toast.error("文件上传失败");
        }
      };
      reader.readAsDataURL(file);
    } else {
      // 对于其他文件类型，直接上传
      try {
        await onFileSelect(file);
      } catch (error) {
        toast.error("文件上传失败");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 处理粘贴事件
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file" && items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          handleFile(file);
        }
        break;
      }
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={isLoading}
      />

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onPaste={handlePaste}
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
            dragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                拖拽文件到此处或点击上传
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                支持图片、PDF、Word、PPT、Excel等格式（最大50MB）
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                也可以直接粘贴图片
              </p>
            </div>
          </div>

          <button
            onClick={handleClick}
            disabled={isLoading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            type="button"
          />
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(selectedFile)}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {getFileTypeLabel(selectedFile)} • {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleClear}
              disabled={isLoading}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              type="button"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {isLoading && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: "60%" }} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">正在上传和分析...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
