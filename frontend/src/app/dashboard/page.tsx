"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useDocuments } from "@/hooks/useDocuments";
import { DocumentList } from "@/components/documents/DocumentList";
import { useAuth } from "@/hooks/useAuth";
import { 
  FileText, CheckCircle2, Clock, AlertCircle, Upload, 
  MessageSquare, ArrowUpRight, TrendingUp, Sparkles, Database 
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { documents, isLoading, deleteDocument, reprocessDocument } = useDocuments();
  const { user } = useAuth();

  const stats = {
    total: documents.length,
    completed: documents.filter((d) => d.status === "completed").length,
    processing: documents.filter((d) => d.status === "processing" || d.status === "pending").length,
    failed: documents.filter((d) => d.status === "failed").length,
    totalChunks: documents.reduce((acc, d) => acc + d.chunk_count, 0),
    totalPages: documents.reduce((acc, d) => acc + d.page_count, 0),
    totalBytes: documents.reduce((acc, d) => acc + d.file_size, 0),
  };

  const formatStorage = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const userName = user?.full_name ? user.full_name.split(" ")[0] : "Sanjay";

  const statCards = [
    { 
      title: "Documents Indexed", 
      value: stats.total, 
      sub: `${stats.totalPages} pages • ${stats.totalChunks} chunks`, 
      icon: FileText, 
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/15",
      trend: "+12.4% this wk",
      sparkline: "M0,25 C20,20 40,8 60,18 C80,28 100,5 100,5"
    },
    { 
      title: "Ready Vectors", 
      value: stats.completed, 
      sub: "Processed & searchable", 
      icon: CheckCircle2, 
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/15",
      trend: "99.2% success",
      sparkline: "M0,28 C15,28 30,22 45,18 C60,14 75,6 100,5"
    },
    { 
      title: "Active Pipeline", 
      value: stats.processing, 
      sub: "Background vectorizing", 
      icon: Clock, 
      color: "text-amber-400 bg-amber-500/10 border-amber-500/15",
      trend: "Avg: 4.2s/doc",
      sparkline: "M0,25 C30,25 60,10 100,10"
    },
    { 
      title: "Knowledge Base", 
      value: formatStorage(stats.totalBytes), 
      sub: "Isolated cluster", 
      icon: Database, 
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/15",
      trend: "No limit (Tier 1)",
      sparkline: "M0,28 C20,22 40,25 60,15 C80,5 100,8 100,8"
    },
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8 font-sans">
        
        {/* Welcome Area / Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#171F2E]/80 via-[#171F2E]/40 to-transparent border border-white/5 relative overflow-hidden backdrop-blur-md">
          {/* Blur blobs */}
          <div className="absolute top-[-30px] left-[-30px] w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
          
          <div className="space-y-1 relative z-10">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Good Morning, {userName} <span className="animate-bounce">👋</span>
            </h1>
            <p className="text-white/50 text-sm">
              Your semantic knowledge base is synced. AI indexing is active.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <Link href="/upload">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/15 transition-all">
                <Upload className="h-4 w-4" /> Upload Document
              </button>
            </Link>
            <Link href="/chat/new">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 active:scale-[0.98] text-white rounded-xl text-xs font-semibold transition-all">
                <MessageSquare className="h-4 w-4 text-white/60" /> Ask AI Copilot
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.title} className="bg-[#171F2E]/45 border border-white/5 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between group hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">{card.title}</p>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{card.value}</h3>
                </div>
                <div className={`p-2 rounded-xl border shrink-0 ${card.color}`}>
                  <card.icon className="h-4.5 w-4.5" />
                </div>
              </div>
              
              <div className="mt-5 flex items-center justify-between gap-2 border-t border-white/5 pt-3">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-white/35 font-medium">{card.sub}</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-indigo-400" />
                    <span className="text-[10px] font-semibold text-white/50">{card.trend}</span>
                  </div>
                </div>

                {/* SVG Mini Sparkline */}
                <div className="w-16 h-8 text-indigo-500/30 group-hover:text-indigo-400/60 transition-colors shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 100 30" fill="none">
                    <path 
                      d={card.sparkline} 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Documents Table Card */}
        <div className="bg-[#171F2E]/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">Your Workspace Documents</h2>
              <p className="text-xs text-white/40 mt-0.5">Manage and view search availability for uploaded documents</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[11px] font-semibold border border-indigo-500/20 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Semantic search active
            </span>
          </div>

          <DocumentList 
            documents={documents} 
            isLoading={isLoading} 
            onDelete={deleteDocument} 
            onReprocess={reprocessDocument} 
          />
        </div>

      </div>
    </AppShell>
  );
}
