"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

export function AddConversationDialog() {
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isGroup, setIsGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchError("");
    setUsers([]);

    try {
      const res = await fetch(`/api/users?email=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch users");

      if (data.length === 0) {
        setSearchError("User not found.");
      } else {
        setUsers(data);
      }
    } catch (err) {
      setSearchError("Error occurred");
      console.error("Error fetching users:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: isGroup ? groupName : null,
          isGroup,
          userIds: [...selectedUsers],
        }),
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }

      const result = await res.json();
      localStorage.setItem("activeConversationId", JSON.stringify(result.id));
      setGroupName("");
      setSelectedUsers([]);
      setIsGroup(false);
      window.location.reload();
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm sm:text-base">
          Add Conversation
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-10 w-[90%] sm:w-full max-w-md bg-white p-4 sm:p-6 rounded-md shadow-lg transform -translate-x-1/2 -translate-y-1/2 overflow-y-auto max-h-[90vh]">
          <Dialog.Title className="text-base sm:text-lg font-semibold mb-4">
            Add New Conversation
          </Dialog.Title>

          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isGroup}
                onChange={(e) => setIsGroup(e.target.checked)}
              />
              Add Group
            </label>
          </div>

          {isGroup && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Enter group name"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Search by Email</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:flex-1 border rounded px-3 py-2 text-sm"
                placeholder="Enter email"
              />
              <button
                onClick={handleSearch}
                className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white text-sm rounded"
                disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {searchError && (
            <div className="text-red-500 text-sm mb-2">{searchError}</div>
          )}

          {users.length > 0 && (
            <div className="mb-4">
              <div className="min-h-[100px] max-h-[240px] overflow-y-auto border rounded">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center px-3 py-2 gap-2">
                    <input
                      type="checkbox"
                      value={user.id}
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedUsers((prev) =>
                          e.target.checked ? [...prev, id] : prev.filter((uid) => uid !== id)
                        );
                      }}
                    />
                    <span className="text-sm truncate">{user.name || user.email}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
            <Dialog.Close asChild>
              <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded text-sm">
                Cancel
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button
                onClick={handleCreateConversation}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded text-sm"
                disabled={selectedUsers.length === 0}>
                {isGroup ? "Create Group" : "Create Conversation"}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
