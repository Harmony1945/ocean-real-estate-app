import type { Metadata } from "next";
import AuthGate from "./auth-gate";
import "./globals.css";

export const metadata: Metadata = {
  title: "OCEAN BrokerageOS",
  description: "Gayrimenkul aracılık ekipleri için odaklı işletim sistemi."
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
