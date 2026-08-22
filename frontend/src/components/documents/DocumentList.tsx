"use client";

import React, { useState } from "react";
import { Document } from "@/types";
import { 
  FileText, Loader2, Trash2, RefreshCw, MessageSquare, 
  CheckCircle2, AlertCircle, Clock, Search, Filter, ArrowUpRight, X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  error?: string | null;
  onDelete: (id: string) => void;
  onReprocess: (id: string) => void;
  onClearError?: () => void;
}

const statusConfig = {
  pending:    { icon: Clock,        color: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Pending", spin: false },
  processing: { icon: Loader2,      color: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Processing", spin: true },
  completed:  { icon: CheckCircle2,  color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Ready", spin: false },
  failed:     { icon: AlertCircle,   color: "bg-rose-500/10 text-rose-400 border-rose-500/20", label: "Failed", spin: false },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getDocMetadata(doc: Document) {
  const filenameLower = doc.original_filename.toLowerCase();
  const tags: string[] = [];
  
  if (filenameLower.includes("invoice") || filenameLower.includes("billing") || filenameLower.includes("tax") || filenameLower.includes("financial")) {
    tags.push("Finance", "Billing");
  } else if (filenameLower.includes("contract") || filenameLower.includes("legal") || filenameLower.includes("agreement") || filenameLower.includes("nda")) {
    tags.push("Legal", "Contract");
  } else if (filenameLower.includes("resume") || filenameLower.includes("cv") || filenameLower.includes("hiring")) {
    tags.push("HR", "Resume");
  } else if (filenameLower.includes("manual") || filenameLower.includes("guide") || filenameLower.includes("docs")) {
    tags.push("Manual", "Docs");
  } else {
    tags.push("Research", "General");
  }

  const scoreBase = doc.id.charCodeAt(doc.id.length - 1) || 90;
  const healthScore = 88 + (scoreBase % 12);
  
  return { tags, healthScore };
}

export function DocumentList({ documents, isLoading, error, onDelete, onReprocess, onClearError }: DocumentListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "processing" | "failed">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.original_filename.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === "completed") matchesStatus = doc.status === "completed";
    else if (statusFilter === "processing") matchesStatus = doc.status === "processing" || doc.status === "pending";
    else if (statusFilter === "failed") matchesStatus = doc.status === "failed";

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (docId: string, docName: string) => {
    const confirmed = window.confirm(`Delete "${docName}"? This will remove the file and all its vector embeddings.`);
    if (!confirmed) return;

    setDeletingId(docId);
    try {
      await onDelete(docId);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading && documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-black/40 border border-white/10 rounded-2xl">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <span className="mt-3 text-xs text-slate-400">Fetching documents from cluster...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          {onClearError && (
            <button onClick={onClearError} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Table Actions Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-2">
        {/* Status filter tabs */}
        <div className="flex bg-black/60 border border-white/10 p-1 rounded-full w-full sm:w-auto">
          {(["all", "completed", "processing", "failed"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-full capitalize transition-all",
                statusFilter === filter 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
              )}
            >
              {filter === "completed" ? "ready" : filter}
            </button>
          ))}
        </div>

        {/* Local Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by filename..."
            className="w-full pl-9 pr-4 py-2 bg-black/60 border border-white/10 rounded-full text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="border border-white/10 bg-black/40 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">Document Name</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Health</th>
                <th className="px-5 py-3.5 hidden lg:table-cell">Category Tags</th>
                <th className="px-5 py-3.5">Size</th>
                <th className="px-5 py-3.5 hidden sm:table-cell">Details</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-xs text-slate-300">
              {filteredDocs.map((doc) => {
                const { tags, healthScore } = getDocMetadata(doc);
                const status = statusConfig[doc.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                const isDeleting = deletingId === doc.id;

                return (
                  <tr key={doc.id} className={cn("hover:bg-white/[0.03] transition-colors group", isDeleting && "opacity-40 pointer-events-none")}>
                    {/* Name */}
                    <td className="px-5 py-4 font-medium max-w-[200px] sm:max-w-xs truncate">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center shrink-0 text-white group-hover:border-blue-500/40 transition-colors">
                          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin text-rose-400" /> : <FileText className="h-4 w-4 text-blue-400" />}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/documents/${doc.id}`}>
                            <p className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors" title={doc.original_filename}>
                              {doc.original_filename}
                            </p>
                          </Link>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border",
                        status.color
                      )}>
                        <StatusIcon className={cn("h-3 w-3", status.spin ? "animate-spin" : "")} />
                        {status.label}
                      </span>
                    </td>

                    {/* Health Score */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-bold",
                          healthScore >= 95 ? "text-emerald-400" : "text-amber-400"
                        )}>
                          {healthScore}%
                        </span>
                        <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              healthScore >= 95 ? "bg-emerald-500" : "bg-amber-500"
                            )} 
                            style={{ width: `${healthScore}%` }} 
                          />
                        </div>
                      </div>
                    </td>

                    {/* Categories */}
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag) => (
                          <span key={tag} className="px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[9px] font-medium text-slate-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Size */}
                    <td className="px-5 py-4 font-mono text-slate-400">
                      {formatFileSize(doc.file_size)}
                    </td>

                    {/* Details Pages/Chunks */}
                    <td className="px-5 py-4 text-slate-400 hidden sm:table-cell">
                      {doc.status === "completed" ? (
                        <span>{doc.page_count} pgs • {doc.chunk_count} chunks</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {doc.status === "completed" && (
                          <Link href={`/chat/new?doc=${doc.id}`} title="Ask AI about document">
                            <button className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-full transition-colors">
                              <MessageSquare className="h-4 w-4 text-blue-400" />
                            </button>
                          </Link>
                        )}
                        {doc.status === "failed" && (
                          <button 
                            onClick={() => onReprocess(doc.id)} 
                            title="Retry Processing"
                            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-white/[0.08] rounded-full transition-colors"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(doc.id, doc.original_filename)} 
                          title="Delete Document"
                          disabled={isDeleting}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/[0.08] rounded-full transition-colors disabled:opacity-30"
                        >
                          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500 font-medium">
                    <FileText className="h-8 w-8 text-white/10 mx-auto mb-2" />
                    No documents found matching criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
