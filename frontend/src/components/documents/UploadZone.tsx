"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadFile {
  file: File;
  id: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

interface UploadZoneProps {
  onUpload: (file: File) => Promise<any>;
}

export function UploadZone({ onUpload }: UploadZoneProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);

  const processFile = useCallback(async (uploadFile: UploadFile) => {
    setFiles((prev) => prev.map((f) => f.id === uploadFile.id ? { ...f, status: "uploading", progress: 30 } : f));
    try {
      setFiles((prev) => prev.map((f) => f.id === uploadFile.id ? { ...f, progress: 60 } : f));
      await onUpload(uploadFile.file);
      setFiles((prev) => prev.map((f) => f.id === uploadFile.id ? { ...f, status: "success", progress: 100 } : f));
    } catch (err: any) {
      setFiles((prev) => prev.map((f) =>
        f.id === uploadFile.id ? { ...f, status: "error", progress: 0, error: err.response?.data?.detail || "Upload failed" } : f
      ));
    }
  }, [onUpload]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file, id: Math.random().toString(36).substr(2, 9), status: "pending" as const, progress: 0,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    for (const uploadFile of newFiles) await processFile(uploadFile);
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
    },
    maxSize: 50 * 1024 * 1024,
    multiple: true,
  });

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
          isDragActive ? "border-blue-500 bg-blue-500/10" : "border-gray-700 hover:border-gray-500 hover:bg-gray-800/50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className={cn("h-12 w-12 mx-auto mb-4", isDragActive ? "text-blue-400" : "text-gray-600")} />
        {isDragActive ? (
          <p className="text-blue-400 text-lg font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-gray-300 text-lg font-medium">Drag & drop your documents here</p>
            <p className="text-gray-500 mt-2">or <span className="text-blue-400 underline">browse files</span></p>
            <p className="text-gray-600 text-sm mt-3">Supported: PDF, DOCX • Max size: 50MB</p>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400">Uploaded Files</h3>
          {files.map((uploadFile) => (
            <div key={uploadFile.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <FileText className="h-5 w-5 text-gray-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{uploadFile.file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{(uploadFile.file.size / (1024 * 1024)).toFixed(1)} MB</span>
                  {uploadFile.status === "uploading" && (
                    <div className="flex-1 max-w-xs h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${uploadFile.progress}%` }} />
                    </div>
                  )}
                  {uploadFile.status === "error" && <span className="text-xs text-red-400">{uploadFile.error}</span>}
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1">
                {uploadFile.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-blue-400" />}
                {uploadFile.status === "success" && <CheckCircle className="h-4 w-4 text-green-400" />}
                {uploadFile.status === "error" && <AlertCircle className="h-4 w-4 text-red-400" />}
                {(uploadFile.status === "success" || uploadFile.status === "error") && (
                  <button onClick={() => removeFile(uploadFile.id)} className="p-1 text-gray-500 hover:text-gray-300">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
