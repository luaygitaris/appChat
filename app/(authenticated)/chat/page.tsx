// app/(authenticated)/chat/page.tsx
"use client";

import { ChatArea } from "@/components/chat/chatArea";
import { useConversation } from "@/context/ConversationContext";
import React from "react";

export default function ChatPage() {
  const { activeConversationId } = useConversation();

  return (
    <div className="flex overflow-auto flex-col h-full">
      <ChatArea conversationId={activeConversationId} />
    </div>
  );
}
