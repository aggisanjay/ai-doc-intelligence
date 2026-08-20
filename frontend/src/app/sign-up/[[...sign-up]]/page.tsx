"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { LogoIcon } from "@/components/common/Logo";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#FAF3F0] dark:bg-[#0F0E11] flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="mb-6 flex items-center gap-2.5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <LogoIcon size="md" className="group-hover:scale-105 transition-transform" />
          <span className="font-bold text-xl text-black dark:text-white">
            Doc<span className="text-[#E8503A]">AI</span>
          </span>
        </Link>
      </div>

      <div className="w-full max-w-[420px] bg-white dark:bg-[#18161D] border border-black/10 dark:border-white/10 rounded-3xl p-4 shadow-2xl">
        <SignUp 
          appearance={{
            variables: {
              colorPrimary: '#E8503A',
              colorBackground: 'transparent',
              colorInputBackground: '#f8fafc',
              colorText: '#0f172a',
            },
            elements: {
              card: "bg-transparent border-0 shadow-none w-full",
              formButtonPrimary: "bg-[#E8503A] hover:bg-[#D3402B] text-white font-semibold rounded-full text-sm py-2.5 transition-all active:scale-[0.98]",
            }
          }}
        />
      </div>
    </div>
  );
}
