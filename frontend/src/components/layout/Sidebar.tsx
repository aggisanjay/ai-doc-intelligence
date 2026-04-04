"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Upload, MessageSquare, FileText, Plus, ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { chatAPI } from "@/lib/api";
import { Conversation } from "@/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload Documents", icon: Upload },
];

export function Sidebar() {
  const pathname = usePathname();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    chatAPI.listConversations().then((res) => setConversations(res.data.slice(0, 10))).catch(() => {});
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
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-500" />
          <span className="text-lg font-bold">DocAI</span>
        </Link>
      </div>

      <nav className="p-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href} href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === item.href ? "bg-blue-600/20 text-blue-400" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 pb-2 border-t border-gray-800 pt-3">
        <Link href="/chat/new">
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
            <Plus className="h-4 w-4" /> New Chat
          </button>
        </Link>
      </div>

      <div className="px-3 py-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Conversations</h3>
      </div>

      <div className="flex-1 px-3 overflow-auto space-y-1 pb-4">
        {conversations.map((conv) => (
          <Link
            key={conv.id} href={`/chat/${conv.id}`}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors group",
              pathname === `/chat/${conv.id}` ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-300"
            )}
          >
            <MessageSquare className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate flex-1">{conv.title}</span>
            <button
              onClick={(e) => handleDelete(e, conv.id)}
              className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 shrink-0" />
          </Link>
        ))}
        {conversations.length === 0 && (
          <p className="text-xs text-gray-600 px-3 py-4 text-center">No conversations yet</p>
        )}
      </div>
    </div>
  );
}
