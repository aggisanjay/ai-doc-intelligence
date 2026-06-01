"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  FileText, Loader2, Mail, Lock, User, Eye, EyeOff, 
  CheckCircle2, ShieldCheck, Cpu, Database, Award, ArrowRight
} from "lucide-react";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(loginEmail, loginPassword);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await register(regEmail, regPassword, regName);
      setSuccessMsg("Account created successfully! Logging you in...");
      setTimeout(() => {
        login(regEmail, regPassword);
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Try a different email.");
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* RIGHT SECTION - 40% Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16 relative bg-[#0A0A0F]">
        
        {/* Glow circle for mobile bg */}
        <div className="md:hidden absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

        <div className="w-full max-w-[420px] z-10 space-y-8">
          
          {/* Mobile Logo */}
          <div className="flex md:hidden items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
              <FileText className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold">DocAI</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">
              {tab === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-sm text-white/50">
              {tab === "login" ? "Enter your workspace details to proceed" : "Get started with your developer account in minutes"}
            </p>
          </div>

          {/* Login / Register tab switcher */}
          <div className="bg-white/[0.03] border border-white/5 p-1 rounded-xl flex">
            <button
              onClick={() => { setTab("login"); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                tab === "login" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/70"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab("register"); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                tab === "register" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/70"
              }`}
            >
              Register
            </button>
          </div>

          {/* Feedback states */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 mt-0.5 text-rose-400 font-bold">!</div>
              <p>{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>{successMsg}</p>
            </div>
          )}

          {/* Forms */}
          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider text-white/50 uppercase">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-sm placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold tracking-wider text-white/50 uppercase">Password</label>
                  <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">Forgot?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-sm placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-white/10 bg-white/[0.02] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-[#0A0A0F] focus:ring-offset-2"
                />
                <label htmlFor="remember-me" className="ml-2 text-xs text-white/50 cursor-pointer select-none">
                  Keep me signed in on this device
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all duration-150"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider text-white/50 uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Sanjay Aggarwal"
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-sm placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider text-white/50 uppercase">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-sm placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider text-white/50 uppercase">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    minLength={8}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-sm placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all duration-150"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}



          {/* Policy */}
          <p className="text-[10px] text-center text-white/30 px-4">
            By signing in, you agree to our Terms of Service and Privacy Policy. Security auditing is active.
          </p>

        </div>
      </div>
    </div>
  );
}
