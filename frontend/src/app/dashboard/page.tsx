"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useDocuments } from "@/hooks/useDocuments";
import { DocumentList } from "@/components/documents/DocumentList";
import { FileText, CheckCircle, Clock, AlertCircle, Upload, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { documents, isLoading, deleteDocument, reprocessDocument } = useDocuments();

  const stats = {
    total: documents.length,
    completed: documents.filter((d) => d.status === "completed").length,
    processing: documents.filter((d) => d.status === "processing" || d.status === "pending").length,
    failed: documents.filter((d) => d.status === "failed").length,
    totalChunks: documents.reduce((acc, d) => acc + d.chunk_count, 0),
    totalPages: documents.reduce((acc, d) => acc + d.page_count, 0),
  };

  const statCards = [
    { title: "Total Documents", value: stats.total, sub: `${stats.totalPages} pages • ${stats.totalChunks} chunks`, icon: FileText, color: "text-blue-500" },
    { title: "Ready", value: stats.completed, sub: "Processed & searchable", icon: CheckCircle, color: "text-green-500" },
    { title: "Processing", value: stats.processing, sub: "Being analyzed", icon: Clock, color: "text-yellow-500" },
    { title: "Failed", value: stats.failed, sub: "Need attention", icon: AlertCircle, color: "text-red-500" },
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage your documents and start asking questions</p>
          </div>
          <div className="flex gap-3">
            <Link href="/upload">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                <Upload className="h-4 w-4" /> Upload Document
              </button>
            </Link>
            <Link href="/chat/new">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-700 hover:bg-gray-800 text-gray-300 rounded-lg text-sm font-medium transition-colors">
                <MessageSquare className="h-4 w-4" /> New Chat
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.title} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-400">{card.title}</p>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Your Documents</h2>
          <DocumentList documents={documents} isLoading={isLoading} onDelete={deleteDocument} onReprocess={reprocessDocument} />
        </div>
      </div>
    </AppShell>
  );
}
