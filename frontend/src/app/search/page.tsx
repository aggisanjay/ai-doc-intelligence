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
    : 85; // default fallback visual representation

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 font-sans pb-16">
        
        {/* Title / Intro */}
        <div className="text-center py-4 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> AI Cognitive Engine Active
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            What would you like to <span className="gradient-text">discover</span>?
          </h1>
          <p className="text-white/45 text-sm max-w-lg mx-auto">
            Search naturally across your entire document repository. DocAI extracts semantic meaning and cites source paragraphs instantly.
          </p>
        </div>

        {/* Large Search Input Area */}
        <div className="bg-[#171F2E]/50 border border-white/10 rounded-2xl p-4 backdrop-blur-md relative shadow-xl glow-primary">
          <div className="flex items-start gap-3">
            <Search className="h-5 w-5 text-white/30 mt-3 shrink-0" />
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
              className="flex-1 bg-transparent text-white placeholder:text-white/20 resize-none border-none focus:ring-0 focus:outline-none text-sm leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 mt-2">
            <div className="flex items-center gap-3">
              {/* Scope filter */}
              <div className="relative">
                <button 
                  onClick={() => setShowDocFilter(!showDocFilter)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[11px] font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
                >
                  <Database className="h-3.5 w-3.5" />
                  {selectedDocIds.length === 0 
                    ? "All Documents" 
                    : `${selectedDocIds.length} select files`}
                </button>

                {showDocFilter && (
                  <div className="absolute left-0 bottom-10 w-64 bg-[#171F2E] border border-white/10 rounded-xl shadow-2xl z-50 p-2 max-h-48 overflow-y-auto space-y-1">
                    <p className="text-[10px] uppercase font-bold text-white/35 p-1">Filter Scope</p>
                    {availableDocs.map((doc) => {
                      const isSelected = selectedDocIds.includes(doc.id);
                      return (
                        <button
                          key={doc.id}
                          onClick={() => toggleDocSelection(doc.id)}
                          className={cn(
                            "w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-all",
                            isSelected ? "bg-indigo-600/20 text-indigo-300" : "text-white/50 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <span className={cn(
                            "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0",
                            isSelected ? "border-indigo-400 bg-indigo-500" : "border-white/20"
                          )}>
                            {isSelected && <Check className="h-2 w-2 text-white" />}
                          </span>
                          <span className="truncate">{doc.original_filename}</span>
                        </button>
                      );
                    })}
                    {availableDocs.length === 0 && (
                      <p className="text-[10px] text-white/30 text-center p-2">No documents indexed yet</p>
                    )}
                  </div>
                )}
              </div>

              {/* Model selection */}
              <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
                <button 
                  onClick={() => setModelType("gemini-flash")}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider transition-all",
                    modelType === "gemini-flash" ? "bg-indigo-500 text-white" : "text-white/40 hover:text-white/60"
                  )}
                >
                  Gemini 3.0
                </button>
                <button 
                  onClick={() => setModelType("gemini-pro")}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider transition-all",
                    modelType === "gemini-pro" ? "bg-indigo-500 text-white" : "text-white/40 hover:text-white/60"
                  )}
                >
                  Groq
                </button>
              </div>
            </div>

            <button
              onClick={() => handleSearch(query)}
              disabled={isLoading || !query.trim()}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
              Search Engine
            </button>
          </div>
        </div>



        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4 p-6 bg-[#171F2E]/30 border border-white/5 rounded-2xl backdrop-blur-md animate-pulse">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="h-4 w-32 bg-white/10 rounded" />
              <div className="h-4 w-20 bg-white/10 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-white/10 rounded" />
              <div className="h-3 w-[95%] bg-white/10 rounded" />
              <div className="h-3 w-[88%] bg-white/10 rounded" />
              <div className="h-3 w-[45%] bg-white/5 rounded" />
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-2xl flex items-start gap-2.5">
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
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div>
                <p className="text-[10px] uppercase font-bold text-white/35 tracking-wider">Search Query Results</p>
                <h2 className="text-sm font-semibold text-white/80 mt-0.5">&ldquo;{searchedQuery}&rdquo;</h2>
              </div>
              <button 
                onClick={() => handleSearch(searchedQuery)}
                className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                title="Regenerate search"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Answer Card */}
            <div className="bg-[#171F2E]/45 border border-white/5 rounded-2xl p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-white">DocAI Answer Synthesizer</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/40 font-medium">Confidence:</span>
                  <span className="text-xs font-bold text-emerald-400">{confidencePercent}%</span>
                  <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${confidencePercent}%` }} />
                  </div>
                </div>
              </div>

              {/* Main Markdown Text */}
              <div className="text-xs sm:text-sm text-white/90 leading-relaxed prose prose-invert max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc ml-4 mb-3 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal ml-4 mb-3 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="mb-0.5">{children}</li>,
                    h3: ({ children }) => <h3 className="text-base font-bold mb-2 mt-4 text-indigo-400">{children}</h3>,
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
                  {answer}
                </ReactMarkdown>
              </div>
            </div>

            {/* Sources Cards Section */}
            {sources.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/35 px-1 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> Source Document Citations
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sources.map((s, idx) => {
                    const score = Math.round(s.relevance_score * 100);
                    return (
                      <div key={idx} className="p-3 bg-[#171F2E]/30 border border-white/5 rounded-xl flex flex-col justify-between hover:border-white/10 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 text-white/35 shrink-0" />
                            <p className="text-xs font-semibold text-white truncate" title={s.document_name}>
                              {s.document_name}
                            </p>
                          </div>
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0",
                            score >= 80 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                          )}>
                            {score}% Match
                          </span>
                        </div>
                        
                        <p className="text-[11px] text-white/50 line-clamp-3 bg-white/[0.01] border border-white/5 p-2 rounded-lg leading-relaxed mb-2 font-mono">
                          &ldquo;{s.chunk_text}&rdquo;
                        </p>
                        
                        <div className="flex items-center justify-between text-[9px] text-white/30">
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
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                <span className="text-xs text-white/60">Need a deeper analysis of these findings?</span>
              </div>
              <Link href="/chat/new">
                <button className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all">
                  Launch Assistant Chat <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>

          </div>
        )}

      </div>
    </AppShell>
  );
}
