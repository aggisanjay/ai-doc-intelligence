"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, ArrowRight, Check, Shield, Search, ChevronDown, Plus, 
  X, Menu, Sun, Moon, Cpu, Layers, BarChart3, Lock, CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { SignUpButton, SignInButton, useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { LogoIcon } from "@/components/common/Logo";

/* ─────────────────────────────────────────────────────────
   LANDING PAGE — WITH FLUID FRAMER MOTION TRANSITIONS
   ───────────────────────────────────────────────────────── */

export default function LandingPage() {
  const router = useRouter();

  // ── Theme ──────────────────────────────────────────────
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // ── Navigation & UI State ─────────────────────────────
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // ── Auth state ──
  const { isSignedIn, isLoaded } = useUser();

  // If already signed in, seamlessly navigate to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // ── Mount + Theme Init ─────────────────────────────────
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("docai-theme") as "light" | "dark" | null;
      const initial = saved || "light";
      setTheme(initial);
      applyThemeToDOM(initial);
    } catch {
      applyThemeToDOM("light");
    }
  }, []);

  function applyThemeToDOM(t: "light" | "dark") {
    if (typeof document === "undefined") return;
    document.body.style.backgroundColor = t === "dark" ? "#0F0E11" : "#FAF3F0";
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  // ── Theme Toggle ───────────────────────────────────────
  function handleToggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyThemeToDOM(next);
    try { localStorage.setItem("docai-theme", next); } catch {}
  }

  // Wrapper: opens Clerk modal if not signed in, goes to dashboard if signed in
  function AuthCTA({ children, signedInText }: { children: React.ReactElement; signedInText?: string }) {
    if (isSignedIn) {
      return React.cloneElement(children, {
        onClick: () => { router.push("/dashboard"); },
        children: signedInText ? (
          <>
            <span>{signedInText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        ) : children.props.children,
      });
    }
    return (
      <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard" forceRedirectUrl="/dashboard">
        {children}
      </SignUpButton>
    );
  }

  function AuthSignIn({ children }: { children: React.ReactElement }) {
    if (isSignedIn) {
      return React.cloneElement(children, {
        onClick: () => { router.push("/dashboard"); },
      });
    }
    return (
      <SignInButton mode="modal" fallbackRedirectUrl="/dashboard" forceRedirectUrl="/dashboard">
        {children}
      </SignInButton>
    );
  }

  const isDark = theme === "dark";

  // ── Data ───────────────────────────────────────────────
  const supportedFileTypes = [
    "PDF", "DOCX", "Research papers", "API specs", 
    "Contracts", "SOPs", "Product manuals", "Whitepapers", "Clinical studies"
  ];

  const faqItems = [
    {
      q: "How does DocAI guarantee zero hallucinations?",
      a: "DocAI utilizes strict Retrieval-Augmented Generation (RAG). Answers are synthesized exclusively from verified text chunks extracted from your documents, accompanied by deterministic citations linking back to the exact page and section."
    },
    {
      q: "What file formats are supported?",
      a: "You can upload PDFs, DOCX, DOC, Markdown, and plain text files. Our semantic parsers process tables, multi-column research layouts, and dense technical specifications seamlessly."
    },
    {
      q: "Is my proprietary data kept private and secure?",
      a: "Yes. All documents are isolated with JWT-scoped permissions and owner-bound vector stores. Your data is strictly encrypted in transit and at rest, and is never used to train public foundation models."
    },
    {
      q: "Can I query multiple documents at once?",
      a: "Yes. You can chat across your entire document library or focus your inquiries on specific files or collections to cross-reference multiple sources seamlessly."
    },
    {
      q: "How do document collections work?",
      a: "Collections allow you to group related documents together (such as legal files, financial reports, or technical specs) for targeted querying, organized browsing, and focused AI chat."
    }
  ];

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div className="min-h-screen" style={{ backgroundColor: "#FAF3F0" }} />;
  }

  return (
    <div
      className="min-h-screen font-sans relative overflow-x-hidden"
      style={{
        backgroundColor: isDark ? "#0F0E11" : "#FAF3F0",
        color: isDark ? "#F3F1F5" : "#19171A",
        transition: "background-color 0.4s ease, color 0.4s ease",
      }}
    >
      
      {/* ========================================================= */}
      {/* 1. STICKY PILL NAV                                        */}
      {/* ========================================================= */}
      <motion.header 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-5 left-0 right-0 z-40 px-4 sm:px-6 flex justify-center"
      >
        <nav 
          style={{
            backgroundColor: isDark ? "rgba(24,22,29,0.92)" : "rgba(255,255,255,0.92)",
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
            backdropFilter: "blur(12px)",
          }}
          className="w-full max-w-5xl rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between border shadow-lg"
        >
          {/* Left: Brand */}
          <Link href="/" className="flex items-center gap-2.5 select-none group">
            <LogoIcon size="sm" className="group-hover:scale-105 transition-transform" />
            <span className="font-bold tracking-tight text-base sm:text-lg" style={{ color: isDark ? "#fff" : "#19171A" }}>
              Doc<span style={{ color: "#E8503A" }}>AI</span>
            </span>
          </Link>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-medium" style={{ color: isDark ? "#cbd5e1" : "#64748b" }}>
            <a href="#method" className="hover:text-[#E8503A] transition-colors">How it works</a>
            <a href="#features" className="hover:text-[#E8503A] transition-colors">Features</a>
            <a href="#privacy" className="hover:text-[#E8503A] transition-colors">Privacy</a>
            <a href="#faq" className="hover:text-[#E8503A] transition-colors">FAQ</a>
          </div>

          {/* Right: Theme Toggle + CTA */}
          <div className="flex items-center gap-3">
            {/* THEME TOGGLE BUTTON */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={handleToggleTheme}
              className="p-2 rounded-full transition-colors cursor-pointer"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                color: isDark ? "#facc15" : "#334155",
              }}
              aria-label="Toggle dark/light theme"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            {/* START FREE / DASHBOARD BUTTON */}
            <AuthCTA signedInText="Dashboard">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                className="bg-[#E8503A] hover:bg-[#D3402B] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 rounded-full transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>Start free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </AuthCTA>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-full cursor-pointer"
              style={{ color: isDark ? "#cbd5e1" : "#64748b" }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-4 right-4 z-40 md:hidden p-6 rounded-3xl border shadow-2xl"
            style={{
              backgroundColor: isDark ? "#18161D" : "#ffffff",
              borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="flex flex-col gap-4 text-sm font-medium">
              <a href="#method" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#E8503A]">How it works</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#E8503A]">Features</a>
              <a href="#privacy" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#E8503A]">Privacy</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#E8503A]">FAQ</a>
              <div className="pt-3 flex flex-col gap-2" style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` }}>
                <AuthSignIn>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center text-xs font-semibold rounded-full border cursor-pointer"
                    style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
                  >
                    Sign in
                  </button>
                </AuthSignIn>
                <AuthCTA signedInText="Go to Dashboard">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center text-xs font-semibold rounded-full bg-[#E8503A] text-white cursor-pointer"
                  >
                    Start free
                  </button>
                </AuthCTA>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 2. HERO SECTION                                           */}
      {/* ========================================================= */}
      <section className="pt-36 sm:pt-44 pb-20 px-6 sm:px-8 max-w-5xl mx-auto text-center flex flex-col items-center">
        
        {/* Eyebrow Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border mb-8 select-none shadow-sm"
          style={{
            backgroundColor: "rgba(232,80,58,0.1)",
            color: "#E8503A",
            borderColor: "rgba(232,80,58,0.2)",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-[#E8503A] animate-pulse" />
          <span>Retrieval-grounded document intelligence</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl sm:text-6xl lg:text-[76px] font-extrabold tracking-[-0.04em] leading-[1.08] mb-8 max-w-4xl text-center"
          style={{ color: isDark ? "#fff" : "#19171A" }}
        >
          Turn dense documents into <br />
          <span className="font-serif italic font-normal" style={{ color: "#E8503A" }}>living</span> intelligence.
        </motion.h1>

        {/* Subtext */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-base sm:text-lg max-w-2xl leading-relaxed mb-10 text-center" 
          style={{ color: isDark ? "#cbd5e1" : "#64748b" }}
        >
          Upload specs, research and knowledge bases. Ask anything and get precise, source-cited answers pulled straight from your own files — no guessing, no hallucinations.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <AuthCTA signedInText="Go to Dashboard">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              className="bg-[#E8503A] hover:bg-[#D3402B] text-white text-sm sm:text-base font-semibold px-8 py-3.5 rounded-full transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Start free</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </AuthCTA>
          
          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            href="#features"
            className="text-sm sm:text-base font-medium px-8 py-3.5 rounded-full transition-all border cursor-pointer inline-block"
            style={{
              borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
              color: isDark ? "#fff" : "#19171A",
            }}
          >
            Explore features
          </motion.a>
        </motion.div>

        {/* ========================================================= */}
        {/* WORKSPACE PREVIEW IMAGE                                    */}
        {/* ========================================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-full space-y-3 text-left"
        >
          {/* Breadcrumb */}
          <div className="flex items-center justify-between text-xs font-mono px-2" style={{ color: "#94a3b8" }}>
            <div className="flex items-center gap-2">
              <span>docai</span>
              <span>/</span>
              <span style={{ color: "#E8503A" }}>workspace</span>
            </div>
            <span className="text-[11px] hidden sm:inline" style={{ color: "#94a3b8" }}>Production Workspace Dashboard</span>
          </div>

          {/* Browser Frame */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border overflow-hidden shadow-2xl transition-all duration-300 group"
            style={{
              backgroundColor: isDark ? "#141218" : "#FFFFFF",
              borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)",
              boxShadow: isDark ? "0 25px 50px -12px rgba(0, 0, 0, 0.7)" : "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
            }}
          >
            {/* Top Browser Bar */}
            <div
              className="px-5 py-3 border-b flex items-center justify-between gap-4"
              style={{
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                backgroundColor: isDark ? "#17151D" : "#FCFAF8",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#10B981]/80 inline-block" />
              </div>

              <div
                className="flex items-center gap-2 px-4 py-1 rounded-full text-[11px] font-mono border"
                style={{
                  backgroundColor: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.03)",
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                  color: "#94a3b8",
                }}
              >
                <Lock className="w-3 h-3 text-[#10B981]" />
                <span>app.docai.intelligence/dashboard</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[11px] font-medium hidden sm:inline" style={{ color: "#94a3b8" }}>Live</span>
              </div>
            </div>

            {/* Actual Screenshot Image */}
            <div className="relative w-full overflow-hidden bg-black flex items-center justify-center">
              <img
                src="/workspace-preview.png"
                alt="DocAI Workspace Dashboard preview"
                className="w-full h-auto object-cover object-top select-none transition-transform duration-500 group-hover:scale-[1.008]"
                loading="eager"
              />
            </div>
          </motion.div>
        </motion.div>

      </section>

      {/* ========================================================= */}
      {/* 3. FILE-TYPE MARQUEE                                      */}
      {/* ========================================================= */}
      <section
        className="py-8 border-y overflow-hidden select-none"
        style={{
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
          backgroundColor: isDark ? "#131117" : "#FFFFFF",
        }}
      >
        <div className="flex whitespace-nowrap overflow-hidden group">
          <div className="flex items-center gap-8 animate-marquee group-hover:[animation-play-state:paused]">
            {[...supportedFileTypes, ...supportedFileTypes, ...supportedFileTypes].map((type, idx) => (
              <div key={idx} className="flex items-center gap-8">
                <span className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: isDark ? "#e2e8f0" : "#1e293b" }}>
                  {type}
                </span>
                <span className="text-lg font-black" style={{ color: "#E8503A" }}>✳</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. THE METHOD SECTION                                     */}
      {/* ========================================================= */}
      <section id="method" className="py-24 sm:py-32 px-6 sm:px-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-serif italic text-lg mb-3" style={{ color: "#E8503A" }}>The method</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-16 max-w-xl" style={{ color: isDark ? "#fff" : "#19171A" }}>
            Three moves from clutter to clarity.
          </h2>
        </motion.div>

        <div className="space-y-6">
          {[
            { num: "01", title: "Ingest", desc: "Drop in PDFs and Word docs. We parse each page, split it into overlapping semantic chunks and index everything into a private vector store — fully scoped to you.", icon: <FileText className="w-5 h-5" /> },
            { num: "02", title: "Understand", desc: "Every query is matched by meaning, not keywords. Sentence-transformer embeddings run a cosine search across your corpus to surface the most relevant context.", icon: <Cpu className="w-5 h-5" /> },
            { num: "03", title: "Answer", desc: "A grounded LLM composes replies strictly from retrieved context with click-to-view citations, providing verifiable, transparent insights.", icon: <CheckCircle2 className="w-5 h-5" /> },
          ].map((row, index) => (
            <motion.div 
              key={row.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ scale: 1.01, x: 6 }}
              className="p-6 sm:p-8 rounded-3xl border transition-all duration-300 flex flex-col md:flex-row md:items-start justify-between gap-6 cursor-pointer"
              style={{
                backgroundColor: isDark ? "rgba(20,18,24,0.6)" : "#FFFFFF",
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(232,80,58,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"; }}
            >
              <div className="flex items-baseline gap-6">
                <span className="text-4xl sm:text-5xl font-extrabold font-mono" style={{ color: "#E8503A" }}>{row.num}</span>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight mb-2" style={{ color: isDark ? "#fff" : "#19171A" }}>{row.title}</h3>
                  <p className="text-sm sm:text-base leading-relaxed max-w-xl" style={{ color: isDark ? "#cbd5e1" : "#64748b" }}>{row.desc}</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 self-end md:self-start"
                style={{
                  backgroundColor: "rgba(232,80,58,0.1)",
                  border: "1px solid rgba(232,80,58,0.2)",
                  color: "#E8503A",
                }}
              >
                {row.icon}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* 5. FEATURES BENTO GRID                                    */}
      {/* ========================================================= */}
      <section id="features" className="py-24 sm:py-32 px-6 sm:px-8 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <p className="font-serif italic text-lg mb-3" style={{ color: "#E8503A" }}>Features</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight" style={{ color: isDark ? "#fff" : "#19171A" }}>
              Built for real document intelligence.
            </h2>
          </div>
          <p className="text-sm sm:text-base max-w-sm leading-relaxed" style={{ color: isDark ? "#cbd5e1" : "#64748b" }}>
            Everything you need to turn raw files into structured, verifiable knowledge.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {[
            { span: "md:col-span-7", title: "Semantic vector search", desc: "Find ideas and context by meaning across your whole workspace, not brittle keyword matches.", icon: <Search className="w-5 h-5" />, big: true },
          ].map((card) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
              className={`${card.span} rounded-3xl p-6 sm:p-8 border flex flex-col justify-between min-h-[260px] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl`}
              style={{
                backgroundColor: isDark ? "#141218" : "#FFFFFF",
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(232,80,58,0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"; }}
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(232,80,58,0.1)", border: "1px solid rgba(232,80,58,0.2)", color: "#E8503A" }}>
                {card.icon}
              </div>
              <div className="space-y-2 pt-6">
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: isDark ? "#fff" : "#19171A" }}>{card.title}</h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: isDark ? "#cbd5e1" : "#64748b" }}>{card.desc}</p>
              </div>
            </motion.div>
          ))}

          {/* Right Column Stack */}
          <div className="md:col-span-5 flex flex-col gap-6">
            {[
              { title: "Grounded RAG chat", desc: "Answers synthesized strictly from your private documents — verifiable, never invented.", icon: <Cpu className="w-4 h-4" /> },
              { title: "Source-cited answers", desc: "Every answer links directly to its source document with exact page and section references.", icon: <Shield className="w-4 h-4" /> },
            ].map((card, idx) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="rounded-3xl p-6 sm:p-7 border flex flex-col justify-between flex-1 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl"
                style={{
                  backgroundColor: isDark ? "#141218" : "#FFFFFF",
                  borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(232,80,58,0.5)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"; }}
              >
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(232,80,58,0.1)", border: "1px solid rgba(232,80,58,0.2)", color: "#E8503A" }}>
                  {card.icon}
                </div>
                <div className="space-y-1.5 pt-4">
                  <h3 className="text-xl font-bold tracking-tight" style={{ color: isDark ? "#fff" : "#19171A" }}>{card.title}</h3>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: isDark ? "#cbd5e1" : "#64748b" }}>{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Row */}
          {[
            { span: "md:col-span-6", title: "Organized collections", desc: "Group related files into custom collections for focused research and project-level queries.", icon: <Layers className="w-4 h-4" /> },
            { span: "md:col-span-6", title: "Workspace analytics", desc: "Track query volume, document index statistics, and system activity in real time.", icon: <BarChart3 className="w-4 h-4" /> },
          ].map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className={`${card.span} rounded-3xl p-6 sm:p-8 border flex flex-col justify-between transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl`}
              style={{
                backgroundColor: isDark ? "#141218" : "#FFFFFF",
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(232,80,58,0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"; }}
            >
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(232,80,58,0.1)", border: "1px solid rgba(232,80,58,0.2)", color: "#E8503A" }}>
                {card.icon}
              </div>
              <div className="space-y-2 pt-6">
                <h3 className="text-xl font-bold tracking-tight" style={{ color: isDark ? "#fff" : "#19171A" }}>{card.title}</h3>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: isDark ? "#cbd5e1" : "#64748b" }}>{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. PRIVATE BY DESIGN                                      */}
      {/* ========================================================= */}
      <section id="privacy" className="py-24 sm:py-32 px-6 sm:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-6"
          >
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-3xl overflow-hidden border shadow-2xl transition-all duration-300 group"
              style={{
                backgroundColor: isDark ? "#141218" : "#FFFFFF",
                borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)",
                boxShadow: isDark ? "0 25px 50px -12px rgba(0, 0, 0, 0.7)" : "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
              }}
            >
              {/* Window Header */}
              <div
                className="px-4 py-2.5 border-b flex items-center justify-between"
                style={{
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                  backgroundColor: isDark ? "#17151D" : "#FCFAF8",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/80 inline-block" />
                </div>
                <span className="text-[10px] font-mono" style={{ color: "#94a3b8" }}>DocAI Copilot Engine</span>
                <span className="text-[10px] text-[#10B981] font-semibold">● RAG Active</span>
              </div>

              {/* Copilot Chat Screenshot */}
              <div className="relative w-full overflow-hidden bg-black flex items-center justify-center">
                <img
                  src="/copilot-preview.png"
                  alt="DocAI Copilot grounded reasoning interface"
                  className="w-full h-auto object-cover object-top select-none transition-transform duration-500 group-hover:scale-[1.01]"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-6 space-y-6"
          >
            <p className="font-serif italic text-lg" style={{ color: "#E8503A" }}>Private by design</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight" style={{ color: isDark ? "#fff" : "#19171A" }}>
              Your knowledge, under a single spotlight.
            </h2>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: isDark ? "#cbd5e1" : "#64748b" }}>
              Documents carry trade secrets. Vectors are bound to strict owner constraints, embeddings run in isolated sandboxes, and JWT-scoped permissions gate every request. Your data never trains a public model.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                { title: "Scoped isolation", desc: "Owner-bound vectors" },
                { title: "Local chunks", desc: "Sandboxed indexing" },
              ].map((chip) => (
                <motion.div
                  key={chip.title}
                  whileHover={{ scale: 1.02, x: 2 }}
                  className="p-4 rounded-2xl border transition-all cursor-pointer"
                  style={{
                    backgroundColor: isDark ? "#141218" : "#FFFFFF",
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(232,80,58,0.4)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"; }}
                >
                  <span className="text-xs font-bold block mb-1" style={{ color: isDark ? "#fff" : "#19171A" }}>{chip.title}</span>
                  <span className="text-xs" style={{ color: "#94a3b8" }}>{chip.desc}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>



      {/* ========================================================= */}
      {/* 8. FAQ ACCORDION SECTION                                  */}
      {/* ========================================================= */}
      <section id="faq" className="py-24 sm:py-32 px-6 sm:px-8 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 space-y-3"
        >
          <p className="font-serif italic text-lg" style={{ color: "#E8503A" }}>FAQ</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight" style={{ color: isDark ? "#fff" : "#19171A" }}>
            Frequently asked questions.
          </h2>
          <p className="text-xs sm:text-sm max-w-md mx-auto" style={{ color: isDark ? "#94a3b8" : "#64748b" }}>
            Got questions? Click any topic below to learn more about our AI architecture.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = activeFaq === index;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="rounded-2xl border overflow-hidden cursor-pointer transition-colors duration-200"
                style={{
                  backgroundColor: isOpen
                    ? isDark ? "#18161D" : "#FFFFFF"
                    : isDark ? "#141218" : "#FFFFFF",
                  borderColor: isOpen
                    ? "rgba(232,80,58,0.5)"
                    : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                  boxShadow: isOpen ? "0 4px 12px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.05)",
                }}
                onClick={() => setActiveFaq(prev => prev === index ? null : index)}
              >
                {/* Question Header */}
                <div className="w-full p-6 text-left flex items-center justify-between gap-4 select-none">
                  <span
                    className="text-base font-bold transition-colors"
                    style={{ color: isOpen ? "#E8503A" : isDark ? "#fff" : "#19171A" }}
                  >
                    {item.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: isOpen ? "#E8503A" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                      color: isOpen ? "#fff" : "#94a3b8",
                    }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </div>
                
                {/* Answer Body with AnimatePresence */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div
                        className="px-6 pb-6 text-xs sm:text-sm leading-relaxed pt-2"
                        style={{
                          color: isDark ? "#cbd5e1" : "#64748b",
                          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"}`,
                        }}
                      >
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. FINAL CTA SECTION                                      */}
      {/* ========================================================= */}
      <section className="py-24 sm:py-32 px-6 sm:px-8 max-w-5xl mx-auto text-left">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-serif italic text-xl mb-4" style={{ color: "#E8503A" }}>Ready?</p>
          <h2
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] leading-[1.1] mb-8"
            style={{ color: isDark ? "#fff" : "#19171A" }}
          >
            Transform your <br />
            documents today.
          </h2>
          <p className="text-base sm:text-lg max-w-2xl leading-relaxed mb-10" style={{ color: isDark ? "#cbd5e1" : "#64748b" }}>
            Upload your files, explore instant semantic search, and get verifiable, source-cited answers in seconds.
          </p>
          <div>
            <AuthCTA signedInText="Go to Dashboard">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                className="bg-[#E8503A] hover:bg-[#D3402B] text-white text-sm sm:text-base font-semibold px-8 py-4 rounded-full transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>Get started free</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </AuthCTA>
          </div>
        </motion.div>
      </section>

      {/* ========================================================= */}
      {/* 10. FOOTER                                                */}
      {/* ========================================================= */}
      <footer
        className="py-10"
        style={{
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
          backgroundColor: isDark ? "#0F0E11" : "#FAF3F0",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ color: "#94a3b8" }}>
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
            <LogoIcon size="sm" />
            <span className="font-bold" style={{ color: isDark ? "#fff" : "#19171A" }}>
              DocAI Intelligence
            </span>
          </Link>
          <div>
            <span>© 2026 DocAI Inc. — Retrieval-grounded, source-cited.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
