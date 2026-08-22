import { create } from "zustand";
import { workspacesAPI, chatAPI } from "@/lib/api";
import { Conversation } from "@/types";

interface WorkspaceState {
  workspaces: any[];
  activeWorkspace: any | null;
  collections: any[];
  conversations: Conversation[];
  isLoadingWorkspaces: boolean;
  isInitialLoaded: boolean;

  fetchWorkspaces: (silent?: boolean) => Promise<void>;
  fetchCollections: (workspaceId?: string) => Promise<void>;
  fetchConversations: () => Promise<void>;
  setActiveWorkspace: (ws: any) => void;
  createWorkspace: (name: string) => Promise<any>;
  createCollection: (name: string, workspaceId: string) => Promise<any>;
  deleteConversation: (id: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  collections: [],
  conversations: [],
  isLoadingWorkspaces: false,
  isInitialLoaded: false,

  fetchWorkspaces: async (silent = false) => {
    const { isInitialLoaded, activeWorkspace } = get();
    if (!isInitialLoaded && !silent) {
      set({ isLoadingWorkspaces: true });
    }

    try {
      const wsRes = await workspacesAPI.list();
      const wsList = wsRes.data || [];
      
      let nextActive = activeWorkspace;
      if (wsList.length > 0) {
        const cachedWsId = typeof window !== "undefined" ? localStorage.getItem("active_workspace_id") : null;
        const found = wsList.find((w: any) => w.id === cachedWsId);
        nextActive = found || wsList[0];
        if (typeof window !== "undefined") {
          localStorage.setItem("active_workspace_id", nextActive.id);
        }
      }

      set({
        workspaces: wsList,
        activeWorkspace: nextActive,
        isInitialLoaded: true,
        isLoadingWorkspaces: false,
      });

      // Also fetch collections for the active workspace
      if (nextActive?.id) {
        get().fetchCollections(nextActive.id);
      }
    } catch (err) {
      console.error("[WorkspaceStore] Failed to load workspaces", err);
      set({ isLoadingWorkspaces: false });
    }
  },

  fetchCollections: async (workspaceId?: string) => {
    const targetWsId = workspaceId || get().activeWorkspace?.id;
    if (!targetWsId) return;

    try {
      const colRes = await workspacesAPI.listCollections(targetWsId);
      set({ collections: colRes.data || [] });
    } catch (err) {
      console.error("[WorkspaceStore] Failed to load collections", err);
    }
  },

  fetchConversations: async () => {
    try {
      const res = await chatAPI.listConversations();
      set({ conversations: (res.data || []).slice(0, 30) });
    } catch (err) {
      console.error("[WorkspaceStore] Failed to load conversations", err);
    }
  },

  setActiveWorkspace: (ws: any) => {
    if (typeof window !== "undefined" && ws?.id) {
      localStorage.setItem("active_workspace_id", ws.id);
    }
    set({ activeWorkspace: ws });
    if (ws?.id) {
      get().fetchCollections(ws.id);
    }
  },

  createWorkspace: async (name: string) => {
    const res = await workspacesAPI.create(name);
    const newWs = res.data;
    set((state) => ({
      workspaces: [...state.workspaces, newWs],
    }));
    get().setActiveWorkspace(newWs);
    return newWs;
  },

  createCollection: async (name: string, workspaceId: string) => {
    const res = await workspacesAPI.createCollection(name, workspaceId);
    const newCol = res.data;
    set((state) => ({
      collections: [...state.collections, newCol],
    }));
    return newCol;
  },

  deleteConversation: async (id: string) => {
    await chatAPI.deleteConversation(id);
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
    }));
  },
}));
