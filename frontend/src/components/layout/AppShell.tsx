"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useUser } from "@clerk/nextjs";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { FileText } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => { 
    loadFromStorage(); 
  }, [loadFromStorage]);

  // Sync Clerk state and check local auth reactively
  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        useAuthStore.getState().logout();
        router.push("/");
      } else if (!isAuthenticated) {
        router.push("/");
      }
    }
  }, [isLoaded, isSignedIn, isAuthenticated, router]);

  if (!isLoaded || !isAuthenticated || !isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0A0A0F] text-white">
        <div className="relative flex items-center justify-center mb-4">
          {/* Pulsing glow under logo */}
          <div className="absolute w-16 h-16 rounded-2xl bg-indigo-500/20 blur-xl animate-pulse" />
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 relative">
            <FileText className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-indigo-400 uppercase animate-pulse">
          Authenticating Session
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0A0A0F] text-white font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Subtle top background radial glow */}
        <div className="absolute top-0 right-0 w-[40%] h-[30%] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />
        <Header />
        <main className="flex-1 overflow-auto p-6 md:p-8 relative z-10">{children}</main>
      </div>
    </div>
  );
}
