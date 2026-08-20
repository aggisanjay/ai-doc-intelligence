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

interface AppShellProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export function AppShell({ children, noPadding = false }: AppShellProps) {
  const router = useRouter();
  const { isAuthenticated, loadFromStorage, setAuth } = useAuthStore();
  const { isSignedIn, isLoaded, user: clerkUser } = useUser();
  const hasSyncedRef = React.useRef(false);

  useEffect(() => { 
    loadFromStorage(); 
  }, [loadFromStorage]);

  // Sync Clerk state and ensure local auth session
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      useAuthStore.getState().logout();
      router.push("/");
      return;
    }

    // If signed in to Clerk but local token is not yet initialized, sync user
    if (isSignedIn && !isAuthenticated && !hasSyncedRef.current && clerkUser) {
      hasSyncedRef.current = true;
      const email = clerkUser.primaryEmailAddress?.emailAddress || "user@docai.com";
      const fullName = clerkUser.fullName || clerkUser.username || "User";

      authAPI.clerkSync({ email, full_name: fullName })
        .then((res: any) => {
          const { access_token, user: userData } = res.data;
          setAuth(userData, access_token);
        })
        .catch((err: any) => {
          console.warn("Backend Clerk sync notice (using local session fallback):", err?.message);
          // Resilient fallback: ensure user can access dashboard with local profile
          const fallbackUser = {
            id: clerkUser.id,
            email,
            full_name: fullName,
            role: "user",
            is_active: true,
            created_at: new Date().toISOString(),
          };
          const fallbackToken = `clerk_session_${clerkUser.id}`;
          setAuth(fallbackUser, fallbackToken);
        });
    }
  }, [isLoaded, isSignedIn, isAuthenticated, clerkUser, router, setAuth]);

  if (!isLoaded || !isAuthenticated || !isSignedIn) {
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
