"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { chatAPI } from "@/lib/api";
import { useDocuments } from "@/hooks/useDocuments";
import { SourceCitation } from "@/types";
import { 
  Search, Sparkles, Database, ArrowRight, Loader2, FileText, 
  ChevronRight, RefreshCw, BarChart2, ShieldCheck, Check, Globe, AlertCircle
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function SearchPage() {
  const { documents } = useDocuments();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Results states
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<SourceCitation[]>([]);
  const [searchedQuery, setSearchedQuery] = useState("");
  
  // Quick Search filters
  const [modelType, setModelType] = useState<"gemini-flash" | "gemini-pro">("gemini-flash");
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [showDocFilter, setShowDocFilter] = useState(false);

  const availableDocs = documents.filter((d) => d.status === "completed");

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    setSearchedQuery(searchQuery);
    
    try {
      const response = await chatAPI.query({
        query: searchQuery,
        document_ids: selectedDocIds.length > 0 ? selectedDocIds : availableDocs.map(d => d.id)
      });
      
      const { answer: respAnswer, sources: respSources } = response.data;
      setAnswer(respAnswer);
      setSources(respSources || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to retrieve search results. Check if documents are ready.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDocSelection = (id: string) => {
    setSelectedDocIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const highestScore = sources.length > 0 
    ? Math.max(...sources.map(s => s.relevance_score)) 
    : 0;
  
  const confidencePercent = highestScore > 0 
    ? Math.round(highestScore * 100) 
    : 85;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 font-sans pb-16">
        
        {/* Title / Intro */}
        <div className="text-center py-4 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" /> AI Semantic Search
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            What would you like to discover?
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
            Search naturally across your entire document repository. DocAI extracts semantic meaning and cites source paragraphs instantly.
          </p>
        </div>

        {/* Large Search Input Area */}
        <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-start gap-3">
            <Search className="h-5 w-5 text-blue-400 mt-2 shrink-0" />
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your contracts, invoices, specifications..."
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSearch(query);
                }
              }}
              className="flex-1 bg-transparent text-white placeholder:text-slate-500 resize-none border-none focus:ring-0 focus:outline-none text-sm leading-relaxed py-1"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 mt-3">
            <div className="flex items-center gap-3">
              {/* Scope filter */}
              <div className="relative">
                <button 
                  onClick={() => setShowDocFilter(!showDocFilter)}
                  className="px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/[0.12] transition-colors flex items-center gap-1.5"
                >
                  <Database className="h-3.5 w-3.5 text-blue-400" />
                  {selectedDocIds.length === 0 
                    ? "All Documents" 
                    : `${selectedDocIds.length} select files`}
                </button>

                {showDocFilter && (
                  <div className="absolute left-0 bottom-10 w-64 bg-[#0e0e12] border border-white/15 rounded-2xl shadow-2xl z-50 p-2.5 max-h-48 overflow-y-auto space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 p-1 tracking-wider">Filter Scope</p>
                    {availableDocs.map((doc) => {
                      const isSelected = selectedDocIds.includes(doc.id);
                      return (
                        <button
                          key={doc.id}
                          onClick={() => toggleDocSelection(doc.id)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 transition-all",
                            isSelected ? "bg-blue-600/20 text-white font-medium border border-blue-500/30" : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                          )}
                        >
                          <span className={cn(
                            "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0",
                            isSelected ? "border-blue-500 bg-blue-600" : "border-white/20"
                          )}>
                            {isSelected && <Check className="h-2 w-2 text-white" />}
                          </span>
                          <span className="truncate">{doc.original_filename}</span>
                        </button>
                      );
                    })}
                    {availableDocs.length === 0 && (
                      <p className="text-[11px] text-slate-500 text-center p-2">No documents indexed yet</p>
                    )}
                  </div>
                )}
              </div>

              {/* Model selection */}
              <div className="flex bg-black/60 rounded-full p-1 border border-white/10">
                <button 
                  onClick={() => setModelType("gemini-flash")}
                  className={cn(
                    "px-3.5 py-1 text-[10px] font-semibold rounded-full uppercase tracking-wider transition-all",
                    modelType === "gemini-flash" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  )}
                >
                  Gemini 1.5
                </button>
                <button 
                  onClick={() => setModelType("gemini-pro")}
                  className={cn(
                    "px-3.5 py-1 text-[10px] font-semibold rounded-full uppercase tracking-wider transition-all",
                    modelType === "gemini-pro" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  )}
                >
                  Pro
                </button>
              </div>
            </div>

            <button
              onClick={() => handleSearch(query)}
              disabled={isLoading || !query.trim()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-full text-xs font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-95"
            >
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
              Search Engine
            </button>
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4 p-8 bg-[#0c0c0e] border border-white/10 rounded-3xl animate-pulse shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="h-4 w-32 bg-white/10 rounded" />
              <div className="h-4 w-20 bg-white/10 rounded" />
            </div>
            <div className="space-y-2.5">
              <div className="h-3 w-full bg-white/10 rounded" />
              <div className="h-3 w-[95%] bg-white/10 rounded" />
              <div className="h-3 w-[88%] bg-white/10 rounded" />
              <div className="h-3 w-[45%] bg-white/5 rounded" />
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="p-5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-3xl flex items-start gap-3 shadow-md">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold">Search query execution failed</h5>
              <p className="mt-1 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Search Results Answer Display */}
        {answer && !isLoading && (
          <div className="space-y-6">
            
            {/* Top result title bar */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Search Query Results</p>
                <h2 className="text-sm font-semibold text-white mt-0.5">&ldquo;{searchedQuery}&rdquo;</h2>
              </div>
              <button 
                onClick={() => handleSearch(searchedQuery)}
                className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                title="Regenerate search"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Answer Card */}
            <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-white">DocAI Synthesizer</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium">Confidence:</span>
                  <span className="text-xs font-bold text-emerald-400">{confidencePercent}%</span>
                  <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${confidencePercent}%` }} />
                  </div>
                </div>
              </div>

              {/* Main Markdown Text with Blue Highlights */}
              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed prose prose-invert max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-slate-200">{children}</p>,
                    strong: ({ children }) => <strong className="text-blue-400 font-bold">{children}</strong>,
                    b: ({ children }) => <strong className="text-blue-400 font-bold">{children}</strong>,
                    h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-4 text-blue-400">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-4 text-blue-400">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-bold mb-2 mt-3 text-blue-400">{children}</h3>,
                    ul: ({ children }) => <ul className="list-disc ml-4 mb-3 space-y-1.5 text-slate-200">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal ml-4 mb-3 space-y-1.5 text-slate-200">{children}</ol>,
                    li: ({ children }) => <li className="mb-0.5 leading-relaxed">{children}</li>,
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
                  {answer}
                </ReactMarkdown>
              </div>
            </div>

            {/* Sources Cards Section */}
            {sources.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-blue-400" /> Source Document Citations
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sources.map((s, idx) => {
                    const score = Math.round(s.relevance_score * 100);
                    return (
                      <div key={idx} className="p-4 bg-[#0c0c0e] border border-white/10 rounded-2xl flex flex-col justify-between hover:border-blue-500/30 transition-all shadow-sm">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                            <p className="text-xs font-semibold text-white truncate" title={s.document_name}>
                              {s.document_name}
                            </p>
                          </div>
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[9px] font-bold border shrink-0",
                            score >= 80 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/[0.04] text-slate-300 border-white/10"
                          )}>
                            {score}% Match
                          </span>
                        </div>
                        
                        <p className="text-[11px] text-slate-300 line-clamp-3 bg-black/60 border border-white/10 p-3 rounded-xl leading-relaxed mb-2 font-mono">
                          &ldquo;{s.chunk_text}&rdquo;
                        </p>
                        
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          {s.page_number && <span>Page {s.page_number}</span>}
                          <span>Index [{idx + 1}]</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Related Questions / Actions */}
            <div className="p-6 bg-[#0c0c0e] border border-white/10 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
                <span className="text-xs text-slate-300 font-medium">Need a deeper analysis of these findings?</span>
              </div>
              <Link href="/chat/new">
                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all shadow-sm">
                  Launch Copilot Chat <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>

          </div>
        )}

      </div>
    </AppShell>
  );
}
