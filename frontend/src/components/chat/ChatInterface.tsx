"use client";

import React, { useRef, useEffect, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { useDocuments } from "@/hooks/useDocuments";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { Bot, FileText, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  initialDocumentId?: string;
  conversationId?: string;
}

export function ChatInterface({ initialDocumentId, conversationId }: ChatInterfaceProps) {
  const { messages, isLoading, isStreaming, streamingContent, selectedDocumentIds, sendMessage, loadConversation, setSelectedDocuments, resetChat } = useChat();
  const { documents } = useDocuments();
  const [showDocSelector, setShowDocSelector] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId && conversationId !== "new") loadConversation(conversationId);
    else {
      resetChat();
      if (initialDocumentId) setSelectedDocuments([initialDocumentId]);
    }
  }, [conversationId, initialDocumentId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streamingContent]);

  const availableDocs = documents.filter((d) => d.status === "completed");

  const toggleDocument = (docId: string) => {
    setSelectedDocuments(selectedDocumentIds.includes(docId)
      ? selectedDocumentIds.filter((id) => id !== docId)
      : [...selectedDocumentIds, docId]
    );
  };

  const suggestions = ["What is the main topic of this document?", "Summarize the key findings", "What are the conclusions?", "List the main recommendations"];

  return (
    <div className="flex flex-col h-full">
      {/* Document selector bar */}
      <div className="border-b border-gray-800 bg-gray-900/50 px-4 py-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Searching in:</span>
          {selectedDocumentIds.length === 0 ? (
            <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full text-xs">All documents</span>
          ) : (
            selectedDocumentIds.map((docId) => {
              const doc = documents.find((d) => d.id === docId);
              return (
                <span key={docId} className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                  <FileText className="h-3 w-3" />
                  {doc?.original_filename || "Unknown"}
                  <button onClick={() => toggleDocument(docId)}><X className="h-3 w-3 ml-0.5 hover:text-red-400" /></button>
                </span>
              );
            })
          )}
          <button onClick={() => setShowDocSelector(!showDocSelector)} className="text-xs text-gray-500 hover:text-gray-300">
            {showDocSelector ? "Hide" : "Select documents"}
          </button>
        </div>

        {showDocSelector && (
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-40 overflow-auto">
            {availableDocs.map((doc) => {
              const isSelected = selectedDocumentIds.includes(doc.id);
              return (
                <button key={doc.id} onClick={() => toggleDocument(doc.id)}
                  className={cn("flex items-center gap-2 p-2 rounded text-xs text-left transition-colors", isSelected ? "bg-blue-500/20 text-blue-300" : "bg-gray-800/50 text-gray-400 hover:bg-gray-800")}
                >
                  {isSelected ? <Check className="h-3 w-3 text-blue-400 shrink-0" /> : <FileText className="h-3 w-3 shrink-0" />}
                  <span className="truncate">{doc.original_filename}</span>
                </button>
              );
            })}
            {availableDocs.length === 0 && (
              <p className="text-xs text-gray-600 p-2 col-span-2 text-center">No processed documents available.</p>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-auto px-4">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-300">Ask anything about your documents</h2>
              <p className="text-gray-500 mt-2 text-center max-w-md">I'll search through your documents and provide accurate answers with source citations.</p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => sendMessage(s)} className="text-xs text-left p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-300 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => <MessageBubble key={idx} message={msg} />)}

          {isStreaming && streamingContent && (
            <div className="flex gap-3 py-4">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0"><Bot className="h-4 w-4" /></div>
              <div className="max-w-[80%]">
                <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-200 leading-relaxed">
                  {streamingContent}
                  <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {isLoading && !isStreaming && (
            <div className="flex gap-3 py-4">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0"><Bot className="h-4 w-4" /></div>
              <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="flex gap-1">
                    {[0, 0.1, 0.2].map((delay) => (
                      <span key={delay} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
                    ))}
                  </div>
                  Searching documents and generating answer...
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ChatInput onSend={sendMessage} isLoading={isLoading || isStreaming} disabled={availableDocs.length === 0} />
    </div>
  );
}
