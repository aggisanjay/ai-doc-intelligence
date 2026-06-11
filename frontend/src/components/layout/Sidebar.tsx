"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Upload, MessageSquare, FileText, Plus, 
  ChevronRight, Trash2, Search, BarChart3, Settings, Database, Folder,
  ChevronDown, Layers, Loader2, FolderClosed
} from "lucide-react";
import { cn } from "@/lib/utils";
import { chatAPI, workspacesAPI } from "@/lib/api";
import { Conversation } from "@/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload Documents", icon: Upload },
  { href: "/search", label: "AI Search", icon: Search },
  { href: "/documents/compare", label: "Doc Comparison", icon: FileText },
  { href: "/chat/new", label: "AI Copilot", icon: MessageSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isRecentCollapsed, setIsRecentCollapsed] = useState(false);
  
  // Workspaces & Collections State
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [isWsDropdownOpen, setIsWsDropdownOpen] = useState(false);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);

  // Load Workspaces & Collections
  useEffect(() => {
    async function loadWorkspaceData() {
      try {
        const wsRes = await workspacesAPI.list();
        const wsList = wsRes.data;
        setWorkspaces(wsList);
        
        if (wsList.length > 0) {
          const cachedWsId = localStorage.getItem("active_workspace_id");
          const found = wsList.find((w: any) => w.id === cachedWsId);
          const current = found || wsList[0];
          setActiveWorkspace(current);
          localStorage.setItem("active_workspace_id", current.id);
        }
      } catch (err) {
        console.error("Failed to load workspaces", err);
      } finally {
        setIsLoadingWorkspaces(false);
      }
    }
    loadWorkspaceData();
  }, [pathname]);

  // Load Collections when active workspace changes
  useEffect(() => {
    if (!activeWorkspace) return;
    async function loadCollections() {
      try {
        const colRes = await workspacesAPI.listCollections(activeWorkspace.id);
        setCollections(colRes.data);
      } catch (err) {
        console.error("Failed to load collections", err);
      }
    }
    loadCollections();
  }, [activeWorkspace, pathname]);

  // Load Recent Conversations
  useEffect(() => {
    chatAPI.listConversations()
      .then((res) => setConversations(res.data.slice(0, 5)))
      .catch(() => {});
  }, [pathname]);

  const handleSwitchWorkspace = (ws: any) => {
    setActiveWorkspace(ws);
    localStorage.setItem("active_workspace_id", ws.id);
    setIsWsDropdownOpen(false);
  };

  const handleCreateWorkspace = async () => {
    const name = prompt("Enter new workspace name:");
    if (!name) return;
    try {
      const res = await workspacesAPI.create(name);
      const newWs = res.data;
      setWorkspaces([...workspaces, newWs]);
      handleSwitchWorkspace(newWs);
    } catch (err) {
      alert("Failed to create workspace");
    }
  };

  const handleCreateCollection = async () => {
    if (!activeWorkspace) return;
    const name = prompt("Enter new collection name:");
    if (!name) return;
    try {
      const res = await workspacesAPI.createCollection(name, activeWorkspace.id);
      setCollections([...collections, res.data]);
    } catch (err) {
      alert("Failed to create collection");
    }
  };

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
      
      {/* Dynamic Workspace Switcher */}
      <div className="p-4 border-b border-white/5 relative">
        {isLoadingWorkspaces ? (
          <div className="flex items-center gap-2 py-2">
            <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
            <span className="text-xs text-white/40">Loading Workspaces...</span>
          </div>
        ) : (
          <div>
            <button 
              onClick={() => setIsWsDropdownOpen(!isWsDropdownOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="text-left min-w-0">
                  <span className="text-xs font-bold text-white block truncate leading-none">
                    {activeWorkspace?.name || "Personal Workspace"}
                  </span>
                  <span className="text-[9px] font-semibold text-indigo-400 uppercase tracking-wide mt-0.5 block">
                    Enterprise
                  </span>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-white/40" />
            </button>

            {/* Switcher Dropdown */}
            {isWsDropdownOpen && (
              <div className="absolute top-16 left-4 right-4 bg-[#171F2E] border border-white/10 rounded-xl shadow-xl z-50 p-1.5 space-y-0.5">
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest px-2 py-1">Switch Workspace</p>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => handleSwitchWorkspace(ws)}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors block truncate",
                      activeWorkspace?.id === ws.id 
                        ? "bg-indigo-600/20 text-indigo-400" 
                        : "text-white/60 hover:text-white hover:bg-white/[0.02]"
                    )}
                  >
                    {ws.name}
                  </button>
                ))}
                <div className="border-t border-white/5 my-1" />
                <button
                  onClick={handleCreateWorkspace}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-white/[0.02] flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create Workspace
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="p-3 space-y-1">
        <p className="text-[9px] font-bold uppercase tracking-widest text-white/35 px-3 mb-1">Platform</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group relative",
                isActive 
                  ? "bg-indigo-600/10 text-indigo-400" 
                  : "text-white/60 hover:text-white hover:bg-white/[0.02]"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-indigo-500 rounded-r" />
              )}
              <item.icon className={cn("h-3.5 w-3.5 shrink-0 transition-colors", isActive ? "text-indigo-400" : "text-white/40 group-hover:text-white/70")} />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Collections Section */}
      <div className="px-3 pt-2 pb-1 flex-1 flex flex-col overflow-hidden border-t border-white/5">
        <div className="flex items-center justify-between px-3 mb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/35">Collections</span>
          <button 
            onClick={handleCreateCollection}
            className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white transition-colors"
            title="Create Collection"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        {/* Dynamic Collections List */}
        <div className="overflow-y-auto max-h-48 space-y-0.5">
          {collections.map((col) => {
            const isColActive = pathname === `/collections/${col.id}`;
            return (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors",
                  isColActive 
                    ? "bg-white/5 text-white font-semibold" 
                    : "text-white/50 hover:bg-white/[0.02] hover:text-white/80"
                )}
              >
                <FolderClosed className="h-3.5 w-3.5 text-indigo-400/60 shrink-0" />
                <span className="truncate flex-1">{col.name}</span>
                {col._count?.documents > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-bold text-white/40 shrink-0">
                    {col._count.documents}
                  </span>
                )}
              </Link>
            );
          })}
          {collections.length === 0 && (
            <p className="text-[10px] text-white/30 px-3 py-2">No collections created</p>
          )}
        </div>

        {/* Recent Conversations header */}
        <div className="flex items-center justify-between px-3 mt-3 mb-1">
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/35">Recent Chats</span>
          <button 
            onClick={() => setIsRecentCollapsed(!isRecentCollapsed)}
            className="text-[9px] text-white/40 hover:text-white/70 px-1 font-semibold"
          >
            {isRecentCollapsed ? "Show" : "Hide"}
          </button>
        </div>

        {/* Scrollable Conversation List */}
        {!isRecentCollapsed && (
          <div className="overflow-y-auto max-h-36 space-y-0.5">
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
                    className="p-1 rounded hover:bg-white/10 text-white/35 hover:text-rose-450 absolute right-2 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Link>
              );
            })}
            {conversations.length === 0 && (
              <p className="text-[10px] text-white/30 px-3 py-2">No recent sessions</p>
            )}
          </div>
        )}
      </div>

      {/* Footer Details */}
      <div className="p-4 border-t border-white/5 bg-[#0C121D] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shrink-0">
          <Database className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-white/70 truncate">Secure Sandbox</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-wide">Sync: Online</p>
          </div>
        </div>
      </div>
    </div>
  );
}
