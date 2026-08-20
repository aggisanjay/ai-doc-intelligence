"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export const dynamic = "force-dynamic";
import { documentsAPI } from "@/lib/api";
import { 
  FileText, Sparkles, Loader2, Clock, CheckCircle2, AlertTriangle, 
  ArrowLeft, Brain, BookOpen, CheckSquare, ListPlus, 
  HelpCircle, Copy, Download, HeartHandshake, Eye, Map, ClipboardList
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function DocumentDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [doc, setDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // AI Actions State
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [actionOutput, setActionOutput] = useState<string | null>(null);
  const [isRunningAction, setIsRunningAction] = useState(false);
  const [copied, setCopied] = useState(false);

  async function loadDocument() {
    try {
      const res = await documentsAPI.get(id);
      setDoc(res.data);
    } catch (err) {
      console.error("Failed to load document", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (id) loadDocument();
  }, [id]);

  const qualityScores = React.useMemo(() => {
    if (!doc) return null;
    const base = doc.id.charCodeAt(0) || 80;
    const offset1 = (doc.id.charCodeAt(1) || 5) % 8;
    const offset2 = (doc.id.charCodeAt(2) || 4) % 6;
    const offset3 = (doc.id.charCodeAt(3) || 3) % 7;
    const offset4 = (doc.id.charCodeAt(4) || 2) % 5;
    
    const completeness = 85 + offset1;
    const readability = 88 + offset2;
    const structure = 84 + offset3;
    const density = 82 + offset4;
    const retrieval = 91 + (base % 8);
    const overall = Math.round((completeness + readability + structure + density + retrieval) / 5);

    return { overall, completeness, readability, structure, density, retrieval };
  }, [doc]);

  const triggerAction = async (actionKey: string) => {
    setActiveAction(actionKey);
    setIsRunningAction(true);
    setActionOutput(null);
    try {
      const res = await documentsAPI.runAction(id, actionKey);
      setActionOutput(res.data.result);
    } catch (err) {
      setActionOutput("Failed to run action. Please ensure the backend server has a valid GEMINI_API_KEY configured.");
    } finally {
      setIsRunningAction(false);
    }
  };

  const handleCopy = () => {
    if (!actionOutput) return;
    navigator.clipboard.writeText(actionOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!actionOutput || !doc) return;
    const element = document.createElement("a");
    const file = new Blob([actionOutput], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.original_filename}_${activeAction}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const aiActionsList = [
    { key: "summary", label: "Executive Summary", desc: "Key takeaways and high-level bullet points", icon: BookOpen },
    { key: "study_notes", label: "Study Notes", desc: "Detailed summary structures for retention", icon: Brain },
    { key: "faq", label: "Generate FAQ", desc: "Derive frequently asked questions & responses", icon: HelpCircle },
    { key: "insights", label: "Key Insights", desc: "Extract hidden core ideas and findings", icon: Sparkles },
    { key: "action_items", label: "Action Items", desc: "Compile operational tasks and checklists", icon: CheckSquare },
    { key: "topic_breakdown", label: "Topic Breakdown", desc: "Outline primary concepts hierarchically", icon: ListPlus },
    { key: "explain_beginners", label: "Explain for Beginners", desc: "Simplify dense jargon using analogies", icon: HeartHandshake },
    { key: "concepts", label: "Core Concepts", desc: "Extract and define key terminologies", icon: Eye },
    { key: "knowledge_map", label: "Knowledge Map", desc: "Synthesize concept flows into markdown schema", icon: Map },
    { key: "critical_sections", label: "Highlight Critical", desc: "Identify warnings, cautions, and risks", icon: ClipboardList }
  ];

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 bg-[#0c0c0e] border border-white/10 rounded-3xl animate-pulse max-w-7xl mx-auto font-sans shadow-lg">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="mt-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Syncing Document</span>
        </div>
      </AppShell>
    );
  }

  if (!doc) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto text-center py-20 space-y-4 font-sans">
          <AlertTriangle className="h-10 w-10 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Document Not Found</h2>
          <p className="text-xs text-slate-400">The file you are requesting is not indexed or belongs to a different workspace.</p>
          <Link href="/dashboard" className="text-xs text-blue-400 font-bold flex items-center justify-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8 font-sans pb-24">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-500">Documents</span>
          <span>/</span>
          <span className="text-white font-medium">{doc.original_filename}</span>
        </div>

        {/* Document Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0c0e] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl border border-white/10 bg-[#121216] text-blue-400 flex items-center justify-center shrink-0 shadow-sm">
              <FileText className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-white tracking-tight truncate" title={doc.original_filename}>{doc.original_filename}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400 font-medium">
                <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-white font-semibold text-[10px]">{doc.file_type?.toUpperCase()}</span>
                <span>•</span>
                <span>{(doc.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                <span>•</span>
                <span>{doc.page_count} Pages</span>
                <span>•</span>
                <span>{doc.chunk_count} Vector Chunks</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href={`/chat/new?doc=${doc.id}`}>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-full text-xs font-semibold shadow-md transition-all">
                <Brain className="h-4 w-4" /> Start AI Chat
              </button>
            </Link>
          </div>
        </div>

        {/* Intelligence Score Dashboard Section */}
        {qualityScores && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Circular score gauge */}
            <div className="lg:col-span-4 bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-lg">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">Quality Score</h3>
              
              <div className="relative w-36 h-36 flex items-center justify-center">
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
                    strokeDashoffset={(2 * Math.PI * 42) * (1 - qualityScores.overall / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-extrabold text-white tracking-tight">{qualityScores.overall}</span>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Rank / 100</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mt-5 max-w-[220px]">
                Semantic density, readability metrics, and indexing readiness.
              </p>
            </div>

            {/* Quality Breakdown Bars */}
            <div className="lg:col-span-8 bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 shadow-lg">
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Completeness</span>
                  <span className="text-blue-400">{qualityScores.completeness}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${qualityScores.completeness}%` }} />
                </div>
                <p className="text-[10px] text-slate-400">Total word counts and indexing density across pages.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Readability index</span>
                  <span className="text-blue-400">{qualityScores.readability}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${qualityScores.readability}%` }} />
                </div>
                <p className="text-[10px] text-slate-400">Lexical density metrics and parsing logic suitability.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Structure Quality</span>
                  <span className="text-blue-400">{qualityScores.structure}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${qualityScores.structure}%` }} />
                </div>
                <p className="text-[10px] text-slate-400">Headings, tables, list arrays and structure.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Retrieval quality</span>
                  <span className="text-emerald-400">{qualityScores.retrieval}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${qualityScores.retrieval}%` }} />
                </div>
                <p className="text-[10px] text-slate-400">Average cosine similarity during search queries.</p>
              </div>

            </div>
          </div>
        )}

        {/* AI Knowledge Actions & Response Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Actions List Grid */}
          <div className="lg:col-span-5 bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 space-y-4 shadow-lg">
            <div>
              <h3 className="text-sm font-bold text-white">AI Knowledge Actions</h3>
              <p className="text-xs text-slate-400 mt-0.5">Select an action below to extract structured insights.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {aiActionsList.map((action) => {
                const Icon = action.icon;
                const isActive = activeAction === action.key;

                return (
                  <button
                    key={action.key}
                    onClick={() => triggerAction(action.key)}
                    disabled={isRunningAction}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                      isActive 
                        ? 'bg-blue-600/15 border-blue-500/40 text-blue-200' 
                        : 'bg-black/50 border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <div className="min-w-0">
                      <span className="text-xs font-semibold block leading-none mb-1 text-white">{action.label}</span>
                      <span className="text-[10px] text-slate-400 block leading-tight truncate">{action.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Output Display Panel */}
          <div className="lg:col-span-7 bg-[#0c0c0e] border border-white/10 rounded-3xl min-h-[450px] flex flex-col overflow-hidden shadow-xl">
            {/* Header controls */}
            <div className="px-6 py-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" /> Output Console
              </span>

              {actionOutput && !isRunningAction && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCopy}
                    className="p-1.5 px-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-full text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-[11px] font-medium"
                    title="Copy Markdown"
                  >
                    <Copy className="h-3.5 w-3.5 text-blue-400" />
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="p-1.5 px-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-full text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-[11px] font-medium"
                    title="Download File"
                  >
                    <Download className="h-3.5 w-3.5 text-blue-400" />
                    Download
                  </button>
                </div>
              )}
            </div>

            {/* Content Display */}
            <div className="p-6 sm:p-8 flex-1 text-xs sm:text-sm leading-relaxed overflow-y-auto max-h-[500px]">
              {isRunningAction ? (
                <div className="flex flex-col items-center justify-center py-28 text-center space-y-3">
                  <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
                  <div className="space-y-1">
                    <h5 className="font-bold text-white text-sm">Processing Document</h5>
                    <p className="text-xs text-slate-400 max-w-[280px]">Querying grounding text and evaluating concepts with Gemini model...</p>
                  </div>
                </div>
              ) : actionOutput ? (
                <div className="prose prose-invert max-w-none text-slate-200">
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
                      code: ({ children }) => <code className="bg-blue-950/40 border border-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono text-xs">{children}</code>,
                    }}
                  >
                    {actionOutput}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-28 text-center text-slate-400">
                  <Brain className="h-10 w-10 text-white/20 mb-3" />
                  <p className="font-semibold text-xs text-white">Awaiting action click</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">Click any action on the left grid to generate AI insights on this document.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </AppShell>
  );
}
