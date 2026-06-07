"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../auth-context";
import {
  createSupabaseAuthClient,
  getDataSetupMessage,
  isSupabaseConfigured,
  type AdvisorRow,
  type AdvisorPropertyRow,
  type PropertyMediaRow
} from "@/lib/supabase/client";
import {
  deedStatusOptions,
  listingTypeOptions,
  parkingTypeOptions,
  propertyTypeOptions,
  roomCountOptions
} from "@/lib/oos/property-fields";
import {
  buildPropertyFilterChips,
  createPropertyFilterItem,
  defaultPropertyFilters,
  filterPropertyRows,
  getUniquePropertyOptions,
  hasActivePropertyFilters,
  propertyFiltersFromSearchParams,
  propertyFiltersToSearchParams,
  type PropertyFilterState
} from "@/lib/oos/property-filters";
import { PropertyListingCard } from "../property-listing-card";

export default function AllPortfoliosPage() {
  const { user } = useAuthContext();
  const supabase = useMemo(() => createSupabaseAuthClient(), []);
  const [items, setItems] = useState<AdvisorPropertyRow[]>([]);
  const [advisors, setAdvisors] = useState<AdvisorRow[]>([]);
  const [mediaByProperty, setMediaByProperty] = useState<Record<string, PropertyMediaRow[]>>({});
  const [filters, setFilters] = useState<PropertyFilterState>(defaultPropertyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [urlReady, setUrlReady] = useState(false);
  const [message, setMessage] = useState("");
  const [mediaMessage, setMediaMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const persistentMode = Boolean(isSupabaseConfigured && user && supabase);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setFilters(propertyFiltersFromSearchParams(new URLSearchParams(window.location.search)));
    setUrlReady(true);
  }, []);

  useEffect(() => {
    if (!urlReady || typeof window === "undefined") return;
    const searchParams = propertyFiltersToSearchParams(filters);
    const nextUrl = searchParams.toString()
      ? `${window.location.pathname}?${searchParams.toString()}`
      : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  }, [filters, urlReady]);

  useEffect(() => {
    if (!persistentMode || !supabase) return;

    setLoading(true);
    setMessage("");
    Promise.all([supabase.getProperties(), supabase.getAdvisors()])
      .then(async ([rows, advisorRows]: [AdvisorPropertyRow[], AdvisorRow[]]) => {
        setItems(rows);
        setAdvisors(advisorRows);
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

  const advisorNamesById = useMemo(
    () => Object.fromEntries(advisors.map((advisor) => [
      advisor.id,
      advisor.profile?.full_name || advisor.title || advisor.advisor_code || advisor.profile?.email || advisor.id
    ])),
    [advisors]
  );
  const filterItems = useMemo(
    () => items.map((item) => createPropertyFilterItem(item, mediaByProperty[item.id] ?? [], item.advisor_id ? advisorNamesById[item.advisor_id] : undefined)),
    [advisorNamesById, items, mediaByProperty]
  );
  const cityOptions = useMemo(() => getUniquePropertyOptions(filterItems, "city"), [filterItems]);
  const districtOptions = useMemo(
    () => getUniquePropertyOptions(
      filterItems.filter((item) => !filters.city || item.city === filters.city),
      "district"
    ),
    [filterItems, filters.city]
  );
  const optionGroup = useMemo(() => ({
    currency: getUniquePropertyOptions(filterItems, "currency"),
    deedStatus: [...new Set([...deedStatusOptions, ...getUniquePropertyOptions(filterItems, "deedStatus")])],
    listingType: [...new Set([...listingTypeOptions, ...getUniquePropertyOptions(filterItems, "listingType")])],
    parkingType: [...new Set([...parkingTypeOptions, ...getUniquePropertyOptions(filterItems, "parkingType")])],
    propertyType: [...new Set([...propertyTypeOptions, ...getUniquePropertyOptions(filterItems, "propertyType")])],
    roomCount: [...new Set([...roomCountOptions, ...getUniquePropertyOptions(filterItems, "roomCount")])],
    status: getUniquePropertyOptions(filterItems, "status")
  }), [filterItems]);
  const advisorOptions = useMemo(
    () => advisors.map((advisor) => ({
      value: advisor.id,
      label: advisorNamesById[advisor.id] || advisor.id
    })),
    [advisorNamesById, advisors]
  );
  const filteredItems = useMemo(
    () => filterPropertyRows(items, filters, mediaByProperty, advisorNamesById),
    [advisorNamesById, filters, items, mediaByProperty]
  );
  const activeChips = useMemo(
    () => buildPropertyFilterChips(filters, advisorOptions.find((advisor) => advisor.value === filters.advisor)?.label),
    [advisorOptions, filters]
  );
  const filtersActive = hasActivePropertyFilters(filters);

  function updateFilter<K extends keyof PropertyFilterState>(key: K, value: PropertyFilterState[K]) {
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === "city" ? { district: "" } : {})
    }));
  }

  function clearFilters() {
    setFilters(defaultPropertyFilters);
  }

  function removeChip(key: keyof PropertyFilterState) {
    setFilters((current) => ({
      ...current,
      [key]: defaultPropertyFilters[key],
      ...(key === "city" ? { district: "" } : {})
    }));
  }

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
              <p className="text-sm text-slate-500 dark:text-slate-400">Sonuç</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">{filteredItems.length} portföy bulundu</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-[minmax(260px,1fr)_auto_auto]">
              <input
                className="input"
                placeholder="Portföy ara"
                value={filters.query}
                onChange={(event) => updateFilter("query", event.target.value)}
              />
              <button className="btn-secondary" type="button" onClick={() => setFiltersOpen((current) => !current)}>
                Filtreler
              </button>
              <button className="btn-secondary" type="button" onClick={clearFilters}>
                Temizle
              </button>
            </div>
          </div>
          {activeChips.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeChips.map((chip) => (
                <button
                  key={`${chip.key}-${chip.label}`}
                  className="rounded-full border border-slate-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:border-white/20"
                  type="button"
                  onClick={() => removeChip(chip.key)}
                >
                  {chip.label} ×
                </button>
              ))}
            </div>
          ) : null}
          <div className={`${filtersOpen || filtersActive ? "grid" : "hidden"} mt-4 gap-3 md:grid-cols-3 xl:grid-cols-4`}>
            <FilterSelect label="İl" value={filters.city} onChange={(value) => updateFilter("city", value)} options={cityOptions} emptyLabel="Tüm iller" />
            <FilterSelect label="İlçe" value={filters.district} onChange={(value) => updateFilter("district", value)} options={districtOptions} emptyLabel="Tüm ilçeler" />
            <FilterInput label="Lokasyon / mahalle" value={filters.neighborhood} onChange={(value) => updateFilter("neighborhood", value)} placeholder="Mahalle veya adres" />
            <FilterInput label="Fiyat min" value={filters.minPrice} onChange={(value) => updateFilter("minPrice", value)} inputMode="numeric" />
            <FilterInput label="Fiyat max" value={filters.maxPrice} onChange={(value) => updateFilter("maxPrice", value)} inputMode="numeric" />
            <FilterSelect label="Para birimi" value={filters.currency} onChange={(value) => updateFilter("currency", value)} options={optionGroup.currency} emptyLabel="Tümü" />
            <FilterSelect label="İlan tipi" value={filters.listingType} onChange={(value) => updateFilter("listingType", value)} options={optionGroup.listingType} emptyLabel="Tümü" />
            <FilterSelect label="Gayrimenkul tipi" value={filters.propertyType} onChange={(value) => updateFilter("propertyType", value)} options={optionGroup.propertyType} emptyLabel="Tümü" />
            <FilterSelect label="Oda sayısı" value={filters.roomCount} onChange={(value) => updateFilter("roomCount", value)} options={optionGroup.roomCount} emptyLabel="Tümü" />
            <FilterInput label="m² min" value={filters.minArea} onChange={(value) => updateFilter("minArea", value)} inputMode="numeric" />
            <FilterInput label="m² max" value={filters.maxArea} onChange={(value) => updateFilter("maxArea", value)} inputMode="numeric" />
            <FilterSelect label="Alan modu" value={filters.areaMode} onChange={(value) => updateFilter("areaMode", value as PropertyFilterState["areaMode"])} options={[
              { value: "fallback", label: "Net / brüt" },
              { value: "net_area", label: "Net m²" },
              { value: "gross_area", label: "Brüt m²" }
            ]} emptyLabel="" />
            <FilterSelect label="Danışman" value={filters.advisor} onChange={(value) => updateFilter("advisor", value)} options={advisorOptions} emptyLabel="Tümü" />
            <FilterSelect label="Durum" value={filters.status} onChange={(value) => updateFilter("status", value)} options={optionGroup.status} emptyLabel="Tümü" />
            <FilterSelect label="Fotoğraf" value={filters.photos} onChange={(value) => updateFilter("photos", value as PropertyFilterState["photos"])} options={[
              { value: "with", label: "Fotoğrafı olanlar" },
              { value: "without", label: "Fotoğrafsız" }
            ]} emptyLabel="Tümü" />
            <FilterSelect label="Harita konumu" value={filters.coordinates} onChange={(value) => updateFilter("coordinates", value as PropertyFilterState["coordinates"])} options={[
              { value: "with", label: "Harita konumu olanlar" },
              { value: "missing", label: "Konumu eksik" }
            ]} emptyLabel="Tümü" />
            <FilterSelect label="Site içi" value={filters.inSite} onChange={(value) => updateFilter("inSite", value as PropertyFilterState["inSite"])} options={[
              { value: "yes", label: "Evet" },
              { value: "no", label: "Hayır" }
            ]} emptyLabel="Tümü" />
            <FilterSelect label="Otopark" value={filters.parkingType} onChange={(value) => updateFilter("parkingType", value)} options={optionGroup.parkingType} emptyLabel="Tümü" />
            <FilterSelect label="Asansör" value={filters.hasElevator} onChange={(value) => updateFilter("hasElevator", value as PropertyFilterState["hasElevator"])} options={[
              { value: "yes", label: "Var" },
              { value: "no", label: "Yok" }
            ]} emptyLabel="Tümü" />
            <FilterSelect label="Tapu durumu" value={filters.deedStatus} onChange={(value) => updateFilter("deedStatus", value)} options={optionGroup.deedStatus} emptyLabel="Tümü" />
            <FilterSelect label="Takas" value={filters.exchangeAvailable} onChange={(value) => updateFilter("exchangeAvailable", value as PropertyFilterState["exchangeAvailable"])} options={[
              { value: "yes", label: "Var" },
              { value: "no", label: "Yok" }
            ]} emptyLabel="Tümü" />
            <FilterSelect label="Eksik bilgi" value={filters.technicalCompleteness} onChange={(value) => updateFilter("technicalCompleteness", value as PropertyFilterState["technicalCompleteness"])} options={[
              { value: "missing", label: "Eksik teknik bilgi" }
            ]} emptyLabel="Tümü" />
            <FilterSelect label="Sıralama" value={filters.sort} onChange={(value) => updateFilter("sort", value as PropertyFilterState["sort"])} options={[
              { value: "newest", label: "Yeni eklenen" },
              { value: "price_asc", label: "Fiyat artan" },
              { value: "price_desc", label: "Fiyat azalan" },
              { value: "area_asc", label: "m² artan" },
              { value: "area_desc", label: "m² azalan" }
            ]} emptyLabel="" />
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
              {filtersActive ? "Bu filtrelerle eşleşen portföy bulunamadı." : "Office-wide görünür portföy bulunamadı."}
            </article>
          )}
        </section>
      </div>
    </main>
  );
}

function FilterInput({
  inputMode,
  label,
  onChange,
  placeholder,
  value
}: {
  inputMode?: "numeric" | "text";
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <input
        className="input"
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function FilterSelect({
  emptyLabel,
  label,
  onChange,
  options,
  value
}: {
  emptyLabel: string;
  label: string;
  onChange: (value: string) => void;
  options: Array<string | { value: string; label: string }>;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <select className="input" value={value} onChange={(event) => onChange(event.target.value)}>
        {emptyLabel ? <option value="">{emptyLabel}</option> : null}
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const label = typeof option === "string" ? option : option.label;
          return <option key={`${value}-${label}`} value={value}>{label}</option>;
        })}
      </select>
    </label>
  );
}
