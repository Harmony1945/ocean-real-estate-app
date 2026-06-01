"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuthContext } from "../../auth-context";
import {
  createSupabaseAuthClient,
  getDataSetupMessage,
  getShareLinkSetupMessage,
  type AdvisorPropertyRow,
  type PropertyMediaRow,
  type PropertyShareLinkRow,
  type PropertySharePayload
} from "@/lib/supabase/client";
import { DEMO_PROPERTY_IMAGE, formatPropertyLocation, formatPropertyPrice } from "@/app/property-listing-card";
import { formatStatusLabel, getStatusPillClass } from "@/lib/oos/status-labels";
import { booleanToText, formatDuesAmount, formatSquareMeters } from "@/lib/oos/property-fields";

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
  const [shareLink, setShareLink] = useState<PropertyShareLinkRow | null>(null);
  const [shareMessage, setShareMessage] = useState("");
  const [manualShareUrl, setManualShareUrl] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
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
      supabase.getPropertyMedia(propertyId).catch(() => []),
      supabase.getActivePropertyShareLink(propertyId).catch(() => null)
    ])
      .then(([propertyRow, mediaRows, activeShareLink]: [AdvisorPropertyRow | null, PropertyMediaRow[], PropertyShareLinkRow | null]) => {
        if (!mounted) return;
        setProperty(propertyRow);
        setMedia(mediaRows);
        setShareLink(activeShareLink);
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

  const shareUrl = shareLink
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${shareLink.token}`
    : "";

  async function createOrCopyShareLink() {
    if (!property || !supabase) return;
    setShareLoading(true);
    setShareMessage("");
    setManualShareUrl("");

    try {
      const activeShareLink =
        shareLink || (await supabase.createPropertyShareLink(property.id, toPublicSharePayload(property, orderedMedia.length)));
      if (activeShareLink) {
        setShareLink(activeShareLink);
        const url = `${window.location.origin}/share/${activeShareLink.token}`;
        const result = await sharePropertyUrl(url, property.title);
        if (result === "shared") {
          setShareMessage("Paylaşım penceresi açıldı.");
          logPropertyActivity("property_share_copied", "Paylaşım linki paylaşıldı.", { delivery: "native_share" });
        } else if (result === "copied") {
          setShareMessage("Paylaşım linki kopyalandı.");
          logPropertyActivity("property_share_copied", "Paylaşım linki kopyalandı.", { delivery: "clipboard" });
        } else if (result === "manual") {
          setManualShareUrl(url);
          setShareMessage("Paylaşım linki hazır. Aşağıdan manuel kopyalayabilirsiniz.");
        } else if (result === "cancelled") {
          setShareMessage("Paylaşım iptal edildi.");
        }
      }
    } catch (error) {
      console.error(error);
      setShareMessage(error instanceof Error ? getShareLinkSetupMessage(error.message) : "Paylaşım linki oluşturulamadı.");
    } finally {
      setShareLoading(false);
    }
  }

  function logPropertyActivity(action: string, summary: string, metadata: Record<string, unknown> = {}) {
    if (!property || !supabase) return;

    void supabase.logActivity({
      action,
      entity_type: "property",
      entity_id: property.id,
      entity_title: property.title,
      summary,
      metadata
    });
  }

  async function disableShareLink() {
    if (!shareLink || !supabase) return;
    setShareLoading(true);
    setShareMessage("");

    try {
      await supabase.disablePropertyShareLink(shareLink.id);
      setShareLink(null);
      setShareMessage("Paylaşım kapatıldı.");
    } catch (error) {
      console.error(error);
      setShareMessage(error instanceof Error ? getShareLinkSetupMessage(error.message) : "Paylaşım kapatılamadı.");
    } finally {
      setShareLoading(false);
    }
  }

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
  const primaryDetails = getPrimaryPropertyDetails(property, location);
  const secondaryDetails = getSecondaryPropertyDetails(property);

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-5 pb-[calc(env(safe-area-inset-bottom)+7rem)] text-slate-950 dark:bg-black dark:text-neutral-50 sm:px-6 md:pb-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="mini-action w-fit">Dashboard’a Dön</Link>
          <p className="text-sm text-slate-500 dark:text-slate-400">OceanOS portföy detayı</p>
        </header>

        {shareMessage ? (
          <p className="mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-white/10 dark:bg-[#080808] dark:text-slate-300">
            {shareMessage}
          </p>
        ) : null}

        {manualShareUrl ? (
          <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#080808] sm:flex-row">
            <input className="input min-w-0 flex-1" readOnly value={manualShareUrl} aria-label="Paylaşım linki" />
            <button
              className="btn-secondary"
              type="button"
              onClick={async () => {
                const copied = await copyManualShareUrl(manualShareUrl, setShareMessage);
                if (copied) {
                  logPropertyActivity("property_share_copied", "Paylaşım linki kopyalandı.", { delivery: "manual_clipboard" });
                }
              }}
            >
              Linki Kopyala
            </button>
          </div>
        ) : null}

        <section className="mt-6">
          <PropertyGallery
            media={orderedMedia}
            activePhotoIndex={activePhotoIndex}
            propertyTitle={property.title}
            onSelectPhoto={setActivePhotoIndex}
            actions={
              <>
                <button
                  className="grid h-11 w-11 place-items-center rounded-full bg-black/45 text-white shadow-sm backdrop-blur transition hover:bg-black/65 disabled:opacity-50"
                  type="button"
                  disabled={shareLoading}
                  onClick={createOrCopyShareLink}
                  title="Paylaş"
                  aria-label="Paylaş"
                >
                  <ShareIcon />
                </button>
                <Link
                  href={`/properties/${property.id}/print`}
                  target="_blank"
                  className="grid h-11 min-w-11 place-items-center rounded-full bg-black/45 px-3 text-xs font-semibold text-white shadow-sm backdrop-blur transition hover:bg-black/65"
                  onClick={() => logPropertyActivity("property_pdf_exported", "PDF dışa aktarımı başlatıldı.")}
                  aria-label="PDF indir"
                  title="PDF indir"
                >
                  PDF
                </Link>
              </>
            }
          />
        </section>

        {shareLink ? (
          <div className="mt-3 flex justify-end">
            <button className="mini-action" type="button" disabled={shareLoading} onClick={disableShareLink}>
              Paylaşımı Kapat
            </button>
          </div>
        ) : null}

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
              {primaryDetails.slice(1).map((item) => (
                <DetailLine key={item.label} label={item.label} value={item.value} />
              ))}
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

          <PropertyTabContent
            property={property}
            mediaCount={orderedMedia.length}
            activeTab={activeTab}
            primaryDetails={primaryDetails}
            secondaryDetails={secondaryDetails}
          />
        </section>
      </div>
    </main>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M6 14v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}

async function sharePropertyUrl(url: string, propertyTitle?: string | null) {
  const shareData = {
    title: propertyTitle || "Ocean Real Estate portföyü",
    text: "Ocean Real Estate portföyünü inceleyebilirsiniz.",
    url
  };

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share(shareData);
      return "shared" as const;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled" as const;
      }
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return "copied" as const;
  }

  return "manual" as const;
}

async function copyManualShareUrl(url: string, setMessage: (message: string) => void) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    setMessage("Paylaşım linki kopyalandı.");
    return true;
  }

  setMessage("Paylaşım linki hazır. Link alanından manuel kopyalayabilirsiniz.");
  return false;
}

function toPublicSharePayload(property: AdvisorPropertyRow, photoCount: number): PropertySharePayload {
  return {
    title: property.title || "Ocean Real Estate portföyü",
    price: property.asking_price,
    currency: property.currency,
    city: property.city,
    district: property.district,
    neighborhood: property.neighborhood,
    listing_type: property.listing_type,
    property_type: property.property_type,
    usage_type: property.usage_type,
    room_count: property.room_count,
    gross_area: property.gross_area,
    net_area: property.net_area,
    building_age: property.building_age,
    floor: property.floor,
    total_floors: property.total_floors,
    heating_type: property.heating_type,
    bathroom_count: property.bathroom_count,
    balcony_count: property.balcony_count,
    parking_type: property.parking_type,
    has_elevator: property.has_elevator,
    in_site: property.in_site,
    dues_amount: property.dues_amount,
    deed_status: property.deed_status,
    exchange_available: property.exchange_available,
    status: property.status,
    photo_count: photoCount
  };
}

function PropertyGallery({
  activePhotoIndex,
  actions,
  media,
  propertyTitle,
  onSelectPhoto
}: {
  activePhotoIndex: number;
  actions?: ReactNode;
  media: PropertyMediaRow[];
  propertyTitle: string;
  onSelectPhoto: (index: number) => void;
}) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const galleryItems = media.length
    ? media
    : [{
        id: "demo-property-image",
        signed_url: DEMO_PROPERTY_IMAGE,
        file_name: `${propertyTitle} örnek fotoğrafı`
      } as PropertyMediaRow];
  const hasMultiplePhotos = galleryItems.length > 1;
  const visibleCount = galleryItems.length;
  const safeActivePhotoIndex = Math.min(activePhotoIndex, Math.max(visibleCount - 1, 0));

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  function scrollToPhoto(index: number, behavior: ScrollBehavior = "smooth") {
    const container = scrollRef.current;
    if (!container) {
      onSelectPhoto(index);
      return;
    }

    container.scrollTo({
      left: container.clientWidth * index,
      behavior
    });
    onSelectPhoto(index);
  }

  function handleScroll() {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(() => {
      const container = scrollRef.current;
      if (!container) return;
      const nextIndex = Math.round(container.scrollLeft / Math.max(container.clientWidth, 1));
      if (nextIndex !== safeActivePhotoIndex && nextIndex >= 0 && nextIndex < visibleCount) {
        onSelectPhoto(nextIndex);
      }
    });
  }

  function showPrevious() {
    if (!hasMultiplePhotos) return;
    scrollToPhoto(safeActivePhotoIndex === 0 ? galleryItems.length - 1 : safeActivePhotoIndex - 1);
  }

  function showNext() {
    if (!hasMultiplePhotos) return;
    scrollToPhoto(safeActivePhotoIndex === galleryItems.length - 1 ? 0 : safeActivePhotoIndex + 1);
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white dark:border-white/10 dark:bg-[#080808]">
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {galleryItems.map((item, index) => {
            const url = item.signed_url || DEMO_PROPERTY_IMAGE;
            const hasFailed = failedImages[item.id];

            return (
              <div key={item.id} className="relative min-w-full snap-center">
                {url && !hasFailed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={item.file_name || propertyTitle}
                    className="h-[320px] w-full select-none object-cover sm:h-[520px]"
                    draggable={false}
                    loading={index === 0 ? "eager" : "lazy"}
                    onError={() => setFailedImages((current) => ({ ...current, [item.id]: true }))}
                  />
                ) : (
                  <div className="grid h-[320px] place-items-center bg-slate-100 px-4 text-center text-sm text-slate-500 dark:bg-white/[0.06] dark:text-slate-400 sm:h-[520px]">
                    Fotoğraf önizlemesi hazırlanamadı.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {actions ? <div className="absolute right-3 top-3 z-10 flex items-center gap-2">{actions}</div> : null}

        <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {safeActivePhotoIndex + 1}/{Math.min(visibleCount, 12)} Fotoğraf
        </div>

        {!media.length ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <span className="rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              Örnek görsel
            </span>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/85">
              Bu portföy için gerçek fotoğraf yüklendiğinde galeri otomatik olarak güvenli medya kayıtlarını gösterir.
            </p>
          </div>
        ) : null}

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
              onClick={() => scrollToPhoto(index)}
              className={`h-1.5 rounded-full transition ${
                index === safeActivePhotoIndex ? "w-7 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"
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
  primaryDetails,
  property,
  secondaryDetails
}: {
  activeTab: PropertyTab;
  mediaCount: number;
  primaryDetails: PropertyDetailItem[];
  property: AdvisorPropertyRow;
  secondaryDetails: PropertyDetailItem[];
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
        {secondaryDetails.length ? secondaryDetails.map((item) => (
          <DetailLine key={item.label} label={item.label} value={item.value} />
        )) : (
          <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400 sm:col-span-3">
            Ek teknik özellik girilmemiş.
          </p>
        )}
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
    <div className="mt-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {primaryDetails.map((item) => (
          <DetailLine key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
      {secondaryDetails.length ? (
        <details className="mt-4 rounded-[1.5rem] border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <summary className="cursor-pointer text-sm font-semibold text-slate-950 dark:text-slate-100">
            Daha Fazla Özellik
          </summary>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {secondaryDetails.map((item) => (
              <DetailLine key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-medium text-slate-950 dark:text-slate-100">{value}</p>
    </div>
  );
}

type PropertyDetailItem = {
  label: string;
  value: string;
};

function getPrimaryPropertyDetails(property: AdvisorPropertyRow, location: string) {
  return [
    { label: "Fiyat", value: formatPropertyPrice(property.asking_price, property.currency) },
    { label: "Lokasyon", value: location || "Belirtilmedi" },
    { label: "İlan Tipi", value: property.listing_type || "Belirtilmedi" },
    { label: "Gayrimenkul Tipi", value: property.property_type || "Belirtilmedi" },
    { label: "Oda Sayısı", value: property.room_count || "Belirtilmedi" },
    { label: "Net / Brüt m²", value: [formatSquareMeters(property.net_area), formatSquareMeters(property.gross_area)].filter(Boolean).join(" / ") || "Belirtilmedi" },
    { label: "Kat", value: [property.floor, property.total_floors].filter(Boolean).join(" / ") || "Belirtilmedi" },
    { label: "Durum", value: formatStatusLabel(property.status || "Belirtilmedi") }
  ];
}

function getSecondaryPropertyDetails(property: AdvisorPropertyRow) {
  return [
    { label: "Bina Yaşı", value: property.building_age || "" },
    { label: "Isıtma Tipi", value: property.heating_type || "" },
    { label: "Banyo Sayısı", value: property.bathroom_count || "" },
    { label: "Balkon Sayısı", value: property.balcony_count || "" },
    { label: "Otopark", value: property.parking_type || "" },
    { label: "Asansör", value: booleanToText(property.has_elevator) },
    { label: "Site İçi", value: booleanToText(property.in_site, "Evet", "Hayır") },
    { label: "Aidat", value: formatDuesAmount(property.dues_amount) },
    { label: "Tapu Durumu", value: property.deed_status || "" },
    { label: "Takas", value: booleanToText(property.exchange_available) },
    { label: "Kullanım", value: property.usage_type || "" },
    { label: "Danışman", value: property.advisor_id || "" },
    { label: "Görünürlük", value: property.is_public ? "Office-wide görünür" : "İç kullanım" }
  ].filter((item) => item.value && item.value !== "Belirtilmedi");
}

function formatDate(value?: string) {
  if (!value) return "Tarih yok";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tarih yok";
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(date);
}
