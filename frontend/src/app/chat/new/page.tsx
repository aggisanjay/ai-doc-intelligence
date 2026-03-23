"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default function NewChatPage() {
  const searchParams = useSearchParams();
  const docId = searchParams.get("doc") || undefined;

  return (
    <AppShell>
      <div className="h-full -m-6">
        <ChatInterface initialDocumentId={docId} conversationId="new" />
      </div>
    </AppShell>
  );
}
