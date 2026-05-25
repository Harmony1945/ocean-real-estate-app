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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
try {
  const key = "ocean-theme";
  const saved = window.localStorage.getItem(key);
  const theme = saved === "dark" || saved === "light"
    ? saved
    : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
} catch (_) {}
})();`
          }}
        />
      </head>
      <body>
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
