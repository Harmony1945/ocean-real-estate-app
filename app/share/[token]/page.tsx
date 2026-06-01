"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import PropertyPublicPresentation from "../../property-public-presentation";
import { createSupabaseAuthClient, type PropertyShareLinkRow, type PropertySharePayload } from "@/lib/supabase/client";

export default function PropertySharePage() {
  const params = useParams<{ token: string }>();
  const supabase = useMemo(() => createSupabaseAuthClient(), []);
  const [payload, setPayload] = useState<PropertySharePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const token = params?.token || "";

  useEffect(() => {
    if (!supabase || !token) {
      setLoading(false);
      setMessage("Paylaşım bulunamadı veya kapatılmış.");
      return;
    }

    let mounted = true;
    setLoading(true);
    setMessage("");

    supabase.getPublicPropertyShare(token)
      .then((shareLink: PropertyShareLinkRow | null) => {
        if (!mounted) return;
        if (!shareLink?.public_payload) {
          setPayload(null);
          setMessage("Paylaşım bulunamadı veya kapatılmış.");
          return;
        }

        setPayload(shareLink.public_payload);
      })
      .catch(() => {
        if (!mounted) return;
        setPayload(null);
        setMessage("Paylaşım bulunamadı veya kapatılmış.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [supabase, token]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-stone-50 px-4 text-slate-950 dark:bg-black dark:text-neutral-50">
        <p className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-[#080808] dark:text-slate-400">
          Paylaşım yükleniyor...
        </p>
      </main>
    );
  }

  if (!payload) {
    return (
      <main className="grid min-h-screen place-items-center bg-stone-50 px-4 text-slate-950 dark:bg-black dark:text-neutral-50">
        <section className="max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 text-center dark:border-white/10 dark:bg-[#080808]">
          <h1 className="text-2xl font-semibold tracking-tight">Paylaşım bulunamadı</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {message || "Paylaşım bulunamadı veya kapatılmış."}
          </p>
        </section>
      </main>
    );
  }

  return <PropertyPublicPresentation payload={payload} />;
}
