"use client";

import * as Popover from "@radix-ui/react-popover";
import { signOut } from "next-auth/react";
import {
  RiLogoutBoxLine,
  RiUser3Line,
  RiDeleteBin6Line,
  RiMore2Line,
} from "@remixicon/react";
import * as Dialog from "@radix-ui/react-dialog";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
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
import { useSession } from "next-auth/react";
import Image from "next/image";
import { AddConversationDialog } from "../chat/addConversation";
import { Conversation } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";

type ExtendedConversation = Conversation & {
  participants: {
    user: {
      name: string | null;
      email: string | null;
      image?: string | null;
    };
  }[];
};

// Contoh data
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

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onConversationSelect: (id: string | null) => void;
  activeConversationId: string | null;
}

export function AppSidebar({
  onConversationSelect,
  activeConversationId,
  ...props
}: AppSidebarProps) {
  const { data: session } = useSession();
  const [conversations, setConversations] = React.useState<
    ExtendedConversation[]
  >([]);
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

        const savedConversationId = localStorage.getItem(
          "activeConversationId"
        );

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
    <SidebarProvider>
      <Sidebar {...props} className="dark !border-none">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <Image
              src={session?.user?.image || data.teams[0].logo}
              alt="Logo"
              className="w-8 h-8 rounded-full"
              width={32}
              height={32}
            />
            <div className="text-sm font-medium text-sidebar-foreground">
              {session?.user?.name}
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase text-sidebar-foreground/50">
              {data.navMain[0]?.title}
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  {isAccountPage ? (
                    <SidebarMenuButton
                      asChild
                      className="group/menu-button font-medium gap-3 h-9 rounded-md [&>svg]:size-auto"
                      onClick={() => (window.location.href = "/chat")}>
                      <div>
                        <RiChat1Line
                          className="text-sidebar-foreground/50 group-data-[active=true]/menu-button:text-primary"
                          size={22}
                          aria-hidden="true"
                        />
                        <span>Conversations</span>
                      </div>
                    </SidebarMenuButton>
                  ) : (
                    <AddConversationDialog />
                  )}
                </SidebarMenuItem>
                <div className={isAccountPage ? "hidden" : "block"}>
                  {conversations.map((conversation) => (
                    <SidebarMenuItem
                      key={conversation.id}
                      className="relative group">
                      <SidebarMenuButton
                        onClick={() => {
                          if (isAccountPage) {
                            window.location.href = `/chat?conversation=${conversation.id}`;
                          } else {
                            onConversationSelect(conversation.id);
                          }
                        }}
                        className={`group/menu-button font-medium gap-3 h-9 rounded-md pr-8 ${
                          activeConversationId === conversation.id
                            ? "data-[active=true]:bg-gradient-to-b data-[active=true]:from-sidebar-primary data-[active=true]:to-sidebar-primary/70"
                            : ""
                        }`}
                        isActive={activeConversationId === conversation.id}>
                        <RiChat1Line
                          className="text-sidebar-foreground/50 group-data-[active=true]/menu-button:text-sidebar-foreground"
                          size={22}
                          aria-hidden="true"
                        />
                        <span>
                          {conversation.isGroup
                            ? conversation.name || "Unnamed Group"
                            : conversation.participants.find(
                                (p) => p.user.email !== session?.user?.email
                              )?.user.name || "Unnamed User"}
                        </span>
                      </SidebarMenuButton>

                      {/* Tombol titik tiga */}
                      <Popover.Root>
                        <Popover.Trigger asChild>
                          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white">
                            <RiMore2Line size={18} />
                          </button>
                        </Popover.Trigger>
                        <Popover.Portal>
                          <Popover.Content
                            align="end"
                            className="z-50 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-2"
                            sideOffset={8}>
                            <Dialog.Root>
                              <Dialog.Trigger asChild>
                                <button className="w-full text-left text-sm flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition text-red-600 dark:text-red-400">
                                  <RiDeleteBin6Line size={18} />
                                  <span>Delete Conversation</span>
                                </button>
                              </Dialog.Trigger>

                              <Dialog.Portal>
                                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                                <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                                  <Dialog.Title className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                                    Delete Conversation
                                  </Dialog.Title>
                                  <Dialog.Description className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                    Are you sure you want to delete this
                                    conversation? This action cannot be undone.
                                  </Dialog.Description>

                                  <div className="flex justify-end gap-2">
                                    <Dialog.Close asChild>
                                      <button className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md">
                                        Cancel
                                      </button>
                                    </Dialog.Close>
                                    <Dialog.Close asChild>
                                      <button
                                        onClick={async () => {
                                          try {
                                            const res = await fetch(
                                              `/api/conversations/${conversation.id}`,
                                              {
                                                method: "DELETE",
                                              }
                                            );

                                            if (res.ok) {
                                              setConversations((prev) =>
                                                prev.filter(
                                                  (c) =>
                                                    c.id !== conversation.id
                                                )
                                              );
                                              if (
                                                activeConversationId ===
                                                conversation.id
                                              ) {
                                                onConversationSelect(null);
                                                router.replace("/chat");
                                              }
                                            } else {
                                              const data = await res.json();
                                              alert(
                                                data.message ||
                                                  "Failed to delete conversation"
                                              );
                                            }
                                          } catch (error) {
                                            console.error(
                                              "Error deleting conversation:",
                                              error
                                            );
                                            alert(
                                              "An error occurred while deleting the conversation."
                                            );
                                          }
                                        }}
                                        className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md">
                                        Delete
                                      </button>
                                    </Dialog.Close>
                                  </div>
                                </Dialog.Content>
                              </Dialog.Portal>
                            </Dialog.Root>
                          </Popover.Content>
                        </Popover.Portal>
                      </Popover.Root>
                    </SidebarMenuItem>
                  ))}
                </div>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase text-sidebar-foreground/50">
              {data.navMain[1]?.title}
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SidebarMenu>
                {data.navMain[1]?.items.map((item) => {
                  if (item.title === "Settings") {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <Popover.Root>
                          <Popover.Trigger asChild>
                            <SidebarMenuButton
                              className="group/menu-button font-medium gap-3 h-9 rounded-md [&>svg]:size-auto"
                              isActive={item.isActive}>
                              {item.icon && (
                                <item.icon
                                  className="text-sidebar-foreground/50 group-data-[active=true]/menu-button:text-primary"
                                  size={22}
                                  aria-hidden="true"
                                />
                              )}
                              <span>{item.title}</span>
                            </SidebarMenuButton>
                          </Popover.Trigger>

                          <Popover.Portal>
                            <Popover.Content
                              align="start"
                              className="z-50 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-2"
                              sideOffset={8}>
                              <button
                                onClick={() => {
                                  window.location.href = "/account";
                                }}
                                className="w-full text-left text-sm flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition">
                                <RiUser3Line
                                  className="text-gray-500 dark:text-gray-400"
                                  size={18}
                                />
                                <span className="text-gray-800 dark:text-gray-100">
                                  Account
                                </span>
                              </button>

                              <button
                                onClick={() => {
                                  localStorage.removeItem(
                                    "activeConversationId"
                                  );
                                  signOut({ callbackUrl: "/" });
                                }}
                                className="w-full text-left text-sm flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition">
                                <RiLogoutBoxLine
                                  className="text-gray-500 dark:text-gray-400"
                                  size={18}
                                />
                                <span className="text-gray-800 dark:text-gray-100">
                                  Logout
                                </span>
                              </button>
                            </Popover.Content>
                          </Popover.Portal>
                        </Popover.Root>
                      </SidebarMenuItem>
                    );
                  }

                  // Render item lainnya (Community, Help Centre, dll)
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className="group/menu-button font-medium gap-3 h-9 rounded-md [&>svg]:size-auto"
                        isActive={item.isActive}>
                        <a href={item.url}>
                          {item.icon && (
                            <item.icon
                              className="text-sidebar-foreground/50 group-data-[active=true]/menu-button:text-primary"
                              size={22}
                              aria-hidden="true"
                            />
                          )}
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
