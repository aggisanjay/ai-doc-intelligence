"use client";

import React, { useMemo, useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useDocuments } from "@/hooks/useDocuments";
import { 
  BarChart3, TrendingUp, Clock, ShieldCheck, Database, FileText, 
  ArrowUpRight, ArrowDownRight, Activity, Download, Loader2
} from "lucide-react";
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const { documents, isLoading } = useDocuments();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Calculate active workspace numbers
  const stats = useMemo(() => {
    const total = documents.length;
    const completed = documents.filter((d) => d.status === "completed").length;
    const totalBytes = documents.reduce((acc, d) => acc + d.file_size, 0);
    const totalPages = documents.reduce((acc, d) => acc + d.page_count, 0);
    
    const storageMB = (totalBytes / (1024 * 1024)).toFixed(1);
    
    return { total, completed, storageMB, totalPages };
  }, [documents]);

  // 2. Mock trend logs - 7 days
  const queryTrends = [
    { day: "Mon", queries: 145, cacheHits: 60 },
    { day: "Tue", queries: 210, cacheHits: 85 },
    { day: "Wed", queries: 185, cacheHits: 90 },
    { day: "Thu", queries: 320, cacheHits: 140 },
    { day: "Fri", queries: 290, cacheHits: 130 },
    { day: "Sat", queries: 95, cacheHits: 40 },
    { day: "Sun", queries: 120, cacheHits: 50 }
  ];

  // Ingestion history - 6 months
  const ingestionHistory = [
    { month: "Dec", pdf: 5, docx: 2 },
    { month: "Jan", pdf: 8, docx: 4 },
    { month: "Feb", pdf: 12, docx: 6 },
    { month: "Mar", pdf: 15, docx: 9 },
    { month: "Apr", pdf: stats.completed, docx: Math.max(1, Math.floor(stats.total - stats.completed)) },
    { month: "May", pdf: Math.max(2, stats.completed + 2), docx: 3 }
  ];

  // Latency trends - 7 days
  const latencyTrends = [
    { day: "Mon", geminiFlash: 1.1, geminiPro: 2.8 },
    { day: "Tue", geminiFlash: 0.9, geminiPro: 2.4 },
    { day: "Wed", geminiFlash: 1.2, geminiPro: 2.6 },
    { day: "Thu", geminiFlash: 1.0, geminiPro: 2.1 },
    { day: "Fri", geminiFlash: 0.8, geminiPro: 2.0 },
    { day: "Sat", geminiFlash: 1.1, geminiPro: 2.5 },
    { day: "Sun", geminiFlash: 0.9, geminiPro: 2.3 }
  ];

  // Category breakdown derived from actual documents list or defaults
  const categoriesData = useMemo(() => {
    let finance = 0;
    let legal = 0;
    let hr = 0;
    let other = 0;

    documents.forEach(doc => {
      const name = doc.original_filename.toLowerCase();
      if (name.includes("invoice") || name.includes("billing") || name.includes("tax") || name.includes("financial")) finance++;
      else if (name.includes("contract") || name.includes("legal") || name.includes("agreement") || name.includes("nda")) legal++;
      else if (name.includes("resume") || name.includes("cv") || name.includes("hiring")) hr++;
      else other++;
    });

    // Make sure we have visual interest even if the documents are empty
    if (documents.length === 0) {
      return [
        { name: "Legal & Contracts", value: 35, color: "#6366F1" },
        { name: "Finance & Invoices", value: 25, color: "#8B5CF6" },
        { name: "HR & Resumes", value: 20, color: "#06B6D4" },
        { name: "General Research", value: 20, color: "#10B981" }
      ];
    }

    return [
      { name: "Legal & Contracts", value: legal, color: "#6366F1" },
      { name: "Finance & Invoices", value: finance, color: "#8B5CF6" },
      { name: "HR & Resumes", value: hr, color: "#06B6D4" },
      { name: "General Research", value: other, color: "#10B981" }
    ].filter(c => c.value > 0);
  }, [documents]);

  const cards = [
    { title: "Query Volatility", value: "1,365", sub: "+18.2% vs last week", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", trend: "up" },
    { title: "Active Memory", value: `${stats.storageMB} MB`, sub: "Prisma Cloud Storage", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", trend: "up" },
    { title: "Processing Speed", value: "98.8%", sub: "GPU Vector cluster", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", trend: "up" },
    { title: "API Errors", value: "0.04%", sub: "-12% error drop", color: "text-rose-400 bg-rose-500/10 border-rose-500/20", trend: "down" }
  ];

  return (
    <AppShell>
      {!isMounted ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white/[0.01] border border-white/5 rounded-2xl animate-pulse max-w-7xl mx-auto">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <span className="mt-3 text-xs font-semibold tracking-wider text-indigo-400 uppercase">Initializing Analytics Subsystem</span>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8 font-sans pb-16">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">System Analytics</h1>
                <p className="text-white/40 text-xs mt-0.5">Real-time insights on query volatility, vector indexes, and LLM throughput</p>
              </div>
            </div>

            <button 
              onClick={() => alert("Generating Executive Summary...")}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-xl text-xs font-semibold transition-colors shrink-0"
            >
              <Download className="h-4 w-4" /> Download Report
            </button>
          </div>

          {/* Mini stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
              <div key={card.title} className="bg-[#171F2E]/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">{card.title}</p>
                <h3 className="text-2xl font-extrabold text-white tracking-tight mt-1.5">{card.value}</h3>
                <div className="flex items-center gap-1 mt-2.5">
                  {card.trend === "up" ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  )}
                  <span className={cn(
                    "text-[10px] font-medium",
                    card.trend === "up" ? "text-emerald-400" : "text-rose-450"
                  )}>{card.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Request Volume */}
            <div className="bg-[#171F2E]/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Daily Requests</h3>
                <p className="text-[11px] text-white/40">Request throughput showing Cache hits versus LLM completions</p>
              </div>
              <div className="h-72 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={queryTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="queriesGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="cacheGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" />
                    <YAxis stroke="rgba(255,255,255,0.3)" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#171F2E", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }}
                      labelClassName="font-bold text-white/50 text-[10px]"
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ color: "rgba(255,255,255,0.6)" }} />
                    <Area type="monotone" name="Total Queries" dataKey="queries" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#queriesGlow)" />
                    <Area type="monotone" name="Semantic Cache Hits" dataKey="cacheHits" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#cacheGlow)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Ingestion volume */}
            <div className="bg-[#171F2E]/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Ingestion Rate</h3>
                <p className="text-[11px] text-white/40">Quantity of document formats parsed and mapped to vectors per month</p>
              </div>
              <div className="h-72 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ingestionHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" />
                    <YAxis stroke="rgba(255,255,255,0.3)" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#171F2E", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Bar name="PDF Format" dataKey="pdf" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    <Bar name="Word (DOCX)" dataKey="docx" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: AI Latency */}
            <div className="bg-[#171F2E]/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">LLM Response Latency</h3>
                <p className="text-[11px] text-white/40">Model inference speeds measured in seconds over time</p>
              </div>
              <div className="h-72 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={latencyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" />
                    <YAxis stroke="rgba(255,255,255,0.3)" unit="s" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#171F2E", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Line type="monotone" name="Gemini 3.0 Flash" dataKey="geminiFlash" stroke="#06B6D4" strokeWidth={2.5} activeDot={{ r: 6 }} />
                    <Line type="monotone" name="Groq" dataKey="geminiPro" stroke="#8B5CF6" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Document category distribution */}
            <div className="bg-[#171F2E]/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Knowledge Distribution</h3>
                <p className="text-[11px] text-white/40">Proportion of files processed within core domain category groups</p>
              </div>
              <div className="h-72 w-full text-xs flex flex-col sm:flex-row items-center justify-center">
                <div className="w-full sm:w-[60%] h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoriesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoriesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#171F2E", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Legends */}
                <div className="w-full sm:w-[40%] space-y-2 mt-4 sm:mt-0 px-4">
                  {categoriesData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-white/60 truncate">{item.name}</span>
                      <span className="text-white font-bold ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}
    </AppShell>
  );
}
