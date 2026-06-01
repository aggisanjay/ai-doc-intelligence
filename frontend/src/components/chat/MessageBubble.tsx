"use client";

import React, { useState } from "react";
import { ChatMessage } from "@/types";
import { User, Bot, ChevronDown, ChevronUp, FileText, Quote, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SourceCitationProps {
  source: { document_name: string; page_number: number | null; chunk_text: string; relevance_score: number };
  index: number;
}

export function SourceCitation({ source, index }: SourceCitationProps) {
  const [expanded, setExpanded] = useState(false);
  const score = Math.round(source.relevance_score * 100);
  const scoreColor = score >= 80 
    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : score >= 50 
      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
      : "text-rose-400 bg-rose-500/10 border-rose-500/20";

  return (
    <div className="bg-[#171F2E]/30 border border-white/5 rounded-xl p-3 text-xs backdrop-blur-sm transition-colors hover:border-white/10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-3.5 w-3.5 text-white/35 shrink-0" />
          <span className="text-white/80 font-semibold truncate">[{index}] {source.document_name}</span>
          {source.page_number && <span className="text-white/30 shrink-0">Page {source.page_number}</span>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn("px-1.5 py-0.5 rounded-md text-[9px] font-bold border", scoreColor)}>
            {score}% Match
          </span>
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="text-white/40 hover:text-white p-0.5 hover:bg-white/5 rounded transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-2.5 p-3 bg-white/[0.01] border-l-2 border-indigo-500 rounded-r-xl text-white/55 leading-relaxed font-mono text-[11px] relative overflow-hidden">
          <Quote className="absolute top-1 right-2 h-8 w-8 text-white/[0.02] pointer-events-none" />
          {source.chunk_text}
        </div>
      )}
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [showSources, setShowSources] = useState(false);
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex gap-4 py-6 border-b border-white/[0.02]", isUser ? "flex-row-reverse" : "file-row")}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-md transition-transform hover:scale-105",
        isUser 
          ? "bg-indigo-600 text-white" 
          : "bg-gradient-to-tr from-indigo-500 to-purple-600 text-white"
      )}>
        {isUser ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
      </div>

      {/* Main Content Container */}
      <div className="flex-1 space-y-2.5 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">
            {isUser ? "You" : "DocAI Copilot"}
          </p>
          {!isUser && (
            <button 
              onClick={handleCopy} 
              className="text-white/30 hover:text-white flex items-center gap-1 text-[10px] font-medium transition-colors"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        {/* Message Bubble Card */}
        <div className={cn(
          "rounded-2xl px-4 py-3.5 text-sm leading-relaxed max-w-none shadow-sm",
          isUser 
            ? "bg-[#1E1E2E] text-white rounded-tr-sm border border-white/5" 
            : "bg-[#171F2E]/35 text-white/90 rounded-tl-sm border border-white/5"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-invert max-w-none text-xs sm:text-sm">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc ml-4 mb-3 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal ml-4 mb-3 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="mb-0.5">{children}</li>,
                  h3: ({ children }) => <h3 className="text-base font-bold mb-2.5 mt-4 text-indigo-400">{children}</h3>,
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 border border-white/5 rounded-xl">
                      <table className="min-w-full border-collapse divide-y divide-white/5 bg-white/[0.01]">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => <th className="px-4 py-2 bg-white/[0.03] text-left text-[10px] font-semibold uppercase tracking-wider text-white/50">{children}</th>,
                  td: ({ children }) => <td className="px-4 py-2 text-xs border-t border-white/5 text-white/70">{children}</td>,
                  code: ({ children }) => <code className="bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-pink-400 font-mono text-xs">{children}</code>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Citations block */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="w-full space-y-2 pt-1">
            <button 
              onClick={() => setShowSources(!showSources)} 
              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {showSources ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {message.sources.length} document citation{message.sources.length > 1 ? "s" : ""}
            </button>
            
            {showSources && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {message.sources.map((source, idx) => (
                  <SourceCitation key={idx} source={source} index={idx + 1} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
