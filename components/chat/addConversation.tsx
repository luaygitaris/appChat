"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

export function AddConversationDialog() {
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isGroup, setIsGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (!res.ok) throw new Error("Failed to fetch users");
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

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
        console.error("Failed to create conversation:", errorMessage);
        throw new Error(`Failed to create conversation: ${errorMessage}`);
      }
  
      const result = await res.json();
  
      // ✅ Simpan ID ke localStorage (agar ChatPage otomatis menampilkan)
      localStorage.setItem("activeConversationId", JSON.stringify(result.id));

  
      // ✅ Reset dialog state
      setGroupName("");
      setSelectedUsers([]);
      setIsGroup(false);
  
      // ✅ Reload agar ChatPage terpicu
      window.location.reload(); // atau: router.refresh() jika pakai Server Components
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Add Conversation
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-md bg-white p-6 rounded-md shadow-lg transform -translate-x-1/2 -translate-y-1/2">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Add New Conversation
          </Dialog.Title>

          <div className="mb-4">
            <label className="flex items-center gap-2">
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
              <label className="block text-sm font-medium mb-1">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter group name"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Select Members
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Search users..."
            />
            <div className="min-h-40 overflow-y-auto border rounded">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center px-3 py-1 gap-2">
                  <input
                    type="checkbox"
                    value={user.id}
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedUsers((prev) =>
                        e.target.checked
                          ? [...prev, id]
                          : prev.filter((uid) => uid !== id)
                      );
                    }}
                  />
                  <span>{user.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button
                onClick={handleCreateConversation}
                className="px-4 py-2 bg-green-600 text-white rounded">
                {isGroup ? "Create Group" : "Create Conversation"}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
