"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2, Info } from "lucide-react";
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
          "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 relative overflow-hidden",
          isDragActive 
            ? "border-indigo-500 bg-indigo-500/5 glow-primary scale-[0.99]" 
            : "border-white/10 hover:border-white/20 hover:bg-white/[0.01]"
        )}
      >
        <input {...getInputProps()} />
        
        {/* Glow circles */}
        <div className="absolute top-[-50px] left-[-50px] w-32 h-32 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-[-50px] right-[-50px] w-32 h-32 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className={cn(
            "w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto transition-colors",
            isDragActive ? "text-indigo-400 border-indigo-500/30 bg-indigo-500/10" : "text-white/40"
          )}>
            <Upload className="h-6 w-6" />
          </div>
          
          {isDragActive ? (
            <div className="space-y-1">
              <p className="text-indigo-400 text-sm font-semibold">Drop files to start processing</p>
              <p className="text-white/45 text-xs">Maximum size limit 50MB</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-white/80 text-sm font-semibold">Drag & drop files here, or <span className="text-indigo-400 hover:text-indigo-300 transition-colors">browse local system</span></p>
              <p className="text-white/40 text-xs">Supported file extensions: PDF, DOCX (Max 50MB)</p>
            </div>
          )}
        </div>
      </div>

      {/* Uploading Progress Log */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Upload Queue</span>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-medium">
              {files.filter(f => f.status === "success").length}/{files.length} Done
            </span>
          </div>

          <div className="space-y-2">
            {files.map((uploadFile) => (
              <div key={uploadFile.id} className="flex items-center gap-4 p-3 bg-[#171F2E]/30 border border-white/5 rounded-xl backdrop-blur-md">
                <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center shrink-0 text-white/40">
                  <FileText className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-md">{uploadFile.file.name}</p>
                    <span className="text-[10px] font-mono text-white/30">
                      {(uploadFile.file.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>

                  {uploadFile.status === "uploading" && (
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1.5">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-300" 
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
                  {uploadFile.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />}
                  {uploadFile.status === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  {uploadFile.status === "error" && <AlertCircle className="h-4 w-4 text-rose-400" />}
                  {(uploadFile.status === "success" || uploadFile.status === "error") && (
                    <button onClick={() => removeFile(uploadFile.id)} className="p-1 text-white/30 hover:text-white hover:bg-white/5 rounded transition-colors">
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
