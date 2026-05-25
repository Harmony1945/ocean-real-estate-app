"use client";

import { useEffect, useState } from "react";
import { getPreferredTheme, saveTheme, type ThemeMode } from "./theme";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    setTheme(getPreferredTheme());

    function syncTheme(event: Event) {
      const nextTheme =
        event instanceof CustomEvent && (event.detail === "dark" || event.detail === "light")
          ? event.detail
          : getPreferredTheme();
      setTheme(nextTheme);
    }

    window.addEventListener("oos-theme-change", syncTheme);
    window.addEventListener("storage", syncTheme);
    return () => {
      window.removeEventListener("oos-theme-change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    saveTheme(nextTheme);
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
      title={isDark ? "Açık tema" : "Koyu tema"}
      onClick={toggleTheme}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/85 text-slate-800 shadow-sm backdrop-blur-xl transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:hover:bg-slate-900 ${className}`}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M20.1 14.7A7.9 7.9 0 0 1 9.3 3.9 8.5 8.5 0 1 0 20.1 14.7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M4.7 4.7l1.6 1.6M17.7 17.7l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.7 19.3l1.6-1.6M17.7 6.3l1.6-1.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
