"use client";

import React, { useState } from "react";
import { ChatMessage } from "@/types";
import { User, Bot, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SourceCitationProps {
  source: { document_name: string; page_number: number | null; chunk_text: string; relevance_score: number };
  index: number;
}

export function SourceCitation({ source, index }: SourceCitationProps) {
  const [expanded, setExpanded] = useState(false);
  const scoreColor = source.relevance_score >= 0.8 ? "text-green-400 bg-green-500/20"
    : source.relevance_score >= 0.5 ? "text-yellow-400 bg-yellow-500/20"
    : "text-red-400 bg-red-500/20";

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-gray-300 font-medium">[{index}] {source.document_name}</span>
          {source.page_number && <span className="text-gray-500">Page {source.page_number}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${scoreColor}`}>
            {(source.relevance_score * 100).toFixed(0)}% match
          </span>
          <button onClick={() => setExpanded(!expanded)} className="text-gray-500 hover:text-gray-300">
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-2 p-2 bg-gray-800 rounded text-gray-400 leading-relaxed border-l-2 border-blue-500">
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
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 py-4", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", isUser ? "bg-blue-600" : "bg-gray-700")}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn("max-w-[80%] space-y-2", isUser ? "items-end" : "items-start")}>
        <div className={cn("rounded-2xl px-4 py-3 text-sm leading-relaxed prose prose-invert max-w-none", isUser ? "bg-blue-600 text-white rounded-tr-sm" : "bg-gray-800 text-gray-200 rounded-tl-sm")}>
          {isUser ? (
            message.content
          ) : (
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4 text-blue-400">{children}</h3>,
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border border-gray-700 divide-y divide-gray-700">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => <th className="px-3 py-2 bg-gray-700 text-left text-xs font-medium uppercase tracking-wider">{children}</th>,
                td: ({ children }) => <td className="px-3 py-2 text-sm border-t border-gray-700">{children}</td>,
                code: ({ children }) => <code className="bg-gray-900 px-1 rounded text-pink-400">{children}</code>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="w-full">
            <button onClick={() => setShowSources(!showSources)} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
              {showSources ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {message.sources.length} source{message.sources.length > 1 ? "s" : ""}
            </button>
            {showSources && (
              <div className="mt-2 space-y-2">
                {message.sources.map((source, idx) => <SourceCitation key={idx} source={source} index={idx + 1} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
