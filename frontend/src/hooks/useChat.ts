"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { chatAPI } from "@/lib/api";
import { useChatStore } from "@/stores/chatStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { ChatMessage, SourceCitation } from "@/types";

export function useChat() {
  const store = useChatStore();
  const router = useRouter();

  const sendMessage = useCallback(async (query: string) => {
    const userMessage: ChatMessage = { role: "user", content: query, timestamp: new Date().toISOString() };
    store.addMessage(userMessage);
    store.setStreaming(true);
    store.resetStreamingContent();

    let sources: SourceCitation[] = [];

    try {
      const stream = chatAPI.queryStream({
        query,
        conversation_id: store.conversationId || undefined,
        document_ids: store.selectedDocumentIds,
      });

      for await (const event of stream) {
        switch (event.type) {
          case "sources": sources = event.data; break;
          case "content": store.appendStreamingContent(event.data); break;
          case "done": 
            store.finalizeStreaming(sources, event.conversation_id);
            if (event.conversation_id) {
              store.setConversationId(event.conversation_id);
              // Update URL seamlessly in the browser without unmounting/reloading components
              if (typeof window !== "undefined" && !window.location.pathname.includes(event.conversation_id)) {
                window.history.replaceState(null, "", `/chat/${event.conversation_id}`);
              }
              // Silently refresh conversations in the sidebar so new chat appears immediately
              useWorkspaceStore.getState().fetchConversations();
            }
            break;
          case "error": throw new Error(event.data);
        }
      }
    } catch (error: any) {
      try {
        store.resetStreamingContent();
        store.setStreaming(false);
        store.setLoading(true);

        const response = await chatAPI.query({
          query,
          conversation_id: store.conversationId || undefined,
          document_ids: store.selectedDocumentIds,
        });

        const { answer, sources: respSources, conversation_id } = response.data;
        store.addMessage({ role: "assistant", content: answer, sources: respSources, timestamp: new Date().toISOString() });
        if (conversation_id) {
          store.setConversationId(conversation_id);
          if (typeof window !== "undefined" && !window.location.pathname.includes(conversation_id)) {
            window.history.replaceState(null, "", `/chat/${conversation_id}`);
          }
        }
      } catch (fallbackError: any) {
        store.addMessage({
          role: "assistant",
          content: `Error: ${fallbackError.response?.data?.detail || "Failed to get response"}`,
          timestamp: new Date().toISOString(),
        });
      }
    } finally {
      store.setLoading(false);
      store.setStreaming(false);
    }
  }, [store]);

  const loadConversation = useCallback(async (conversationId: string) => {
    // If conversation is already loaded in store, don't trigger a duplicate fetch/flash
    if (store.conversationId === conversationId && store.messages.length > 0) {
      return;
    }

    try {
      store.setLoadingHistory(true);
      const response = await chatAPI.getConversation(conversationId);
      const conversation = response.data;
      store.setConversationId(conversation.id);
      store.setMessages(conversation.messages || []);
      if (conversation.document_ids?.length) store.setSelectedDocuments(conversation.document_ids);
    } catch (error) {
      console.error("Failed to load conversation:", error);
    } finally {
      store.setLoadingHistory(false);
    }
  }, [store]);

  return {
    messages: store.messages,
    conversationId: store.conversationId,
    isLoading: store.isLoading,
    isLoadingHistory: store.isLoadingHistory,
    isStreaming: store.isStreaming,
    streamingContent: store.streamingContent,
    selectedDocumentIds: store.selectedDocumentIds,
    sendMessage,
    loadConversation,
    setSelectedDocuments: store.setSelectedDocuments,
    resetChat: store.resetChat,
  };
}
