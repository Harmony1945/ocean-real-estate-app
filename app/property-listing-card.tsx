"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import type { AdvisorPropertyRow, PropertyMediaRow } from "@/lib/supabase/client";
import { formatStatusLabel, getStatusPillClass } from "@/lib/oos/status-labels";

export const DEMO_PROPERTY_IMAGE = "/mandarin-2.jpeg";

type PropertyListingCardProps = {
  property: AdvisorPropertyRow;
  media?: PropertyMediaRow[];
  demo?: boolean;
  actions?: ReactNode;
};

export function PropertyListingCard({ actions, demo = false, media = [], property }: PropertyListingCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const orderedMedia = [...media].sort((a, b) => {
    if (a.is_cover && !b.is_cover) return -1;
    if (!a.is_cover && b.is_cover) return 1;
    return Number(a.sort_order || 0) - Number(b.sort_order || 0);
  });
  const cover = orderedMedia[0];
  const imageUrl = cover?.signed_url || (demo || !cover ? DEMO_PROPERTY_IMAGE : "");
  const location = formatPropertyLocation(property);
  const area = property.gross_area || property.net_area;
  const floor = [property.floor, property.total_floors].filter(Boolean).join(" / ");
  const photoCount = orderedMedia.length || (demo ? 1 : 0);

  return (
    <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white dark:border-white/10 dark:bg-[#080808]">
      <div className="relative bg-slate-100 dark:bg-white/[0.06]">
        {imageUrl && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={cover?.file_name || property.title || "Portföy fotoğrafı"}
            className="h-56 w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="grid h-56 place-items-center px-4 text-center text-sm text-slate-500 dark:text-slate-400">
            Fotoğraf önizlemesi hazırlanıyor
          </div>
        )}

        {photoCount ? (
          <div className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            1/{Math.min(photoCount, 12)} Fotoğraf
          </div>
        ) : null}
      </div>

      {photoCount > 1 ? (
        <div className="flex justify-center gap-1.5 px-4 pt-3">
          {orderedMedia.slice(0, 6).map((item, index) => (
            <span
              key={item.id}
              className={`h-1.5 rounded-full transition ${index === 0 ? "w-5 bg-slate-950 dark:bg-white" : "w-1.5 bg-slate-300 dark:bg-white/25"}`}
            />
          ))}
        </div>
      ) : null}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="break-words text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-100">
              {property.title || "İsimsiz portföy"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {location || "Konum bekleniyor"}
            </p>
          </div>
          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs ${getStatusPillClass(property.status || "")}`}>
            {formatStatusLabel(property.status || "Durum yok")}
          </span>
        </div>

        <p className="mt-4 break-words text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
          {formatPropertyPrice(property.asking_price, property.currency)}
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <CardSpec label="İlan" value={property.listing_type || property.usage_type || "Belirtilmedi"} />
          <CardSpec label="Tip" value={property.property_type || "Belirtilmedi"} />
          <CardSpec label="Oda / Alan" value={[property.room_count, area ? `${area} m²` : ""].filter(Boolean).join(" · ") || "Belirtilmedi"} />
          <CardSpec label="Kat" value={floor || "Belirtilmedi"} />
          <CardSpec label="Isıtma" value={property.heating_type || "Belirtilmedi"} />
          <CardSpec label="Otopark" value={property.parking_type || "Belirtilmedi"} />
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {actions}
          {!demo ? <Link href={`/properties/${property.id}`} className="mini-action">Aç</Link> : null}
        </div>
      </div>
    </article>
  );
}

function CardSpec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-3 dark:bg-white/[0.04]">
      <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-950 dark:text-slate-100">{value}</p>
    </div>
  );
}

export function formatPropertyLocation(property: AdvisorPropertyRow) {
  return [property.city, property.district, property.neighborhood].filter(Boolean).join(" / ");
}

export function formatPropertyPrice(value: number | null, currency: string | null) {
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
