"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { analyticsAPI } from "@/lib/api";
import { 
  BarChart3, TrendingUp, Clock, ShieldCheck, Database, FileText, 
  ArrowUpRight, Activity, Download, Loader2, Sparkles, AlertCircle, MessageSquare
} from "lucide-react";
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadAnalytics() {
    try {
      const res = await analyticsAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error("Failed to load analytics dashboard data", err);
      setError("Unable to sync analytics clusters. Make sure backend is active.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const downloadReport = () => {
    if (!data) return;
    const reportText = `DocAI Knowledge Intelligence Platform - Executive Report
===========================================================
Timestamp: ${new Date().toLocaleString()}
Documents Processed successfully: ${data.documentsProcessed} / ${data.totalDocuments}
Total Pages Ingested: ${data.totalPages}
Total Query Conversations: ${data.totalQueries}
Active Memory Vector Space: ${data.storageMB} MB
Average Retrieval Quality (Vector Match): ${data.averageRetrievalQuality}%

Most Referenced Documents:
${data.mostReferencedDocuments.map((d: any) => `- ${d.filename}: ${d.count} citations`).join("\n")}

Popular Queries:
${data.popularQuestions.map((q: any) => `- "${q.question}" (${q.count} calls)`).join("\n")}
===========================================================`;

    const element = document.createElement("a");
    const file = new Blob([reportText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `DocAI_Workspace_Report_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 bg-[#0c0c0e] border border-white/10 rounded-3xl animate-pulse max-w-7xl mx-auto font-sans shadow-lg">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="mt-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Syncing Workspace Metrics</span>
        </div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto text-center py-20 space-y-4 font-sans">
          <AlertCircle className="h-10 w-10 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Analytics Pipeline Offline</h2>
          <p className="text-xs text-slate-400">{error || "Unable to load analytics calculations."}</p>
          <button 
            onClick={loadAnalytics}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-full text-xs font-semibold text-white transition-colors shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      </AppShell>
    );
  }

  const statCards = [
    { title: "Processed Files", value: `${data.documentsProcessed} / ${data.totalDocuments}`, sub: `${data.totalPages} total page frames`, icon: FileText },
    { title: "Total Queries", value: data.totalQueries, sub: "Context-scoped chat messages", icon: MessageSquare },
    { title: "Vector Memory Space", value: `${data.storageMB} MB`, sub: "Indexed sentence transformers", icon: Database },
    { title: "Retrieval Match Score", value: `${data.averageRetrievalQuality}%`, sub: "Average cosine similarity vector matching", icon: TrendingUp }
  ];

  const COLORS = ["#2563EB", "#60a5fa", "#93c5fd", "#e2e8f0"];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8 font-sans pb-16">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl border border-white/10 bg-[#0c0c0e] text-blue-400 flex items-center justify-center shadow-sm">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">System Analytics</h1>
              <p className="text-slate-400 text-xs mt-0.5">Real-time metrics on vector clusters, query volumes, and ingestion ratios</p>
            </div>
          </div>

          <button 
            onClick={downloadReport}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 rounded-full text-xs font-semibold text-white transition-colors shrink-0 shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-blue-400" /> Download Executive Report
          </button>
        </div>

        {/* mini stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, idx) => (
            <div key={idx} className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 flex items-start justify-between hover:border-white/20 hover:bg-[#111116] transition-all shadow-md">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{card.title}</p>
                <h3 className="text-2xl font-bold text-white tracking-tight">{card.value}</h3>
                <p className="text-[10px] text-slate-400 font-medium">{card.sub}</p>
              </div>
              <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-blue-400 shrink-0">
                <card.icon className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Request volumes */}
          <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 space-y-4 shadow-lg">
            <div>
              <h3 className="text-sm font-bold text-white">Daily Requests</h3>
              <p className="text-[11px] text-slate-400">Query volume versus semantic cache responses</p>
            </div>
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.usageTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="queriesGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="cacheGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" />
                  <YAxis stroke="rgba(255,255,255,0.4)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0c0c0e", borderColor: "rgba(255,255,255,0.15)", borderRadius: "16px", color: "white" }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area type="monotone" name="Total Queries" dataKey="queries" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#queriesGlow)" />
                  <Area type="monotone" name="Cache Hits" dataKey="cacheHits" stroke="#60a5fa" strokeWidth={1.5} fillOpacity={1} fill="url(#cacheGlow)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Category distribution */}
          <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 space-y-4 shadow-lg">
            <div>
              <h3 className="text-sm font-bold text-white">Searched Topic Spread</h3>
              <p className="text-[11px] text-slate-400">Distribution of query domains computed from keyword analysis</p>
            </div>
            <div className="h-72 w-full flex flex-col sm:flex-row items-center justify-center">
              <div className="w-full sm:w-[60%] h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.mostSearchedTopics}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="topic"
                    >
                      {data.mostSearchedTopics.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0c0c0e", borderColor: "rgba(255,255,255,0.15)", borderRadius: "16px", color: "white" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Legends */}
              <div className="w-full sm:w-[40%] space-y-2 mt-4 sm:mt-0 px-4">
                {data.mostSearchedTopics.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-slate-300 truncate">{item.topic}</span>
                    <span className="text-white font-bold ml-auto">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Lower Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Section 1: Most Cited Documents */}
          <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 space-y-4 shadow-lg">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-white/10 pb-3">Most Referenced Documents</h3>
            <div className="space-y-3">
              {data.mostReferencedDocuments.map((doc: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3.5 bg-black/50 border border-white/10 rounded-2xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                    <span className="text-xs text-white font-medium truncate max-w-[150px]">{doc.filename}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400">
                    {doc.count} citations
                  </span>
                </div>
              ))}
              {data.mostReferencedDocuments.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-6">No references cited yet.</p>
              )}
            </div>
          </div>

          {/* Section 2: Popular Questions */}
          <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 space-y-4 shadow-lg">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-white/10 pb-3">Popular Questions</h3>
            <div className="space-y-3">
              {data.popularQuestions.map((q: any, i: number) => (
                <div key={i} className="p-3.5 bg-black/50 border border-white/10 rounded-2xl space-y-1">
                  <p className="text-xs font-medium text-white line-clamp-1">"{q.question}"</p>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">{q.count} calls in cluster</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Recent Activity Feed */}
          <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 space-y-4 shadow-lg">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-white/10 pb-3">Recent Activity</h3>
            <div className="space-y-3 overflow-y-auto max-h-64 pr-1">
              {data.recentActivity.map((act: any, i: number) => (
                <div key={i} className="flex gap-2.5 text-xs leading-relaxed">
                  <div className="pt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-slate-300 font-medium">{act.description}</p>
                    <p className="text-[10px] text-slate-500">{formatDistanceToNow(new Date(act.timestamp), { addSuffix: true })}</p>
                  </div>
                </div>
              ))}
              {data.recentActivity.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-6">No workspace records.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </AppShell>
  );
}
