"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Upload, MessageSquare, FileText, Plus, 
  ChevronRight, Trash2, Search, BarChart3, Settings, Database, Folder
} from "lucide-react";
import { cn } from "@/lib/utils";
import { chatAPI } from "@/lib/api";
import { Conversation } from "@/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload Documents", icon: Upload },
  { href: "/search", label: "AI Search", icon: Search },
  { href: "/chat/new", label: "AI Copilot", icon: MessageSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isRecentCollapsed, setIsRecentCollapsed] = useState(false);

  useEffect(() => {
    chatAPI.listConversations()
      .then((res) => setConversations(res.data.slice(0, 8)))
      .catch(() => {});
  }, [pathname]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation?")) return;

    try {
      await chatAPI.deleteConversation(id);
      setConversations(conversations.filter(c => c.id !== id));
      if (pathname === `/chat/${id}`) {
        window.location.href = "/chat/new";
      }
    } catch (err) {
      console.error("Failed to delete conversation", err);
    }
  };

  return (
    <div className="w-64 bg-[#111827] border-r border-white/5 flex flex-col h-full font-sans shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <FileText className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white leading-none">DocAI</span>
            <span className="text-[9px] font-semibold text-indigo-400 tracking-wider uppercase mt-0.5">Enterprise</span>
          </div>
        </Link>
        <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-medium border border-indigo-500/20">
          v1.2
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="p-4 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35 px-3 mb-2">Platform</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative",
                isActive 
                  ? "bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500 pl-2.5" 
                  : "text-white/60 hover:text-white hover:bg-white/[0.02]"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-indigo-400" : "text-white/40 group-hover:text-white/70")} />
              <span className="flex-1">{item.label}</span>
              {!isActive && item.href === "/chat/new" && (
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[9px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Ask
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Workspace Quick Actions */}
      <div className="px-4 pb-3 pt-2 border-t border-white/5">
        <Link href="/chat/new">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/15 transition-all">
            <Plus className="h-4 w-4" /> New AI Session
          </button>
        </Link>
      </div>

      {/* Recent Conversations header */}
      <div className="px-4 py-2 flex items-center justify-between border-t border-white/5 mt-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/35 px-3">Recent Chats</span>
        <button 
          onClick={() => setIsRecentCollapsed(!isRecentCollapsed)}
          className="text-[10px] text-white/40 hover:text-white/70 px-2"
        >
          {isRecentCollapsed ? "Show" : "Hide"}
        </button>
      </div>

      {/* Scrollable Conversation List */}
      {!isRecentCollapsed && (
        <div className="flex-1 px-4 overflow-auto space-y-0.5 pb-4">
          {conversations.map((conv) => {
            const isChatActive = pathname === `/chat/${conv.id}`;
            return (
              <Link
                key={conv.id} 
                href={`/chat/${conv.id}`}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors group relative",
                  isChatActive 
                    ? "bg-white/5 text-white font-medium" 
                    : "text-white/50 hover:bg-white/[0.02] hover:text-white/80"
                )}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-white/30" />
                <span className="truncate flex-1 pr-6">{conv.title}</span>
                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  className="p-1 rounded hover:bg-white/10 text-white/35 hover:text-rose-400 absolute right-2 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Link>
            );
          })}
          {conversations.length === 0 && (
            <p className="text-[11px] text-white/30 px-3 py-4 text-center">No recent sessions</p>
          )}
        </div>
      )}

      {/* Footer Details */}
      <div className="p-4 border-t border-white/5 bg-[#0C121D] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shrink-0">
          <Database className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-white/70 truncate">Sanjay Workspace</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[9px] font-semibold text-white/40 uppercase tracking-wider">Sync: Online</p>
          </div>
        </div>
      </div>
    </div>
  );
}
