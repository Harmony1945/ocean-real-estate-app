"use client";

import Link from "next/link";
import { useAuthContext } from "../auth-context";
import { getInitials, MenuPanelContent } from "../oos-navigation";
import { getUserDisplayName } from "@/lib/supabase/client";

export default function MenuRoutePage() {
  const { user, profile, onLogout } = useAuthContext();
  const displayName = getUserDisplayName(user, profile) || "Ocean Danışmanı";

  return (
    <main className="min-h-screen bg-stone-50 px-4 pb-[calc(env(safe-area-inset-bottom)+7rem)] pt-20 text-slate-950 dark:bg-black dark:text-slate-100 sm:px-6 md:bg-slate-950 md:pt-24 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <Link href="/" title="Ana sayfaya dön" aria-label="Ana sayfaya dön" className="inline-flex text-sm font-medium text-slate-500 transition hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-300">
            Ocean Operating System
          </Link>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Menü</h1>
        </header>

        <section className="md:liquid-glass-strong md:rounded-[2rem] md:p-3">
          <MenuPanelContent
            displayName={displayName}
            initials={getInitials(displayName)}
            onLogout={onLogout}
          />
        </section>

        <footer className="pb-2 pt-10 text-center text-xs leading-5 text-slate-400 dark:text-slate-600">
          Star Girişim ve Yatırım A.Ş. · OOS danışman çalışma alanı
        </footer>
      </div>
    </main>
  );
}
