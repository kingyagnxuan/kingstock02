import React from "react";
import { Download, Trash2, Image as ImageIcon, FileText, File } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileListProps {
  files: any[];
  onDelete?: (fileId: number) => void;
}

export const FileList: React.FC<FileListProps> = ({ files, onDelete }) => {
  if (files.length === 0) return null;

  const getFileIcon = (fileType: string) => {
    if (fileType === "image") {
      return <ImageIcon className="w-4 h-4" />;
    }
    if (fileType === "pdf" || fileType === "document") {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const getFileTypeLabel = (fileType: string) => {
    const labels: Record<string, string> = {
      image: "图片",
      pdf: "PDF",
      document: "文档",
      spreadsheet: "表格",
    };
    return labels[fileType] || "文件";
  };

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-2 p-2 bg-muted rounded-lg text-sm"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {getFileIcon(file.fileType)}
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-foreground">{file.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {getFileTypeLabel(file.fileType)} • {(file.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <div className="flex gap-1">
            <a
              href={file.s3Url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-background rounded transition-colors"
              title="下载"
            >
              <Download className="w-4 h-4 text-muted-foreground" />
            </a>
            {onDelete && (
              <button
                onClick={() => onDelete(file.id)}
                className="p-1 hover:bg-background rounded transition-colors"
                title="删除"
              >
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
