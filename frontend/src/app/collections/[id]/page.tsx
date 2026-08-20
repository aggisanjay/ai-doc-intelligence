"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export const dynamic = "force-dynamic";
import { workspacesAPI, documentsAPI } from "@/lib/api";
import { 
  FolderClosed, Upload, MessageSquare, Loader2, FileText, 
  Trash2, RefreshCw, CheckCircle2, AlertCircle, Clock, Search, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function CollectionDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [collection, setCollection] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function loadCollection() {
    try {
      const res = await workspacesAPI.getCollection(id);
      setCollection(res.data);
    } catch (err) {
      console.error("Failed to load collection", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (id) loadCollection();
  }, [id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      await documentsAPI.upload(file, id);
      await new Promise(r => setTimeout(r, 1000));
      await loadCollection();
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await documentsAPI.delete(docId);
      loadCollection();
    } catch (err) {
      alert("Failed to delete document");
    }
  };

  const handleReprocessDoc = async (docId: string) => {
    try {
      await documentsAPI.reprocess(docId);
      loadCollection();
    } catch (err) {
      alert("Failed to reprocess document");
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 bg-[#0c0c0e] border border-white/10 rounded-3xl animate-pulse max-w-7xl mx-auto font-sans shadow-lg">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="mt-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Syncing Collection</span>
        </div>
      </AppShell>
    );
  }

  if (!collection) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto text-center py-20 space-y-4 font-sans">
          <AlertCircle className="h-10 w-10 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Collection Not Found</h2>
          <p className="text-xs text-slate-400">The folder collection you are trying to access does not exist or has been deleted.</p>
          <Link href="/dashboard" className="text-xs text-blue-400 font-bold flex items-center justify-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </AppShell>
    );
  }

  const documents = collection.documents || [];
  const completedDocs = documents.filter((d: any) => d.status === "completed");
  const totalChunks = documents.reduce((acc: number, d: any) => acc + (d.chunkCount || d.chunk_count || 0), 0);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8 font-sans pb-16">
        
        {/* Back and Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-500">Collections</span>
          <span>/</span>
          <span className="text-white font-medium">{collection.name}</span>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-[#0c0c0e] border border-white/10 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl border border-white/10 bg-[#121216] text-blue-400 flex items-center justify-center shrink-0 shadow-sm">
              <FolderClosed className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">{collection.name}</h1>
              <p className="text-xs text-slate-400 mt-1">
                Folder collection • {documents.length} files • {totalChunks} active vectors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer">
              <Upload className="h-3.5 w-3.5" />
              {isUploading ? "Uploading..." : "Add to Collection"}
              <input 
                type="file" 
                accept=".pdf,.docx,.doc" 
                onChange={handleFileUpload} 
                className="hidden" 
                disabled={isUploading}
              />
            </label>
            {completedDocs.length > 0 && (
              <Link href={`/chat/new?collectionId=${collection.id}`}>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 active:scale-[0.98] text-white rounded-full text-xs font-semibold transition-all">
                  <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
                  Chat Scoped Folder
                </button>
              </Link>
            )}
          </div>
        </div>

        {uploadError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-2xl flex items-center gap-2 shadow-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Documents list */}
        <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-4">Files in this Collection</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="px-5 py-3.5">Filename</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Size</th>
                  <th className="px-5 py-3.5">Details</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-xs text-slate-300">
                {documents.map((doc: any) => {
                  const status = doc.status;
                  const isReady = status === "completed";
                  const isFailed = status === "failed";
                  const isPending = status === "pending" || status === "processing";

                  return (
                    <tr key={doc.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="px-5 py-4 max-w-xs truncate">
                        <Link href={`/documents/${doc.id}`} className="flex items-center gap-3 hover:text-blue-400 transition-colors">
                          <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                          <span className="font-semibold block truncate" title={doc.originalFilename || doc.original_filename}>
                            {doc.originalFilename || doc.original_filename}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                          isReady ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          isFailed ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                          {isReady && <CheckCircle2 className="h-3 w-3" />}
                          {isFailed && <AlertCircle className="h-3 w-3" />}
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-400">
                        {doc.fileSize || doc.file_size ? `${((doc.fileSize || doc.file_size) / (1024 * 1024)).toFixed(2)} MB` : "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {isReady ? `${doc.pageCount || doc.page_count} pgs • ${doc.chunkCount || doc.chunk_count} chunks` : "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isReady && (
                            <Link href={`/documents/${doc.id}`}>
                              <button className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded-full text-[10px] font-medium text-white transition-colors">
                                View Details
                              </button>
                            </Link>
                          )}
                          {isFailed && (
                            <button 
                              onClick={() => handleReprocessDoc(doc.id)}
                              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-white/[0.08] rounded-full transition-colors"
                              title="Reprocess file"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/[0.08] rounded-full transition-colors"
                            title="Delete file"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {documents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500 font-medium">
                      <FolderClosed className="h-8 w-8 text-white/10 mx-auto mb-2" />
                      No files loaded in this collection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
