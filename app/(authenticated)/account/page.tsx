// app/account/page.tsx
"use client";

import { useSession } from "next-auth/react";
import React from "react";

export default function AccountPage() {
  const { data: session } = useSession();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex h-screen">
        <div className="w-64 shrink-0 bg-gray-100 dark:bg-gray-800" />
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-gray-900">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
          Account Settings
        </h1>
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <p><strong>Name:</strong> {session?.user?.name}</p>
          <p><strong>Email:</strong> {session?.user?.email}</p>
          {/* Tambahkan pengaturan akun lainnya di sini */}
        </div>
      </div>
    </div>
  );
}
