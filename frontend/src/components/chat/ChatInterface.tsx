"use client";

import React, { useRef, useEffect, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { useDocuments } from "@/hooks/useDocuments";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { Bot, FileText, X, Check, Sparkles, HelpCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { workspacesAPI } from "@/lib/api";

interface ChatInterfaceProps {
  initialDocumentId?: string;
  initialCollectionId?: string;
  conversationId?: string;
}

export function ChatInterface({ initialDocumentId, initialCollectionId, conversationId }: ChatInterfaceProps) {
  const { 
    messages, isLoading, isStreaming, streamingContent, selectedDocumentIds, 
    sendMessage, loadConversation, setSelectedDocuments, resetChat 
  } = useChat();
  const { documents } = useDocuments();
  const [showDocSelector, setShowDocSelector] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId && conversationId !== "new") {
      loadConversation(conversationId);
    } else {
      resetChat();
      if (initialDocumentId) {
        setSelectedDocuments([initialDocumentId]);
      } else if (initialCollectionId) {
        workspacesAPI.getCollection(initialCollectionId)
          .then((res) => {
            const docs = res.data.documents || [];
            setSelectedDocuments(docs.map((d: any) => d.id));
          })
          .catch((err) => console.error("Error setting folder chat scope:", err));
      }
    }
    // Only re-run the effect when the route/prop conversation or initial doc ID changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, initialDocumentId, initialCollectionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const availableDocs = documents.filter((d) => d.status === "completed");

  const toggleDocument = (docId: string) => {
    setSelectedDocuments(selectedDocumentIds.includes(docId)
      ? selectedDocumentIds.filter((id) => id !== docId)
      : [...selectedDocumentIds, docId]
    );
  };

  const suggestions = [
    "What is the main topic of this document?",
    "Summarize the key findings in 3 bullet points.",
    "What are the contract liabilities or termination clauses?",
    "List the main dates, values, and recommendations."
  ];

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F] font-sans">
      
      {/* Document Selector bar */}
      <div className="border-b border-white/5 bg-[#111827]/40 backdrop-blur-md px-6 py-3 shrink-0 flex items-center justify-between z-30">
        <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/35 shrink-0">Search Context:</span>
          <div className="flex items-center gap-1.5 flex-wrap max-h-16 overflow-y-auto">
            {selectedDocumentIds.length === 0 ? (
              <span className="px-2 py-0.5 bg-white/5 border border-white/5 text-white/45 rounded-md text-[10px] font-semibold">
                All Documents (Universal Search)
              </span>
            ) : (
              selectedDocumentIds.map((docId) => {
                const doc = documents.find((d) => d.id === docId);
                return (
                  <span key={docId} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md text-[10px] font-semibold truncate max-w-[150px]">
                    <FileText className="h-3 w-3 shrink-0" />
                    {doc?.original_filename || "Unknown"}
                    <button 
                      onClick={() => toggleDocument(docId)}
                      className="text-indigo-400 hover:text-rose-400 transition-colors ml-0.5"
                    >
                      <X className="h-3 w-3 shrink-0" />
                    </button>
                  </span>
                );
              })
            )}
          </div>
        </div>

        <button 
          onClick={() => setShowDocSelector(!showDocSelector)} 
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors shrink-0 ml-4 px-2.5 py-1 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-lg border border-indigo-500/10"
        >
          {showDocSelector ? "Hide Focus Selector" : "Choose Ingested Files"}
        </button>
      </div>

      {/* Expandable Document Checklist Drawer */}
      {showDocSelector && (
        <div className="bg-[#171F2E]/80 border-b border-white/5 px-6 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto shrink-0 z-20 backdrop-blur-md">
          {availableDocs.map((doc) => {
            const isSelected = selectedDocumentIds.includes(doc.id);
            return (
              <button 
                key={doc.id} 
                onClick={() => toggleDocument(doc.id)}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-xl text-xs text-left transition-all border",
                  isSelected 
                    ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/25" 
                    : "bg-white/[0.01] border-white/5 text-white/55 hover:bg-white/[0.03] hover:text-white"
                )}
              >
                <span className={cn(
                  "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0",
                  isSelected ? "border-indigo-400 bg-indigo-500" : "border-white/20"
                )}>
                  {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                </span>
                <span className="truncate flex-1">{doc.original_filename}</span>
              </button>
            );
          })}
          {availableDocs.length === 0 && (
            <p className="text-xs text-white/30 p-2 col-span-3 text-center">No completed vector indexes found. Ingest files in upload page.</p>
          )}
        </div>
      )}

      {/* Chat Messages Log Panel */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* New Chat Welcome Banner */}
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="relative flex items-center justify-center">
                {/* Glow layer */}
                <div className="absolute w-20 h-20 rounded-full bg-indigo-500/15 blur-2xl animate-pulse" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg relative">
                  <Bot className="h-7 w-7 text-white" />
                </div>
              </div>
              
              <div className="space-y-1 max-w-md">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-400" /> DocAI Semantic Workspace
                </h2>
                <p className="text-white/45 text-xs">
                  Ask complex questions about your vector-embedded documents. The AI searches, compiles details, and maps exact citations.
                </p>
              </div>

              {/* Suggestions shortcuts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl w-full pt-6">
                {suggestions.map((s) => (
                  <button 
                    key={s} 
                    onClick={() => sendMessage(s)} 
                    disabled={availableDocs.length === 0}
                    className="text-xs text-left p-3.5 bg-white/[0.01] border border-white/5 rounded-xl text-white/55 hover:bg-white/[0.03] hover:text-indigo-300 disabled:opacity-40 hover:border-white/10 transition-colors flex items-start gap-2.5"
                  >
                    <HelpCircle className="h-4 w-4 text-indigo-500/60 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Render individual bubbles */}
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))}

          {/* Live text output for streaming responses */}
          {isStreaming && streamingContent && (
            <div className="flex gap-4 py-6 border-b border-white/[0.02]">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">DocAI Copilot</p>
                <div className="bg-[#171F2E]/35 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-white/90 leading-relaxed shadow-sm">
                  {streamingContent}
                  <span className="inline-block w-2.5 h-4 bg-indigo-400 ml-1 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* Core model latency loading state */}
          {isLoading && !isStreaming && (
            <div className="flex gap-4 py-6 border-b border-white/[0.02] animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 text-indigo-400">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-450">DocAI Copilot</p>
                <div className="bg-[#171F2E]/25 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-2.5 text-xs text-white/45">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400 shrink-0" />
                  Generating context and fetching exact source embeddings...
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input container bar */}
      <ChatInput 
        onSend={sendMessage} 
        isLoading={isLoading || isStreaming} 
        disabled={availableDocs.length === 0} 
      />
    </div>
  );
}
