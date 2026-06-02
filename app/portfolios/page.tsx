"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../auth-context";
import {
  createSupabaseAuthClient,
  getDataSetupMessage,
  isSupabaseConfigured,
  type AdvisorPropertyRow,
  type PropertyInput,
  type PropertyMediaRow
} from "@/lib/supabase/client";
import { demoShowcasePortfolios } from "@/lib/oos/demo-data";
import {
  booleanTextOptions,
  deedStatusOptions,
  heatingTypeOptions,
  listingTypeOptions,
  parkingTypeOptions,
  propertyTypeOptions,
  roomCountOptions,
  textToBoolean,
  yesNoTextOptions
} from "@/lib/oos/property-fields";
import { PropertyListingCard, formatPropertyLocation, formatPropertyPrice } from "../property-listing-card";
import {
  PropertyPhotoManager,
  validatePropertyPhotoFiles,
  type PropertyPhotoPreviewItem
} from "../property-photo-manager";
import { PropertyLocationPicker, type PropertyLocationSelection } from "../property-location-picker";

type PendingPortfolioPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

const demoPortfolios: AdvisorPropertyRow[] = demoShowcasePortfolios.slice(0, 2).map((portfolio) => ({
  id: portfolio.id,
  advisor_id: null,
  title: portfolio.title,
  property_type: portfolio.propertyType,
  usage_type: portfolio.contractType,
  city: portfolio.location.split("/")[0]?.trim() || "İstanbul",
  district: portfolio.district || portfolio.location.split("/")[1]?.trim() || null,
  neighborhood: portfolio.location.split("/")[2]?.trim() || null,
  gross_area: Number(String(portfolio.area || "").replace(/[^0-9]/g, "")) || null,
  net_area: null,
  asking_price: portfolio.value,
  currency: "TRY",
  status: "active",
  is_public: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}));

const emptyForm = {
  title: "",
  location: "",
  value: "",
  status: "active",
  listingType: "Satılık",
  propertyType: "Daire",
  roomCount: "",
  grossArea: "",
  netArea: "",
  buildingAge: "",
  floor: "",
  totalFloors: "",
  heatingType: "",
  bathroomCount: "",
  balconyCount: "",
  parkingType: "",
  hasElevator: "Belirtilmedi",
  inSite: "Belirtilmedi",
  duesAmount: "",
  deedStatus: "",
  exchangeAvailable: "Belirtilmedi",
  latitude: "",
  longitude: "",
  addressText: "",
  moreOpen: false
};

