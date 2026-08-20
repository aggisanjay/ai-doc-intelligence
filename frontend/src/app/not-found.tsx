"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF3F0] dark:bg-[#0F0E11] text-[#19171A] dark:text-[#F3F1F5] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <span className="text-6xl font-extrabold text-[#E8503A]">404</span>
        <h1 className="text-2xl font-bold">Page Not Found</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          The page or document you are looking for does not exist or has been moved.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#E8503A] text-white font-semibold text-sm hover:bg-[#D3402B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
