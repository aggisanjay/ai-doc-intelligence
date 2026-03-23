"use client";

import { useState, useEffect, useCallback } from "react";
import { documentsAPI } from "@/lib/api";
import { Document } from "@/types";

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await documentsAPI.list();
      setDocuments(response.data.documents);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === "pending" || d.status === "processing");
    if (!hasProcessing) return;
    const interval = setInterval(fetchDocuments, 5000);
    return () => clearInterval(interval);
  }, [documents, fetchDocuments]);

  const uploadDocument = async (file: File) => {
    const response = await documentsAPI.upload(file);
    setDocuments((prev) => [response.data, ...prev]);
    return response.data;
  };

  const deleteDocument = async (id: string) => {
    await documentsAPI.delete(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const reprocessDocument = async (id: string) => {
    const response = await documentsAPI.reprocess(id);
    setDocuments((prev) => prev.map((d) => (d.id === id ? response.data : d)));
  };

  return { documents, isLoading, error, uploadDocument, deleteDocument, reprocessDocument, refetch: fetchDocuments };
}
