import type { Metadata } from "next";
import AuthGate from "./auth-gate";
import "./globals.css";

export const metadata: Metadata = {
  title: "OOS",
  description: "Ocean Operating System: gayrimenkul danışmanları için odaklı işletim sistemi."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
