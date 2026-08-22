"use client";

import { useEffect } from "react";
import { useDocumentStore } from "@/stores/documentStore";

export function useDocuments() {
  const {
    documents,
    isLoading,
    isInitialLoaded,
    error,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    reprocessDocument,
    clearError,
  } = useDocumentStore();

  // Initial fetch on mount if not loaded yet; otherwise silent background sync
  useEffect(() => {
    if (!isInitialLoaded) {
      fetchDocuments(false);
    } else {
      fetchDocuments(true); // Silent sync without setting isLoading: true
    }
  }, [isInitialLoaded, fetchDocuments]);

  // Poll in background every 5s if any document is processing, without flickering loading state
  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === "pending" || d.status === "processing");
    if (!hasProcessing) return;
    const interval = setInterval(() => {
      fetchDocuments(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [documents, fetchDocuments]);

  return {
    documents,
    isLoading,
    isInitialLoaded,
    error,
    uploadDocument,
    deleteDocument,
    reprocessDocument,
    refetch: () => fetchDocuments(false),
    clearError,
  };
}
