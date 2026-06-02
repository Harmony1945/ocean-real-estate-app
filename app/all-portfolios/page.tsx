"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../auth-context";
import {
  createSupabaseAuthClient,
  getDataSetupMessage,
  isSupabaseConfigured,
  type AdvisorPropertyRow,
  type PropertyMediaRow
} from "@/lib/supabase/client";
import { PropertyListingCard } from "../property-listing-card";

export default function AllPortfoliosPage() {
  const { user } = useAuthContext();
  const supabase = useMemo(() => createSupabaseAuthClient(), []);
  const [items, setItems] = useState<AdvisorPropertyRow[]>([]);
  const [mediaByProperty, setMediaByProperty] = useState<Record<string, PropertyMediaRow[]>>({});
  const [query, setQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [message, setMessage] = useState("");
  const [mediaMessage, setMediaMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const persistentMode = Boolean(isSupabaseConfigured && user && supabase);

  useEffect(() => {
    if (!persistentMode || !supabase) return;

    setLoading(true);
    setMessage("");
    supabase.getProperties()
      .then(async (rows: AdvisorPropertyRow[]) => {
        setItems(rows);
        const mediaEntries = await Promise.all(
          rows.map(async (row) => [
            row.id,
            await supabase.getPropertyMedia(row.id).catch(() => {
              setMediaMessage("Bazı portföy fotoğrafları şu anda yüklenemedi.");
              return [];
            })
          ] as const)
        );
        setMediaByProperty(Object.fromEntries(mediaEntries));
      })
      .catch((error: Error) => {
        console.error(error);
        setItems([]);
        setMessage(getDataSetupMessage(error.message));
      })
      .finally(() => setLoading(false));
  }, [persistentMode, supabase]);

  const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
  const cityOptions = useMemo(
    () => [...new Set(items.map((item) => item.city).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, "tr")),
    [items]
  );
  const districtOptions = useMemo(
    () => [...new Set(items
      .filter((item) => !cityFilter || item.city === cityFilter)
      .map((item) => item.district)
      .filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, "tr")),
    [cityFilter, items]
  );
  const filteredItems = items.filter((item) => {
    if (cityFilter && item.city !== cityFilter) return false;
    if (districtFilter && item.district !== districtFilter) return false;
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
          <p className="mt-7 text-sm font-medium text-slate-500 dark:text-slate-400">Ofis geneli portföy envanteri</p>
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
          <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">İl</span>
              <select
                className="input"
                value={cityFilter}
                onChange={(event) => {
                  setCityFilter(event.target.value);
                  setDistrictFilter("");
                }}
              >
                <option value="">Tüm iller</option>
                {cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">İlçe</span>
              <select
                className="input"
                value={districtFilter}
                onChange={(event) => setDistrictFilter(event.target.value)}
              >
                <option value="">Tüm ilçeler</option>
                {districtOptions.map((district) => <option key={district} value={district}>{district}</option>)}
              </select>
            </label>
            <button
              className="btn-secondary self-end"
              type="button"
              onClick={() => {
                setQuery("");
                setCityFilter("");
                setDistrictFilter("");
              }}
            >
              Temizle
            </button>
          </div>
        </section>

        {loading ? (
          <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">Portföyler yükleniyor...</p>
        ) : null}

        {mediaMessage ? (
          <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
            {mediaMessage}
          </p>
        ) : null}

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {filteredItems.length ? filteredItems.map((item) => (
            <PropertyListingCard
              key={item.id}
              property={item}
              media={mediaByProperty[item.id] ?? []}
            />
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
