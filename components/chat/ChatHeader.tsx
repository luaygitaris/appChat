"use client";

import * as React from "react";
import { useSession } from "next-auth/react";

interface User {
  name: string | null;
  email: string | null;
}

interface Participant {
  user: User;
  isAdmin: boolean;
}

interface Conversation {
  id: string;
  name: string | null;
  isGroup: boolean;
  participants: Participant[];
}

interface ChatHeaderProps {
  conversationId: string | null;
}

export function ChatHeader({ conversationId }: ChatHeaderProps) {
  const { data: session } = useSession();
  const [conversation, setConversation] = React.useState<Conversation | null>(null);

  React.useEffect(() => {
    if (!conversationId) return;

    const fetchConversation = async () => {
      try {
        const res = await fetch(`/api/conversations/${conversationId}`);
        if (!res.ok) throw new Error("Failed to fetch conversation");
        const data = await res.json();
        setConversation(data);
      } catch (error) {
        console.error("Error fetching conversation in ChatHeader:", error);
      }
    };

    fetchConversation();
  }, [conversationId]);

  if (!conversationId || !conversation) return null;

  const otherParticipants = conversation.participants.filter(
    (p) => p.user.email !== session?.user?.email
  );

  const displayName = conversation.isGroup
    ? conversation.participants.map((p) => p.user.name).join(", ") || "Group Chat"
    : otherParticipants[0]?.user.name || "Unknown User";

  return (
    <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-900">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white pl-10 lg:pl-0">
        {displayName}
      </h2>
    </div>
  );
}
