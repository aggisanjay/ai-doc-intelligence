"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User, ChevronDown, Bell, Search, Settings, Shield } from "lucide-react";
import Link from "next/link";

export function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "?";

  const mockNotifications = [
    { id: 1, title: "Indexing Complete", desc: "Financial_Report_2026.pdf was processed.", time: "2 min ago", type: "success" },
    { id: 2, title: "Model Updated", desc: "Workspace switched to Gemini 1.5 Pro.", time: "1 hour ago", type: "info" }
  ];

  return (
    <header className="h-16 border-b border-white/5 bg-[#0A0A0F]/65 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-40 relative">

      {/* Search Bar - Commander View */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-xl w-64 md:w-80 transition-all cursor-pointer">
        <Search className="h-4 w-4 text-white/35" />
        <span className="text-xs text-white/35 flex-1 select-none">Search documents, chats, settings...</span>
        <kbd className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-white/40 font-mono tracking-tight select-none">⌘K</kbd>
      </div>

      <div className="flex-1 sm:hidden" />

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setOpen(false); }}
            className="p-2 text-white/50 hover:text-white hover:bg-white/[0.03] rounded-xl transition-all relative"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#0A0A0F]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-11 w-80 bg-[#171F2E] border border-white/10 rounded-xl shadow-2xl z-50 p-1 divide-y divide-white/5 overflow-hidden">
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-white">Notifications</span>
                <button className="text-[10px] text-indigo-400 hover:text-indigo-300">Mark all read</button>
              </div>
              <div className="py-1">
                {mockNotifications.map((notif) => (
                  <div key={notif.id} className="p-3 hover:bg-white/[0.02] transition-colors flex items-start gap-2.5 cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5" />
                    <div>
                      <h5 className="text-xs font-semibold text-white">{notif.title}</h5>
                      <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">{notif.desc}</p>
                      <span className="text-[9px] text-white/30 block mt-1">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setOpen(!open); setShowNotifications(false); }}
            className="flex items-center gap-2 p-1 px-2.5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-xl transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shadow-md">
              {initials}
            </div>
            <span className="hidden md:block text-xs font-medium text-white/70 max-w-[120px] truncate">{user?.email}</span>
            <ChevronDown className="h-3.5 w-3.5 text-white/40" />
          </button>

          {open && (
            <div className="absolute right-0 top-11 w-52 bg-[#171F2E] border border-white/10 rounded-xl shadow-2xl z-50 p-1 divide-y divide-white/5 overflow-hidden">
              <div className="px-3.5 py-2.5">
                <p className="text-xs font-bold text-white truncate">{user?.full_name || "Enterprise User"}</p>
                <p className="text-[10px] text-white/40 truncate mt-0.5">{user?.email}</p>
              </div>
              <div className="py-1">
                <Link href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3.5 py-2 text-xs text-white/70 hover:bg-white/[0.02] hover:text-white transition-colors">
                  <User className="h-4 w-4 text-white/30" /> Profile
                </Link>
                <Link href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3.5 py-2 text-xs text-white/70 hover:bg-white/[0.02] hover:text-white transition-colors">
                  <Settings className="h-4 w-4 text-white/30" /> Settings
                </Link>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setOpen(false); logout(); }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
