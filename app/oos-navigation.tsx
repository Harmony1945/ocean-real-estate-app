"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import ThemeToggle from "./theme-toggle";
import {
  createSupabaseAuthClient,
  getUserDisplayName,
  isSupabaseConfigured,
  type AdvisorProfile,
  type SupabaseAuthUser
} from "@/lib/supabase/client";

type OOSNavigationProps = {
  user: SupabaseAuthUser | null;
  profile?: AdvisorProfile | null;
  onLogout: () => void;
};

type MenuItem = {
  label: string;
  href: string;
  icon: IconName;
};

export type IconName =
  | "user"
  | "portfolio"
  | "search"
  | "match"
  | "payment"
  | "tax"
  | "commission"
  | "report"
  | "map"
  | "bell"
  | "task"
  | "shield"
  | "settings"
  | "support"
  | "faq"
  | "legal"
  | "activity";

const navItems = [
  { href: "/", label: "Ana Sayfa", icon: HomeIcon },
  { href: "/portfolios", label: "Portföylerim", icon: PortfolioIcon },
  { href: "/requests", label: "Arayışlar", icon: SearchIcon },
  { href: "/menu", label: "Menü", icon: MenuIcon }
];

const menuGroups: Array<{ title: string; items: MenuItem[] }> = [
  {
    title: "Operasyon",
    items: [
      { label: "Profilim", href: "/menu/profile", icon: "user" },
      { label: "Portföylerim", href: "/portfolios", icon: "portfolio" },
      { label: "Tüm Portföyler", href: "/all-portfolios", icon: "portfolio" },
      { label: "Arayışlarım", href: "/requests", icon: "search" },
      { label: "Eşleşmeler", href: "/menu/matches", icon: "match" }
    ]
  },
  {
    title: "İş araçları",
    items: [
      { label: "Ödemeler", href: "/menu/payments", icon: "payment" },
      { label: "Vergi Hesaplayıcı", href: "/menu/tax-calculator", icon: "tax" },
      { label: "Gelir Motoru", href: "/menu/commissions", icon: "commission" },
      { label: "Raporlar", href: "/menu/reports", icon: "report" }
    ]
  },
  {
    title: "Platform",
    items: [
      { label: "Harita", href: "/menu/map", icon: "map" },
      { label: "Bildirimler", href: "/menu/notifications", icon: "bell" },
      { label: "Görevlerim", href: "/menu/tasks", icon: "task" },
      { label: "Aktivite Kayıtları", href: "/menu/activity", icon: "activity" },
      { label: "Hesap ve Güvenlik", href: "/menu/security", icon: "shield" },
      { label: "Ayarlar", href: "/menu/settings", icon: "settings" }
    ]
  },
  {
    title: "Destek ve kurumsal",
    items: [
      { label: "Yardım ve Destek", href: "/menu/support", icon: "support" },
      { label: "Sıkça Sorulan Sorular", href: "/menu/faq", icon: "faq" },
      { label: "Yasal ve Kurumsal", href: "/menu/legal-corporate", icon: "legal" }
    ]
  }
];

export const oosMenuGroups = menuGroups;

