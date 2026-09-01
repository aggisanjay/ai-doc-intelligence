"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { authAPI } from "@/lib/api";
import { useUser } from "@clerk/nextjs";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useDocumentStore } from "@/stores/documentStore";

interface AppShellProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export function AppShell({ children, noPadding = false }: AppShellProps) {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const { isAuthenticated, loadFromStorage, setAuth } = useAuthStore();
  const { isSignedIn, isLoaded, user: clerkUser } = useUser();
  const hasSyncedRef = React.useRef(false);

  useEffect(() => { 
    setMounted(true);
    loadFromStorage(); 
  }, [loadFromStorage]);

  // Sync Clerk state and ensure user is provisioned in the backend database
  useEffect(() => {
    if (!isLoaded || !mounted) return;

    if (!isSignedIn) {
      useAuthStore.getState().logout();
      router.push("/");
      return;
    }

    if (isSignedIn && clerkUser && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      const email = clerkUser.primaryEmailAddress?.emailAddress || "user@docai.com";
      const fullName = clerkUser.fullName || clerkUser.username || "User";

      authAPI.clerkSync({ email, full_name: fullName })
        .then((res: any) => {
          const { access_token, user: userData } = res.data;
          setAuth(userData, access_token);
          // Refresh workspace and document stores with fresh valid token
          useWorkspaceStore.getState().fetchWorkspaces(false);
          useDocumentStore.getState().fetchDocuments(false);
        })
        .catch((err: any) => {
          console.warn("Backend Clerk sync notice:", err?.message);
        });
    }
  }, [isLoaded, isSignedIn, clerkUser, router, setAuth, mounted]);

  // Prevent hydration mismatch: render stable container during initial SSR/hydration
  if (!mounted) {
    return (
      <div className="flex h-screen bg-black text-slate-100 font-sans overflow-hidden">
        <div className="w-64 bg-black border-r border-white/10 shrink-0 hidden md:block" />
        <div className="flex-1 flex flex-col overflow-hidden relative bg-black">
          <div className="h-16 border-b border-white/10 shrink-0" />
          <main className={cn("flex-1 relative z-10 bg-black", noPadding ? "overflow-hidden flex flex-col h-full" : "overflow-auto p-6 md:p-8")}>
            <div className="animate-pulse space-y-4 max-w-4xl mx-auto py-8">
              <div className="h-8 bg-white/5 rounded-2xl w-48" />
              <div className="h-32 bg-white/5 rounded-3xl w-full" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Only show full-screen auth screen on first load when genuinely unauthenticated
  const isPendingAuth = !isAuthenticated && (!isLoaded || (isSignedIn && !hasSyncedRef.current));

  if (isPendingAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shadow-lg">
            <span className="font-serif italic font-bold text-xl text-white">DocAI</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase animate-pulse">
          Authenticating Session
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-slate-100 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative bg-black">
        <Header />
        <main className={cn("flex-1 relative z-10 bg-black", noPadding ? "overflow-hidden flex flex-col h-full" : "overflow-auto p-6 md:p-8")}>
          {children}
        </main>
      </div>
    </div>
  );
}
