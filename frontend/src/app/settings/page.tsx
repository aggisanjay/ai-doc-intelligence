"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, Shield, Key, Bell, CreditCard, Activity, Settings, 
  Trash2, Plus, Check, Loader2, RefreshCw, Mail, AlertTriangle, 
  ExternalLink, LogOut, CheckCircle2, CloudLightning
} from "lucide-react";
import { cn } from "@/lib/utils";

// Tabs list
const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "workspace", label: "Workspace", icon: Settings },
  { id: "security", label: "Security", icon: Shield },
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "integrations", label: "Integrations", icon: CloudLightning },
  { id: "audit-logs", label: "Audit Logs", icon: Activity },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Local profile state
  const [fullName, setFullName] = useState(user?.full_name || "Sanjay Aggarwal");
  const [email, setEmail] = useState(user?.email || "you@company.com");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local API keys state
  const [apiKeys, setApiKeys] = useState([
    { id: "1", name: "Production API Key", prefix: "sk_live_...", created: "May 12, 2026", status: "active" },
    { id: "2", name: "Dev Testing Key", prefix: "sk_test_...", created: "May 25, 2026", status: "active" }
  ]);

  const generateApiKey = () => {
    const name = prompt("Enter key name:", "Sandbox Key");
    if (!name) return;
    const randomHex = Math.random().toString(16).substring(2, 10);
    const newKey = {
      id: Math.random().toString(),
      name,
      prefix: `sk_sandbox_${randomHex}...`,
      created: "Today",
      status: "active"
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const deleteApiKey = (id: string) => {
    if (confirm("Are you sure you want to revoke this API key?")) {
      setApiKeys(apiKeys.filter(k => k.id !== id));
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1200);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8 font-sans pb-16">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">System Settings</h1>
            <p className="text-white/40 text-xs mt-0.5">Manage user credentials, team workspaces, billing tier limits, and API keys</p>
          </div>
        </div>

        {/* Settings grid */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* Side Tabs Selector */}
          <div className="w-full md:w-60 shrink-0 bg-[#171F2E]/40 border border-white/5 rounded-2xl p-2 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all text-left",
                  activeTab === tab.id
                    ? "bg-indigo-600/15 text-indigo-400 border-l-2 border-indigo-500 md:pl-3"
                    : "text-white/50 hover:bg-white/[0.02] hover:text-white"
                )}
              >
                <tab.icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main Panel Content Card */}
          <div className="flex-1 w-full bg-[#171F2E]/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden min-h-[480px]">
            {/* Inner background glow */}
            <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

            {/* TAB: PROFILE */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-white">User Profile</h3>
                  <p className="text-xs text-white/40 mt-0.5">Update personal registration credentials</p>
                </div>
                
                {saveSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Changes successfully written to cluster profile.
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/45">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.02] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/45">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.02] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/45">Account Role</label>
                    <input
                      type="text"
                      value="Owner / Staff Engineer"
                      disabled
                      className="w-full px-3 py-2 bg-white/[0.01] border border-white/5 rounded-xl text-xs text-white/40 cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
                  >
                    {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Save Profile Changes
                  </button>
                </form>
              </div>
            )}

            {/* TAB: WORKSPACE */}
            {activeTab === "workspace" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-white">Sanjay Workspace</h3>
                  <p className="text-xs text-white/40 mt-0.5">Control collaborative directory settings and team access</p>
                </div>

                <div className="space-y-4 max-w-xl">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/45">Workspace Name</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        defaultValue="Sanjay Workspace"
                        className="flex-1 px-3 py-2 bg-white/[0.02] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50"
                      />
                      <button className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors">Rename</button>
                    </div>
                  </div>

                  <div className="border border-white/5 rounded-xl overflow-hidden mt-6">
                    <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-white/35">
                      Workspace Members
                    </div>
                    <div className="divide-y divide-white/5">
                      <div className="p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-white">Sanjay Aggarwal</p>
                          <p className="text-[10px] text-white/40">you@company.com</p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[9px] font-bold">Owner</span>
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-white">John Doe</p>
                          <p className="text-[10px] text-white/40">john.doe@company.com</p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-white/50 text-[9px] font-semibold">Viewer</span>
                      </div>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5">
                    <Plus className="h-4 w-4" /> Invite Team Member
                  </button>
                </div>
              </div>
            )}

            {/* TAB: SECURITY */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-white">Security Settings</h3>
                  <p className="text-xs text-white/40 mt-0.5">Manage session durations and security policies</p>
                </div>

                <div className="space-y-4 max-w-md">
                  <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-white">Multi-Factor Authentication (MFA)</p>
                        <p className="text-[10px] text-white/45 mt-0.5">Require auth app token verification on sign in.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                      <div>
                        <p className="text-xs font-semibold text-white">Strict IP Allowlist</p>
                        <p className="text-[10px] text-white/45 mt-0.5">Restrict API access only to configured IP pools.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex gap-3 text-rose-400">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold">API Security Policy Warning</h4>
                      <p className="text-[10px] leading-relaxed mt-1">If strict mode is triggered, background document reprocessing requests outside the allowlist will fail automatically.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: API KEYS */}
            {activeTab === "api-keys" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">Developer API Keys</h3>
                    <p className="text-xs text-white/40 mt-0.5">Integrate semantic search directly into your own tools</p>
                  </div>
                  <button 
                    onClick={generateApiKey}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Plus className="h-4 w-4" /> Generate Key
                  </button>
                </div>

                <div className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.01]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-white/45">
                        <th className="p-3.5">Name</th>
                        <th className="p-3.5">Prefix Token</th>
                        <th className="p-3.5">Generated</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Revoke</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-white/80">
                      {apiKeys.map((key) => (
                        <tr key={key.id} className="hover:bg-white/[0.005] transition-colors">
                          <td className="p-3.5 font-semibold text-white">{key.name}</td>
                          <td className="p-3.5 font-mono text-indigo-400">{key.prefix}</td>
                          <td className="p-3.5 text-white/40">{key.created}</td>
                          <td className="p-3.5">
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              Active
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button 
                              onClick={() => deleteApiKey(key.id)}
                              className="p-1 text-white/35 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {apiKeys.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-white/35 font-medium">No active API keys found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-white">Notification Matrix</h3>
                  <p className="text-xs text-white/40 mt-0.5">Toggle indices updates and email status alerts</p>
                </div>

                <div className="space-y-3 max-w-md">
                  {[
                    { id: "1", title: "Document Process Complete", desc: "Notify when background vector chunks parsing succeeds." },
                    { id: "2", title: "Monthly Usage Reports", desc: "Send total queries, storage footprint, and token volume logs." },
                    { id: "3", title: "Security Login Attempts", desc: "High-priority email alerts when new workspace IPs log in." }
                  ].map((item) => (
                    <div key={item.id} className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-white">{item.title}</p>
                        <p className="text-[10px] text-white/45 mt-0.5">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: BILLING */}
            {activeTab === "billing" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-white">Billing & Limits</h3>
                  <p className="text-xs text-white/40 mt-0.5">Verify your workspace tier allocations and monthly cost ledger</p>
                </div>

                <div className="space-y-4 max-w-lg">
                  {/* Tier status card */}
                  <div className="p-4 bg-gradient-to-tr from-indigo-500/10 via-indigo-600/5 to-transparent border border-indigo-500/20 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Current Subscription</span>
                        <h4 className="text-lg font-bold text-white mt-0.5">Enterprise Pro Tier</h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">Active</span>
                    </div>

                    <div className="mt-6 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/50">Vector Pages Used</span>
                        <span className="font-semibold text-white">128 / 5,000 pages</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: "2.5%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: INTEGRATIONS */}
            {activeTab === "integrations" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-white">Cloud Integrations</h3>
                  <p className="text-xs text-white/40 mt-0.5">Auto-ingest documents directly from your cloud filesystems</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                  {[
                    { name: "Google Drive", desc: "Sync file structures automatically.", connected: true },
                    { name: "Dropbox Sync", desc: "Ingest shared folder assets.", connected: false },
                    { name: "Slack Integrations", desc: "Retrieve uploaded files in chats.", connected: false },
                    { name: "Notion Knowledge", desc: "Sync database pages and wikis.", connected: false }
                  ].map((service) => (
                    <div key={service.name} className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between hover:border-white/10 transition-colors">
                      <div>
                        <h4 className="text-xs font-semibold text-white">{service.name}</h4>
                        <p className="text-[10px] text-white/40 mt-0.5">{service.desc}</p>
                      </div>
                      <button className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors",
                        service.connected
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20"
                          : "bg-white/5 text-white/60 border-white/5 hover:bg-white/10 hover:text-white"
                      )}>
                        {service.connected ? "Active" : "Connect"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: AUDIT LOGS */}
            {activeTab === "audit-logs" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-white">Workspace Audit Trail</h3>
                  <p className="text-xs text-white/40 mt-0.5">Trace index queries and administrative operations</p>
                </div>

                <div className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.01] text-xs">
                  <div className="p-3 bg-white/[0.02] border-b border-white/5 grid grid-cols-3 font-bold uppercase tracking-wider text-white/35 text-[9px]">
                    <span>User / Operation</span>
                    <span>Action Summary</span>
                    <span className="text-right">Timestamp</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {[
                      { user: "you@company.com", action: "Query Document Vector Database", time: "2 min ago" },
                      { user: "you@company.com", action: "Ingested Contract_NDA_2026.docx", time: "12 min ago" },
                      { user: "you@company.com", action: "Created Workspace API Key (sk_test...)", time: "2 hours ago" },
                      { user: "system@docai.com", action: "Vector Database Cluster Garbage Sync", time: "6 hours ago" }
                    ].map((log, idx) => (
                      <div key={idx} className="p-3 grid grid-cols-3 hover:bg-white/[0.005]">
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">{log.user}</p>
                        </div>
                        <span className="text-white/60 truncate pr-3">{log.action}</span>
                        <span className="text-white/30 text-right font-mono text-[10px]">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </AppShell>
  );
}
