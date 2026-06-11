"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, ArrowRight, CheckCircle2, Shield, Zap, Sparkles, 
  MessageSquare, Search, BarChart3, Database, Globe, Lock, Cpu,
  ChevronDown, HelpCircle, Users, Code, BookOpen, Layers, Briefcase, Upload, X
} from "lucide-react";
import { SignIn, SignUp, useUser } from "@clerk/nextjs";
import { useAuth } from "@/hooks/useAuth";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("engineering");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Auth Modal State
  const [authModal, setAuthModal] = useState<"signin" | "signup" | null>(null);
  
  // Clerk Sync logic
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const { clerkSync } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress;
      const fullName = clerkUser.fullName || clerkUser.username || "";
      if (email && !isSyncing) {
        setIsSyncing(true);
        clerkSync(email, fullName)
          .then(() => {
            window.location.href = "/dashboard";
          })
          .catch((err) => {
            console.error("Clerk sync failed on landing page:", err);
            setIsSyncing(false);
          });
      }
    }
  }, [isLoaded, isSignedIn, clerkUser, isSyncing, clerkSync]);

  // Interactive Simulation State
  const [simStep, setSimStep] = useState(0);
  const [simText, setSimText] = useState("");
  const [simResponse, setSimResponse] = useState("");
  const [simCitations, setSimCitations] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Auto-run simulation on interval
  useEffect(() => {
    if (isSimulating) return;
    const interval = setTimeout(() => {
      runSimulation();
    }, 4000);
    return () => clearTimeout(interval);
  }, [simStep, isSimulating]);

  const runSimulation = async () => {
    setIsSimulating(true);
    setSimStep(0);
    setSimText("");
    setSimResponse("");
    setSimCitations([]);

    // 1. Uploading
    await new Promise(r => setTimeout(r, 1200));
    setSimStep(1); // Uploaded api_spec.pdf

    // 2. Querying
    await new Promise(r => setTimeout(r, 1500));
    setSimStep(2); // Typing query...
    const query = "What is the rate limit for the GET /users endpoint?";
    for (let i = 0; i <= query.length; i++) {
      setSimText(query.slice(0, i));
      await new Promise(r => setTimeout(r, 40));
    }

    // 3. Retrieval
    await new Promise(r => setTimeout(r, 800));
    setSimStep(3); // Matching chunks...
    setSimCitations([
      { file: "api_spec.pdf", page: 12, score: 0.94 },
      { file: "dev_guide.docx", page: 4, score: 0.81 }
    ]);

    // 4. Streaming response
    await new Promise(r => setTimeout(r, 1000));
    setSimStep(4); // Generating...
    const response = "Based on page 12 of api_spec.pdf, the rate limit for the GET /users endpoint is 100 requests per minute per API key. If this limit is exceeded, the API returns a 429 Too Many Requests status code.";
    for (let i = 0; i <= response.length; i++) {
      setSimResponse(response.slice(0, i));
      await new Promise(r => setTimeout(r, 15));
    }

    setIsSimulating(false);
  };

  const useCases = {
    engineering: {
      title: "Engineering Teams",
      icon: Code,
      bullets: [
        "Search dense technical specifications and system guidelines instantly.",
        "Retrieve API schemas and environment parameters without digging.",
        "Onboard new hires by searching legacy codebase architectures."
      ],
      tag: "12x Developer Velocity"
    },
    research: {
      title: "Research & Development",
      icon: BookOpen,
      bullets: [
        "Ingest and query hundreds of academic journals and clinical studies.",
        "Extract findings, compare methodologies, and uncover hidden patterns.",
        "Compile cross-referenced literature reviews in seconds."
      ],
      tag: "80% Time Saved"
    },
    product: {
      title: "Product Teams",
      icon: Layers,
      bullets: [
        "Synthesize client feedback documents, PRDs, and user requests.",
        "Align teams on product guidelines, features, and release criteria.",
        "Instantly search competitive teardowns and customer surveys."
      ],
      tag: "Accelerated Product Discovery"
    },
    operations: {
      title: "Operations & HR",
      icon: Briefcase,
      bullets: [
        "Query standard operating procedures (SOPs) and compliance guidelines.",
        "Provide immediate answers for HR policy and insurance document queries.",
        "Track updates across business policies and training records."
      ],
      tag: "Zero Operational Lag"
    }
  };

  const faqs = [
    { q: "How does the AI verify its answers?", a: "Every answer generated by the platform contains direct click-to-view citations referencing the source document and page number. If the answer cannot be found in the workspace, the AI will state that it has insufficient context to prevent hallucination." },
    { q: "Is my uploaded documentation kept private?", a: "Yes. All documents are stored in dedicated, isolated Supabase clusters. Embeddings are calculated locally via Xenova transformers, and document vectors are scoped exclusively to your user ID. We never train public models on your data." },
    { q: "What file formats are supported?", a: "We support PDF, DOCX, and DOC files. These files are parsed, formatted page-by-page, and indexed into dense chunks ready for immediate semantic search." },
    { q: "Can I search across multiple documents at once?", a: "Absolutely. You can scope your search queries or chat conversations to a single document, a collection of documents (e.g., Engineering Docs), or your entire workspace repository." }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans overflow-x-hidden selection:bg-indigo-500/30 selection:text-white">
      
      {/* Glow Backdrops */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[800px] right-10 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[1000px] left-10 w-[450px] h-[450px] bg-cyan-500/5 rounded-full blur-[130px] pointer-events-none" />

      {/* ── HEADER NAVBAR ────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0F]/75 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block">DocAI</span>
              <span className="text-[9px] font-bold text-indigo-400 tracking-widest uppercase block -mt-1">Intelligence</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setAuthModal("signin")} 
              className="text-xs font-bold text-white/75 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => setAuthModal("signup")}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white rounded-full text-xs font-semibold shadow-lg shadow-indigo-600/15 transition-all"
            >
              Start Free <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ─────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
            <Sparkles className="h-3 w-3 animate-spin" /> Next-Gen Knowledge Management
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
            Turn Your Documents Into <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Searchable Intelligence
            </span>
          </h1>

          <p className="text-white/60 text-sm sm:text-lg max-w-3xl mx-auto leading-relaxed">
            Upload technical documentation, research papers, company knowledge bases, product manuals, and business documents. Instantly retrieve insights, ask questions, and discover information with AI-powered semantic search and source-cited answers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button 
              onClick={() => setAuthModal("signup")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] text-white rounded-full text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all"
            >
              Start Free
            </button>
            <button 
              onClick={runSimulation}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 active:scale-[0.98] text-white rounded-full text-sm font-semibold transition-all"
            >
              <Zap className="h-4 w-4 text-indigo-400" />
              View Demo Simulation
            </button>
          </div>
        </div>

        {/* ── LIVE INTERACTIVE MOCKUP ────────────────────────────────────────── */}
        <div className="mt-16 max-w-5xl mx-auto rounded-2xl border border-white/10 bg-[#171F2E]/30 backdrop-blur-xl p-4 sm:p-6 shadow-2xl relative group">
          {/* Top window dots */}
          <div className="flex items-center gap-1.5 pb-4 border-b border-white/5 mb-4">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-xs text-white/30 font-medium ml-4 font-mono select-none">AI Intelligence Sandbox</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left font-mono">
            {/* Sidebar flow */}
            <div className="md:col-span-1 border-r border-white/5 pr-4 space-y-4 hidden md:block text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Ingestion Status</span>
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${simStep >= 1 ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
                  <span className={simStep >= 1 ? 'text-white font-bold' : 'text-white/40'}>api_spec.pdf</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${simStep >= 1 ? 'bg-emerald-500' : 'bg-white/20'}`} />
                  <span className={simStep >= 1 ? 'text-white/70' : 'text-white/40'}>dev_guide.docx</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Retrieval Map</span>
                {simStep >= 3 ? (
                  <div className="space-y-1.5">
                    {simCitations.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] bg-indigo-500/10 p-1.5 rounded border border-indigo-500/15">
                        <span className="text-indigo-400 font-bold truncate max-w-[100px]">{c.file} (p.{c.page})</span>
                        <span className="text-emerald-400 font-bold">{(c.score * 100).toFixed(0)}% Match</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-white/30 italic">Awaiting semantic prompt...</span>
                )}
              </div>
            </div>

            {/* Simulated Chat Interface */}
            <div className="md:col-span-2 space-y-4 flex flex-col justify-between min-h-[300px]">
              <div className="space-y-4">
                {/* Simulated Query */}
                {simStep >= 2 && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0 font-bold text-xs uppercase">
                      U
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl rounded-tl-none border border-white/5 max-w-[85%]">
                      <p className="text-xs text-white leading-relaxed">{simText || " "}</p>
                    </div>
                  </div>
                )}

                {/* Simulated Streaming Answer */}
                {simStep >= 4 && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="bg-indigo-500/[0.04] border border-indigo-500/10 p-3.5 rounded-xl rounded-tl-none max-w-[90%] space-y-2">
                      <p className="text-xs text-white/90 leading-relaxed font-sans">{simResponse || " "}</p>
                      
                      {simResponse.length > 50 && (
                        <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2">
                          <span className="text-[10px] text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/25">
                            Citations: [api_spec.pdf, Page 12]
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Status input bar */}
              <div className="bg-[#0A0A0F] border border-white/5 p-2 rounded-xl flex items-center gap-3">
                <Search className="h-4 w-4 text-white/30 shrink-0" />
                <div className="text-xs text-white/50 flex-1 truncate">
                  {simStep === 0 && "System idle. Awaiting action..."}
                  {simStep === 1 && "Indexing api_spec.pdf into vector store..."}
                  {simStep === 2 && "Inputting user prompt..."}
                  {simStep === 3 && "Running cosine similarity over embedding spaces..."}
                  {simStep === 4 && "Streaming context-grounded response..."}
                </div>
                <button 
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-[10px] font-bold rounded"
                >
                  {isSimulating ? "Simulating..." : "Trigger Simulation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE CAPABILITIES FEATURE CARD SHOWCASE ─────────────────────────── */}
      <section id="features" className="py-24 px-6 border-t border-white/5 bg-[#171F2E]/10 relative">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Platform Strengths</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Enterprise Feature Showcase</h3>
            <p className="text-white/50 text-sm max-w-2xl mx-auto">
              Our architecture maps documents directly into semantic multi-dimensional arrays, optimizing retrieval quality.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="bg-[#171F2E]/45 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Upload className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Document Ingestion Pipeline</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Asynchronous PDF/DOCX indexing. Parses pages, splits them dynamically with overlap tokens, and uploads structures safely.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#171F2E]/45 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Search className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Semantic Search</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Matches user queries based on conceptual meaning using sentence-transformer models instead of simple keyword queries.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#171F2E]/45 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Cpu className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">RAG Engine</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Grounds Gemini LLM context explicitly in your private documents, guaranteeing verified answers without hallucinations.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#171F2E]/45 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Source-Cited Verification</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Answers display click-to-view citations showing document source name and page locations to cross-reference data.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-[#171F2E]/45 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <FileText className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Multi-Document Compare</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Select two documents and perform side-by-side comparison, detailing changes, omissions, additions, and similarity scores.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-[#171F2E]/45 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Workspace Quality Analytics</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Track search counts, vector query latencies, most referenced docs, and overall document quality intelligence indexes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── USE CASES TABS SECTION ─────────────────────────────────────────── */}
      <section id="use-cases" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Target Use Cases</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Tailored Intelligence Workflows</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Explore how different departments leverage DocAI to eliminate context-switching and query files with absolute trust.
            </p>

            <div className="flex flex-col gap-2">
              {Object.entries(useCases).map(([key, data]) => {
                const TabIcon = data.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-semibold border transition-all",
                      activeTab === key 
                        ? "bg-indigo-600/15 border-indigo-500/35 text-indigo-300" 
                        : "bg-white/[0.01] border-white/5 text-white/60 hover:text-white hover:bg-white/[0.02]"
                    )}
                  >
                    <TabIcon className="h-4 w-4" />
                    <span>{data.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#171F2E]/40 border border-white/5 rounded-2xl p-8 backdrop-blur-md relative min-h-[300px] flex flex-col justify-between">
            <div className="absolute top-[-20%] right-[-10%] w-56 h-56 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-bold uppercase tracking-wide">
                    {useCases[activeTab as keyof typeof useCases].tag}
                  </span>
                </div>

                <h4 className="text-xl font-bold text-white">
                  Optimized for {useCases[activeTab as keyof typeof useCases].title}
                </h4>

                <div className="space-y-3">
                  {useCases[activeTab as keyof typeof useCases].bullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-white/70 leading-relaxed">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="pt-8 border-t border-white/5 mt-6 flex items-center justify-between">
              <span className="text-[10px] text-white/35 font-medium">DocAI Workspace Platform</span>
              <button 
                onClick={() => setAuthModal("signup")}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-transparent border-0 cursor-pointer"
              >
                Configure Workspace <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECURITY SECTION ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5 bg-gradient-to-b from-transparent to-[#0C0C16]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-3xl font-extrabold tracking-tight">Isolated Security Architecture</h3>
            <p className="text-white/50 text-xs sm:text-sm leading-relaxed">
              We understand company documents hold critical trade secrets and IPs. Our system is structured with zero-trust isolation boundaries.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <Lock className="h-4 w-4 text-cyan-400 mb-1" />
                <h5 className="text-xs font-bold text-white">Scoping Isolation</h5>
                <p className="text-[10px] text-white/40 leading-relaxed">Document vectors are bound by strict owner constraints.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <Globe className="h-4 w-4 text-purple-400 mb-1" />
                <h5 className="text-xs font-bold text-white">Local Chunks</h5>
                <p className="text-[10px] text-white/40 leading-relaxed">Vector indexing processes are done on isolated sandboxes.</p>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 z-0 pointer-events-none" />
            <div className="p-8 space-y-4 relative z-10 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-[10px] text-white/40 font-bold uppercase">Security Log Audits</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400">SOC2 COMPLIANT</span>
              </div>
              <div className="space-y-2.5 text-[11px] text-white/60">
                <p><span className="text-indigo-400">[INFO]</span> Initializing secure vector indexing cluster...</p>
                <p><span className="text-indigo-400">[INFO]</span> Document tokenization running: all-MiniLM-L6-v2...</p>
                <p><span className="text-emerald-400">[PASS]</span> Checked JWT permissions scope check (100% OK)</p>
                <p><span className="text-indigo-400">[INFO]</span> Context matched references parsed into memory.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION ──────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">SaaS Plans</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Flexible Plans For Teams</h3>
          <p className="text-white/50 text-sm">
            Scale your document intelligence workspace dynamically as company size expands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-[#171F2E]/30 border border-white/5 rounded-2xl p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white">Developer Sandbox</h4>
              <p className="text-xs text-white/40">Ideal for personal document analysis and exploration.</p>
              <div className="pt-2">
                <span className="text-3xl font-extrabold text-white">$0</span>
                <span className="text-xs text-white/40">/ forever</span>
              </div>
              <div className="border-t border-white/5 pt-4 space-y-2 text-xs text-white/60">
                <p>• Max 10 Documents</p>
                <p>• Max 20MB / file size limit</p>
                <p>• Cosine Semantic Search</p>
                <p>• Gemini AI Chat support</p>
              </div>
            </div>
            <button 
              onClick={() => setAuthModal("signup")}
              className="w-full mt-8 py-2 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg text-xs transition-colors"
            >
              Start Free Sandbox
            </button>
          </div>

          {/* Card 2 - Featured */}
          <div className="bg-[#171F2E]/50 border-2 border-indigo-500/50 rounded-2xl p-8 flex flex-col justify-between relative shadow-indigo-500/5 shadow-2xl">
            <span className="absolute top-0 right-6 -translate-y-1/2 px-2.5 py-0.5 rounded-full bg-indigo-500 text-[9px] font-bold uppercase tracking-wider text-white">
              RECOMMENDED
            </span>
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white">Professional Teams</h4>
              <p className="text-xs text-white/40">For engineering and operations teams querying core SOP files.</p>
              <div className="pt-2">
                <span className="text-3xl font-extrabold text-white">$15</span>
                <span className="text-xs text-white/40">/ user / mo</span>
              </div>
              <div className="border-t border-white/5 pt-4 space-y-2 text-xs text-white/60">
                <p className="text-indigo-400 font-semibold">• Everything in Free</p>
                <p>• Unlimited Document uploads</p>
                <p>• Max 100MB / file size limit</p>
                <p>• Side-by-side Document Comparison</p>
                <p>• One-click AI Actions suite</p>
                <p>• Real-time Quality analytics</p>
              </div>
            </div>
            <button 
              onClick={() => setAuthModal("signup")}
              className="w-full mt-8 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-all shadow-lg shadow-indigo-600/15"
            >
              Upgrade Workspace
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-[#171F2E]/30 border border-white/5 rounded-2xl p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white">Enterprise Suite</h4>
              <p className="text-xs text-white/40">Secure workspace clusters tailored for large organizations.</p>
              <div className="pt-2">
                <span className="text-3xl font-extrabold text-white">Custom</span>
              </div>
              <div className="border-t border-white/5 pt-4 space-y-2 text-xs text-white/60">
                <p className="text-indigo-400 font-semibold">• Everything in Professional</p>
                <p>• SOC2 verified private clusters</p>
                <p>• Dedicated local Vector hosting</p>
                <p>• SSO Integration / SAML</p>
                <p>• Custom LLM grounding prompts</p>
                <p>• 24/7 Priority support SLA</p>
              </div>
            </div>
            <a href="mailto:sales@docai.com?subject=Enterprise Inquiry" className="block w-full">
              <button className="w-full mt-8 py-2 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg text-xs transition-colors">
                Contact Enterprise Sales
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-4xl mx-auto border-t border-white/5">
        <div className="text-center space-y-3 mb-16">
          <HelpCircle className="h-8 w-8 text-indigo-400 mx-auto" />
          <h3 className="text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-white/5 rounded-xl bg-white/[0.01] overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left text-xs sm:text-sm font-semibold text-white/80 hover:text-white"
              >
                <span>{faq.q}</span>
                <ChevronDown className={cn("h-4 w-4 text-white/35 transition-transform", openFaq === i ? "rotate-180" : "")} />
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="p-5 pt-0 border-t border-white/5 text-xs text-white/50 leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA BANNER ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto text-center border-t border-white/5">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-cyan-900/40 border border-white/10 p-12 sm:p-20">
          <div className="absolute inset-0 bg-[#0A0A0F]/30 backdrop-blur-sm z-0" />
          
          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Transform Your Knowledge Base Today
            </h3>
            <p className="text-white/60 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Configure your secure corporate document vault. Parse files, search concepts, and extract source-cited insights instantly.
            </p>
            <div className="pt-4">
              <button 
                onClick={() => setAuthModal("signup")}
                className="flex items-center gap-1.5 px-6 py-3 bg-white text-gray-950 hover:bg-white/90 active:scale-[0.98] rounded-full text-xs font-bold shadow-lg transition-all mx-auto"
              >
                Start Free Sandbox <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="py-12 px-6 border-t border-white/5 text-white/30 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-400" />
            <span className="font-bold text-white/50">DocAI Intelligence</span>
          </div>
          <p>© 2026 DocAI Inc. All rights reserved. Data sandboxing verified.</p>
        </div>
      </footer>

      {/* ── CLERK AUTH MODALS OVERLAY ────────────────────────────────────────── */}
      <AnimatePresence>
        {authModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0F]/80 backdrop-blur-md p-4">
            <div className="absolute inset-0 z-0" onClick={() => setAuthModal(null)} />
            <div className="relative z-10 w-full max-w-[400px] bg-[#171F2E] border border-white/5 shadow-2xl rounded-3xl p-1 overflow-hidden">
              <button 
                onClick={() => setAuthModal(null)}
                className="absolute top-4 right-4 z-50 p-1.5 rounded-lg bg-[#0A0A0F]/45 hover:bg-[#0A0A0F]/80 text-white/60 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {authModal === "signin" ? (
                <SignIn 
                  routing="hash"
                  signUpUrl="/#signup"
                  appearance={{
                    variables: {
                      colorPrimary: '#4f46e5',
                      colorBackground: '#171F2E',
                      colorInputBackground: '#0A0A0F',
                      colorText: '#ffffff',
                      colorTextSecondary: '#9ca3af',
                      colorInputText: '#ffffff',
                      colorTextOnPrimaryBackground: '#ffffff',
                    },
                    elements: {
                      card: "bg-transparent border-0 shadow-none w-full",
                      headerTitle: "text-white font-extrabold text-xl",
                      headerSubtitle: "text-white/40 text-xs",
                      socialButtonsBlockButton: "bg-white/[0.02] border-white/5 hover:bg-white/[0.06] text-white",
                      formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm py-2.5 shadow-lg shadow-indigo-600/15 transition-all duration-150 active:scale-[0.98]",
                      formFieldInput: "bg-[#0A0A0F] border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-indigo-500/50",
                      footerActionLink: "text-indigo-400 hover:text-indigo-300 font-semibold",
                      footerActionText: "text-white/40",
                      identityPreviewText: "text-white",
                      identityPreviewEditButtonIcon: "text-white/50",
                      dividerText: "text-white/30",
                      dividerLine: "bg-white/5",
                      formFieldLabel: "text-white/50 text-xs font-medium uppercase tracking-wider",
                      footer: "bg-transparent",
                    }
                  }}
                />
              ) : (
                <SignUp 
                  routing="hash"
                  signInUrl="/#signin"
                  appearance={{
                    variables: {
                      colorPrimary: '#4f46e5',
                      colorBackground: '#171F2E',
                      colorInputBackground: '#0A0A0F',
                      colorText: '#ffffff',
                      colorTextSecondary: '#9ca3af',
                      colorInputText: '#ffffff',
                      colorTextOnPrimaryBackground: '#ffffff',
                    },
                    elements: {
                      card: "bg-transparent border-0 shadow-none w-full",
                      headerTitle: "text-white font-extrabold text-xl",
                      headerSubtitle: "text-white/40 text-xs",
                      socialButtonsBlockButton: "bg-white/[0.02] border-white/5 hover:bg-white/[0.06] text-white",
                      formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm py-2.5 shadow-lg shadow-indigo-600/15 transition-all duration-150 active:scale-[0.98]",
                      formFieldInput: "bg-[#0A0A0F] border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-indigo-500/50",
                      footerActionLink: "text-indigo-400 hover:text-indigo-300 font-semibold",
                      footerActionText: "text-white/40",
                      identityPreviewText: "text-white",
                      identityPreviewEditButtonIcon: "text-white/50",
                      dividerText: "text-white/30",
                      dividerLine: "bg-white/5",
                      formFieldLabel: "text-white/50 text-xs font-medium uppercase tracking-wider",
                      footer: "bg-transparent",
                    }
                  }}
                />
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
