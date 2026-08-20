"use client";

import React, { useRef, useEffect, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { useDocuments } from "@/hooks/useDocuments";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { Bot, FileText, X, Check, Sparkles, HelpCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { workspacesAPI } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  }, [conversationId, initialDocumentId, initialCollectionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent, isStreaming, isLoading]);

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
    "What are the contract liabilities or key terms?",
    "List the main values, dates, and recommendations."
  ];

  return (
    <div className="flex flex-col h-full bg-black font-sans">
      
      {/* Document Selector bar */}
      <div className="border-b border-white/10 bg-[#0c0c0e] px-6 py-3 shrink-0 flex items-center justify-between z-30">
        <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 shrink-0">Search Scope:</span>
          <div className="flex items-center gap-1.5 flex-wrap max-h-16 overflow-y-auto">
            {selectedDocumentIds.length === 0 ? (
              <span className="px-3 py-1 bg-white/[0.04] border border-white/10 text-slate-200 rounded-full text-[11px] font-medium">
                All Workspace Documents
              </span>
            ) : (
              selectedDocumentIds.map((docId) => {
                const doc = documents.find((d) => d.id === docId);
                return (
                  <span key={docId} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-950/30 border border-blue-500/30 text-blue-200 rounded-full text-[11px] font-medium truncate max-w-[180px]">
                    <FileText className="h-3 w-3 shrink-0 text-blue-400" />
                    <span className="truncate">{doc?.original_filename || "Unknown"}</span>
                    <button 
                      onClick={() => toggleDocument(docId)}
                      className="text-blue-300 hover:text-white transition-colors ml-0.5"
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
          className="text-xs font-semibold text-white hover:text-blue-300 transition-colors shrink-0 ml-4 px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] rounded-full border border-white/15"
        >
          {showDocSelector ? "Hide Focus Files" : "Select Focus Files"}
        </button>
      </div>

      {/* Expandable Document Checklist Drawer */}
      {showDocSelector && (
        <div className="bg-[#0e0e12] border-b border-white/10 px-6 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto shrink-0 z-20">
          {availableDocs.map((doc) => {
            const isSelected = selectedDocumentIds.includes(doc.id);
            return (
              <button 
                key={doc.id} 
                onClick={() => toggleDocument(doc.id)}
                className={cn(
                  "flex items-center gap-2.5 p-3 rounded-2xl text-xs text-left transition-all border",
                  isSelected 
                    ? "bg-blue-600/15 text-white border-blue-500/40 font-medium" 
                    : "bg-[#0c0c0e] border-white/10 text-slate-300 hover:bg-white/[0.04] hover:text-white"
                )}
              >
                <span className={cn(
                  "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0",
                  isSelected ? "border-blue-500 bg-blue-600" : "border-white/20"
                )}>
                  {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                </span>
                <span className="truncate flex-1">{doc.original_filename}</span>
              </button>
            );
          })}
          {availableDocs.length === 0 && (
            <p className="text-xs text-slate-500 p-2 col-span-3 text-center">No completed vector indexes found. Ingest files in upload page.</p>
          )}
        </div>
      )}

      {/* Chat Messages Log Panel */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 pb-10 min-h-0">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* New Chat Welcome Banner */}
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="w-12 h-12 rounded-2xl border border-white/10 bg-[#0c0c0e] flex items-center justify-center text-white shadow-md">
                <Bot className="h-6 w-6 text-blue-400" />
              </div>
              
              <div className="space-y-1 max-w-md">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-400" /> DocAI Semantic Workspace
                </h2>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Ask questions across all indexed files. The AI extracts answers, generates summaries, and maps exact citations.
                </p>
              </div>

              {/* Suggestions shortcuts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl w-full pt-6">
                {suggestions.map((s) => (
                  <button 
                    key={s} 
                    onClick={() => sendMessage(s)} 
                    disabled={availableDocs.length === 0}
                    className="text-xs text-left p-3.5 bg-[#0c0c0e] border border-white/10 rounded-2xl text-slate-300 hover:text-white hover:border-blue-500/30 disabled:opacity-40 transition-all flex items-start gap-2.5 shadow-sm"
                  >
                    <HelpCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
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

          {/* Active Streaming / Generating response state */}
          {isStreaming && (
            <div className="flex gap-4 py-5 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-full border border-white/10 bg-[#121216] flex items-center justify-center shrink-0 text-blue-400">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-2 max-w-[85%] sm:max-w-[80%] min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">DocAI Copilot</p>
                <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl rounded-tl-sm p-5 text-sm text-slate-100 leading-relaxed shadow-md">
                  {streamingContent ? (
                    <div className="prose prose-invert max-w-none text-xs sm:text-sm">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-slate-200">{children}</p>,
                          strong: ({ children }) => <strong className="text-blue-400 font-bold">{children}</strong>,
                          b: ({ children }) => <strong className="text-blue-400 font-bold">{children}</strong>,
                          h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-4 text-blue-400 flex items-center gap-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-4 text-blue-400 flex items-center gap-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-bold mb-2 mt-3 text-blue-400 flex items-center gap-1.5">{children}</h3>,
                          h4: ({ children }) => <h4 className="text-xs font-bold mb-1.5 mt-3 text-blue-300">{children}</h4>,
                          ul: ({ children }) => <ul className="list-disc ml-4 mb-3 space-y-1.5 text-slate-200">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal ml-4 mb-3 space-y-1.5 text-slate-200">{children}</ol>,
                          li: ({ children }) => <li className="mb-0.5 leading-relaxed">{children}</li>,
                          code: ({ children }) => <code className="bg-blue-950/40 border border-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono text-xs">{children}</code>,
                        }}
                      >
                        {streamingContent}
                      </ReactMarkdown>
                      <span className="inline-block w-2 h-3.5 bg-blue-500 ml-1 animate-pulse align-middle" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-xs text-slate-300 py-1">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500 shrink-0" />
                      <span>Searching document embeddings & generating answer...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Non-streaming fallback loading state */}
          {isLoading && !isStreaming && (
            <div className="flex gap-4 py-5 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-full border border-white/10 bg-[#121216] flex items-center justify-center shrink-0 text-blue-400">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">DocAI Copilot</p>
                <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl rounded-tl-sm px-5 py-4 flex items-center gap-2.5 text-xs text-slate-300 shadow-md">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500 shrink-0" />
                  Generating answer from document sources...
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
