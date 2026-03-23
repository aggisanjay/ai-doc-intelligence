"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { UploadZone } from "@/components/documents/UploadZone";
import { DocumentList } from "@/components/documents/DocumentList";
import { useDocuments } from "@/hooks/useDocuments";

export default function UploadPage() {
  const { documents, isLoading, uploadDocument, deleteDocument, reprocessDocument } = useDocuments();

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Upload Documents</h1>
          <p className="text-gray-400 mt-1">Upload PDF or DOCX files to make them searchable with AI</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-1">Upload Files</h2>
          <p className="text-sm text-gray-400 mb-4">Documents are automatically processed and indexed for intelligent search</p>
          <UploadZone onUpload={uploadDocument} />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Uploads</h2>
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