export default function OOSNavigation({ user, profile, onLogout }: OOSNavigationProps) {
  const pathname = usePathname();
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const displayName = getUserDisplayName(user, profile) || "OOS Advisor";
  const initials = useMemo(() => getInitials(displayName), [displayName]);
  const supabase = useMemo(() => createSupabaseAuthClient(), []);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setDesktopMenuOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    if (!user || !isSupabaseConfigured || !supabase) {
      setUnreadNotificationCount(0);
      return;
    }

    let mounted = true;
    supabase.getUnreadNotificationCount()
      .then((count: number) => {
        if (mounted) setUnreadNotificationCount(count);
      })
      .catch(() => {
        if (mounted) setUnreadNotificationCount(0);
      });

    return () => {
      mounted = false;
    };
  }, [supabase, user]);

  return (
    <>
      <div className="fixed right-4 top-4 z-[70] hidden items-center gap-2 md:flex">
        <ThemeToggle />
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

      <ThemeToggle className="fixed right-4 top-4 z-[70] md:hidden" />

      {desktopMenuOpen ? (
        <>
          <button
            type="button"
            aria-label="Menüyü kapat"
            className="fixed inset-0 z-[65] hidden cursor-default bg-transparent md:block"
            onClick={() => setDesktopMenuOpen(false)}
          />
          <aside className="liquid-glass-strong fixed right-4 top-16 z-[75] hidden max-h-[calc(100dvh-5rem)] w-[22rem] max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain rounded-[2rem] p-3 text-slate-950 dark:text-slate-100 md:block">
            <MenuPanelContent
              displayName={displayName}
              email={user?.email || "Kurulum bekleniyor"}
              initials={initials}
              company={profile?.company || "Şirket bilgisi bekleniyor"}
              phone={profile?.phone || "Telefon bilgisi bekleniyor"}
              unreadNotificationCount={unreadNotificationCount}
              onLogout={onLogout}
              onItemSelect={() => setDesktopMenuOpen(false)}
            />
          </aside>
        </>
      ) : null}

      <nav className="oos-mobile-nav fixed bottom-0 left-0 right-0 z-[70] px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 md:hidden">
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

export function MenuPanelContent({
  displayName,
  email,
  initials,
  company,
  phone,
  unreadNotificationCount,
  onLogout,
  onItemSelect
}: {
  displayName: string;
  email: string;
  initials: string;
  company: string;
  phone: string;
  unreadNotificationCount?: number;
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
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{company} · {phone}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-5">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <p className="px-3 pb-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <MenuRow
                  key={item.label}
                  item={item}
                  notificationCount={item.href === "/menu/notifications" ? unreadNotificationCount : 0}
                  onItemSelect={onItemSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="mt-4 flex min-h-12 w-full items-center justify-center rounded-2xl border border-red-100 bg-white/70 px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:bg-white/5 dark:text-red-300 dark:hover:bg-red-950/30"
      >
        Çıkış Yap
      </button>
    </div>
  );
}

function MenuRow({
  item,
  notificationCount = 0,
  onItemSelect
}: {
  item: MenuItem;
  notificationCount?: number;
  onItemSelect?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === item.href;

  return (
    <Link
      href={item.href}
      onClick={onItemSelect}
      aria-current={active ? "page" : undefined}
      className={`group flex min-h-[58px] items-center gap-4 rounded-[1.35rem] px-3 py-3 text-slate-800 transition hover:bg-white/55 active:bg-white/70 dark:text-slate-200 dark:hover:bg-white/5 dark:active:bg-white/10 ${
        active ? "bg-white/70 shadow-sm dark:bg-white/10" : ""
      }`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center text-slate-700 dark:text-slate-200">
        <MenuItemIcon name={item.icon} />
      </span>
      <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{item.label}</span>
      {notificationCount > 0 ? (
        <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-semibold text-white">
          {notificationCount > 99 ? "99+" : notificationCount}
        </span>
      ) : null}
      <ChevronIcon className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 dark:text-slate-600" />
    </Link>
  );
}

export function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toLocaleUpperCase("tr-TR"))
      .join("") || "O"
  );
}

export function MenuItemIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
    portfolio: <><rect x="5" y="5" width="14" height="14" rx="3" /><path d="M8.5 10h7M8.5 14h5" /></>,
    search: <><circle cx="10.5" cy="10.5" r="5.5" /><path d="m15 15 4 4" /></>,
    match: <><path d="M7 7h10v10H7z" /><path d="M4 12h3M17 12h3M12 4v3M12 17v3" /></>,
    payment: <><rect x="4" y="7" width="16" height="11" rx="2" /><path d="M4 10h16M8 15h3" /></>,
    tax: <><path d="M19 5 5 19" /><circle cx="7" cy="7" r="2" /><circle cx="17" cy="17" r="2" /></>,
    commission: <><path d="M5 7h14M5 12h14M5 17h8" /><path d="M17 16l2 2 3-4" /></>,
    report: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h5M10 13h5M10 17h6" /></>,
    map: <><path d="M9 18 4 20V6l5-2 6 2 5-2v14l-5 2z" /><path d="M9 4v14M15 6v14" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    task: <><path d="m5 12 4 4L19 6" /><path d="M5 6h8M5 18h14" /></>,
    shield: <><path d="M12 3 5 6v5c0 5 3.2 8.5 7 10 3.8-1.5 7-5 7-10V6z" /><path d="M9.5 12.5 11 14l3.5-4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.7-1L14.5 3h-5l-.3 3.1a8 8 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .1 1l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 1.7 1l.3 3.1h5l.3-3.1a8 8 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5a7 7 0 0 0 .1-1Z" /></>,
    support: <><circle cx="12" cy="12" r="8" /><path d="M8 13a4 4 0 0 0 8 0M9 9h.01M15 9h.01" /></>,
    faq: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.7 2.7 0 0 1 5 1.4c0 2-2.5 2-2.5 4" /><path d="M12 18h.01" /></>,
    legal: <><path d="M12 3v18M6 7h12" /><path d="m6 7-3 6h6zM18 7l-3 6h6z" /></>,
    activity: <><path d="M5 5h14v14H5z" /><path d="M8 9h8M8 13h5M8 17h7" /><path d="M17 3v4M7 3v4" /></>
  };

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
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

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
