"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User, ChevronDown } from "lucide-react";

export function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <header className="h-14 border-b border-gray-800 bg-gray-900/50 backdrop-blur flex items-center justify-between px-6">
      <div />
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
            {initials}
          </div>
          <span className="hidden sm:block">{user?.email}</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {open && (
          <div className="absolute right-0 top-10 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50">
            <div className="px-3 py-2 border-b border-gray-800">
              <p className="text-xs text-gray-400 truncate">{user?.full_name || user?.email}</p>
            </div>
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-800 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
