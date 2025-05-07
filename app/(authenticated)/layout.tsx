// app/(authenticated)/layout.tsx
"use client";

import { ConversationProvider, useConversation } from "@/context/ConversationContext";
import { AppSidebar } from "@/components/sidebar/sidebarchat";
import React from "react";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConversationProvider>
      <LayoutWithSidebar>{children}</LayoutWithSidebar>
    </ConversationProvider>
  );
}

function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const { activeConversationId, setActiveConversationId } = useConversation();

  return (
    <div className="flex h-screen">
      <div className="w-64 shrink-0">
        <AppSidebar
          onConversationSelect={setActiveConversationId}
          activeConversationId={activeConversationId}
        />
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
