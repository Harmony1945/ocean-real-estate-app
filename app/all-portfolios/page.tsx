"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../auth-context";
import {
  createSupabaseAuthClient,
  getDataSetupMessage,
  isSupabaseConfigured,
  type AdvisorPropertyRow
} from "@/lib/supabase/client";
import { formatStatusLabel, getStatusPillClass } from "@/lib/oos/status-labels";

export default function AllPortfoliosPage() {
  const { user } = useAuthContext();
  const supabase = useMemo(() => createSupabaseAuthClient(), []);
  const [items, setItems] = useState<AdvisorPropertyRow[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const persistentMode = Boolean(isSupabaseConfigured && user && supabase);

  useEffect(() => {
    if (!persistentMode || !supabase) return;

    setLoading(true);
    setMessage("");
    supabase.getProperties()
      .then((rows: AdvisorPropertyRow[]) => setItems(rows))
      .catch((error: Error) => {
        console.error(error);
        setItems([]);
        setMessage(getDataSetupMessage(error.message));
      })
      .finally(() => setLoading(false));
  }, [persistentMode, supabase]);

  const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
  const filteredItems = items.filter((item) => {
    if (!normalizedQuery) return true;
    return [
      item.title,
      item.city,
      item.district,
      item.neighborhood,
      item.property_type,
      item.status
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("tr-TR")
      .includes(normalizedQuery);
  });

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-5 pb-[calc(env(safe-area-inset-bottom)+7rem)] text-slate-950 dark:bg-black dark:text-neutral-50 sm:px-6 md:pb-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-slate-200 pb-6 dark:border-white/10">
          <Link href="/" className="mini-action">Dashboard’a Dön</Link>
          <p className="mt-7 text-sm font-medium text-slate-500 dark:text-slate-400">Office-wide portföy envanteri</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-5xl">
            Tüm Portföyler
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Ocean içi görünür portföyleri arayın, filtreleyin ve her portföyün detay sayfasını açın.
          </p>
        </header>

        {message ? (
          <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
            {message}
          </p>
        ) : null}

        {!isSupabaseConfigured ? (
          <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
            {getDataSetupMessage()}
          </p>
        ) : null}

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#080808]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Portföy sayısı</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">{filteredItems.length}</p>
            </div>
            <input
              className="input sm:max-w-sm"
              placeholder="Başlık, ilçe veya tip ara"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </section>

        {loading ? (
          <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">Portföyler yükleniyor...</p>
        ) : null}

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {filteredItems.length ? filteredItems.map((item) => (
            <article key={item.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#080808]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="break-words text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-100">
                    {item.title || "İsimsiz portföy"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {[item.city, item.district, item.neighborhood].filter(Boolean).join(" / ") || "Konum bekleniyor"}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs ${getStatusPillClass(item.status || "")}`}>
                  {formatStatusLabel(item.status || "Durum yok")}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Info label="Tip" value={item.property_type || "Belirtilmedi"} />
                <Info label="Fiyat" value={formatPropertyPrice(item.asking_price, item.currency)} />
                <Info label="Alan" value={item.gross_area || item.net_area ? `${item.gross_area || item.net_area} m²` : "Belirtilmedi"} />
              </div>
              <div className="mt-4 flex justify-end">
                <Link href={`/properties/${item.id}`} className="mini-action">Aç</Link>
              </div>
            </article>
          )) : (
            <article className="rounded-[2rem] border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400 md:col-span-2">
              Office-wide görünür portföy bulunamadı.
            </article>
          )}
        </section>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-3 dark:bg-white/[0.04]">
      <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-950 dark:text-slate-100">{value}</p>
    </div>
  );
}

function formatPropertyPrice(value: number | null, currency: string | null) {
  if (!value) return "Fiyat bekleniyor";
  const normalizedCurrency = currency || "TRY";
  if (normalizedCurrency === "TRY") {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0
    }).format(value);
  }

  return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value)} ${normalizedCurrency}`;
}
