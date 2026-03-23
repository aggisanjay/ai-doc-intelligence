"use client";

import React from "react";
import { Document } from "@/types";
import { DocumentCard } from "./DocumentCard";
import { FileText, Loader2 } from "lucide-react";

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onReprocess: (id: string) => void;
}

export function DocumentList({ documents, isLoading, onDelete, onReprocess }: DocumentListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-400">Loading documents...</span>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-700 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-400">No documents yet</h3>
        <p className="text-gray-600 mt-1">Upload your first document to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} onDelete={onDelete} onReprocess={onReprocess} />
      ))}
    </div>
  );
}
