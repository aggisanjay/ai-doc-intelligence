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
      : "text-slate-400 bg-white/[0.04] border-white/10";

  return (
    <div className="bg-[#0c0c0e] border border-white/10 rounded-2xl p-3.5 text-xs transition-all hover:border-blue-500/30 self-start w-full shadow-sm">
      <div 
        onClick={() => setExpanded(!expanded)} 
        className="flex items-center justify-between gap-3 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          <span className="text-white font-medium truncate" title={source.document_name}>
            [{index}] {source.document_name}
          </span>
          {source.page_number && (
            <span className="text-slate-300 shrink-0 text-[10px] bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded-full font-medium">
              p. {source.page_number}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold border", scoreColor)}>
            {score}% Match
          </span>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="text-slate-400 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-2.5 p-3.5 bg-black/50 border-l-2 border-blue-500 rounded-r-xl text-slate-200 leading-relaxed font-mono text-[11px] relative overflow-hidden">
          <Quote className="absolute top-1 right-2 h-8 w-8 text-blue-500/10 pointer-events-none" />
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

  const displayContent = isUser 
    ? message.content 
    : message.content.replace(/\n*\[Source: [^\]]+\]\s*$/gi, '').trim();

  return (
    <div className={cn("flex gap-4 py-5 border-b border-white/[0.06]", isUser ? "flex-row-reverse" : "")}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-transform shadow-sm",
        isUser 
          ? "bg-blue-600 border-blue-500 text-white font-bold" 
          : "bg-[#121216] border-white/10 text-blue-400"
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Main Content Container */}
      <div className={cn("space-y-2 max-w-[85%] sm:max-w-[80%]", isUser ? "items-end" : "flex-1 min-w-0")}>
        <div className={cn("flex items-center gap-2", isUser ? "justify-end" : "justify-between")}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isUser ? "You" : "DocAI Copilot"}
          </p>
          {!isUser && (
            <button 
              onClick={handleCopy} 
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] font-medium transition-colors bg-white/[0.04] hover:bg-white/[0.08] px-2 py-0.5 rounded-full border border-white/10"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        {/* Message Bubble Card */}
        <div className={cn(
          "rounded-3xl text-sm leading-relaxed shadow-md transition-all",
          isUser 
            ? "bg-blue-600 text-white rounded-tr-sm font-medium px-5 py-3.5 border border-blue-500/50" 
            : "bg-[#0c0c0e] text-slate-100 rounded-tl-sm border border-white/10 p-5 sm:p-6"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed text-white text-sm">{message.content}</p>
          ) : (
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
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-blue-500 bg-blue-950/20 px-3.5 py-2 my-3 rounded-r-xl text-slate-200 italic">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-4">
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 border border-white/10 rounded-2xl bg-black/60">
                      <table className="min-w-full border-collapse divide-y divide-white/10">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => <th className="px-4 py-2.5 bg-white/[0.04] text-left text-[11px] font-bold uppercase tracking-wider text-blue-400">{children}</th>,
                  td: ({ children }) => <td className="px-4 py-2.5 text-xs border-t border-white/10 text-slate-300">{children}</td>,
                  code: ({ children }) => <code className="bg-blue-950/40 border border-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono text-xs">{children}</code>,
                }}
              >
                {displayContent}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Citations block */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="w-full space-y-2 pt-1">
            <button 
              onClick={() => setShowSources(!showSources)} 
              className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors bg-white/[0.05] hover:bg-white/[0.1] px-3 py-1 rounded-full border border-white/10"
            >
              {showSources ? <ChevronUp className="h-3.5 w-3.5 text-blue-400" /> : <ChevronDown className="h-3.5 w-3.5 text-blue-400" />}
              {message.sources.length} document citation{message.sources.length > 1 ? "s" : ""}
            </button>
            
            {showSources && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2 items-start">
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
