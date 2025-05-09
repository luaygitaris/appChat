"use client";

import { signOut } from "next-auth/react";
import {
  RiLogoutBoxLine,
  RiUser3Line,
  RiDeleteBin6Line,
  RiMore2Line,
  RiChat1Line,
  RiBardLine,
  RiMickeyLine,
  RiMicLine,
  RiCheckDoubleLine,
  RiBracesLine,
  RiPlanetLine,
  RiSeedlingLine,
  RiSettings3Line,
} from "@remixicon/react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import * as React from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { AddConversationDialog } from "../chat/addConversation";
import { Conversation } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type ExtendedConversation = Conversation & {
  participants: {
    user: {
      name: string | null;
      email: string | null;
      image?: string | null;
    };
  }[];
};

const data = {
  teams: [
    {
      name: "ArkDigital",
      logo: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741345635/logo-01_upxvqe.png",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      items: [
        { title: "Chat", url: "#", icon: RiChat1Line, isActive: true },
        { title: "Real-time", url: "#", icon: RiBardLine },
        { title: "Assistants", url: "#", icon: RiMickeyLine },
        { title: "Audio", url: "#", icon: RiMicLine },
        { title: "Metrics", url: "#", icon: RiCheckDoubleLine },
        { title: "Documentation", url: "#", icon: RiBracesLine },
      ],
    },
    {
      title: "More",
      url: "#",
      items: [
        { title: "Community", url: "#", icon: RiPlanetLine },
        { title: "Help Centre", url: "#", icon: RiSeedlingLine },
        { title: "Settings", url: "#", icon: RiSettings3Line },
      ],
    },
  ],
};

interface AppSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onConversationSelect: (id: string | null) => void;
  activeConversationId: string | null;
}

export function AppSidebar({
  onConversationSelect,
  activeConversationId,
  className,
  ...props
}: AppSidebarProps) {
  const { data: session } = useSession();
  const [conversations, setConversations] = React.useState<ExtendedConversation[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const isAccountPage = pathname === "/account";
  const isChatPage = pathname === "/chat";

  React.useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem("activeConversationId", activeConversationId);
    }
  }, [activeConversationId]);

  React.useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/conversations");
        if (!res.ok) throw new Error("Failed to fetch conversations");
        const data = await res.json();
        setConversations(data);

        const savedConversationId = localStorage.getItem("activeConversationId");

        if (savedConversationId) {
          if (data.some((c: Conversation) => c.id === savedConversationId)) {
            onConversationSelect(savedConversationId);
            if (isChatPage) {
              router.replace(`/chat?conversation=${savedConversationId}`);
            }
          } else if (data.length > 0) {
            onConversationSelect(data[0].id);
            if (isChatPage) {
              router.replace(`/chat?conversation=${data[0].id}`);
            }
          }
        } else if (data.length > 0) {
          onConversationSelect(data[0].id);
          if (isChatPage) {
            router.replace(`/chat?conversation=${data[0].id}`);
          }
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    if (typeof window !== "undefined") {
      fetchConversations();
    }
  }, [onConversationSelect, isChatPage, router]);

  return (
    <div
      {...props}
      className={cn(
        "flex flex-col h-full w-64 bg-gray-900 text-white border-r border-gray-700",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-700">
        <Image
          src={session?.user?.image || data.teams[0].logo}
          alt="Logo"
          className="w-8 h-8 rounded-full"
          width={32}
          height={32}
        />
        <div className="text-sm font-medium">
          {session?.user?.name}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="mb-6">
          <div className="text-xs uppercase text-gray-500 px-2 mb-2">
            {data.navMain[0]?.title}
          </div>
          <div className="space-y-1">
            {isAccountPage ? (
              <button
                className="flex items-center gap-3 w-full px-2 py-2 rounded-md font-medium hover:bg-gray-800"
                onClick={() => (window.location.href = "/chat")}
              >
                <RiChat1Line className="text-gray-400" size={20} />
                <span>Conversations</span>
              </button>
            ) : (
              <AddConversationDialog />
            )}

            {!isAccountPage && conversations.map((conversation) => (
              <div key={conversation.id} className="relative group">
                <button
                  onClick={() => {
                    if (isAccountPage) {
                      window.location.href = `/chat?conversation=${conversation.id}`;
                    } else {
                      onConversationSelect(conversation.id);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 w-full px-2 py-2 rounded-md font-medium",
                    activeConversationId === conversation.id
                      ? "bg-gradient-to-b from-blue-600 to-blue-700"
                      : "hover:bg-gray-800"
                  )}
                >
                  <RiChat1Line
                    className={activeConversationId === conversation.id ? "text-white" : "text-gray-400"}
                    size={20}
                  />
                  <span className="truncate">
                    {conversation.isGroup
                      ? conversation.name || "Unnamed Group"
                      : conversation.participants.find(
                          (p) => p.user.email !== session?.user?.email
                        )?.user.name || "Unnamed User"}
                  </span>
                </button>

                <Popover.Root>
                  <Popover.Trigger asChild>
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100">
                      <RiMore2Line size={18} />
                    </button>
                  </Popover.Trigger>
                  <Popover.Content
                    align="end"
                    className="z-50 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-md p-2"
                    sideOffset={8}
                  >
                    <Dialog.Root>
                      <Dialog.Trigger asChild>
                        <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-700 rounded-md transition text-red-400">
                          <RiDeleteBin6Line size={18} />
                          <span>Delete Conversation</span>
                        </button>
                      </Dialog.Trigger>

                      {/* Dialog content tetap sama */}
                    </Dialog.Root>
                  </Popover.Content>
                </Popover.Root>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-700">
        <div className="text-xs uppercase text-gray-500 px-2 mb-2">
          {data.navMain[1]?.title}
        </div>
        <div className="space-y-1">
          {data.navMain[1]?.items.map((item) => {
            if (item.title === "Settings") {
              return (
                <Popover.Root key={item.title}>
                  <Popover.Trigger asChild>
                    <button className="flex items-center gap-3 w-full px-2 py-2 rounded-md font-medium hover:bg-gray-800">
                      <item.icon className="text-gray-400" size={20} />
                      <span>{item.title}</span>
                    </button>
                  </Popover.Trigger>
                  <Popover.Content
                    align="start"
                    className="z-50 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-md p-2"
                    sideOffset={8}
                  >
                    <button
                      onClick={() => {
                        window.location.href = "/account";
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-700 rounded-md transition"
                    >
                      <RiUser3Line size={18} />
                      <span>Account</span>
                    </button>

                    <button
                      onClick={() => {
                        localStorage.removeItem("activeConversationId");
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-700 rounded-md transition"
                    >
                      <RiLogoutBoxLine size={18} />
                      <span>Logout</span>
                    </button>
                  </Popover.Content>
                </Popover.Root>
              );
            }

            return (
              <button
                key={item.title}
                className="flex items-center gap-3 w-full px-2 py-2 rounded-md font-medium hover:bg-gray-800"
              >
                <item.icon className="text-gray-400" size={20} />
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}