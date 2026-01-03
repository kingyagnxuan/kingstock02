import React from "react";
import { Download, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilePreviewProps {
  fileName: string;
  fileType: string;
  mimeType: string;
  s3Url: string;
  extractedText?: string;
  analysisResult?: any;
  onDelete?: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  fileName,
  fileType,
  mimeType,
  s3Url,
  extractedText,
  analysisResult,
  onDelete,
}) => {
  const isImage = fileType === "image" || mimeType.startsWith("image/");
  const isPdf = fileType === "pdf" || mimeType === "application/pdf";

  return (
    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 mb-4">
      {/* 文件头部 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{fileName}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{fileType}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={s3Url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </a>
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* 图片预览 */}
      {isImage && (
        <div className="mb-4">
          <img
            src={s3Url}
            alt={fileName}
            className="max-w-full h-auto rounded border border-gray-200 dark:border-gray-700"
            style={{ maxHeight: "300px" }}
          />
        </div>
      )}

      {/* 提取的文本 */}
      {extractedText && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            提取的内容
          </h4>
          <div className="bg-white dark:bg-gray-800 rounded p-3 max-h-40 overflow-y-auto">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {extractedText.substring(0, 500)}
              {extractedText.length > 500 ? "..." : ""}
            </p>
          </div>
        </div>
      )}

      {/* 分析结果 */}
      {analysisResult && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            AI分析结果
          </h4>
          <div className="bg-white dark:bg-gray-800 rounded p-3">
            {typeof analysisResult === "string" ? (
              <p className="text-sm text-gray-700 dark:text-gray-300">{analysisResult}</p>
            ) : (
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {analysisResult.content && (
                  <p>{analysisResult.content}</p>
                )}
                {analysisResult.type && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    分析类型: {analysisResult.type}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
