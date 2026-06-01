"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ChatInterface } from "@/components/chat/ChatInterface";

function ChatContent() {
  const searchParams = useSearchParams();
  const docId = searchParams.get("doc") || undefined;

  return (
    <div className="h-full -m-6">
      <ChatInterface initialDocumentId={docId} conversationId="new" />
    </div>
  );
}

export default function NewChatPage() {
  return (
    <AppShell>
      <Suspense fallback={<div>Loading Chat...</div>}>
        <ChatContent />
      </Suspense>
    </AppShell>
  );
}
