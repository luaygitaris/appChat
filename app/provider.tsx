// app/layout.tsx atau app/providers.tsx (jika Anda memisahkan provider)

"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
