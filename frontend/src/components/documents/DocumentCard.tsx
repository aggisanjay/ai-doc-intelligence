"use client";

import React from "react";
import { Document } from "@/types";
import { FileText, Trash2, RefreshCw, MessageSquare, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
  onReprocess: (id: string) => void;
}

const statusConfig = {
  pending:    { icon: Clock,       color: "bg-white/[0.04] text-amber-400 border-white/[0.08]", label: "Pending",    spin: false },
  processing: { icon: Loader2,     color: "bg-white/[0.04] text-blue-400 border-white/[0.08]",  label: "Processing", spin: true  },
  completed:  { icon: CheckCircle, color: "bg-white/[0.04] text-emerald-400 border-white/[0.08]",label: "Ready",      spin: false },
  failed:     { icon: XCircle,     color: "bg-white/[0.04] text-rose-400 border-white/[0.08]",   label: "Failed",     spin: false },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentCard({ document, onDelete, onReprocess }: DocumentCardProps) {
  const status = statusConfig[document.status];
  const StatusIcon = status.icon;

  return (
    <div className="bg-black border border-white/[0.08] hover:border-white/20 transition-colors rounded-3xl p-5 font-sans">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center shrink-0 text-white">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white truncate text-sm">{document.original_filename}</h3>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
              <span>{formatFileSize(document.file_size)}</span>
              <span>•</span>
              <span>{document.file_type.toUpperCase()}</span>
              {document.page_count > 0 && <><span>•</span><span>{document.page_count} pages</span></>}
              {document.chunk_count > 0 && <><span>•</span><span>{document.chunk_count} chunks</span></>}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${status.color}`}>
                <StatusIcon className={`h-3 w-3 ${status.spin ? "animate-spin" : ""}`} />
                {status.label}
              </span>
              <span className="text-[10px] text-slate-500">
                {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
              </span>
            </div>
            {document.error_message && (
              <p className="mt-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">{document.error_message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 ml-4 shrink-0">
          {document.status === "completed" && (
            <Link href={`/chat/new?doc=${document.id}`}>
              <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                <MessageSquare className="h-4 w-4" />
              </button>
            </Link>
          )}
          {document.status === "failed" && (
            <button onClick={() => onReprocess(document.id)} className="p-2 text-slate-400 hover:text-amber-400 hover:bg-white/5 rounded-full transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          <button onClick={() => onDelete(document.id)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-full transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
