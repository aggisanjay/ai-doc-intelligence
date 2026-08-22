"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { UploadZone } from "@/components/documents/UploadZone";
import { DocumentList } from "@/components/documents/DocumentList";
import { useDocuments } from "@/hooks/useDocuments";
import { FolderUp } from "lucide-react";

export default function UploadPage() {
  const { documents, isLoading, error, uploadDocument, deleteDocument, reprocessDocument, clearError } = useDocuments();

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8 font-sans">
        
        {/* Header Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl border border-white/10 bg-[#0c0c0e] text-blue-400 flex items-center justify-center shadow-sm">
            <FolderUp className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Upload Documents</h1>
            <p className="text-slate-400 text-xs mt-0.5">Ingest and parse local documents into the semantic knowledge base</p>
          </div>
        </div>

        {/* Upload Zone Card */}
        <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-base font-bold text-white tracking-tight mb-1">Ingest Files</h2>
          <p className="text-xs text-slate-400 mb-6">Uploaded files are split into page-aware text chunks and vectorized in real-time.</p>
          
          <UploadZone onUpload={uploadDocument} />
        </div>

        {/* Recent Uploads Table Card */}
        <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-base font-bold text-white tracking-tight mb-1">Recent uploads</h2>
          <p className="text-xs text-slate-400 mb-6">Monitor parse status and manage indexing of documents.</p>
          
          <DocumentList
            documents={documents}
            isLoading={isLoading}
            error={error}
            onDelete={deleteDocument}
            onReprocess={reprocessDocument}
            onClearError={clearError}
          />
        </div>

      </div>
    </AppShell>
  );
}
