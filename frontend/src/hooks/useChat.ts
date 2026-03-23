"use client";

import { useCallback } from "react";
import { chatAPI } from "@/lib/api";
import { useChatStore } from "@/stores/chatStore";
import { ChatMessage, SourceCitation } from "@/types";

export function useChat() {
  const store = useChatStore();

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
          case "done": store.finalizeStreaming(sources); break;
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
        store.setConversationId(conversation_id);
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
    try {
      const response = await chatAPI.getConversation(conversationId);
      const conversation = response.data;
      store.setConversationId(conversation.id);
      store.setMessages(conversation.messages);
      if (conversation.document_ids?.length) store.setSelectedDocuments(conversation.document_ids);
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  }, [store]);

  return {
    messages: store.messages,
    conversationId: store.conversationId,
    isLoading: store.isLoading,
    isStreaming: store.isStreaming,
    streamingContent: store.streamingContent,
    selectedDocumentIds: store.selectedDocumentIds,
    sendMessage,
    loadConversation,
    setSelectedDocuments: store.setSelectedDocuments,
    resetChat: store.resetChat,
  };
}
