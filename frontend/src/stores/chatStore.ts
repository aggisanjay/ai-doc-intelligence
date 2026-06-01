import { create } from "zustand";
import { ChatMessage, SourceCitation } from "@/types";

interface ChatState {
  messages: ChatMessage[];
  conversationId: string | null;
  selectedDocumentIds: string[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setConversationId: (id: string | null) => void;
  setSelectedDocuments: (ids: string[]) => void;
  setLoading: (loading: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  appendStreamingContent: (content: string) => void;
  finalizeStreaming: (sources: SourceCitation[]) => void;
  resetStreamingContent: () => void;
  resetChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  conversationId: null,
  selectedDocumentIds: [],
  isLoading: false,
  isStreaming: false,
  streamingContent: "",

  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setConversationId: (id) => set({ conversationId: id }),
  setSelectedDocuments: (ids) => set({ selectedDocumentIds: ids }),
  setLoading: (loading) => set({ isLoading: loading }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  appendStreamingContent: (content) => set((state) => ({ streamingContent: state.streamingContent + content })),

  finalizeStreaming: (sources) => {
    const { streamingContent, messages } = get();
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: streamingContent,
      sources,
      timestamp: new Date().toISOString(),
    };
    set({ messages: [...messages, assistantMessage], streamingContent: "", isStreaming: false });
  },

  resetStreamingContent: () => set({ streamingContent: "" }),

  resetChat: () => set({
    messages: [],
    conversationId: null,
    streamingContent: "",
    isLoading: false,
    isStreaming: false,
  }),
}));
