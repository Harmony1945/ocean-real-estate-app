"use client";

import Link from "next/link";

const menuItems = [
  ["Profilim", "Advisor hesabı ve temel profil bilgileri."],
  ["Bildirimler", "Eski far-right bottom nav fonksiyonu buraya taşındı."],
  ["Görevlerim", "Açık ve tamamlanan görevler."],
  ["Portföylerim", "Danışmana ait portföyler."],
  ["Arayışlarım", "Aktif müşteri ve yatırımcı talepleri."],
  ["Eşleşmeler", "Arayış-portföy eşleşmeleri."],
  ["Ödemeler", "Yakında."],
  ["İşlem ve Komisyonlar", "Komisyon ve işlem görünümü."],
  ["Raporlar", "Yakında."],
  ["Hesap ve Güvenlik", "Oturum ve güvenlik ayarları."],
  ["Ayarlar", "Uygulama tercihleri."],
  ["Yardım ve Destek", "Yakında."]
];

export default function MenuRoutePage() {
  function logout() {
    window.localStorage.removeItem("ocean-authenticated");
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-5 pb-[calc(env(safe-area-inset-bottom)+7rem)] text-slate-950 dark:bg-slate-950 dark:text-slate-100 sm:px-6 md:pb-8 lg:px-8">
      <div className="mx-auto max-w-3xl">
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
          <div id="profilim" className="rounded-[1.5rem] border border-white/60 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-950">
                O
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">OOS Advisor</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">Profil ve hesap merkezi</p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                advisor
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-1">
            {menuItems.map(([title, description]) => (
              <Link
                key={title}
                href={title === "Portföylerim" ? "/portfolios" : title === "Arayışlarım" ? "/requests" : `/menu#${title.toLocaleLowerCase("tr-TR").replace(/\s+/g, "-")}`}
                className="group flex min-h-12 items-center justify-between gap-3 rounded-2xl px-3 py-2 text-sm transition hover:bg-white/65 dark:hover:bg-white/5"
              >
                <span>
                  <span className="block font-medium text-slate-800 group-hover:text-slate-950 dark:text-slate-200 dark:group-hover:text-white">{title}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{description}</span>
                </span>
                <span className="text-slate-300 dark:text-slate-600">›</span>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-3 flex min-h-12 w-full items-center justify-center rounded-2xl border border-red-100 bg-white/70 px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:bg-white/5 dark:text-red-300 dark:hover:bg-red-950/30"
          >
            Çıkış Yap
          </button>
        </section>
      </div>
    </main>
  );
}
