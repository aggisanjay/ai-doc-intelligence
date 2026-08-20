"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Upload, MessageSquare, FileText, Plus, 
  ChevronRight, Trash2, Search, BarChart3, Settings, Database, Folder,
  ChevronDown, Layers, Loader2, FolderClosed, History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/common/Logo";
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
  const router = useRouter();
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

  // Load Recent Conversations (up to 30 items)
  useEffect(() => {
    chatAPI.listConversations()
      .then((res) => setConversations(res.data.slice(0, 30)))
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
        router.push("/chat/new");
      }
    } catch (err) {
      console.error("Failed to delete conversation", err);
    }
  };

  return (
    <div className="w-64 bg-black border-r border-white/10 flex flex-col h-full font-sans shrink-0 overflow-hidden">
      
      {/* Brand & Dynamic Workspace Switcher (Sticky Top) */}
      <div className="p-4 border-b border-white/10 shrink-0 relative bg-black z-10">
        <div className="mb-3 px-1">
          <Logo href="/dashboard" />
        </div>

        {isLoadingWorkspaces ? (
          <div className="flex items-center gap-2 py-2">
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
            <span className="text-xs text-slate-400">Loading Workspaces...</span>
          </div>
        ) : (
          <div>
            <button 
              onClick={() => setIsWsDropdownOpen(!isWsDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-[#0c0c0e] border border-white/10 hover:border-white/20 transition-all shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 text-xs font-bold">
                  <Layers className="h-3.5 w-3.5" />
                </div>
                <div className="text-left min-w-0">
                  <span className="text-xs font-semibold text-white block truncate leading-none">
                    {activeWorkspace?.name || "Personal Workspace"}
                  </span>
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wide mt-1 block">
                    Enterprise
                  </span>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {/* Switcher Dropdown */}
            {isWsDropdownOpen && (
              <div className="absolute top-24 left-4 right-4 bg-[#0e0e12] border border-white/15 rounded-2xl shadow-2xl z-50 p-2 space-y-0.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2.5 py-1">Switch Workspace</p>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => handleSwitchWorkspace(ws)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors block truncate",
                      activeWorkspace?.id === ws.id 
                        ? "bg-blue-600/20 text-white font-semibold border border-blue-500/30" 
                        : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                    )}
                  >
                    {ws.name}
                  </button>
                ))}
                <div className="border-t border-white/10 my-1" />
                <button
                  onClick={handleCreateWorkspace}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-blue-400 hover:text-blue-300 hover:bg-white/[0.04] flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create Workspace
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Unified Scrollable Middle Body */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-3">
        
        {/* Main Navigation */}
        <nav className="px-3 space-y-1">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-2">Platform</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all group relative",
                  isActive 
                    ? "bg-white/[0.08] text-white font-semibold border border-white/10" 
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                {isActive && (
                  <span className="absolute left-1 top-2.5 bottom-2.5 w-1 bg-blue-500 rounded-full" />
                )}
                <item.icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200")} />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Folders & Collections Section */}
        <div className="px-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Collections</p>
            <button 
              onClick={handleCreateCollection} 
              className="text-slate-400 hover:text-blue-400 p-0.5 rounded transition-colors"
              title="Create Collection"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          
          <div className="space-y-0.5">
            {collections.map((col) => {
              const isColActive = pathname === `/collections/${col.id}`;
              return (
                <Link
                  key={col.id}
                  href={`/collections/${col.id}`}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors group",
                    isColActive ? "bg-white/[0.08] text-white" : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FolderClosed className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{col.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10">
                    {col.documents?.length || 0}
                  </span>
                </Link>
              );
            })}
            {collections.length === 0 && (
              <p className="text-[10px] text-slate-500 px-3 py-1 italic">No collections yet</p>
            )}
          </div>
        </div>

        {/* Recent Chats History Section */}
        <div className="px-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between px-3 mb-2">
            <div className="flex items-center gap-1.5">
              <History className="h-3 w-3 text-blue-400" />
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Chat History</p>
            </div>
            <button 
              onClick={() => setIsRecentCollapsed(!isRecentCollapsed)}
              className="text-[9px] font-semibold text-slate-400 hover:text-white transition-colors"
            >
              {isRecentCollapsed ? "Show" : "Hide"}
            </button>
          </div>

          {!isRecentCollapsed && (
            <div className="space-y-1">
              {conversations.map((conv) => {
                const isChatActive = pathname === `/chat/${conv.id}`;
                return (
                  <div
                    key={conv.id}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors group relative",
                      isChatActive ? "bg-blue-600/15 text-white border border-blue-500/30" : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    )}
                  >
                    <Link href={`/chat/${conv.id}`} className="flex items-center gap-2 min-w-0 flex-1 truncate">
                      <MessageSquare className={cn("h-3 w-3 shrink-0", isChatActive ? "text-blue-400" : "text-slate-500")} />
                      <span className="truncate">{conv.title || "Untitled query"}</span>
                    </Link>
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-all"
                      title="Delete conversation"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
              {conversations.length === 0 && (
                <p className="text-[10px] text-slate-500 px-3 py-1 italic">No chat history found</p>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Engine Status Bottom Panel (Sticky Bottom) */}
      <div className="p-3 border-t border-white/10 bg-[#0c0c0e] shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-black/60 border border-white/10 text-xs shadow-sm">
          <Database className="h-4 w-4 text-blue-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-white block text-[11px] truncate">DocAI Engine</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Sync: Online</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
