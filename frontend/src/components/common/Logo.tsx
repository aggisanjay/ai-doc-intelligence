"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function LogoIcon({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <svg 
      className={cn(sizeMap[size], "shrink-0", className)} 
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="docAiGradComp" x1="10" y1="10" x2="110" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6"/>
          <stop offset="100%" stopColor="#1D4ED8"/>
        </linearGradient>
        <linearGradient id="docAiAccentComp" x1="30" y1="30" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA"/>
          <stop offset="100%" stopColor="#2563EB"/>
        </linearGradient>
      </defs>

      {/* Rounded Background Box */}
      <rect width="120" height="120" rx="32" fill="#0c0c0e"/>
      <rect width="118" height="118" x="1" y="1" rx="31" stroke="rgba(255,255,255,0.15)" strokeWidth="2"/>

      {/* Document Sheet */}
      <path d="M38 28H76L88 40V86C88 89.3137 85.3137 92 82 92H38C34.6863 92 32 89.3137 32 86V34C32 30.6863 34.6863 28 38 28Z" 
            fill="rgba(255,255,255,0.04)" 
            stroke="rgba(255,255,255,0.2)" 
            strokeWidth="2.5" 
            strokeLinejoin="round"/>

      {/* Folded Corner */}
      <path d="M76 28V40H88" 
            stroke="rgba(255,255,255,0.25)" 
            strokeWidth="2.5" 
            strokeLinejoin="round"/>

      {/* Isometric AI Neural Node */}
      <path d="M60 44L78 54.5V75.5L60 86L42 75.5V54.5L60 44Z" 
            fill="url(#docAiGradComp)" 
            stroke="#93C5FD" 
            strokeWidth="1.5" 
            strokeLinejoin="round"/>
      
      <path d="M60 44L78 54.5L60 65L42 54.5L60 44Z" 
            fill="url(#docAiAccentComp)" 
            opacity="0.95"/>
      
      <path d="M60 65V86L78 75.5V54.5L60 65Z" 
            fill="#1E40AF" 
            opacity="0.75"/>

      <path d="M60 65V86L42 75.5V54.5L60 65Z" 
            fill="#1D4ED8" 
            opacity="0.9"/>

      <circle cx="60" cy="65" r="4" fill="#FFFFFF"/>
      
      {/* Rays */}
      <line x1="60" y1="44" x2="60" y2="36" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="78" y1="54.5" x2="85" y2="50.5" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="78" y1="75.5" x2="85" y2="79.5" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="60" y1="86" x2="60" y2="94" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="42" y1="75.5" x2="35" y2="79.5" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="42" y1="54.5" x2="35" y2="50.5" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export function Logo({ className, iconOnly = false, size = "md", href = "/" }: LogoProps) {
  const textSizeMap = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 select-none group", className)}>
      <LogoIcon size={size} className="group-hover:scale-105 transition-transform" />
      {!iconOnly && (
        <span className={cn("font-bold tracking-tight text-white font-sans flex items-center", textSizeMap[size])}>
          Doc<span className="text-blue-500">AI</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
