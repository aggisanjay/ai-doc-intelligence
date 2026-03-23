"use client";

import React from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;

  return (
    <AppShell>
      <div className="h-full -m-6">
        <ChatInterface conversationId={conversationId} />
      </div>
    </AppShell>
  );
}
