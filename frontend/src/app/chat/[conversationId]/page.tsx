"use client";

import React from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ChatInterface } from "@/components/chat/ChatInterface";

export const dynamic = "force-dynamic";

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;

  return (
    <AppShell noPadding>
      <ChatInterface conversationId={conversationId} />
    </AppShell>
  );
}
