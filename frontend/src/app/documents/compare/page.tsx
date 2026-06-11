"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { documentsAPI } from "@/lib/api";
import { 
  FileText, ArrowLeftRight, Loader2, AlertTriangle, Play,
  CheckCircle2, XCircle, Info, ChevronDown, Sparkles
} from "lucide-react";
import Link from "next/link";

export default function DocumentComparePage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  
  // Selection
  const [docAId, setDocAId] = useState("");
  const [docBId, setDocBId] = useState("");

  // Comparison Results
  const [comparison, setComparison] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await documentsAPI.list();
        // Filter only completed documents
        const completed = (res.data.documents || []).filter((d: any) => d.status === "completed");
        setDocuments(completed);
      } catch (err) {
        console.error("Failed to load documents", err);
      } finally {
        setIsLoadingDocs(false);
      }
    }
    loadDocs();
  }, []);

  const handleRunComparison = async () => {
    if (!docAId || !docBId) return;
    if (docAId === docBId) {
      setCompareError("Please select two different documents to compare.");
      return;
    }

    setIsComparing(true);
    setCompareError(null);
    setComparison(null);

    try {
      const res = await documentsAPI.compare(docAId, docBId);
      setComparison(res.data);
    } catch (err: any) {
      setCompareError(err.response?.data?.detail || "Failed to compare documents. Make sure backend GEMINI_API_KEY is active.");
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8 font-sans pb-24">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/15 text-indigo-400 flex items-center justify-center">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Document Comparison</h1>
            <p className="text-white/40 text-xs mt-0.5">Analyze key differences, revisions, additions, and similarity scores between file versions</p>
          </div>
        </div>

        {/* Ingestion Selection Area */}
        <div className="bg-[#171F2E]/30 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Document A Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Original Document (Version A)</label>
              {isLoadingDocs ? (
                <div className="h-10 bg-white/5 animate-pulse rounded-xl" />
              ) : (
                <select
                  value={docAId}
                  onChange={(e) => setDocAId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0A0A0F] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                >
                  <option value="">Select Document A...</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>{d.original_filename}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Document B Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Revised Document (Version B)</label>
              {isLoadingDocs ? (
                <div className="h-10 bg-white/5 animate-pulse rounded-xl" />
              ) : (
                <select
                  value={docBId}
                  onChange={(e) => setDocBId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0A0A0F] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                >
                  <option value="">Select Document B...</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>{d.original_filename}</option>
                  ))}
                </select>
              )}
            </div>

          </div>

          <div className="mt-6 border-t border-white/5 pt-5 flex justify-end">
            <button
              onClick={handleRunComparison}
              disabled={isComparing || !docAId || !docBId}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/15 transition-all"
            >
              {isComparing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Analyzing Documents...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Run Side-by-Side Comparison
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Notice */}
        {compareError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{compareError}</span>
          </div>
        )}

        {/* Loading state */}
        {isComparing && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01] border border-white/5 rounded-2xl animate-pulse">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <h4 className="mt-3 font-bold text-sm text-white">Comparing semantic tokens</h4>
            <p className="text-[10px] text-white/30 max-w-xs text-center mt-1">
              Analyzing layout shifts, omissions, key differences, and compiling quality comparison scores via Gemini...
            </p>
          </div>
        )}

        {/* Comparison Outputs */}
        {comparison && (
          <div className="space-y-6">
            
            {/* Top Score & Summary Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Radial similarity indicator */}
              <div className="lg:col-span-4 bg-[#171F2E]/35 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-[-30px] left-[-30px] w-20 h-20 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
                
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Overall Similarity</h3>
                
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="42" 
                      stroke="url(#compareGlow)" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={(2 * Math.PI * 42) * (1 - comparison.similarityScore / 100)}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="compareGlow" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#06B6D4" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-white tracking-tight">{comparison.similarityScore}%</span>
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider -mt-1">Match score</span>
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="lg:col-span-8 bg-[#171F2E]/35 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Executive Comparison Summary
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium">
                    {comparison.executiveSummary}
                  </p>
                </div>
                
                <div className="border-t border-white/5 mt-5 pt-3 flex items-center gap-2 text-[10px] text-white/30 font-medium uppercase tracking-wide">
                  <Info className="h-4.5 w-4.5 text-indigo-400" /> Grounded in actual document segments
                </div>
              </div>

            </div>

            {/* Omissions & Additions Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Key differences */}
              <div className="bg-[#171F2E]/25 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-white/80 uppercase tracking-widest border-b border-white/5 pb-2">Key Differences</h4>
                <ul className="space-y-2.5">
                  {(comparison.keyDifferences || []).map((diff: string, idx: number) => (
                    <li key={idx} className="text-[11px] text-white/70 leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                      <span>{diff}</span>
                    </li>
                  ))}
                  {(!comparison.keyDifferences || comparison.keyDifferences.length === 0) && (
                    <p className="text-[10px] text-white/30 italic">No significant differences listed.</p>
                  )}
                </ul>
              </div>

              {/* Added information */}
              <div className="bg-[#171F2E]/25 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Added Information (In B)
                </h4>
                <ul className="space-y-2.5">
                  {(comparison.addedInformation || []).map((add: string, idx: number) => (
                    <li key={idx} className="text-[11px] text-white/70 leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                      <span>{add}</span>
                    </li>
                  ))}
                  {(!comparison.addedInformation || comparison.addedInformation.length === 0) && (
                    <p className="text-[10px] text-white/30 italic text-center py-4">No content additions detected.</p>
                  )}
                </ul>
              </div>

              {/* Removed information */}
              <div className="bg-[#171F2E]/25 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-1.5">
                  <XCircle className="h-4 w-4" /> Removed Information (Not in B)
                </h4>
                <ul className="space-y-2.5">
                  {(comparison.removedInformation || []).map((rem: string, idx: number) => (
                    <li key={idx} className="text-[11px] text-white/70 leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                      <span>{rem}</span>
                    </li>
                  ))}
                  {(!comparison.removedInformation || comparison.removedInformation.length === 0) && (
                    <p className="text-[10px] text-white/30 italic text-center py-4">No content omissions detected.</p>
                  )}
                </ul>
              </div>

            </div>

            {/* Changed sections side-by-side comparison tables */}
            {comparison.changedSections && comparison.changedSections.length > 0 && (
              <div className="bg-[#171F2E]/30 border border-white/5 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                <h4 className="text-xs font-bold text-white/80 uppercase tracking-widest">Section-by-Section Changes</h4>
                
                <div className="border border-white/5 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.01] border-b border-white/5 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                        <th className="p-4 w-[20%]">Section</th>
                        <th className="p-4 w-[35%]">Original Content (A)</th>
                        <th className="p-4 w-[35%]">New Content (B)</th>
                        <th className="p-4 w-[10%]">Reasoning</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-white/70">
                      {comparison.changedSections.map((sec: any, idx: number) => (
                        <tr key={idx} className="hover:bg-white/[0.005]">
                          <td className="p-4 font-bold text-white/80 align-top">{sec.sectionTitle}</td>
                          <td className="p-4 font-mono text-[10px] bg-rose-950/5 text-rose-300 align-top leading-relaxed whitespace-pre-line">{sec.originalContent}</td>
                          <td className="p-4 font-mono text-[10px] bg-emerald-950/5 text-emerald-300 align-top leading-relaxed whitespace-pre-line">{sec.newContent}</td>
                          <td className="p-4 text-[10px] text-white/50 align-top leading-relaxed">{sec.explanation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </AppShell>
  );
}
