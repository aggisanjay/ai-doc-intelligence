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
  pending:    { icon: Clock,      color: "bg-yellow-500/20 text-yellow-400", label: "Pending",    spin: false },
  processing: { icon: Loader2,    color: "bg-blue-500/20 text-blue-400",     label: "Processing", spin: true  },
  completed:  { icon: CheckCircle,color: "bg-green-500/20 text-green-400",   label: "Ready",      spin: false },
  failed:     { icon: XCircle,    color: "bg-red-500/20 text-red-400",       label: "Failed",     spin: false },
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
    <div className="bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-colors rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="p-2 bg-gray-700/50 rounded-lg shrink-0">
            <FileText className="h-5 w-5 text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-white truncate">{document.original_filename}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span>{formatFileSize(document.file_size)}</span>
              <span>•</span>
              <span>{document.file_type.toUpperCase()}</span>
              {document.page_count > 0 && <><span>•</span><span>{document.page_count} pages</span></>}
              {document.chunk_count > 0 && <><span>•</span><span>{document.chunk_count} chunks</span></>}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                <StatusIcon className={`h-3 w-3 ${status.spin ? "animate-spin" : ""}`} />
                {status.label}
              </span>
              <span className="text-xs text-gray-600">
                {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
              </span>
            </div>
            {document.error_message && (
              <p className="mt-2 text-xs text-red-400 bg-red-900/20 p-2 rounded">{document.error_message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 ml-4 shrink-0">
          {document.status === "completed" && (
            <Link href={`/chat/new?doc=${document.id}`}>
              <button className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded">
                <MessageSquare className="h-4 w-4" />
              </button>
            </Link>
          )}
          {document.status === "failed" && (
            <button onClick={() => onReprocess(document.id)} className="p-1.5 text-yellow-400 hover:text-yellow-300 hover:bg-gray-700 rounded">
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          <button onClick={() => onDelete(document.id)} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
