"use client";

import { useEffect, useRef, useState } from "react";

export type PropertyLocationSelection = {
  latitude: number;
  longitude: number;
  location?: string;
  addressText?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  message?: string;
};

type PropertyLocationPickerProps = {
  addressText?: string;
  disabled?: boolean;
  latitude?: string | number | null;
  longitude?: string | number | null;
  location?: string;
  onClear: () => void;
  onConfirm: (selection: PropertyLocationSelection) => void;
};

const defaultCenter: [number, number] = [41.0082, 28.9784];

export function PropertyLocationPicker({
  addressText,
  disabled = false,
  latitude,
  longitude,
  location,
  onClear,
  onConfirm
}: PropertyLocationPickerProps) {
  const [open, setOpen] = useState(false);
  const hasCoordinates = Boolean(latitude && longitude);

  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">Harita Konumu</p>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Portföyün konumunu harita üzerinde iğne ile seçin.
          </p>
        </div>
        <button className="btn-secondary w-full sm:w-auto" type="button" disabled={disabled} onClick={() => setOpen(true)}>
          Haritadan Konum Seç
        </button>
      </div>

      {hasCoordinates ? (
        <div className="mt-4 rounded-2xl bg-white p-3 text-sm dark:bg-[#080808]">
          <p className="font-medium text-slate-950 dark:text-slate-100">{addressText || location || "Konum seçildi"}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Enlem: {latitude} · Boylam: {longitude}
          </p>
          <button className="mt-3 text-xs font-medium text-red-600 dark:text-red-300" type="button" onClick={onClear}>
            Konumu Temizle
          </button>
        </div>
      ) : (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-3 text-sm text-slate-500 dark:border-white/10 dark:bg-[#080808] dark:text-slate-400">
          Henüz harita konumu seçilmedi.
        </p>
      )}

      {open ? (
        <PropertyLocationPickerModal
          initialLatitude={latitude}
          initialLongitude={longitude}
          onClose={() => setOpen(false)}
          onConfirm={(selection) => {
            onConfirm(selection);
            setOpen(false);
          }}
        />
      ) : null}
    </section>
  );
}

function PropertyLocationPickerModal({
  initialLatitude,
  initialLongitude,
  onClose,
  onConfirm
}: {
  initialLatitude?: string | number | null;
  initialLongitude?: string | number | null;
  onClose: () => void;
  onConfirm: (selection: PropertyLocationSelection) => void;
}) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const selectedRef = useRef<[number, number] | null>(null);
  const [selected, setSelected] = useState<[number, number] | null>(() => {
    const lat = Number(initialLatitude);
    const lng = Number(initialLongitude);
    return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    let mounted = true;

    async function mountMap() {
      if (!mapElementRef.current || mapInstanceRef.current) return;
      const leaflet = await import("leaflet").catch((error) => {
        console.error(error);
        setMessage("Harita yüklenemedi. Lütfen tekrar deneyin.");
        return null;
      });
      if (!leaflet || !mounted || !mapElementRef.current) return;
      const L = leaflet;

      const center = selected || defaultCenter;
      mapInstanceRef.current = L.map(mapElementRef.current, {
        center,
        zoom: selected ? 15 : 11,
        scrollWheelZoom: false
      });
      L
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors"
        })
        .addTo(mapInstanceRef.current);

      function placeMarker(latlng: { lat: number; lng: number }) {
        const next: [number, number] = [Number(latlng.lat.toFixed(6)), Number(latlng.lng.toFixed(6))];
        setSelected(next);
        if (!markerRef.current) {
          markerRef.current = L.marker(next, {
            icon: L.divIcon({
              className: "",
              html: '<span style="display:block;width:24px;height:24px;border-radius:999px;background:#011c40;border:4px solid white;box-shadow:0 10px 28px rgba(0,0,0,.35)"></span>',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })
          }).addTo(mapInstanceRef.current);
        } else {
          markerRef.current.setLatLng(next);
        }
      }

      if (selected) placeMarker({ lat: selected[0], lng: selected[1] });
      mapInstanceRef.current.on("click", (event: { latlng: { lat: number; lng: number } }) => {
        placeMarker(event.latlng);
      });
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 120);
    }

    mountMap();
    return () => {
      mounted = false;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  async function confirmLocation() {
    if (!selectedRef.current || saving) {
      setMessage("Lütfen harita üzerinde bir nokta seçin.");
      return;
    }

    setSaving(true);
    const [latitude, longitude] = selectedRef.current;
    const reverse = await reverseGeocode(latitude, longitude);
    onConfirm({
      latitude,
      longitude,
      ...reverse,
      message: reverse.message
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 p-0 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true">
      <div className="flex min-h-dvh flex-col bg-stone-50 text-slate-950 dark:bg-black dark:text-neutral-50 sm:mx-auto sm:min-h-0 sm:max-w-4xl sm:overflow-hidden sm:rounded-[2rem]">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-4 dark:border-white/10">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Harita Konumu</p>
            <h2 className="mt-1 text-xl font-semibold">İğneyi portföy konumuna taşıyın</h2>
          </div>
          <button className="mini-action" type="button" onClick={onClose}>Kapat</button>
        </div>
        <div ref={mapElementRef} className="min-h-[calc(100dvh-13rem)] flex-1 bg-slate-100 dark:bg-white/[0.06] sm:min-h-[32rem]" />
        <div className="border-t border-slate-200 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] dark:border-white/10">
          {selected ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Seçili konum: {selected[0]} · {selected[1]}
            </p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">Haritaya dokunarak iğne yerleştirin.</p>
          )}
          {message ? <p className="mt-2 text-xs text-amber-700 dark:text-amber-200">{message}</p> : null}
          <button className="btn-primary mt-3 w-full" type="button" disabled={saving} onClick={confirmLocation}>
            {saving ? "Konum okunuyor..." : "Konumu Onayla"}
          </button>
        </div>
      </div>
    </div>
  );
}

async function reverseGeocode(latitude: number, longitude: number) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      { method: "GET" }
    );
    if (!response.ok) throw new Error("reverse_geocode_failed");
    const data = await response.json();
    const address = data?.address || {};
    const city = address.city || address.province || address.state || "";
    const district = address.town || address.county || address.district || address.suburb || "";
    const neighborhood = address.neighbourhood || address.quarter || address.village || "";
    const street = [address.road, address.house_number].filter(Boolean).join(" ");
    const location = [city, district, neighborhood].filter(Boolean).join(" / ");
    const addressText = [street, neighborhood, district, city, address.country].filter(Boolean).join(", ");

    return {
      city,
      district,
      neighborhood,
      location,
      addressText: addressText || data?.display_name || "",
      message: addressText || location ? undefined : "Adres otomatik bulunamadı. Konum kaydedildi."
    };
  } catch {
    return { message: "Adres otomatik bulunamadı. Konum kaydedildi." };
  }
}
