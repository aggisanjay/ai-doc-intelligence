"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SignIn, SignUp, useUser } from "@clerk/nextjs";
import { 
  FileText, Loader2, CheckCircle2, Cpu, Database, AlertTriangle, RefreshCw, Sparkles
} from "lucide-react";

export default function LoginPage() {
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const { clerkSync, logout } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const syncAttempted = useRef(false);
  const [authMode, setAuthMode] = useState<"options" | "signin" | "signup">("options");

  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get("mode");
      if (mode === "signup") {
        setAuthMode("signup");
      } else if (mode === "signin") {
        setAuthMode("signin");
      } else {
        setAuthMode("options");
      }
    };

    handleUrlChange();
    window.addEventListener("popstate", handleUrlChange);
    const interval = setInterval(handleUrlChange, 200);

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      clearInterval(interval);
    };
  }, []);

  // Sync Clerk session with local backend
  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser && !syncAttempted.current && !syncError) {
      const email = clerkUser.primaryEmailAddress?.emailAddress;
      const fullName = clerkUser.fullName || clerkUser.username || "";
      if (email && !isSyncing) {
        syncAttempted.current = true;
        setIsSyncing(true);
        clerkSync(email, fullName)
          .catch((err) => {
            console.error("Clerk sync failed:", err);
            setIsSyncing(false);
            setSyncError(err.message || "Failed to sync user with workspace.");
            syncAttempted.current = false;
          });
      }
    }
  }, [isLoaded, isSignedIn, clerkUser, clerkSync, isSyncing, syncError]);

  const handleRetrySync = () => {
    setSyncError(null);
    setIsSyncing(false);
    syncAttempted.current = false;
  };

  const handleSignOut = async () => {
    await logout();
    setSyncError(null);
    setIsSyncing(false);
    syncAttempted.current = false;
  };

  // Rotating features list
  const features = [
    { title: "AI-Powered Search", desc: "Ask questions in natural language and retrieve exact page matches instantly." },
    { title: "Intelligent Summarization", desc: "Get comprehensive summaries of massive document lists with a single click." },
    { title: "Semantic Retrieval", desc: "Find documents based on actual semantic meaning rather than just keyword matches." },
    { title: "Enterprise Security", desc: "Your data is fully isolated, encrypted, and backed by SOC2 compliant infrastructure." },
    { title: "Real-Time Insights", desc: "Monitor active uploads and track processing status live as indexing occurs." }
  ];
  const [activeFeatureIdx, setActiveFeatureIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeatureIdx((prev) => (prev + 1) % features.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* LEFT SECTION - 60% Marketing & Branding */}
      <div className="hidden md:flex md:w-[60%] relative flex-col justify-between p-12 lg:p-16 bg-gradient-to-br from-[#0C0C16] via-[#111122] to-[#0A0A0F] border-r border-white/5 overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />
        
        {/* Floating document mockup cards for visual interest */}
        <div className="absolute top-[25%] right-[10%] w-64 p-4 rounded-xl glass-card border-white/10 shadow-2xl animate-pulse pointer-events-none hidden lg:block transform rotate-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Cpu className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold tracking-wider text-indigo-400 uppercase">AI Processor</span>
          </div>
          <div className="h-2 w-[85%] bg-white/10 rounded mb-1.5" />
          <div className="h-2 w-[95%] bg-white/10 rounded mb-1.5" />
          <div className="h-2 w-[45%] bg-white/5 rounded" />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] text-white/40">Status</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">Completed</span>
          </div>
        </div>

        <div className="absolute bottom-[30%] left-[8%] w-56 p-4 rounded-xl glass-card border-white/5 shadow-2xl pointer-events-none hidden lg:block transform -rotate-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 bg-cyan-500/20 text-cyan-400 rounded">
              <Database className="h-3.5 w-3.5" />
            </div>
            <span className="text-[10px] font-medium text-cyan-400">Embedding Chunk 4</span>
          </div>
          <div className="h-1.5 w-[100%] bg-white/10 rounded mb-1" />
          <div className="h-1.5 w-[70%] bg-white/5 rounded" />
          <div className="mt-2.5 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-cyan-400" />
            <span className="text-[9px] text-white/50">Vector match: 94.2%</span>
          </div>
        </div>

        {/* Logo */}
        <div className="z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <FileText className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">DocAI</span>
            <span className="text-[10px] font-semibold text-indigo-400 tracking-widest uppercase block -mt-1">Intelligence</span>
          </div>
        </div>

        {/* Big Heading & Spotlight Showcase */}
        <div className="z-10 my-auto max-w-xl">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Transform Documents <br/>
            Into <span className="gradient-text">Business Intelligence</span>
          </h1>
          <p className="text-white/60 text-base lg:text-lg mb-10 leading-relaxed">
            Analyze, search, summarize, and extract insights from millions of documents using advanced semantic AI. Built for enterprise speed and security.
          </p>

          {/* Rotating Spotlight Component */}
          <div className="min-h-[110px] p-5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm flex gap-4 transition-all duration-500">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                {features[activeFeatureIdx].title}
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Feature Spotlight</span>
              </h4>
              <p className="text-sm text-white/50 leading-relaxed">
                {features[activeFeatureIdx].desc}
              </p>
            </div>
          </div>
        </div>

        {/* Quotes, trust index & metrics */}
        <div className="z-10 space-y-8">
          {/* Trust Badges */}
          <div className="pt-6 border-t border-white/5 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col gap-1.5 hover:bg-white/[0.02] transition-colors">
              <p className="text-lg font-bold tracking-tight text-white">500K+</p>
              <p className="text-[9px] uppercase tracking-wider text-white/40 font-semibold">Docs Processed</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/[0.02] border border-emerald-500/10 flex flex-col gap-1.5 hover:bg-emerald-500/[0.04] transition-colors">
              <p className="text-lg font-bold tracking-tight text-emerald-400">99.9%</p>
              <p className="text-[9px] uppercase tracking-wider text-white/40 font-semibold">System Uptime</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/[0.02] border border-indigo-500/10 flex flex-col gap-1.5 hover:bg-indigo-500/[0.04] transition-colors">
              <p className="text-lg font-bold tracking-tight text-indigo-400">SOC2</p>
              <p className="text-[9px] uppercase tracking-wider text-white/40 font-semibold">Security Verified</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/[0.02] border border-purple-500/10 flex flex-col gap-1.5 hover:bg-purple-500/[0.04] transition-colors">
              <p className="text-lg font-bold tracking-tight text-purple-400">Enterprise</p>
              <p className="text-[9px] uppercase tracking-wider text-white/40 font-semibold">Ready Shield</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION - 40% Clerk Login Card */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16 relative bg-[#0A0A0F]">
        
        {/* Glow circle for mobile bg */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

        <div className="w-full max-w-[400px] z-10 flex flex-col items-center">
          {/* Mobile Logo */}
          <div className="flex md:hidden items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
              <FileText className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold">DocAI</span>
          </div>

          {syncError ? (
            <div className="flex flex-col items-center justify-center p-8 bg-[#171F2E] border border-white/5 shadow-2xl rounded-2xl w-full text-center space-y-5 min-h-[340px] relative overflow-hidden">
              {/* Alert Glow */}
              <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-rose-500/10 blur-[60px] pointer-events-none" />
              
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
                <AlertTriangle className="h-8 w-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Workspace Sync Failed</h3>
                <p className="text-xs text-white/50 leading-relaxed max-w-[280px]">
                  Unable to connect your credentials with the workspace database. Make sure the backend server is running and accessible.
                </p>
              </div>

              <div className="w-full flex flex-col gap-2 pt-2">
                <button
                  onClick={handleRetrySync}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm py-2.5 shadow-lg shadow-indigo-600/15 transition-all duration-150 active:scale-[0.98]"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry Connection
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] text-white/70 hover:text-white font-medium rounded-xl text-xs py-2 transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : !isLoaded || isSyncing || (isLoaded && isSignedIn) ? (
            <div className="flex flex-col items-center justify-center p-8 bg-[#171F2E] border border-white/5 shadow-2xl rounded-2xl w-full text-center space-y-4 min-h-[340px]">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
              <h3 className="text-lg font-semibold text-white">
                {isSyncing || (isLoaded && isSignedIn) ? "Syncing Workspace Account" : "Loading Workspace"}
              </h3>
              <p className="text-xs text-white/40 leading-relaxed max-w-[280px]">
                {isSyncing || (isLoaded && isSignedIn) 
                  ? "Configuring session credentials and loading your workspace environment..."
                  : "Connecting to secure authentication services..."}
              </p>
            </div>
          ) : authMode === "signup" ? (
            <div className="w-full flex flex-col items-center">
              <SignUp 
                routing="hash"
                signInUrl="/login?mode=signin"
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
                    card: "bg-[#171F2E] border border-white/5 shadow-2xl rounded-[24px] w-full",
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
              <button
                type="button"
                onClick={() => {
                  window.history.pushState(null, "", "/login");
                  setAuthMode("options");
                }}
                className="mt-4 flex items-center justify-center gap-1.5 text-xs text-white/50 hover:text-white font-medium transition-colors"
              >
                ← Back to Workspace Options
              </button>
            </div>
          ) : authMode === "signin" ? (
            <div className="w-full flex flex-col items-center">
              <SignIn 
                routing="hash"
                signUpUrl="/login?mode=signup"
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
                    card: "bg-[#171F2E] border border-white/5 shadow-2xl rounded-[24px] w-full",
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
              <button
                type="button"
                onClick={() => {
                  window.history.pushState(null, "", "/login");
                  setAuthMode("options");
                }}
                className="mt-4 flex items-center justify-center gap-1.5 text-xs text-white/50 hover:text-white font-medium transition-colors"
              >
                ← Back to Workspace Options
              </button>
            </div>
          ) : (
            <div className="w-full max-w-[420px] p-8 bg-[#171F2E] border border-white/5 shadow-2xl rounded-[24px] flex flex-col justify-center items-center text-center space-y-6 relative overflow-hidden">
              {/* Subtle top glow */}
              <div className="absolute top-[-30%] left-[-30%] w-[100%] h-[100%] rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none" />

              <div className="space-y-2 relative z-10 pt-4">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  DocAI Workspace
                </h2>
                <p className="text-sm text-white/50 max-w-[290px] mx-auto leading-relaxed">
                  Access the secure semantic document intelligence sandbox
                </p>
              </div>

              <div className="w-full flex flex-col gap-3.5 relative z-10 pt-4 pb-4">
                <button
                  onClick={() => {
                    window.history.pushState(null, "", "/login?mode=signin");
                    setAuthMode("signin");
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-full text-sm py-3 px-6 shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all duration-150"
                >
                  Sign In to Workspace
                  <Sparkles className="h-4 w-4 text-white" />
                </button>
                
                <button
                  onClick={() => {
                    window.history.pushState(null, "", "/login?mode=signup");
                    setAuthMode("signup");
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-transparent border border-white/20 hover:bg-white/[0.02] hover:border-white/30 text-white font-semibold rounded-full text-sm py-3 px-6 active:scale-[0.98] transition-all duration-150"
                >
                  Register Workspace Account
                </button>
              </div>
            </div>
          )}

          {/* Policy */}
          <p className="text-[10px] text-center text-white/30 px-4 mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy. Security auditing is active.
          </p>
        </div>
      </div>

    </div>
  );
}
