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
      trend: "+12.4% this wk",
      sparkline: "M0,25 C20,20 40,8 60,18 C80,28 100,5 100,5"
    },
    { 
      title: "Ready Vectors", 
      value: stats.completed, 
      sub: "Processed & searchable", 
      icon: CheckCircle2, 
      trend: "99.2% success",
      sparkline: "M0,28 C15,28 30,22 45,18 C60,14 75,6 100,5"
    },
    { 
      title: "Active Pipeline", 
      value: stats.processing, 
      sub: "Background vectorizing", 
      icon: Clock, 
      trend: "Avg: 4.2s/doc",
      sparkline: "M0,25 C30,25 60,10 100,10"
    },
    { 
      title: "Knowledge Base", 
      value: formatStorage(stats.totalBytes), 
      sub: "Isolated cluster", 
      icon: Database, 
      trend: "Tier 1 Enterprise",
      sparkline: "M0,28 C20,22 40,25 60,15 C80,5 100,8 100,8"
    },
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8 font-sans">
        
        {/* Welcome Area / Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-[#0c0c0e] border border-white/10 relative overflow-hidden shadow-lg">
          <div className="space-y-1 relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Good Morning, {userName}
            </h1>
            <p className="text-slate-400 text-sm">
              Your semantic knowledge base is synced and ready for querying.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <Link href="/upload">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-full text-xs font-semibold shadow-sm transition-all">
                <Upload className="h-3.5 w-3.5" /> Upload Document
              </button>
            </Link>
            <Link href="/chat/new">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 active:scale-[0.98] text-white rounded-full text-xs font-semibold transition-all">
                <MessageSquare className="h-3.5 w-3.5 text-blue-400" /> Ask Copilot
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.title} className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 flex flex-col justify-between group hover:border-white/20 hover:bg-[#111116] transition-all shadow-md">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{card.title}</p>
                  <h3 className="text-3xl font-bold text-white tracking-tight">{card.value}</h3>
                </div>
                <div className="w-10 h-10 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center shrink-0 text-white group-hover:border-blue-500/40 transition-colors">
                  <card.icon className="h-4 w-4 text-blue-400" />
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between gap-2 border-t border-white/10 pt-4">
                <div className="space-y-0.5">
                  <p className="text-[11px] text-slate-400 font-medium">{card.sub}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-blue-400" />
                    <span className="text-[10px] font-semibold text-slate-300">{card.trend}</span>
                  </div>
                </div>

                {/* SVG Mini Sparkline */}
                <div className="w-16 h-7 text-slate-600 group-hover:text-blue-400 transition-colors shrink-0">
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
        <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Your Workspace Documents</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage and search all indexed documents</p>
            </div>
            <span className="self-start sm:self-auto px-3.5 py-1 rounded-full bg-white/[0.04] text-slate-200 text-[11px] font-medium border border-white/10 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" /> Semantic search active
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
