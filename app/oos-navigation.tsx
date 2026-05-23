"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getUserDisplayName, type SupabaseAuthUser } from "@/lib/supabase/client";

type OOSNavigationProps = {
  user: SupabaseAuthUser | null;
  onLogout: () => void;
};

const navItems = [
  { href: "/", label: "Ana Sayfa", icon: HomeIcon },
  { href: "/portfolios", label: "Portföyler", icon: PortfolioIcon },
  { href: "/requests", label: "Arayışlar", icon: SearchIcon },
  { href: "/menu", label: "Menü", icon: MenuIcon }
];

const menuItems = [
  { label: "Profilim", href: "/menu#profilim", status: "Aktif" },
  { label: "Bildirimler", href: "/menu#bildirimler", status: "Taşındı" },
  { label: "Görevlerim", href: "/menu#gorevlerim", status: "Aktif" },
  { label: "Portföylerim", href: "/portfolios", status: "Aktif" },
  { label: "Arayışlarım", href: "/requests", status: "Aktif" },
  { label: "Eşleşmeler", href: "/menu#eslesmeler", status: "Aktif" },
  { label: "Ödemeler", href: "/menu#odemeler", status: "Yakında" },
  { label: "İşlem ve Komisyonlar", href: "/menu#islem-komisyon", status: "Aktif" },
  { label: "Raporlar", href: "/menu#raporlar", status: "Yakında" },
  { label: "Hesap ve Güvenlik", href: "/menu#hesap-guvenlik", status: "Aktif" },
  { label: "Ayarlar", href: "/menu#ayarlar", status: "Aktif" },
  { label: "Yardım ve Destek", href: "/menu#yardim", status: "Yakında" }
];

export default function OOSNavigation({ user, onLogout }: OOSNavigationProps) {
  const pathname = usePathname();
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const displayName = getUserDisplayName(user) || "OOS Advisor";
  const initials = useMemo(
    () =>
      displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toLocaleUpperCase("tr-TR"))
        .join("") || "O",
    [displayName]
  );

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setDesktopMenuOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <>
      <div className="fixed right-4 top-4 z-[70] hidden items-center gap-2 md:flex">
        <Link
          href="/menu"
          className="rounded-full border border-white/60 bg-white/80 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-xl transition hover:bg-white dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          OOS Menü
        </Link>
        <button
          type="button"
          aria-label="OOS menüsünü aç"
          aria-expanded={desktopMenuOpen}
          onClick={() => setDesktopMenuOpen((current) => !current)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/85 text-slate-800 shadow-sm backdrop-blur-xl transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:hover:bg-slate-900"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>

      {desktopMenuOpen ? (
        <>
          <button
            type="button"
            aria-label="Menüyü kapat"
            className="fixed inset-0 z-[65] hidden cursor-default bg-transparent md:block"
            onClick={() => setDesktopMenuOpen(false)}
          />
          <aside className="liquid-glass-strong fixed right-4 top-16 z-[75] hidden w-[22rem] max-w-[calc(100vw-2rem)] rounded-[2rem] p-3 text-slate-950 dark:text-slate-100 md:block">
            <MenuPanelContent
              displayName={displayName}
              email={user?.email || "Kurulum bekleniyor"}
              initials={initials}
              onLogout={onLogout}
              onItemSelect={() => setDesktopMenuOpen(false)}
            />
          </aside>
        </>
      ) : null}

      <nav className="fixed bottom-0 left-0 right-0 z-[70] px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 md:hidden">
        <div className="liquid-glass-nav mx-auto grid max-w-[21rem] grid-cols-4 gap-1.5 rounded-[2rem] p-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[54px] flex-col items-center justify-center rounded-[1.45rem] text-[11px] transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 dark:focus-visible:ring-slate-200/40 ${
                  active
                    ? "border border-white/70 bg-white/70 text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_24px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(0,0,0,0.32)]"
                    : "text-slate-500 hover:bg-white/40 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="mt-1 leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export function OOSMenuPageContent({ user, onLogout }: OOSNavigationProps) {
  const displayName = getUserDisplayName(user) || "OOS Advisor";
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toLocaleUpperCase("tr-TR"))
      .join("") || "O";

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-5 pb-[calc(env(safe-area-inset-bottom)+7rem)] text-slate-950 dark:bg-slate-950 dark:text-slate-100 sm:px-6 md:pb-8 lg:px-8">
      <main className="mx-auto max-w-3xl">
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold shadow-sm dark:border-slate-800 dark:bg-slate-900">
              O
            </span>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ocean Operating System</p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Menü</h1>
            </div>
          </div>
        </header>
        <section className="liquid-glass-strong rounded-[2rem] p-3">
          <MenuPanelContent
            displayName={displayName}
            email={user?.email || "Kurulum bekleniyor"}
            initials={initials}
            onLogout={onLogout}
          />
        </section>
      </main>
    </div>
  );
}

function MenuPanelContent({
  displayName,
  email,
  initials,
  onLogout,
  onItemSelect
}: {
  displayName: string;
  email: string;
  initials: string;
  onLogout: () => void;
  onItemSelect?: () => void;
}) {
  return (
    <div>
      <div id="profilim" className="rounded-[1.5rem] border border-white/60 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-950">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">{displayName}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{email}</p>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            advisor
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onItemSelect}
            className="group flex min-h-12 items-center justify-between rounded-2xl px-3 py-2 text-sm transition hover:bg-white/65 dark:hover:bg-white/5"
          >
            <span className="font-medium text-slate-800 group-hover:text-slate-950 dark:text-slate-200 dark:group-hover:text-white">
              {item.label}
            </span>
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                item.status === "Yakında"
                  ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  : item.status === "Taşındı"
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              }`}
            >
              {item.status}
            </span>
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="mt-3 flex min-h-12 w-full items-center justify-center rounded-2xl border border-red-100 bg-white/70 px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:bg-white/5 dark:text-red-300 dark:hover:bg-red-950/30"
      >
        Çıkış Yap
      </button>
    </div>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10.5V20h13v-9.5" />
    </svg>
  );
}

function PortfolioIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <path d="M8.5 9h7" />
      <path d="M8.5 12h5" />
      <path d="M8.5 15h6" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="m15 15 4 4" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}
