"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuthContext } from "../auth-context";
import ThemeToggle from "../theme-toggle";
import type { MenuPageData } from "./menu-data";
import { getUserDisplayName } from "@/lib/supabase/client";

const mapLocations = [
  { district: "Sarıyer", title: "Yeniköy yalı dairesi", price: "₺92M", top: "22%", left: "42%" },
  { district: "Beşiktaş", title: "Levent aile konutu", price: "₺38M", top: "38%", left: "52%" },
  { district: "Kadıköy", title: "Moda yatırım dairesi", price: "₺21M", top: "64%", left: "68%" },
  { district: "Beyoğlu", title: "Galata ticari alan", price: "₺17M", top: "48%", left: "46%" }
];

const missingLocationItems = ["Malik adres teyidi bekleyen villa", "Yeni ithal edilen Kadıköy portföyü"];

export default function MenuDetailPage({ page }: { page: MenuPageData }) {
  const { user, profile } = useAuthContext();
  const [commission, setCommission] = useState(250000);
  const [incomeTaxRate, setIncomeTaxRate] = useState(20);
  const [selectedDistrict, setSelectedDistrict] = useState(mapLocations[0].district);
  const displayName = getUserDisplayName(user, profile) || "OOS Advisor";
  const tax = useMemo(() => {
    const vat = Math.round(commission * 0.2);
    const incomeTax = Math.round(commission * (incomeTaxRate / 100));
    return { vat, incomeTax, net: commission - incomeTax };
  }, [commission, incomeTaxRate]);

  return (
    <main className="min-h-screen bg-stone-50 px-4 pb-[calc(env(safe-area-inset-bottom)+7rem)] pt-20 text-slate-950 dark:bg-slate-950 dark:text-slate-100 sm:px-6 md:pt-24 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <Link href="/menu" className="mini-action">Menüye Dön</Link>
            <ThemeToggle />
          </div>
          <p className="mt-7 text-sm font-medium text-slate-500 dark:text-slate-400">{page.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-5xl">{page.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">{page.description}</p>
        </header>

        {page.slug === "profile" ? (
          <section className="mt-6 grid gap-4 md:grid-cols-2">
            <InfoCard title="Ad Soyad" value={displayName} />
            <InfoCard title="E-posta" value={user?.email || "Kurulum bekleniyor"} />
            <InfoCard title="Telefon" value={profile?.phone || "Telefon bilgisi bekleniyor"} />
            <InfoCard title="Şirket" value={profile?.company || "Şirket bilgisi bekleniyor"} />
            <article className="oos-card rounded-[1.75rem] p-5 md:col-span-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Rol</p>
              <h2 className="mt-2 text-xl font-semibold">Danışman</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Rol bilgisi güvenlik ve yetki kontrolü için sistem tarafından yönetilir; bu ekrandan düzenlenemez.
              </p>
            </article>
          </section>
        ) : null}

        {page.slug === "tax-calculator" ? (
          <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <article className="oos-card rounded-[1.75rem] p-5">
              <h2 className="text-lg font-semibold">Komisyon hesaplama</h2>
              <label className="mt-4 block text-sm font-medium text-slate-500 dark:text-slate-400">
                Brüt komisyon
                <input className="input mt-2" type="number" value={commission} min={0} onChange={(event) => setCommission(Number(event.target.value))} />
              </label>
              <label className="mt-4 block text-sm font-medium text-slate-500 dark:text-slate-400">
                Gelir vergisi oranı
                <input className="input mt-2" type="number" value={incomeTaxRate} min={0} max={45} onChange={(event) => setIncomeTaxRate(Number(event.target.value))} />
              </label>
              <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Sonuçlar ön bilgi niteliğindedir. Nihai beyan için mali müşavir teyidi gerekir.
              </p>
            </article>
            <article className="oos-card rounded-[1.75rem] p-5">
              <h2 className="text-lg font-semibold">Tahmini sonuç</h2>
              <Result label="KDV (%20)" value={formatCurrency(tax.vat)} />
              <Result label="Gelir vergisi" value={formatCurrency(tax.incomeTax)} />
              <Result label="Tahmini net" value={formatCurrency(tax.net)} />
            </article>
          </section>
        ) : null}

        {page.slug === "map" ? (
          <section className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="oos-card overflow-hidden rounded-[1.75rem] p-5">
              <div className="relative min-h-[19rem] rounded-[1.5rem] border border-slate-200 bg-slate-950 dark:border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(148,163,184,0.35),transparent_24%),radial-gradient(circle_at_70%_62%,rgba(34,197,94,0.20),transparent_20%)]" />
                {mapLocations.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setSelectedDistrict(item.district)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-semibold shadow-lg transition ${
                      selectedDistrict === item.district ? "bg-white text-slate-950" : "bg-white/20 text-white hover:bg-white/35"
                    }`}
                    style={{ top: item.top, left: item.left }}
                  >
                    {item.district}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Bu hafif harita alanı üretim güvenlidir; gerçek harita sağlayıcısı entegrasyonu daha sonra eklenebilir.
              </p>
            </article>
            <article className="oos-card rounded-[1.75rem] p-5">
              <h2 className="text-lg font-semibold">{selectedDistrict} portföyleri</h2>
              <div className="mt-4 grid gap-3">
                {mapLocations
                  .filter((item) => item.district === selectedDistrict)
                  .map((item) => (
                    <div key={item.title} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]">
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.price} · tıklanabilir lokasyon çipi</p>
                    </div>
                  ))}
              </div>
              <h3 className="mt-6 text-sm font-semibold">Konumu eksik portföyler</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
                {missingLocationItems.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </article>
          </section>
        ) : null}

        <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {page.cards.map((card) => (
            <article key={card.title} className="liquid-glass-strong rounded-[1.75rem] p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">{card.title}</h2>
                {card.meta ? <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{card.meta}</span> : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{card.body}</p>
            </article>
          ))}
        </section>

        {page.actions ? (
          <section className="mt-6 grid gap-3 sm:grid-cols-3">
            {page.actions.map((action) => <div key={action} className="oos-card-muted rounded-2xl p-4 text-sm font-medium">{action}</div>)}
          </section>
        ) : null}
      </div>
    </main>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="oos-card rounded-[1.75rem] p-5">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <p className="mt-2 break-words text-xl font-semibold">{value}</p>
    </article>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value || 0);
}
