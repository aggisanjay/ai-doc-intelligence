"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { UploadZone } from "@/components/documents/UploadZone";
import { DocumentList } from "@/components/documents/DocumentList";
import { useDocuments } from "@/hooks/useDocuments";
import { FolderUp } from "lucide-react";

export default function UploadPage() {
  const { documents, isLoading, uploadDocument, deleteDocument, reprocessDocument } = useDocuments();

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8 font-sans">
        
        {/* Header Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <FolderUp className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Upload Documents</h1>
            <p className="text-white/40 text-xs mt-0.5">Ingest and parse local documents into the semantic knowledge base</p>
          </div>
        </div>

        {/* Upload Zone Card */}
        <div className="bg-[#171F2E]/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
          {/* Subtle background gradient splash */}
          <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
          
          <h2 className="text-base font-semibold text-white mb-1">Ingest Files</h2>
          <p className="text-xs text-white/45 mb-5">Uploaded files are split into page-aware text chunks and vectorized in real-time.</p>
          
          <UploadZone onUpload={uploadDocument} />
        </div>

        {/* Recent Uploads Table Card */}
        <div className="bg-[#171F2E]/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
          <h2 className="text-base font-semibold text-white mb-1">Recent uploads</h2>
          <p className="text-xs text-white/45 mb-5">Monitor parse status and manage indexing of documents.</p>
          
          <DocumentList
            documents={documents}
            isLoading={isLoading}
            onDelete={deleteDocument}
            onReprocess={reprocessDocument}
          />
        </div>

      </div>
    </AppShell>
  );
}
