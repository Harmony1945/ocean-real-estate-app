"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../auth-context";
import {
  createSupabaseAuthClient,
  getDataSetupMessage,
  type AdvisorPropertyRow,
  type PropertyMediaRow
} from "@/lib/supabase/client";
import { DEMO_PROPERTY_IMAGE, formatPropertyLocation, formatPropertyPrice } from "@/app/property-listing-card";
import { formatStatusLabel, getStatusPillClass } from "@/lib/oos/status-labels";

type PropertyTab = "Genel Bilgiler" | "Konum" | "Özellikler" | "Medya" | "Operasyon";

const tabs: PropertyTab[] = ["Genel Bilgiler", "Konum", "Özellikler", "Medya", "Operasyon"];

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const supabase = useMemo(() => createSupabaseAuthClient(), []);
  const [property, setProperty] = useState<AdvisorPropertyRow | null>(null);
  const [media, setMedia] = useState<PropertyMediaRow[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<PropertyTab>("Genel Bilgiler");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const propertyId = params?.id || "";

  useEffect(() => {
    if (!user || !supabase || !propertyId) {
      setLoading(false);
      setMessage("Portföy bulunamadı. Bu portföye erişim yetkiniz olmayabilir.");
      return;
    }

    let mounted = true;
    setLoading(true);
    setMessage("");

    Promise.all([
      supabase.getProperty(propertyId),
      supabase.getPropertyMedia(propertyId).catch(() => [])
    ])
      .then(([propertyRow, mediaRows]: [AdvisorPropertyRow | null, PropertyMediaRow[]]) => {
        if (!mounted) return;
        setProperty(propertyRow);
        setMedia(mediaRows);
        if (!propertyRow) {
          setMessage("Portföy bulunamadı. Bu portföye erişim yetkiniz olmayabilir.");
        }
      })
      .catch((error: Error) => {
        if (!mounted) return;
        console.error(error);
        setProperty(null);
        setMedia([]);
        setMessage(getDataSetupMessage(error.message) || "Portföy bulunamadı. Bu portföye erişim yetkiniz olmayabilir.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [propertyId, supabase, user]);

  const orderedMedia = useMemo(() => {
    return [...media].sort((a, b) => {
      if (a.is_cover && !b.is_cover) return -1;
      if (!a.is_cover && b.is_cover) return 1;
      return Number(a.sort_order || 0) - Number(b.sort_order || 0);
    });
  }, [media]);
  const activePhoto = orderedMedia[activePhotoIndex] ?? orderedMedia[0] ?? null;

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-6 text-slate-950 dark:bg-black dark:text-neutral-50 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-[#080808] dark:text-slate-400">
            Portföy yükleniyor...
          </p>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-6 text-slate-950 dark:bg-black dark:text-neutral-50 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="mini-action">Dashboard’a Dön</Link>
          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#080808]">
            <h1 className="text-2xl font-semibold tracking-tight">Portföy bulunamadı</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {message || "Bu portföye erişim yetkiniz olmayabilir."}
            </p>
          </section>
        </div>
      </main>
    );
  }

  const location = formatPropertyLocation(property);
  const area = property.gross_area || property.net_area;

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-5 pb-[calc(env(safe-area-inset-bottom)+7rem)] text-slate-950 dark:bg-black dark:text-neutral-50 sm:px-6 md:pb-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="mini-action w-fit">Dashboard’a Dön</Link>
          <p className="text-sm text-slate-500 dark:text-slate-400">OceanOS portföy detayı</p>
        </header>

        <section className="mt-6">
          <PropertyGallery
            media={orderedMedia}
            activePhoto={activePhoto}
            activePhotoIndex={activePhotoIndex}
            propertyTitle={property.title}
            onSelectPhoto={setActivePhotoIndex}
          />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusPillClass(property.status || "")}`}>
              {formatStatusLabel(property.status || "Durum bekleniyor")}
            </span>
            <h1 className="mt-4 break-words text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-5xl">
              {property.title || "İsimsiz portföy"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {location || "Konum bilgisi bekleniyor"}
            </p>
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#080808]">
            <p className="text-sm text-slate-500 dark:text-slate-400">Fiyat</p>
            <p className="mt-2 break-words text-3xl font-semibold tracking-tight">
              {formatPropertyPrice(property.asking_price, property.currency)}
            </p>
            <div className="mt-5 grid gap-3">
              <DetailLine label="Tip" value={property.property_type || "Belirtilmedi"} />
              <DetailLine label="Kullanım" value={property.usage_type || "Belirtilmedi"} />
              <DetailLine label="Alan" value={area ? `${area} m²` : "Belirtilmedi"} />
              <DetailLine label="Görünürlük" value={property.is_public ? "Office-wide görünür" : "İç kullanım"} />
            </div>
          </aside>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#080808] sm:p-5">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium transition ${
                  activeTab === tab
                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/[0.1]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <PropertyTabContent property={property} mediaCount={orderedMedia.length} activeTab={activeTab} />
        </section>
      </div>
    </main>
  );
}

function PropertyGallery({
  activePhoto,
  activePhotoIndex,
  media,
  propertyTitle,
  onSelectPhoto
}: {
  activePhoto: PropertyMediaRow | null;
  activePhotoIndex: number;
  media: PropertyMediaRow[];
  propertyTitle: string;
  onSelectPhoto: (index: number) => void;
}) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const galleryItems = media.length ? media : [];
  const activeUrl = activePhoto?.signed_url || DEMO_PROPERTY_IMAGE;
  const hasMultiplePhotos = galleryItems.length > 1;
  const visibleCount = galleryItems.length || 1;

  function showPrevious() {
    if (!hasMultiplePhotos) return;
    onSelectPhoto(activePhotoIndex === 0 ? galleryItems.length - 1 : activePhotoIndex - 1);
  }

  function showNext() {
    if (!hasMultiplePhotos) return;
    onSelectPhoto(activePhotoIndex === galleryItems.length - 1 ? 0 : activePhotoIndex + 1);
  }

  if (!media.length) {
    return (
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white dark:border-white/10 dark:bg-[#080808]">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={DEMO_PROPERTY_IMAGE}
            alt={`${propertyTitle} örnek fotoğrafı`}
            className="h-[320px] w-full object-cover sm:h-[520px]"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <span className="rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              Örnek görsel
            </span>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/85">
              Bu portföy için gerçek fotoğraf yüklendiğinde galeri otomatik olarak güvenli medya kayıtlarını gösterir.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white dark:border-white/10 dark:bg-[#080808]">
      <div className="relative">
        {activeUrl && !failedImages[activePhoto?.id || ""] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeUrl}
            alt={activePhoto?.file_name || propertyTitle}
            className="h-[320px] w-full object-cover sm:h-[520px]"
            onError={() => activePhoto && setFailedImages((current) => ({ ...current, [activePhoto.id]: true }))}
          />
        ) : (
          <div className="grid h-[320px] place-items-center bg-slate-100 px-4 text-center text-sm text-slate-500 dark:bg-white/[0.06] dark:text-slate-400 sm:h-[520px]">
            Fotoğraf önizlemesi hazırlanamadı.
          </div>
        )}

        <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {activePhotoIndex + 1}/{Math.min(visibleCount, 12)} Fotoğraf
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

        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
          {galleryItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`${index + 1}. fotoğrafı göster`}
              onClick={() => onSelectPhoto(index)}
              className={`h-1.5 rounded-full transition ${
                index === activePhotoIndex ? "w-7 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PropertyTabContent({
  activeTab,
  mediaCount,
  property
}: {
  activeTab: PropertyTab;
  mediaCount: number;
  property: AdvisorPropertyRow;
}) {
  const location = formatPropertyLocation(property);

  if (activeTab === "Konum") {
    return (
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <DetailLine label="Şehir" value={property.city || "Belirtilmedi"} />
        <DetailLine label="İlçe" value={property.district || "Belirtilmedi"} />
        <DetailLine label="Mahalle" value={property.neighborhood || "Belirtilmedi"} />
      </div>
    );
  }

  if (activeTab === "Özellikler") {
    return (
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <DetailLine label="Mülk tipi" value={property.property_type || "Belirtilmedi"} />
        <DetailLine label="Brüt alan" value={property.gross_area ? `${property.gross_area} m²` : "Belirtilmedi"} />
        <DetailLine label="Net alan" value={property.net_area ? `${property.net_area} m²` : "Belirtilmedi"} />
      </div>
    );
  }

  if (activeTab === "Medya") {
    return (
      <div className="mt-5 rounded-2xl border border-slate-200 bg-stone-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
        {mediaCount ? `${mediaCount} fotoğraf güvenli galeri üzerinden görüntüleniyor.` : "Bu portföy için henüz fotoğraf yüklenmedi."}
      </div>
    );
  }

  if (activeTab === "Operasyon") {
    return (
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <DetailLine label="Danışman ID" value={property.advisor_id || "Atama bekleniyor"} />
        <DetailLine label="Oluşturma" value={formatDate(property.created_at)} />
        <DetailLine label="Güncelleme" value={formatDate(property.updated_at)} />
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <DetailLine label="Başlık" value={property.title || "Belirtilmedi"} />
      <DetailLine label="Lokasyon" value={location || "Belirtilmedi"} />
      <DetailLine label="Fiyat" value={formatPropertyPrice(property.asking_price, property.currency)} />
      <DetailLine label="Durum" value={formatStatusLabel(property.status || "Belirtilmedi")} />
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-medium text-slate-950 dark:text-slate-100">{value}</p>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "Tarih yok";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tarih yok";
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(date);
}
