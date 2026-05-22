import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ocean Real Estate",
  description: "Ocean Real Estate için mobil öncelikli portföy ve talep yönetimi."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
