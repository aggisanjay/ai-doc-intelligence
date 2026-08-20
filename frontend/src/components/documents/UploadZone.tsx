"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
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
      setFiles((prev) => prev.map((f) => f.id === uploadFile.id ? { ...f, progress: 65 } : f));
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
    <div className="space-y-4 font-sans">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-200 relative overflow-hidden bg-[#0c0c0e] shadow-lg",
          isDragActive 
            ? "border-blue-500 bg-blue-950/10 scale-[0.99]" 
            : "border-white/15 hover:border-blue-500/50 hover:bg-[#111116]"
        )}
      >
        <input {...getInputProps()} />

        <div className="relative z-10 space-y-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl border border-white/10 bg-[#121216] flex items-center justify-center mx-auto transition-colors text-blue-400 shadow-sm",
            isDragActive ? "border-blue-500 text-blue-400 bg-blue-950/20" : ""
          )}>
            <Upload className="h-5 w-5" />
          </div>
          
          {isDragActive ? (
            <div className="space-y-1">
              <p className="text-white text-sm font-semibold">Drop files to start processing</p>
              <p className="text-slate-400 text-xs">Maximum size limit 50MB</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-white text-sm font-semibold">Drag & drop files here, or <span className="text-blue-400 hover:text-blue-300 transition-colors">browse local files</span></p>
              <p className="text-slate-400 text-xs">Supported file extensions: PDF, DOCX, TXT (Max 50MB)</p>
            </div>
          )}
        </div>
      </div>

      {/* Uploading Progress Log */}
      {files.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Upload Queue</span>
            <span className="text-[10px] bg-blue-500/10 text-blue-300 px-3 py-0.5 rounded-full font-bold border border-blue-500/20">
              {files.filter(f => f.status === "success").length}/{files.length} Done
            </span>
          </div>

          <div className="space-y-2">
            {files.map((uploadFile) => (
              <div key={uploadFile.id} className="flex items-center gap-4 p-4 bg-[#0c0c0e] border border-white/10 rounded-2xl shadow-sm">
                <div className="w-9 h-9 rounded-xl border border-white/10 bg-[#121216] flex items-center justify-center shrink-0 text-blue-400">
                  <FileText className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-md">{uploadFile.file.name}</p>
                    <span className="text-[10px] font-mono text-slate-400">
                      {(uploadFile.file.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>

                  {uploadFile.status === "uploading" && (
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadFile.progress}%` }} 
                      />
                    </div>
                  )}

                  {uploadFile.status === "error" && (
                    <p className="text-[10px] text-rose-400 flex items-center gap-1.5 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      {uploadFile.error}
                    </p>
                  )}

                  {uploadFile.status === "success" && (
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1.5 mt-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Processing completed. Ready for chat indexing.
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-1">
                  {uploadFile.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-blue-400" />}
                  {uploadFile.status === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  {uploadFile.status === "error" && <AlertCircle className="h-4 w-4 text-rose-400" />}
                  {(uploadFile.status === "success" || uploadFile.status === "error") && (
                    <button onClick={() => removeFile(uploadFile.id)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
