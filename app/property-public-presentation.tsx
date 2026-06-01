"use client";

import { useEffect, useState } from "react";
import type { PropertySharePayload } from "@/lib/supabase/client";
import { DEMO_PROPERTY_IMAGE } from "./property-listing-card";
import { formatStatusLabel } from "@/lib/oos/status-labels";
import { booleanToText, formatDuesAmount } from "@/lib/oos/property-fields";

type PropertyPublicPresentationProps = {
  payload: PropertySharePayload;
  printMode?: boolean;
};

export default function PropertyPublicPresentation({ payload, printMode = false }: PropertyPublicPresentationProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const photoCount = Math.max(payload.photo_count || 1, 1);
  const hasMultiplePhotos = !printMode && photoCount > 1;
  const location = [payload.city, payload.district, payload.neighborhood].filter(Boolean).join(" / ");
  const publicSpecs = getPublicSpecs(payload);

  useEffect(() => {
    if (printMode) {
      const timer = window.setTimeout(() => window.print(), 500);
      return () => window.clearTimeout(timer);
    }
  }, [printMode]);

  function showPrevious() {
    if (!hasMultiplePhotos) return;
    setActivePhotoIndex((current) => (current === 0 ? photoCount - 1 : current - 1));
  }

  function showNext() {
    if (!hasMultiplePhotos) return;
    setActivePhotoIndex((current) => (current === photoCount - 1 ? 0 : current + 1));
  }

  return (
    <main className={`${printMode ? "bg-white text-slate-950" : "min-h-screen bg-stone-50 text-slate-950 dark:bg-black dark:text-neutral-50"} px-4 py-6 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between border-b border-slate-200 pb-5 dark:border-white/10">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ocean Real Estate</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">{payload.title}</h1>
          </div>
          {printMode ? null : (
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
              Güvenli paylaşım
            </span>
          )}
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white dark:border-white/10 dark:bg-[#080808]">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={DEMO_PROPERTY_IMAGE}
                alt={`${payload.title} fotoğrafı`}
                className={`${printMode ? "h-[360px]" : "h-[320px] sm:h-[520px]"} w-full object-cover`}
              />
              <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                {activePhotoIndex + 1}/{Math.min(photoCount, 12)} Fotoğraf
              </div>
              {hasMultiplePhotos ? (
                <>
                  <button
                    type="button"
                    aria-label="Önceki fotoğraf"
                    onClick={showPrevious}
                    className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-xl text-white backdrop-blur transition hover:bg-black/60"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    aria-label="Sonraki fotoğraf"
                    onClick={showNext}
                    className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-xl text-white backdrop-blur transition hover:bg-black/60"
                  >
                    ›
                  </button>
                </>
              ) : null}
              {!printMode ? (
                <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
                  {Array.from({ length: Math.min(photoCount, 12) }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      aria-label={`${index + 1}. fotoğrafı göster`}
                      onClick={() => setActivePhotoIndex(index)}
                      className={`h-1.5 rounded-full transition ${
                        index === activePhotoIndex ? "w-7 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#080808]">
            <p className="text-sm text-slate-500 dark:text-slate-400">Fiyat</p>
            <p className="mt-2 break-words text-3xl font-semibold tracking-tight">
              {formatSharePrice(payload.price, payload.currency)}
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {location || "Konum bilgisi paylaşılmadı"}
            </p>
            <div className="mt-5 grid gap-3">
              {publicSpecs.map((spec) => (
                <Spec key={spec.label} label={spec.label} value={spec.value} />
              ))}
            </div>
          </aside>
        </section>

        {(payload.advisor_name || payload.advisor_phone || payload.advisor_email) ? (
          <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#080808]">
            <p className="text-sm font-semibold">Danışman</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Spec label="Ad Soyad" value={payload.advisor_name || "Ocean Real Estate"} />
              <Spec label="Telefon" value={payload.advisor_phone || "Paylaşılmadı"} />
              <Spec label="E-posta" value={payload.advisor_email || "Paylaşılmadı"} />
            </div>
          </section>
        ) : null}

        <footer className="mt-8 border-t border-slate-200 pt-5 text-center text-xs leading-5 text-slate-400 dark:border-white/10 dark:text-slate-600">
          Ocean Real Estate tarafından hazırlanmıştır. Bu çıktı bilgilendirme amaçlıdır; nihai portföy teyidi danışman tarafından yapılır.
        </footer>
      </div>
    </main>
  );
}

function getPublicSpecs(payload: PropertySharePayload) {
  return [
    { label: "İlan Tipi", value: payload.listing_type || "" },
    { label: "Gayrimenkul Tipi", value: payload.property_type || "" },
    { label: "Oda Sayısı", value: payload.room_count || "" },
    { label: "Brüt alan", value: payload.gross_area ? `${payload.gross_area} m²` : "" },
    { label: "Net alan", value: payload.net_area ? `${payload.net_area} m²` : "" },
    { label: "Kat", value: [payload.floor, payload.total_floors].filter(Boolean).join(" / ") },
    { label: "Isıtma", value: payload.heating_type || "" },
    { label: "Banyo", value: payload.bathroom_count || "" },
    { label: "Otopark", value: payload.parking_type || "" },
    { label: "Asansör", value: booleanToText(payload.has_elevator) },
    { label: "Site İçi", value: booleanToText(payload.in_site, "Evet", "Hayır") },
    { label: "Aidat", value: formatDuesAmount(payload.dues_amount) },
    { label: "Tapu", value: payload.deed_status || "" },
    { label: "Durum", value: formatStatusLabel(payload.status || "Belirtilmedi") }
  ].filter((spec) => spec.value && spec.value !== "Belirtilmedi");
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-3 dark:bg-white/[0.04]">
      <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-950 dark:text-slate-100">{value}</p>
    </div>
  );
}

function formatSharePrice(value: number | null, currency: string | null) {
  if (!value) return "Fiyat için iletişime geçin";
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
