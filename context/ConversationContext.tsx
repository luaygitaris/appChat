// context/ConversationContext.tsx
"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type ConversationContextType = {
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
};

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  return (
    <ConversationContext.Provider value={{ activeConversationId, setActiveConversationId }}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error("useConversation must be used within a ConversationProvider");
  }
  return context;
};
