"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import PropertyPublicPresentation from "../../../property-public-presentation";
import {
  createSupabaseAuthClient,
  getDataSetupMessage,
  type AdvisorPropertyRow,
  type PropertySharePayload
} from "@/lib/supabase/client";

export default function PropertyPrintPage() {
  const params = useParams<{ id: string }>();
  const supabase = useMemo(() => createSupabaseAuthClient(), []);
  const [payload, setPayload] = useState<PropertySharePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const propertyId = params?.id || "";

  useEffect(() => {
    if (!supabase || !propertyId) {
      setLoading(false);
      setMessage("Portföy bulunamadı.");
      return;
    }

    let mounted = true;
    setLoading(true);
    setMessage("");

    Promise.all([
      supabase.getProperty(propertyId),
      supabase.getPropertyMedia(propertyId).catch(() => [])
    ])
      .then(([property, media]) => {
        if (!mounted) return;
        if (!property) {
          setPayload(null);
          setMessage("Portföy bulunamadı.");
          return;
        }

        setPayload(toPrintPayload(property, media.length));
      })
      .catch((error: Error) => {
        if (!mounted) return;
        setPayload(null);
        setMessage(getDataSetupMessage(error.message) || "PDF çıktısı hazırlanamadı.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [propertyId, supabase]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-white px-4 text-slate-950">
        <p className="rounded-3xl border border-slate-200 p-4 text-sm text-slate-500">PDF çıktısı hazırlanıyor...</p>
      </main>
    );
  }

  if (!payload) {
    return (
      <main className="grid min-h-screen place-items-center bg-white px-4 text-slate-950">
        <section className="max-w-md rounded-[2rem] border border-slate-200 p-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Portföy bulunamadı</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{message}</p>
        </section>
      </main>
    );
  }

  return <PropertyPublicPresentation payload={payload} printMode />;
}

function toPrintPayload(property: AdvisorPropertyRow, photoCount: number): PropertySharePayload {
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
