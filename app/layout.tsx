// app/layout.tsx

import "./globals.css";
import { Providers } from "./provider"; // <- import provider yang kita buat

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
