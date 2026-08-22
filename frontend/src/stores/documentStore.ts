import { create } from "zustand";
import { Document } from "@/types";
import { documentsAPI } from "@/lib/api";

interface DocumentState {
  documents: Document[];
  isLoading: boolean;
  isInitialLoaded: boolean;
  error: string | null;
  deletingIds: string[];
  
  // Actions
  fetchDocuments: (silent?: boolean) => Promise<void>;
  uploadDocument: (file: File, collectionId?: string) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  reprocessDocument: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  isLoading: false,
  isInitialLoaded: false,
  error: null,
  deletingIds: [],

  fetchDocuments: async (silent = false) => {
    const { isInitialLoaded, deletingIds } = get();
    // Only show full loading spinner on the first load; subsequent loads/polls are silent
    if (!isInitialLoaded && !silent) {
      set({ isLoading: true });
    }

    try {
      const response = await documentsAPI.list();
      const serverDocs: Document[] = response.data.documents || [];
      
      // Filter out any IDs currently in deletion
      const currentDeleting = get().deletingIds;
      const filtered = serverDocs.filter((d) => !currentDeleting.includes(d.id));

      set({
        documents: filtered,
        isInitialLoaded: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.detail || "Failed to load documents",
      });
    }
  },

  uploadDocument: async (file: File, collectionId?: string) => {
    const response = await documentsAPI.upload(file, collectionId);
    const newDoc: Document = response.data;
    set((state) => ({
      documents: [newDoc, ...state.documents],
    }));
    return newDoc;
  },

  deleteDocument: async (id: string) => {
    const { documents } = get();
    // 1. Mark as deleting and optimistically remove from UI
    set((state) => ({
      deletingIds: [...state.deletingIds, id],
      documents: state.documents.filter((d) => d.id !== id),
    }));

    try {
      // 2. Perform actual server deletion
      await documentsAPI.delete(id);
      // Remove from deletingIds on success
      set((state) => ({
        deletingIds: state.deletingIds.filter((item) => item !== id),
      }));
    } catch (err: any) {
      // Rollback on failure
      set({
        documents,
        deletingIds: get().deletingIds.filter((item) => item !== id),
        error: err.response?.data?.detail || "Failed to delete document",
      });
      console.error("[DocumentStore] Delete failed:", err);
    }
  },

  reprocessDocument: async (id: string) => {
    try {
      const response = await documentsAPI.reprocess(id);
      const updatedDoc: Document = response.data;
      set((state) => ({
        documents: state.documents.map((d) => (d.id === id ? updatedDoc : d)),
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to reprocess document",
      });
      console.error("[DocumentStore] Reprocess failed:", err);
    }
  },

  clearError: () => set({ error: null }),
}));