export default function PortfoliosRoutePage() {
  const { user } = useAuthContext();
  const supabase = useMemo(() => createSupabaseAuthClient(), []);
  const [items, setItems] = useState<AdvisorPropertyRow[]>(isSupabaseConfigured ? [] : demoPortfolios);
  const [mediaByProperty, setMediaByProperty] = useState<Record<string, PropertyMediaRow[]>>({});
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [mediaMessage, setMediaMessage] = useState("");
  const [pendingPhotos, setPendingPhotos] = useState<PendingPortfolioPhoto[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [markingCoverId, setMarkingCoverId] = useState("");
  const [refreshingWatermarkId, setRefreshingWatermarkId] = useState("");
  const [removingPhotoId, setRemovingPhotoId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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

  async function savePortfolio() {
    if (!form.title.trim()) {
      setMessage("Portföy başlığı zorunlu.");
      return;
    }

    const payload = toPropertyInput(form);

    setSaving(true);
    if (persistentMode && supabase) {
      try {
        const row = editingId
          ? await supabase.updateProperty(editingId, payload)
          : await supabase.createProperty(payload);
        if (row) {
          setItems((current) =>
            editingId
              ? current.map((item) => (item.id === editingId ? row : item))
              : [row, ...current]
          );
          if (!editingId && pendingPhotos.length) {
            const nextMedia = await uploadFilesForProperty(row.id, pendingPhotos.map((photo) => photo.file), []);
            setMediaByProperty((current) => ({ ...current, [row.id]: nextMedia }));
            setMediaMessage("Portföy kaydedildi ve fotoğraflar yüklendi.");
          }
        }
        setMessage("");
      } catch (error) {
        console.error(error);
        setMessage(error instanceof Error ? getDataSetupMessage(error.message) : "Portföy kaydedilemedi.");
        setSaving(false);
        return;
      }
    } else {
      const card = { ...fromForm(form), id: editingId || `demo-${Date.now()}` };
      setItems((current) =>
        editingId ? current.map((item) => (item.id === editingId ? card : item)) : [card, ...current]
      );
    }

    clearPendingPhotos();
    setForm(emptyForm);
    setEditingId(null);
    setSaving(false);
  }

  async function deletePortfolio(id: string) {
    setDeletingId(id);
    if (persistentMode && supabase) {
      try {
        await supabase.deleteProperty(id);
      } catch (error) {
        console.error(error);
        setMessage(error instanceof Error ? getDataSetupMessage(error.message) : "Portföy silinemedi.");
        setDeletingId(null);
        return;
      }
    }

    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
      clearPendingPhotos();
    }
    setDeletingId(null);
  }

  function editPortfolio(item: AdvisorPropertyRow) {
    setEditingId(item.id);
    clearPendingPhotos();
    setMediaMessage("");
    setForm({
      title: item.title,
      location: formatPropertyLocation(item),
      value: String(item.asking_price || ""),
      status: item.status || "active",
      listingType: item.listing_type || "Satılık",
      propertyType: item.property_type || "Daire",
      roomCount: item.room_count || "",
      grossArea: item.gross_area ? String(item.gross_area) : "",
      netArea: item.net_area ? String(item.net_area) : "",
      buildingAge: item.building_age || "",
      floor: item.floor || "",
      totalFloors: item.total_floors || "",
      heatingType: item.heating_type || "",
      bathroomCount: item.bathroom_count || "",
      balconyCount: item.balcony_count || "",
      parkingType: item.parking_type || "",
      hasElevator: item.has_elevator === true ? "Var" : item.has_elevator === false ? "Yok" : "Belirtilmedi",
      inSite: item.in_site === true ? "Evet" : item.in_site === false ? "Hayır" : "Belirtilmedi",
      duesAmount: item.dues_amount ? String(item.dues_amount) : "",
      deedStatus: item.deed_status || "",
      exchangeAvailable: item.exchange_available === true ? "Var" : item.exchange_available === false ? "Yok" : "Belirtilmedi",
      latitude: item.latitude ? String(item.latitude) : "",
      longitude: item.longitude ? String(item.longitude) : "",
      addressText: item.address_text || "",
      moreOpen: false
    });
  }

  function applyPropertyLocation(selection: PropertyLocationSelection) {
    const nextLocation = selection.location || form.location;
    const shouldUpdateLocation =
      Boolean(nextLocation) &&
      (!form.location.trim() ||
        form.location === nextLocation ||
        window.confirm("Mevcut konum bilgisi haritadan gelen adresle güncellensin mi?"));

    setForm((current) => ({
      ...current,
      latitude: String(selection.latitude),
      longitude: String(selection.longitude),
      addressText: selection.addressText || current.addressText,
      location: shouldUpdateLocation ? nextLocation : current.location
    }));
    setMediaMessage(selection.message || "Harita konumu forma aktarıldı.");

    if (persistentMode && supabase) {
      void supabase.logActivity({
        action: editingId ? "property_coordinates_updated" : "property_location_selected",
        entity_type: "property",
        entity_id: editingId,
        summary: "Portföy harita konumu seçildi.",
        metadata: {
          source_type: "map_picker",
          has_address: Boolean(selection.addressText || selection.location)
        }
      });
    }
  }

  function clearPropertyLocation() {
    setForm((current) => ({ ...current, latitude: "", longitude: "", addressText: "" }));
  }

  function clearPendingPhotos() {
    pendingPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setPendingPhotos([]);
    setUploadProgress(null);
  }

  const pendingMedia: PropertyPhotoPreviewItem[] = pendingPhotos.map((photo, index) => ({
    id: photo.id,
    property_id: "pending",
    storage_bucket: "property-images",
    storage_path: "",
    display_storage_path: null,
    original_storage_path: null,
    file_name: photo.file.name,
    file_size: photo.file.size,
    mime_type: photo.file.type,
    sort_order: index,
    is_cover: index === 0,
    visibility: "internal",
    uploaded_by: null,
    created_at: new Date().toISOString(),
    updated_at: undefined,
    preview_url: photo.previewUrl,
    is_pending: true
  }));

  function addPendingPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    if (!persistentMode || !supabase) {
      setMediaMessage("Fotoğraf yükleme için Supabase bağlantısı gerekli.");
      return;
    }

    const validationMessage = validatePropertyPhotoFiles(files, pendingPhotos.length);
    if (validationMessage) {
      setMediaMessage(validationMessage);
      return;
    }

    setPendingPhotos((current) => [
      ...current,
      ...files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file)
      }))
    ]);
    setMediaMessage("Fotoğraflar portföy kaydedilince yüklenecek.");
  }

  async function uploadFilesForProperty(propertyId: string, files: File[], existingMedia: PropertyMediaRow[]) {
    if (!supabase) return existingMedia;
    let nextMedia = existingMedia;

    for (let index = 0; index < files.length; index += 1) {
      setUploadProgress(Math.round((index / files.length) * 90));
      const media = await supabase.uploadPropertyPhoto(propertyId, files[index], nextMedia.length);
      if (media) nextMedia = [...nextMedia, media];
    }

    setUploadProgress(100);
    return nextMedia;
  }

  async function uploadPortfolioPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length || !editingId) return;

    if (!persistentMode || !supabase) {
      setMediaMessage("Fotoğraf yükleme için Supabase bağlantısı gerekli.");
      return;
    }

    const currentMedia = mediaByProperty[editingId] ?? [];
    const validationMessage = validatePropertyPhotoFiles(files, currentMedia.length);
    if (validationMessage) {
      setMediaMessage(validationMessage);
      return;
    }

    setSaving(true);
    setMediaMessage("");
    setUploadProgress(0);
    try {
      const nextMedia = await uploadFilesForProperty(editingId, files, currentMedia);
      setMediaByProperty((current) => ({ ...current, [editingId]: nextMedia }));
      setMediaMessage("Fotoğraflar yüklendi.");
    } catch (error) {
      console.error(error);
      setMediaMessage(error instanceof Error ? getDataSetupMessage(error.message, { optional: true }) : "Fotoğraf yüklenemedi.");
    } finally {
      setSaving(false);
      setTimeout(() => setUploadProgress(null), 800);
    }
  }

  async function markPhotoAsCover(mediaId: string) {
    if (!editingId || !persistentMode || !supabase) return;
    setMarkingCoverId(mediaId);
    setMediaMessage("");

    try {
      await supabase.markPropertyMediaCover(editingId, mediaId);
      setMediaByProperty((current) => ({
        ...current,
        [editingId]: (current[editingId] ?? []).map((media) => ({
          ...media,
          is_cover: media.id === mediaId
        }))
      }));
      setMediaMessage("Kapak fotoğrafı güncellendi.");
    } catch (error) {
      console.error(error);
      setMediaMessage(error instanceof Error ? getDataSetupMessage(error.message, { optional: true }) : "Kapak fotoğrafı güncellenemedi.");
    } finally {
      setMarkingCoverId("");
    }
  }

  async function refreshPhotoWatermark(mediaId: string) {
    if (!editingId || !persistentMode || !supabase) return;
    setRefreshingWatermarkId(mediaId);
    setMediaMessage("");

    try {
      const refreshedMedia = await supabase.refreshPropertyPhotoWatermark(editingId, mediaId);
      if (refreshedMedia) {
        setMediaByProperty((current) => ({
          ...current,
          [editingId]: (current[editingId] ?? []).map((media) =>
            media.id === mediaId ? refreshedMedia : media
          )
        }));
      }
      setMediaMessage("Watermark yenilendi.");
    } catch (error) {
      console.error(error);
      setMediaMessage(error instanceof Error ? getDataSetupMessage(error.message, { optional: true }) : "Watermark yenilenemedi.");
    } finally {
      setRefreshingWatermarkId("");
    }
  }

  async function removePropertyPhoto(mediaId: string) {
    if (!editingId || !persistentMode || !supabase) return;
    const confirmed = window.confirm("Fotoğraf kaldırılsın mı?");
    if (!confirmed) return;

    setRemovingPhotoId(mediaId);
    setMediaMessage("");
    try {
      const nextMedia = await supabase.deletePropertyMedia(editingId, mediaId);
      setMediaByProperty((current) => ({ ...current, [editingId]: nextMedia }));
      setMediaMessage("Fotoğraf kaldırıldı.");
    } catch (error) {
      console.error(error);
      setMediaMessage(error instanceof Error ? getDataSetupMessage(error.message, { optional: true }) : "Fotoğraf kaldırılamadı.");
    } finally {
      setRemovingPhotoId("");
    }
  }

  const activeCount = items.filter((item) => item.status !== "archived").length;
  const missingCount = items.filter((item) => !formatPropertyLocation(item) || !item.asking_price).length;
  const showingDemoFallback = !items.length && !loading;
  const displayItems = showingDemoFallback ? demoPortfolios : items;

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-5 pb-[calc(env(safe-area-inset-bottom)+7rem)] text-slate-950 dark:bg-black dark:text-neutral-50 sm:px-6 md:pb-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-slate-200 pb-6 dark:border-white/10">
          <Link href="/" title="Ana sayfaya dön" aria-label="Ana sayfaya dön" className="inline-flex items-center gap-3 rounded-2xl transition hover:opacity-80">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold shadow-sm dark:border-white/10 dark:bg-[#080808]">
              O
            </span>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ocean Operating System</p>
          </Link>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">Portföylerim</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Danışmanın aktif portföyleri, eksik bilgi kontrolleri ve hızlı takip notları için kalıcı çalışma alanı.
          </p>
        </header>

        {getDataSetupMessage(message) ? <SetupNotice message={getDataSetupMessage(message)} /> : null}
        {loading ? <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">Portföyler yükleniyor...</p> : null}

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <Metric label="Aktif portföy" value={activeCount} />
          <Metric label="Eksik bilgi" value={missingCount} />
          <Metric label="Toplam değer" value={formatPropertyPrice(items.reduce((sum, item) => sum + Number(item.asking_price || 0), 0), "TRY")} />
        </section>

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#080808]">
          <h2 className="text-lg font-semibold">{editingId ? "Portföyü düzenle" : "İlk portföyünü ekle"}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input className="input" placeholder="Başlık" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            <input className="input" placeholder="Şehir / İlçe / Mahalle" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
            <input className="input" inputMode="numeric" placeholder="Fiyat" value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} />
            <select className="input" value={form.listingType} onChange={(event) => setForm({ ...form, listingType: event.target.value })}>
              {listingTypeOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
            <select className="input" value={form.propertyType} onChange={(event) => setForm({ ...form, propertyType: event.target.value })}>
              {propertyTypeOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
            <select className="input" value={form.roomCount} onChange={(event) => setForm({ ...form, roomCount: event.target.value })}>
              <option value="">Oda Sayısı</option>
              {roomCountOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
            <input className="input" inputMode="numeric" placeholder="Net m²" value={form.netArea} onChange={(event) => setForm({ ...form, netArea: event.target.value })} />
            <input className="input" inputMode="numeric" placeholder="Brüt m²" value={form.grossArea} onChange={(event) => setForm({ ...form, grossArea: event.target.value })} />
            <select className="input" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="active">Aktif</option>
              <option value="draft">Taslak</option>
              <option value="reserved">Rezerve</option>
              <option value="sold">Satıldı</option>
              <option value="rented">Kiralandı</option>
              <option value="hidden">Gizli</option>
              <option value="archived">Arşiv</option>
            </select>
          </div>
          <PropertyLocationPicker
            addressText={form.addressText}
            disabled={saving}
            latitude={form.latitude}
            longitude={form.longitude}
            location={form.location}
            onClear={clearPropertyLocation}
            onConfirm={applyPropertyLocation}
          />
          <details className="mt-4 rounded-3xl border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <summary className="cursor-pointer text-sm font-semibold text-slate-950 dark:text-slate-100">Daha Fazla Özellik</summary>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input className="input" placeholder="Bina Yaşı" value={form.buildingAge} onChange={(event) => setForm({ ...form, buildingAge: event.target.value })} />
              <input className="input" placeholder="Bulunduğu Kat" value={form.floor} onChange={(event) => setForm({ ...form, floor: event.target.value })} />
              <input className="input" placeholder="Toplam Kat Sayısı" value={form.totalFloors} onChange={(event) => setForm({ ...form, totalFloors: event.target.value })} />
              <select className="input" value={form.heatingType} onChange={(event) => setForm({ ...form, heatingType: event.target.value })}>
                <option value="">Isıtma Tipi</option>
                {heatingTypeOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
              <input className="input" inputMode="numeric" placeholder="Banyo Sayısı" value={form.bathroomCount} onChange={(event) => setForm({ ...form, bathroomCount: event.target.value })} />
              <input className="input" inputMode="numeric" placeholder="Balkon Sayısı" value={form.balconyCount} onChange={(event) => setForm({ ...form, balconyCount: event.target.value })} />
              <select className="input" value={form.parkingType} onChange={(event) => setForm({ ...form, parkingType: event.target.value })}>
                <option value="">Otopark</option>
                {parkingTypeOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
              <select className="input" value={form.hasElevator} onChange={(event) => setForm({ ...form, hasElevator: event.target.value })}>
                {booleanTextOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
              <select className="input" value={form.inSite} onChange={(event) => setForm({ ...form, inSite: event.target.value })}>
                {yesNoTextOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
              <input className="input" inputMode="numeric" placeholder="Aidat" value={form.duesAmount} onChange={(event) => setForm({ ...form, duesAmount: event.target.value })} />
              <select className="input" value={form.deedStatus} onChange={(event) => setForm({ ...form, deedStatus: event.target.value })}>
                <option value="">Tapu Durumu</option>
                {deedStatusOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
              <select className="input" value={form.exchangeAvailable} onChange={(event) => setForm({ ...form, exchangeAvailable: event.target.value })}>
                {booleanTextOptions.map((option) => <option key={option} value={option}>Takas: {option}</option>)}
              </select>
            </div>
          </details>
          <PropertyPhotoManager
            disabled={!persistentMode || saving}
            loading={saving}
            markingCoverId={markingCoverId}
            media={editingId ? mediaByProperty[editingId] ?? [] : pendingMedia}
            message={mediaMessage}
            progress={uploadProgress}
            refreshingId={refreshingWatermarkId}
            removingId={removingPhotoId}
            uploadId={editingId ? "portfolio-edit-photo-upload" : "portfolio-create-photo-upload"}
            onMarkCover={editingId ? markPhotoAsCover : () => undefined}
            onRemove={editingId ? removePropertyPhoto : undefined}
            onRefreshWatermark={editingId ? refreshPhotoWatermark : undefined}
            onUpload={editingId ? uploadPortfolioPhotos : addPendingPhotos}
          />
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
            {editingId ? <button className="btn-secondary" type="button" disabled={saving} onClick={() => { setEditingId(null); setForm(emptyForm); clearPendingPhotos(); setMediaMessage(""); }}>Vazgeç</button> : null}
            <button className="btn-primary" type="button" disabled={saving} onClick={savePortfolio}>{saving ? "Kaydediliyor..." : "Kaydet"}</button>
          </div>
        </section>

        {mediaMessage ? (
          <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
            {mediaMessage}
          </p>
        ) : null}

        {showingDemoFallback ? (
          <p className="mt-5 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-500 dark:border-white/10 dark:bg-[#080808] dark:text-slate-400">
            Henüz gerçek portföy yok. Aşağıdaki örnek kartlar çalışma alanının galeri görünümünü gösterir.
          </p>
        ) : null}

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {displayItems.map((item) => (
            <PropertyListingCard
              key={item.id}
              demo={showingDemoFallback || !isSupabaseConfigured}
              property={item}
              media={mediaByProperty[item.id] ?? []}
              actions={
                showingDemoFallback || !isSupabaseConfigured ? null : (
                  <>
                    <button className="mini-action" type="button" onClick={() => editPortfolio(item)}>Düzenle</button>
                    <button className="mini-action !text-red-600" type="button" disabled={deletingId === item.id} onClick={() => deletePortfolio(item.id)}>
                      {deletingId === item.id ? "Siliniyor..." : "Sil"}
                    </button>
                  </>
                )
              }
            />
          ))}
        </section>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn-primary">Ana Sayfa’ya Dön</Link>
          <Link href="/menu" className="btn-secondary">Menüyü Aç</Link>
          <Link href="/menu/map" className="btn-secondary">Haritada Gör</Link>
        </div>
      </div>
    </main>
  );
}

function SetupNotice({ message }: { message: string }) {
  return (
    <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
      {message}
    </p>
  );
}

function toPropertyInput(form: typeof emptyForm): PropertyInput {
  const [city, district, neighborhood] = parseLocation(form.location);
  return {
    title: form.title.trim(),
    property_type: form.propertyType.trim() || "Konut",
    listing_type: form.listingType || "Satılık",
    usage_type: form.listingType || "Satılık",
    city: city || null,
    district: district || null,
    neighborhood: neighborhood || null,
    gross_area: Number(form.grossArea || 0) || null,
    net_area: Number(form.netArea || 0) || null,
    room_count: form.roomCount || null,
    building_age: form.buildingAge || null,
    floor: form.floor || null,
    total_floors: form.totalFloors || null,
    heating_type: form.heatingType || null,
    bathroom_count: form.bathroomCount || null,
    balcony_count: form.balconyCount || null,
    parking_type: form.parkingType || null,
    has_elevator: textToBoolean(form.hasElevator),
    in_site: textToBoolean(form.inSite),
    dues_amount: Number(form.duesAmount || 0) || null,
    deed_status: form.deedStatus || null,
    exchange_available: textToBoolean(form.exchangeAvailable),
    latitude: Number(form.latitude) || null,
    longitude: Number(form.longitude) || null,
    address_text: form.addressText || null,
    asking_price: Number(form.value || 0) || null,
    currency: "TRY",
    status: form.status || "active",
    is_public: true
  };
}

function fromForm(form: typeof emptyForm): AdvisorPropertyRow {
  const [city, district, neighborhood] = parseLocation(form.location);
  return {
    id: "",
    advisor_id: null,
    title: form.title.trim() || "İsimsiz portföy",
    property_type: form.propertyType || "Konut",
    listing_type: form.listingType || "Satılık",
    usage_type: form.listingType || "Satılık",
    city: city || null,
    district: district || null,
    neighborhood: neighborhood || null,
    gross_area: Number(form.grossArea || 0) || null,
    net_area: Number(form.netArea || 0) || null,
    room_count: form.roomCount || null,
    building_age: form.buildingAge || null,
    floor: form.floor || null,
    total_floors: form.totalFloors || null,
    heating_type: form.heatingType || null,
    bathroom_count: form.bathroomCount || null,
    balcony_count: form.balconyCount || null,
    parking_type: form.parkingType || null,
    has_elevator: textToBoolean(form.hasElevator),
    in_site: textToBoolean(form.inSite),
    dues_amount: Number(form.duesAmount || 0) || null,
    deed_status: form.deedStatus || null,
    exchange_available: textToBoolean(form.exchangeAvailable),
    latitude: Number(form.latitude) || null,
    longitude: Number(form.longitude) || null,
    address_text: form.addressText || null,
    asking_price: Number(form.value || 0) || null,
    currency: "TRY",
    status: form.status || "active",
    is_public: true
  };
}

function parseLocation(value: string) {
  return value
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="oos-card-muted rounded-2xl p-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
