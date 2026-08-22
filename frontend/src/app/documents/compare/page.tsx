"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { documentsAPI } from "@/lib/api";
import { useDocuments } from "@/hooks/useDocuments";
import { 
  FileText, ArrowLeftRight, Loader2, AlertTriangle, Play,
  CheckCircle2, XCircle, Info, ChevronDown, Sparkles
} from "lucide-react";
import Link from "next/link";

export default function DocumentComparePage() {
  const { documents: allDocs, isLoading: isLoadingDocs } = useDocuments();
  const documents = allDocs.filter((d: any) => d.status === "completed");
  
  // Selection
  const [docAId, setDocAId] = useState("");
  const [docBId, setDocBId] = useState("");

  // Comparison Results
  const [comparison, setComparison] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

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
          <div className="w-10 h-10 rounded-2xl border border-white/10 bg-[#0c0c0e] text-blue-400 flex items-center justify-center shadow-sm">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Document Comparison</h1>
            <p className="text-slate-400 text-xs mt-0.5">Analyze key differences, revisions, additions, and similarity scores between file versions</p>
          </div>
        </div>

        {/* Ingestion Selection Area */}
        <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* Document A Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Original Document (Version A)</label>
              {isLoadingDocs ? (
                <div className="h-10 bg-white/5 animate-pulse rounded-full" />
              ) : (
                <select
                  value={docAId}
                  onChange={(e) => setDocAId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-full text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors"
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
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Revised Document (Version B)</label>
              {isLoadingDocs ? (
                <div className="h-10 bg-white/5 animate-pulse rounded-full" />
              ) : (
                <select
                  value={docBId}
                  onChange={(e) => setDocBId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-full text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                >
                  <option value="">Select Document B...</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>{d.original_filename}</option>
                  ))}
                </select>
              )}
            </div>

          </div>

          <div className="mt-6 border-t border-white/10 pt-5 flex justify-end">
            <button
              onClick={handleRunComparison}
              disabled={isComparing || !docAId || !docBId}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 text-white rounded-full text-xs font-semibold shadow-sm transition-all"
            >
              {isComparing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing Documents...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" /> Run Comparison
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Notice */}
        {compareError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-2xl flex items-center gap-2 shadow-sm">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{compareError}</span>
          </div>
        )}

        {/* Loading state */}
        {isComparing && (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0c0c0e] border border-white/10 rounded-3xl animate-pulse shadow-lg">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <h4 className="mt-3 font-bold text-sm text-white">Comparing semantic tokens</h4>
            <p className="text-[11px] text-slate-400 max-w-xs text-center mt-1">
              Analyzing layout shifts, omissions, key differences, and compiling comparison scores...
            </p>
          </div>
        )}

        {/* Comparison Outputs */}
        {comparison && (
          <div className="space-y-6">
            
            {/* Top Score & Summary Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Radial similarity indicator */}
              <div className="lg:col-span-4 bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">Overall Similarity</h3>
                
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="42" 
                      stroke="#2563EB" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={(2 * Math.PI * 42) * (1 - comparison.similarityScore / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-white tracking-tight">{comparison.similarityScore}%</span>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Match</span>
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="lg:col-span-8 bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <Sparkles className="h-3.5 w-3.5 text-blue-400" /> Executive Summary
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    {comparison.executiveSummary}
                  </p>
                </div>
                
                <div className="border-t border-white/10 mt-5 pt-3 flex items-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                  <Info className="h-4 w-4 text-blue-400" /> Grounded in actual document segments
                </div>
              </div>

            </div>

            {/* Omissions & Additions Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Key differences */}
              <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 space-y-4 shadow-md">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest border-b border-white/10 pb-3">Key Differences</h4>
                <ul className="space-y-2.5">
                  {(comparison.keyDifferences || []).map((diff: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                      <span>{diff}</span>
                    </li>
                  ))}
                  {(!comparison.keyDifferences || comparison.keyDifferences.length === 0) && (
                    <p className="text-xs text-slate-500 italic">No significant differences listed.</p>
                  )}
                </ul>
              </div>

              {/* Added information */}
              <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 space-y-4 shadow-md">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest border-b border-white/10 pb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Added Information (In B)
                </h4>
                <ul className="space-y-2.5">
                  {(comparison.addedInformation || []).map((add: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                      <span>{add}</span>
                    </li>
                  ))}
                  {(!comparison.addedInformation || comparison.addedInformation.length === 0) && (
                    <p className="text-xs text-slate-500 italic text-center py-4">No content additions detected.</p>
                  )}
                </ul>
              </div>

              {/* Removed information */}
              <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 space-y-4 shadow-md">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest border-b border-white/10 pb-3 flex items-center gap-1.5">
                  <XCircle className="h-4 w-4" /> Removed Information (Not in B)
                </h4>
                <ul className="space-y-2.5">
                  {(comparison.removedInformation || []).map((rem: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                      <span>{rem}</span>
                    </li>
                  ))}
                  {(!comparison.removedInformation || comparison.removedInformation.length === 0) && (
                    <p className="text-xs text-slate-500 italic text-center py-4">No content omissions detected.</p>
                  )}
                </ul>
              </div>

            </div>

            {/* Changed sections side-by-side comparison tables */}
            {comparison.changedSections && comparison.changedSections.length > 0 && (
              <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Section-by-Section Changes</h4>
                
                <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/40">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-4 w-[20%]">Section</th>
                        <th className="p-4 w-[35%]">Original Content (A)</th>
                        <th className="p-4 w-[35%]">New Content (B)</th>
                        <th className="p-4 w-[10%]">Reasoning</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-xs text-slate-300">
                      {comparison.changedSections.map((sec: any, idx: number) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="p-4 font-semibold text-white align-top">{sec.sectionTitle}</td>
                          <td className="p-4 font-mono text-[11px] text-rose-300 align-top leading-relaxed whitespace-pre-line">{sec.originalContent}</td>
                          <td className="p-4 font-mono text-[11px] text-emerald-300 align-top leading-relaxed whitespace-pre-line">{sec.newContent}</td>
                          <td className="p-4 text-[11px] text-slate-400 align-top leading-relaxed">{sec.explanation}</td>
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
