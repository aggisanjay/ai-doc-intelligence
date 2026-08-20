"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, ArrowRight, Check, Shield, Zap, 
  MessageSquare, Search, ChevronDown, Users, 
  Upload, CornerUpRight, Sparkles, X, Menu,
  Lock, Globe, FileCheck, Layers, ExternalLink,
  ChevronRight, Twitter, Instagram, Linkedin, Youtube
} from "lucide-react";
import { SignIn, SignUp, useUser } from "@clerk/nextjs";
import { useAuth } from "@/hooks/useAuth";

export default function LandingPage() {
  // Navigation & Dropdown State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Auth Modal State
  const [authModal, setAuthModal] = useState<"signin" | "signup" | null>(null);

  // Clerk Sync logic
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const { clerkSync } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const openAuth = (type: "signin" | "signup") => {
    if (isSignedIn) {
      window.location.href = "/dashboard";
    } else {
      setAuthModal(type);
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 selection:bg-blue-600/30 selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* ========================================================= */}
      {/* 1. STICKY NAV                                              */}
      {/* ========================================================= */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 border-b ${
          scrolled 
            ? "bg-black/90 backdrop-blur-md border-white/[0.08] shadow-sm" 
            : "bg-black border-white/[0.08]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-serif italic font-bold text-2xl tracking-tight text-white group-hover:opacity-90 transition-opacity">
                DocAI
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
              <a href="#how-it-works" className="hover:text-white transition-colors duration-150">
                How it works
              </a>
              <a href="#features" className="hover:text-white transition-colors duration-150">
                Features
              </a>
              <a href="#pricing" className="hover:text-white transition-colors duration-150">
                Pricing
              </a>
              
              {/* Resources Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setResourcesOpen(!resourcesOpen)}
                  onBlur={() => setTimeout(() => setResourcesOpen(false), 200)}
                  className="flex items-center gap-1.5 hover:text-white transition-colors duration-150 focus:outline-none"
                >
                  <span>Resources</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${resourcesOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {resourcesOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-3 w-52 bg-black border border-white/[0.08] rounded-2xl p-2 shadow-2xl z-50"
                    >
                      <a href="#blog" className="block px-3.5 py-2.5 text-sm rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors">
                        Documentation & Blog
                      </a>
                      <a href="#testimonials" className="block px-3.5 py-2.5 text-sm rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors">
                        Customer Stories
                      </a>
                      <a href="#security" className="block px-3.5 py-2.5 text-sm rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors">
                        Security & Privacy
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Nav Right CTA */}
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => openAuth("signin")}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-150"
            >
              Sign in
            </button>
            <button 
              onClick={() => openAuth("signup")}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-150 active:scale-[0.98]"
            >
              Get started
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black border-b border-white/[0.08] px-6 py-6 space-y-4"
            >
              <a 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base text-slate-300 hover:text-white"
              >
                How it works
              </a>
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base text-slate-300 hover:text-white"
              >
                Features
              </a>
              <a 
                href="#pricing" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base text-slate-300 hover:text-white"
              >
                Pricing
              </a>
              <a 
                href="#blog" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base text-slate-300 hover:text-white"
              >
                Blog & Insights
              </a>
              <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-3">
                <button 
                  onClick={() => { setMobileMenuOpen(false); openAuth("signin"); }}
                  className="w-full text-center py-2.5 text-sm font-medium text-slate-300 hover:text-white"
                >
                  Sign in
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); openAuth("signup"); }}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3 rounded-full text-center"
                >
                  Get started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ========================================================= */}
      {/* 2. HERO SECTION                                            */}
      {/* ========================================================= */}
      <section className="pt-36 pb-20 md:pt-44 md:pb-28 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08] max-w-3xl mx-auto">
              Ask questions about your documents using AI
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
              DocAI reads your files and answers what you need to know. No more digging through pages. Just ask.
            </p>

            {/* CTA Button Pair */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <button 
                onClick={() => openAuth("signup")}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-6 py-2.5 rounded-full transition-all duration-150 active:scale-[0.98]"
              >
                Start
              </button>
              <a 
                href="#how-it-works"
                className="border border-white/20 hover:border-white text-white font-medium text-sm px-6 py-2.5 rounded-full transition-all duration-150 active:scale-[0.98]"
              >
                Learn
              </a>
            </div>
          </motion.div>

          {/* Full-width Hero Image with large rounded corners */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-14 md:mt-20 max-w-6xl mx-auto rounded-3xl border border-white/[0.08] overflow-hidden group bg-[#09090b]"
          >
            <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" 
                alt="DocAI Collaborative Intelligence Platform" 
                className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. THREE STEPS                                             */}
      {/* ========================================================= */}
      <section id="how-it-works" className="py-24 md:py-32 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16 md:mb-24"
          >
            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3">
              Simple
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Three steps to get answers from your documents
            </h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              The work is fast. The answers are clear. You do not need to be a technician.
            </p>
          </motion.div>

          {/* 3-Column Step Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 max-w-6xl mx-auto">
            
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col items-center text-center px-4"
            >
              <div className="w-12 h-12 rounded-full border border-white/[0.08] flex items-center justify-center mb-6 text-white bg-white/[0.02]">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Upload your documents
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Drop in PDFs, Word files, or plain text. DocAI reads them all.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center text-center px-4"
            >
              <div className="w-12 h-12 rounded-full border border-white/[0.08] flex items-center justify-center mb-6 text-white bg-white/[0.02]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Ask a question in plain English
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Type what you need to know. The same way you would ask a colleague.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center text-center px-4"
            >
              <div className="w-12 h-12 rounded-full border border-white/[0.08] flex items-center justify-center mb-6 text-white bg-white/[0.02]">
                <CornerUpRight className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Get your answer with a source
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Receive a direct reply with a citation back to the original page.
              </p>
            </motion.div>

          </div>

          {/* Links Below Steps */}
          <div className="mt-14 flex items-center justify-center gap-6">
            <button 
              onClick={() => openAuth("signup")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm px-5 py-2 rounded-full transition-colors"
            >
              Start
            </button>
            <a 
              href="#features" 
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              More <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. FEATURE BLOCK 1 (Image Right)                           */}
      {/* ========================================================= */}
      <section id="features" className="py-24 md:py-32 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-lg"
            >
              <div className="w-10 h-10 rounded-xl border border-white/[0.08] flex items-center justify-center text-white mb-8 bg-white/[0.02]">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-6">
                Ask anything across all your file formats
              </h2>
              <p className="text-slate-400 text-base leading-relaxed mb-8">
                DocAI handles PDF, DOCX, and TXT. It understands the context of your question and finds the right answer in the right file.
              </p>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => openAuth("signup")}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-5 py-2 rounded-full transition-colors"
                >
                  Try
                </button>
                <a 
                  href="#multi-language" 
                  className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                >
                  More <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border border-white/[0.08] overflow-hidden group bg-[#09090b]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop" 
                  alt="Reviewing document formats" 
                  className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. FEATURE BLOCK 2 (Image Left)                            */}
      {/* ========================================================= */}
      <section className="py-24 md:py-32 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Image */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1 rounded-3xl border border-white/[0.08] overflow-hidden group bg-[#09090b]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop" 
                  alt="Verified answers and citations" 
                  className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
              </div>
            </motion.div>

            {/* Right Content */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2 max-w-lg"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-6">
                Every answer comes with proof and a score
              </h2>
              <p className="text-slate-400 text-base leading-relaxed mb-8">
                DocAI shows you where the answer came from. It also gives a confidence score so you know how much to trust it.
              </p>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => openAuth("signup")}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-5 py-2 rounded-full transition-colors"
                >
                  Try
                </button>
                <a 
                  href="#security" 
                  className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                >
                  More <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. FEATURE BLOCK 3 (Image Right, Secure Eyebrow)           */}
      {/* ========================================================= */}
      <section id="security" className="py-24 md:py-32 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-lg"
            >
              <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3">
                Secure
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-6">
                Your documents stay private and protected
              </h2>
              <p className="text-slate-400 text-base leading-relaxed mb-8">
                Enterprise-grade encryption keeps your data safe. You control who can see and access every file.
              </p>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => openAuth("signup")}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-5 py-2 rounded-full transition-colors"
                >
                  Start
                </button>
                <a 
                  href="#numbered-features" 
                  className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                >
                  More <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border border-white/[0.08] overflow-hidden group bg-[#09090b]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop" 
                  alt="Enterprise security and document privacy" 
                  className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. NUMBERED FEATURE LIST (4 Stacked Rows)                  */}
      {/* ========================================================= */}
      <section id="numbered-features" className="border-b border-white/[0.08]">
        
        {/* Row 01 - Multi-language */}
        <div id="multi-language" className="py-24 md:py-32 border-b border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="mb-10">
              <span className="text-xs font-semibold text-slate-400 tracking-wider">
                01 &nbsp; Multi-language
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-lg"
              >
                <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3">
                  Global
                </p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-6">
                  Ask questions in over twenty languages
                </h2>
                <p className="text-slate-400 text-base leading-relaxed mb-8">
                  DocAI reads and answers in the language you use. Your documents can be in one tongue and your questions in another.
                </p>
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => openAuth("signup")}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-5 py-2 rounded-full transition-colors"
                  >
                    Start
                  </button>
                  <a 
                    href="#row-02" 
                    className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    More <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="rounded-3xl border border-white/[0.08] overflow-hidden group bg-[#09090b]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop" 
                    alt="Multilingual document search" 
                    className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Row 02 - Summarization */}
        <div id="row-02" className="py-24 md:py-32 border-b border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="mb-10">
              <span className="text-xs font-semibold text-slate-400 tracking-wider">
                02 &nbsp; Summarization
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-lg"
              >
                <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3">
                  Fast
                </p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-6">
                  Get the gist of any long document
                </h2>
                <p className="text-slate-400 text-base leading-relaxed mb-8">
                  DocAI condenses a hundred pages into a few clear paragraphs. You get the point without the pain.
                </p>
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => openAuth("signup")}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-5 py-2 rounded-full transition-colors"
                  >
                    Start
                  </button>
                  <a 
                    href="#row-03" 
                    className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    More <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="rounded-3xl border border-white/[0.08] overflow-hidden group bg-[#09090b]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1200&auto=format&fit=crop" 
                    alt="Fast AI document summarization" 
                    className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Row 03 - Entity extraction */}
        <div id="row-03" className="py-24 md:py-32 border-b border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="mb-10">
              <span className="text-xs font-semibold text-slate-400 tracking-wider">
                03 &nbsp; Entity extraction
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-lg"
              >
                <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3">
                  Precise
                </p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-6">
                  Pull out names, dates, and key facts
                </h2>
                <p className="text-slate-400 text-base leading-relaxed mb-8">
                  DocAI finds the important pieces in your files. It lists the people, places, and numbers that matter.
                </p>
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => openAuth("signup")}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-5 py-2 rounded-full transition-colors"
                  >
                    Start
                  </button>
                  <a 
                    href="#row-04" 
                    className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    More <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="rounded-3xl border border-white/[0.08] overflow-hidden group bg-[#09090b]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1200&auto=format&fit=crop" 
                    alt="Precision fact and entity extraction" 
                    className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Row 04 - Collaboration */}
        <div id="row-04" className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="mb-10">
              <span className="text-xs font-semibold text-slate-400 tracking-wider">
                04 &nbsp; Collaboration
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-lg"
              >
                <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3">
                  Shared
                </p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-6">
                  Work on documents with your whole team
                </h2>
                <p className="text-slate-400 text-base leading-relaxed mb-8">
                  Share workspaces, organize collections, and query knowledge together in real time without conflicting versions.
                </p>
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => openAuth("signup")}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-5 py-2 rounded-full transition-colors"
                  >
                    Start
                  </button>
                  <a 
                    href="#benefits" 
                    className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    More <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="rounded-3xl border border-white/[0.08] overflow-hidden group bg-[#09090b]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200&auto=format&fit=crop" 
                    alt="Team collaborative document intelligence" 
                    className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

      </section>

      {/* ========================================================= */}
      {/* 8. BENEFITS GRID (3-Column with Image Above Each)          */}
      {/* ========================================================= */}
      <section id="benefits" className="py-24 md:py-32 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            
            {/* Benefit 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col"
            >
              <div className="rounded-2xl border border-white/[0.08] overflow-hidden mb-6 group aspect-[16/10] bg-[#09090b]">
                <img 
                  src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop" 
                  alt="Save hours of manual work" 
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Save hours of manual work
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Stop reading page by page. Get the answer in seconds.
              </p>
            </motion.div>

            {/* Benefit 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col"
            >
              <div className="rounded-2xl border border-white/[0.08] overflow-hidden mb-6 group aspect-[16/10] bg-[#09090b]">
                <img 
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop" 
                  alt="Reduce human error" 
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Reduce human error
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                The AI does not get tired or miss a line. It finds what is there.
              </p>
            </motion.div>

            {/* Benefit 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col"
            >
              <div className="rounded-2xl border border-white/[0.08] overflow-hidden mb-6 group aspect-[16/10] bg-[#09090b]">
                <img 
                  src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=800&auto=format&fit=crop" 
                  alt="Accelerate decisions" 
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Accelerate decisions
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                With fast answers you can act now. Not next week.
              </p>
            </motion.div>

          </div>

          {/* Action Links */}
          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={() => openAuth("signup")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm px-5 py-2 rounded-full transition-colors"
            >
              Start
            </button>
            <a 
              href="#testimonials" 
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              More <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. DOCUMENT-TYPE SIMPLE SECTION                            */}
      {/* ========================================================= */}
      <section className="py-24 md:py-32 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-lg"
            >
              <div className="w-10 h-10 rounded-xl border border-white/[0.08] flex items-center justify-center text-white mb-8 bg-white/[0.02]">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-6">
                We make document management simple
              </h2>
              <p className="text-slate-400 text-base leading-relaxed mb-8">
                From contract audits to technical manuals, DocAI indexes every page into searchable knowledge. Instant questions, guaranteed citations, zero hassle.
              </p>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => openAuth("signup")}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-5 py-2 rounded-full transition-colors"
                >
                  Start
                </button>
                <a 
                  href="#pricing" 
                  className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                >
                  More <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border border-white/[0.08] overflow-hidden group bg-[#09090b]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1200&auto=format&fit=crop" 
                  alt="Modern simple document workspace" 
                  className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 10. TESTIMONIALS (3-Column with Logo Mark Above)           */}
      {/* ========================================================= */}
      <section id="testimonials" className="py-24 md:py-32 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 max-w-6xl mx-auto">
            
            {/* Testimonial 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col items-center text-center px-4"
            >
              {/* Brand Logo Mark */}
              <div className="h-6 flex items-center justify-center font-bold tracking-wider text-sm text-slate-300 uppercase mb-8">
                Northwind
              </div>
              <p className="text-base sm:text-lg font-medium text-white leading-relaxed mb-8">
                &ldquo;DocAI cut our contract review time from three days to three hours. It is the best tool we have.&rdquo;
              </p>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mb-3 border border-white/10">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop" 
                    alt="Sarah Chen" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-sm font-bold text-white">Sarah Chen</h4>
                <p className="text-xs text-slate-400">Legal Ops, Northwind</p>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center text-center px-4"
            >
              {/* Brand Logo Mark */}
              <div className="h-6 flex items-center justify-center font-bold tracking-wider text-sm text-slate-300 uppercase mb-8">
                Bluepeak
              </div>
              <p className="text-base sm:text-lg font-medium text-white leading-relaxed mb-8">
                &ldquo;I used to dread the quarterly reports. Now I ask a question and get the number with a source. Simple.&rdquo;
              </p>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mb-3 border border-white/10">
                  <img 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" 
                    alt="Mark Olsen" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-sm font-bold text-white">Mark Olsen</h4>
                <p className="text-xs text-slate-400">CFO, Bluepeak</p>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center text-center px-4"
            >
              {/* Brand Logo Mark */}
              <div className="h-6 flex items-center justify-center font-bold tracking-wider text-sm text-slate-300 uppercase mb-8">
                Helios
              </div>
              <p className="text-base sm:text-lg font-medium text-white leading-relaxed mb-8">
                &ldquo;The confidence score is a game changer. We know exactly when to trust the answer and when to double-check.&rdquo;
              </p>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mb-3 border border-white/10">
                  <img 
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop" 
                    alt="Elena Rossi" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-sm font-bold text-white">Elena Rossi</h4>
                <p className="text-xs text-slate-400">Research Lead, Helios</p>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 11. PRICING PLAN                                           */}
      {/* ========================================================= */}
      <section id="pricing" className="py-24 md:py-32 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
          >
            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3">
              Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Pricing plan
            </h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              Choose a plan that fits your work. Cancel anytime.
            </p>
          </motion.div>

          {/* 3 Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Basic Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-3xl border border-white/[0.08] p-8 bg-black flex flex-col justify-between"
            >
              <div>
                <h3 className="text-base font-medium text-white mb-4">Basic plan</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">$19</span>
                  <span className="text-slate-400 text-sm">/mo</span>
                </div>
                <p className="text-xs text-slate-400 mb-8">or $199 yearly</p>

                <div className="space-y-3.5 text-sm text-slate-300 mb-8">
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span>Up to 100 documents</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span>10 questions per day</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span>Standard support</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => openAuth("signup")}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3 rounded-full transition-colors"
              >
                Get started
              </button>
            </motion.div>

            {/* Business Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-3xl border border-white/[0.08] p-8 bg-black flex flex-col justify-between"
            >
              <div>
                <h3 className="text-base font-medium text-white mb-4">Business plan</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">$29</span>
                  <span className="text-slate-400 text-sm">/mo</span>
                </div>
                <p className="text-xs text-slate-400 mb-8">or $299 yearly</p>

                <div className="space-y-3.5 text-sm text-slate-300 mb-8">
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span>Up to 1,000 documents</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span>Unlimited questions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span>Team collaboration</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => openAuth("signup")}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3 rounded-full transition-colors"
              >
                Get started
              </button>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-3xl border border-white/[0.08] p-8 bg-black flex flex-col justify-between"
            >
              <div>
                <h3 className="text-base font-medium text-white mb-4">Enterprise plan</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">$49</span>
                  <span className="text-slate-400 text-sm">/mo</span>
                </div>
                <p className="text-xs text-slate-400 mb-8">or $499 yearly</p>

                <div className="space-y-3.5 text-sm text-slate-300 mb-8">
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span>Unlimited documents</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span>Unlimited questions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span>Dedicated support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span>Advanced security controls</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span>Custom integrations</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => openAuth("signup")}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3 rounded-full transition-colors"
              >
                Get started
              </button>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 12. MID-PAGE CTA                                           */}
      {/* ========================================================= */}
      <section className="py-24 md:py-32 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              Start asking your documents...
            </h2>
            <p className="mt-6 text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
              Try DocAI free for seven days. No credit card required. Just upload a file and ask.
            </p>

            <div className="mt-8 flex items-center justify-center gap-4">
              <button 
                onClick={() => openAuth("signup")}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-6 py-2.5 rounded-full transition-all duration-150 active:scale-[0.98]"
              >
                Start
              </button>
              <a 
                href="#how-it-works"
                className="border border-white/20 hover:border-white text-white font-medium text-sm px-6 py-2.5 rounded-full transition-all duration-150 active:scale-[0.98]"
              >
                Learn
              </a>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 13. BLOG / INSIGHTS                                        */}
      {/* ========================================================= */}
      <section id="blog" className="py-24 md:py-32 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-left max-w-3xl mb-16"
          >
            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3">
              Blog
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Read the latest insights
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Practical advice on document intelligence and getting work done faster.
            </p>
          </motion.div>

          {/* 3-Column Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            
            {/* Article 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col group cursor-pointer"
              onClick={() => openAuth("signup")}
            >
              <div className="rounded-2xl border border-white/[0.08] overflow-hidden mb-6 aspect-[16/10] bg-[#09090b]">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop" 
                  alt="How AI reads a contract" 
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <span className="font-semibold text-white px-2 py-0.5 rounded bg-white/10">AI</span>
                <span>·</span>
                <span>5 min read</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                How AI reads a contract better than you
              </h3>
              <span className="text-sm font-medium text-white group-hover:text-blue-400 flex items-center gap-1 transition-colors">
                Read more <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </motion.div>

            {/* Article 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col group cursor-pointer"
              onClick={() => openAuth("signup")}
            >
              <div className="rounded-2xl border border-white/[0.08] overflow-hidden mb-6 aspect-[16/10] bg-[#09090b]">
                <img 
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop" 
                  alt="Stop searching for files" 
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <span className="font-semibold text-white px-2 py-0.5 rounded bg-white/10">Productivity</span>
                <span>·</span>
                <span>4 min read</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                Stop searching for files and start asking questions
              </h3>
              <span className="text-sm font-medium text-white group-hover:text-blue-400 flex items-center gap-1 transition-colors">
                Read more <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </motion.div>

            {/* Article 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col group cursor-pointer"
              onClick={() => openAuth("signup")}
            >
              <div className="rounded-2xl border border-white/[0.08] overflow-hidden mb-6 aspect-[16/10] bg-[#09090b]">
                <img 
                  src="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop" 
                  alt="Enterprise grade doc security" 
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <span className="font-semibold text-white px-2 py-0.5 rounded bg-white/10">Security</span>
                <span>·</span>
                <span>6 min read</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                Why your docs need enterprise-grade security
              </h3>
              <span className="text-sm font-medium text-white group-hover:text-blue-400 flex items-center gap-1 transition-colors">
                Read more <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </motion.div>

          </div>

          {/* View All Button */}
          <div className="flex justify-center">
            <button 
              onClick={() => openAuth("signup")}
              className="border border-white/20 hover:border-white text-white font-medium text-sm px-6 py-2.5 rounded-full transition-all duration-150 active:scale-[0.98]"
            >
              View all
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 14. FOOTER                                                 */}
      {/* ========================================================= */}
      <footer className="py-16 md:py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/[0.08]">
            
            {/* Brand column */}
            <div className="md:col-span-3">
              <Link href="/" className="font-serif italic font-bold text-2xl text-white">
                DocAI
              </Link>
              <p className="mt-4 text-xs text-slate-400 leading-relaxed max-w-xs">
                Minimalist AI document intelligence for modern teams. Instant answers, guaranteed citations, enterprise security.
              </p>
            </div>

            {/* Product Column */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Product</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#blog" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Company</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>

            {/* Subscribe Column */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Subscribe</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Join our newsletter to stay up to date on features and releases.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); }} className="flex flex-col sm:flex-row gap-2 mt-4">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  required
                  className="bg-white/[0.04] border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 flex-1"
                />
                <button 
                  type="submit"
                  className="bg-white hover:bg-slate-200 text-black text-xs font-semibold px-4 py-2 rounded-full transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-[10px] text-slate-500 mt-2">
                By subscribing you agree to our Privacy Policy and consent to receive updates.
              </p>
            </div>

          </div>

          {/* Bottom Row */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-6">
              <span>© 2026 DocAI. All rights reserved.</span>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookies Settings</a>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4 text-slate-400">
              <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </footer>

      {/* ========================================================= */}
      {/* 15. CLERK AUTH MODAL                                       */}
      {/* ========================================================= */}
      <AnimatePresence>
        {authModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="absolute inset-0 z-0" onClick={() => setAuthModal(null)} />
            <div className="relative z-10 w-full max-w-[400px] bg-[#0d0d11] border border-white/10 shadow-2xl rounded-3xl p-1 overflow-hidden">
              <button 
                onClick={() => setAuthModal(null)}
                className="absolute top-4 right-4 z-50 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>

              {authModal === "signin" ? (
                <SignIn 
                  routing="hash"
                  signUpUrl="/#signup"
                  appearance={{
                    variables: {
                      colorPrimary: '#2563EB',
                      colorBackground: '#0d0d11',
                      colorInputBackground: '#000000',
                      colorText: '#ffffff',
                      colorTextSecondary: '#9ca3af',
                      colorInputText: '#ffffff',
                      colorTextOnPrimaryBackground: '#ffffff',
                    },
                    elements: {
                      card: "bg-transparent border-0 shadow-none w-full",
                      headerTitle: "text-white font-bold text-xl",
                      headerSubtitle: "text-white/40 text-xs",
                      socialButtonsBlockButton: "bg-white/[0.04] border-white/10 hover:bg-white/[0.08] text-white rounded-full",
                      formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-full text-sm py-2.5 transition-all duration-150 active:scale-[0.98]",
                      formFieldInput: "bg-black border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-blue-500",
                      footerActionLink: "text-blue-400 hover:text-blue-300 font-semibold",
                      footerActionText: "text-white/40",
                      identityPreviewText: "text-white",
                      identityPreviewEditButtonIcon: "text-white/50",
                      dividerText: "text-white/30",
                      dividerLine: "bg-white/10",
                      formFieldLabel: "text-white/60 text-xs font-medium uppercase tracking-wider",
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
                      colorPrimary: '#2563EB',
                      colorBackground: '#0d0d11',
                      colorInputBackground: '#000000',
                      colorText: '#ffffff',
                      colorTextSecondary: '#9ca3af',
                      colorInputText: '#ffffff',
                      colorTextOnPrimaryBackground: '#ffffff',
                    },
                    elements: {
                      card: "bg-transparent border-0 shadow-none w-full",
                      headerTitle: "text-white font-bold text-xl",
                      headerSubtitle: "text-white/40 text-xs",
                      socialButtonsBlockButton: "bg-white/[0.04] border-white/10 hover:bg-white/[0.08] text-white rounded-full",
                      formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-full text-sm py-2.5 transition-all duration-150 active:scale-[0.98]",
                      formFieldInput: "bg-black border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-blue-500",
                      footerActionLink: "text-blue-400 hover:text-blue-300 font-semibold",
                      footerActionText: "text-white/40",
                      identityPreviewText: "text-white",
                      identityPreviewEditButtonIcon: "text-white/50",
                      dividerText: "text-white/30",
                      dividerLine: "bg-white/10",
                      formFieldLabel: "text-white/60 text-xs font-medium uppercase tracking-wider",
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
