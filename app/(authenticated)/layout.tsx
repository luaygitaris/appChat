// app/(authenticated)/layout.tsx
"use client";

import {
  ConversationProvider,
  useConversation,
} from "@/context/ConversationContext";
import { AppSidebar } from "@/components/sidebar/sidebarchat";
import React, { useState, useRef, useEffect } from "react";
import { RiCloseFill, RiMenuLine } from "@remixicon/react";

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
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}


function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const { activeConversationId, setActiveConversationId } = useConversation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const prevConversationId = usePrevious(activeConversationId);

  // Close sidebar when conversation changes (mobile only)
  useEffect(() => {
    if (
      prevConversationId !== activeConversationId &&
      typeof window !== "undefined" &&
      window.innerWidth < 768 // mobile breakpoint
    ) {
      setSidebarOpen(false);
    }
  }, [activeConversationId, prevConversationId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen relative bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar toggle button */}
      <button
        ref={toggleButtonRef}
        className={`md:hidden fixed z-50 top-2.5 p-2 rounded-md bg-gray-800 text-white transition-all duration-300 ${
          sidebarOpen ? "left-[calc(16rem-3rem)]" : "left-2"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          setSidebarOpen(!sidebarOpen);
        }}>
        {sidebarOpen ? (
          <RiCloseFill className="w-6 h-6" />
        ) : (
          <RiMenuLine className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                   md:translate-x-0 fixed md:relative z-40 w-64 h-full bg-gray-900 
                   transition-transform duration-300 ease-in-out shadow-lg`}>
        <AppSidebar
          onConversationSelect={(id) => {
            setActiveConversationId(id);
          }}
          activeConversationId={activeConversationId}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto w-full h-full transition-all duration-300">
        {children}
      </div>
    </div>
  );
}

