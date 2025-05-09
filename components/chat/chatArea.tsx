"use client";

import { useState, useRef, useEffect } from "react";
import * as React from "react";
import { useSession } from "next-auth/react";
import {
  RiSendPlaneLine,
  RiEdit2Line,
  RiDeleteBin5Fill,
} from "@remixicon/react";
import { ChatHeader } from "./ChatHeader";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image: string;
    email: string;
  };
}

interface ChatAreaProps {
  conversationId: string | null;
}

export function ChatArea({ conversationId }: ChatAreaProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedMessageId, setSelectedMessageId] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `/api/conversations/${conversationId}/messages`
        );
        if (res.status === 404) {
          localStorage.removeItem("activeConversationId");
          window.location.reload();
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !session?.user?.email) return;

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const sentMessage = await res.json();
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const confirmDeleteMessage = async () => {
    if (!selectedMessageId || !conversationId) return;
    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages/${selectedMessageId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Failed to delete message");

      setMessages((prev) => prev.filter((msg) => msg.id !== selectedMessageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setModalOpen(false);
      setSelectedMessageId(null);
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages/${messageId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newContent }),
        }
      );

      if (!res.ok) throw new Error("Failed to edit message");

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, content: newContent } : msg
        )
      );
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6 max-w-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Choose an existing conversation or start a new one
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-full">
      <div className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <ChatHeader conversationId={conversationId} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={message.sender.email === session?.user?.email}
              onDelete={(id) => {
                setSelectedMessageId(id);
                setModalOpen(true);
              }}
              onEdit={handleEditMessage}
            />
          ))
        )}
      </div>

      <div className="sticky bottom-0 z-10 border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
        <form
          onSubmit={handleSendMessage}
          className="flex gap-2 max-w-6xl mx-1">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 rounded-full bg-blue-600 text-white disabled:opacity-50">
            <RiSendPlaneLine size={20} />
          </button>
        </form>
      </div>

      <DeleteConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDeleteMessage}
      />
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string, newContent: string) => void;
}

function MessageBubble({
  message,
  isCurrentUser,
  onDelete,
  onEdit,
}: MessageBubbleProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bubbleRef.current &&
        !bubbleRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
        setIsEditing(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEdit = () => {
    const trimmed = editContent.trim();
    if (trimmed && trimmed !== message.content) {
      onEdit(message.id, trimmed);
    }
    setIsEditing(false);
    setShowOptions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    }
  };

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div
        ref={bubbleRef}
        onClick={() => setShowOptions(!isEditing && !showOptions)}
        className={`relative max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 cursor-pointer ${
          isCurrentUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
        }`}>
        {!isCurrentUser && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium">{message.sender.name}</span>
          </div>
        )}

        {isEditing ? (
          <div>
            <textarea
              className="w-full text-sm p-1 rounded-md text-black"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              rows={2}
            />
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={handleEdit}
                className="text-white text-xs font-medium">
                Simpan
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-500 text-xs">
                Batal
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap">{message.content}</p>
            <p
              className={`text-xs mt-1 opacity-70 ${
                isCurrentUser ? "text-right" : "text-left"
              }`}>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </>
        )}

        {showOptions && isCurrentUser && !isEditing && (
          <div className="absolute top-full mt-1 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20 w-28">
            <button
              onClick={() => {
                setIsEditing(true);
                setEditContent(message.content);
                setShowOptions(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700">
              <RiEdit2Line /> <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(message.id)}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">
              <RiDeleteBin5Fill /> <span>Hapus</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Hapus Pesan
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Apakah kamu yakin ingin menghapus pesan ini? Tindakan ini tidak dapat
          dibatalkan.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700">
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
