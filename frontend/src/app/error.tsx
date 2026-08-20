"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF3F0] dark:bg-[#0F0E11] text-[#19171A] dark:text-[#F3F1F5] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#E8503A]/10 border border-[#E8503A]/20 flex items-center justify-center text-[#E8503A] mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          An unexpected error occurred. You can retry or head back to safety.
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E8503A] text-white font-semibold text-sm hover:bg-[#D3402B] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try again</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-black/10 dark:border-white/10 font-semibold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
